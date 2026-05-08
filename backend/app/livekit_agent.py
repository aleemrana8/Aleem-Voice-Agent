"""
Aleem Voice Agent — LiveKit Agents Worker (FSM-Driven)
=======================================================
Production-grade voice AI receptionist for Aleem Hospital.

Architecture:
  STT (Whisper) → Intent Extractor (GPT-4o NLU only) → Workflow Engine (FSM)
  → TTS (OpenAI alloy)

The LLM does NOT control workflow. It only:
  1. Extracts intent + entities from patient speech
  2. Assembles spelled letters into names
  3. Determines yes/no confirmations

ALL business logic lives in:
  - workflow_engine.py (24-state FSM)
  - scheduling_engine.py (slot locking + booking)

Run locally:
    cd backend
    python -m app.livekit_agent dev
"""

import os
import uuid
from datetime import datetime, timezone

from dotenv import load_dotenv

load_dotenv()
load_dotenv(".env.local")

from loguru import logger
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from livekit import agents
from livekit.agents import (
    AgentSession,
    Agent,
    RunContext,
)
from livekit.plugins import openai, silero

# ── Database Bootstrap ──────────────────────────────────────────────

_db_initialized = False


async def _ensure_db():
    """Initialize MongoDB + Beanie once per worker process."""
    global _db_initialized
    if _db_initialized:
        return

    from app.core.config import settings
    from app.models import ALL_DOCUMENT_MODELS

    client = AsyncIOMotorClient(
        settings.MONGO_URI,
        maxPoolSize=20,
        minPoolSize=5,
        serverSelectionTimeoutMS=5000,
    )
    await init_beanie(
        database=client[settings.MONGO_DB_NAME],
        document_models=ALL_DOCUMENT_MODELS,
    )
    _db_initialized = True
    logger.info("LiveKit agent worker: MongoDB initialized")


# ── FSM-Driven Hospital Agent ──────────────────────────────────────

class HospitalAgent(Agent):
    """
    AI receptionist driven by a backend FSM.
    LLM is only used for NLU (intent extraction + entity extraction).
    The workflow engine controls ALL conversation flow.
    """

    def __init__(self) -> None:
        super().__init__(
            instructions=(
                "You are the AI receptionist for Aleem Hospital. "
                "Listen carefully to the patient and respond with the "
                "exact message provided by the system. Do NOT add extra "
                "information or make promises. Keep responses concise "
                "and natural for voice. Use a warm, professional tone."
            ),
        )
        self._call_id: str = ""
        self._fsm_session = None

    # ── Call Lifecycle ──────────────────────────────────────────────

    async def on_enter(self) -> None:
        """Initialize call: create CallLog, Transcript, and FSM session."""
        await _ensure_db()

        from app.models.call_log import CallLog
        from app.models.transcript import Transcript
        from app.models.patient import Patient
        from app.services.workflow_engine import workflow_engine

        call_id = f"CALL-{uuid.uuid4().hex[:12].upper()}"
        self._call_id = call_id

        # Extract caller phone from SIP participant attributes
        caller_phone = "livekit-cloud"
        source = "web"
        if self.session and self.session.room_io:
            participant = self.session.room_io.linked_participant
            if participant:
                attrs = participant.attributes or {}
                sip_phone = attrs.get("sip.phoneNumber", "")
                if sip_phone:
                    caller_phone = sip_phone
                    source = "telephony"

        # Create call log
        call_log = CallLog(
            call_id=call_id,
            caller_phone=caller_phone,
            status="in_progress",
        )
        await call_log.insert()

        # Create transcript
        transcript = Transcript(call_id=call_id)
        await transcript.insert()

        # Identify patient by phone for SIP calls
        if source == "telephony" and caller_phone != "livekit-cloud":
            patient = await Patient.find_one(Patient.phone == caller_phone)
            if patient:
                call_log.patient_id = patient.patient_id
                call_log.patient_name = patient.full_name
                await call_log.save()

        logger.info(f"[AGENT] Voice call started: {call_id} from {caller_phone} ({source})")

        # Initialize FSM session
        ctx = workflow_engine.create_session(call_id, caller_phone)
        self._fsm_session = ctx

        # Broadcast call started
        from app.services.websocket_manager import ws_manager
        await ws_manager.broadcast_event("call_started", {
            "call_id": call_id,
            "caller_phone": caller_phone,
            "source": source,
        })

        # Trigger greeting state
        result = await workflow_engine.transition(call_id, "call_started")

        # Speak the greeting
        await self.session.generate_reply(
            instructions=f"Say exactly this to the patient: {result.message}"
        )

    async def on_user_turn_completed(
        self, turn_ctx: agents.ChatContext, new_message: agents.ChatMessage
    ) -> None:
        """
        Called when the patient finishes speaking.
        Pipeline: STT output → Intent extraction → FSM transition → TTS response
        """
        utterance = new_message.text_content
        if not utterance or not utterance.strip():
            return

        logger.info(f"[AGENT] Patient said: {utterance}")

        from app.services.workflow_engine import workflow_engine, ConversationState
        from app.services.intent_extractor import intent_extractor
        from app.services.scheduling_engine import scheduling_engine

        ctx = workflow_engine.get_session(self._call_id)
        if not ctx:
            await self.session.generate_reply(
                instructions="Say: I'm sorry, there was a system error. Please call back."
            )
            return

        # Log transcript
        await self._log_transcript(utterance, "patient")

        # ── State-aware NLU extraction ──────────────────────────────

        event = "user_utterance"
        data: dict = {}

        state = ctx.state

        if state == ConversationState.IDENTIFY_INTENT:
            # Full intent extraction
            nlu = await intent_extractor.extract(
                utterance, current_state=state, context_hint="Initial intent identification"
            )
            event = "intent_extracted"
            data = nlu

        elif state == ConversationState.VERIFY_EXISTING_PATIENT:
            # Determine existing vs new patient
            patient_type = await intent_extractor.extract_patient_type(utterance)
            if not patient_type:
                nlu = await intent_extractor.extract(
                    utterance, current_state=state,
                    context_hint="Determining if existing or new patient"
                )
                patient_type = nlu.get("entities", {}).get("patient_type")
            data = {"patient_type": patient_type}

        elif state in (ConversationState.COLLECT_FIRST_NAME, ConversationState.COLLECT_LAST_NAME):
            # Spelling extraction
            spelled = await intent_extractor.extract_spelled_name(utterance)
            nlu = await intent_extractor.extract(
                utterance, current_state=state,
                context_hint=f"Patient is spelling their {'first' if state == ConversationState.COLLECT_FIRST_NAME else 'last'} name"
            )
            entities = nlu.get("entities", {})
            if spelled:
                entities["spelled_text"] = spelled
            if state == ConversationState.COLLECT_FIRST_NAME:
                data = {"first_name": entities.get("first_name"), "spelled_text": spelled, "entities": entities}
            else:
                data = {"last_name": entities.get("last_name"), "spelled_text": spelled, "entities": entities}

        elif state == ConversationState.SPELLING_CONFIRMATION:
            confirmed = await intent_extractor.extract_confirmation(utterance)
            data = {"confirmed": confirmed}

        elif state == ConversationState.COLLECT_DOB:
            nlu = await intent_extractor.extract(
                utterance, current_state=state,
                context_hint="Patient is providing their date of birth"
            )
            data = {"date_of_birth": nlu.get("entities", {}).get("date_of_birth"), "entities": nlu.get("entities", {})}

        elif state == ConversationState.COLLECT_PHONE:
            nlu = await intent_extractor.extract(
                utterance, current_state=state,
                context_hint="Patient is providing their phone number"
            )
            data = {"phone": nlu.get("entities", {}).get("phone"), "entities": nlu.get("entities", {})}

        elif state == ConversationState.COLLECT_LOCATION:
            nlu = await intent_extractor.extract(
                utterance, current_state=state,
                context_hint="Patient choosing between Islamabad and Multan"
            )
            data = {"location": nlu.get("entities", {}).get("location"), "entities": nlu.get("entities", {})}

        elif state == ConversationState.COLLECT_PROVIDER:
            nlu = await intent_extractor.extract(
                utterance, current_state=state,
                context_hint="Patient choosing a doctor: Dr Aleem, Dr Mohsin, or Dr Zain"
            )
            data = {"provider": nlu.get("entities", {}).get("provider"), "entities": nlu.get("entities", {})}

        elif state == ConversationState.COLLECT_DATE:
            nlu = await intent_extractor.extract(
                utterance, current_state=state,
                context_hint="Patient providing an appointment date"
            )
            data = {"date": nlu.get("entities", {}).get("date"), "entities": nlu.get("entities", {})}

        elif state == ConversationState.SELECT_SLOT:
            # Try fast slot matching first
            slot = await intent_extractor.extract_time_slot(utterance, ctx.available_slots)
            if slot:
                data = {"time_slot": slot}
            else:
                nlu = await intent_extractor.extract(
                    utterance, current_state=state,
                    context_hint=f"Patient selecting a time slot from: {', '.join(ctx.available_slots[:8])}"
                )
                entities = nlu.get("entities", {})
                intent = nlu.get("intent")
                data = {
                    "time_slot": entities.get("time_preference"),
                    "intent": intent,
                    "entities": entities,
                }

        elif state in (ConversationState.CONFIRM_APPOINTMENT, ConversationState.CONFIRM_CANCELLATION):
            confirmed = await intent_extractor.extract_confirmation(utterance)
            if confirmed is None:
                nlu = await intent_extractor.extract(
                    utterance, current_state=state,
                    context_hint="Patient confirming or denying"
                )
                confirmed = nlu.get("confirmed")
            data = {"confirmed": confirmed}

        elif state == ConversationState.END_CALL:
            # Check if they want more help
            nlu = await intent_extractor.extract(
                utterance, current_state=state,
                context_hint="Patient may want more help or is done"
            )
            intent = nlu.get("intent", "unknown")
            if intent in ("book_appointment", "reschedule_appointment", "cancel_appointment", "check_availability"):
                data = {"needs_more": True}
                # Also need to re-identify intent after reset
            else:
                confirmed = await intent_extractor.extract_confirmation(utterance)
                if confirmed:
                    data = {"needs_more": True}
                else:
                    data = {"needs_more": False}

        elif state in (ConversationState.RESCHEDULE_FLOW, ConversationState.CANCEL_FLOW):
            nlu = await intent_extractor.extract(
                utterance, current_state=state,
                context_hint="Patient selecting appointment or providing details for reschedule/cancel"
            )
            data = nlu.get("entities", {})
            data["entities"] = nlu.get("entities", {})

        else:
            # Generic extraction
            nlu = await intent_extractor.extract(utterance, current_state=state)
            data = nlu

        # ── FSM Transition ──────────────────────────────────────────

        result = await workflow_engine.transition(self._call_id, event, data)

        logger.info(f"[AGENT] FSM → state={result.state} action={result.action}")

        # Log agent response
        await self._log_transcript(result.message, "agent")

        # ── Execute Action ──────────────────────────────────────────

        if result.action == "hangup":
            await self.session.generate_reply(
                instructions=f"Say exactly: {result.message}"
            )
            # Update call log
            await self._finalize_call("completed")
            # Release any slot reservations
            scheduling_engine.release_all_for_call(self._call_id)
            return

        elif result.action == "transfer":
            await self.session.generate_reply(
                instructions=f"Say exactly: {result.message}"
            )
            await self._finalize_call("transferred")
            return

        else:
            # Speak the FSM's response
            await self.session.generate_reply(
                instructions=f"Say exactly this to the patient in a warm, professional tone: {result.message}"
            )

    # ── Helpers ─────────────────────────────────────────────────────

    async def _log_transcript(self, text: str, speaker: str):
        """Append to call transcript."""
        try:
            from app.models.transcript import Transcript
            transcript = await Transcript.find_one(Transcript.call_id == self._call_id)
            if transcript:
                transcript.entries.append({
                    "speaker": speaker,
                    "text": text,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })
                await transcript.save()
        except Exception as e:
            logger.warning(f"[AGENT] Transcript log failed: {e}")

    async def _finalize_call(self, final_status: str):
        """Update call log with final status and duration."""
        try:
            from app.models.call_log import CallLog
            call_log = await CallLog.find_one(CallLog.call_id == self._call_id)
            if call_log:
                call_log.status = final_status
                call_log.ended_at = datetime.now(timezone.utc)
                if call_log.created_at:
                    delta = call_log.ended_at - call_log.created_at
                    call_log.duration = int(delta.total_seconds())
                await call_log.save()

            # Broadcast call ended
            from app.services.websocket_manager import ws_manager
            await ws_manager.broadcast_event("call_ended", {
                "call_id": self._call_id,
                "status": final_status,
            })

            # Release FSM session
            from app.services.workflow_engine import workflow_engine
            workflow_engine.end_session(self._call_id)

        except Exception as e:
            logger.error(f"[AGENT] Finalize call failed: {e}")


# ── Agent Entrypoint ────────────────────────────────────────────────

async def entrypoint(ctx: agents.JobContext):
    """Called by LiveKit when a new room is created / agent is dispatched."""
    await _ensure_db()
    await ctx.connect()

    session = AgentSession(
        stt=openai.STT(model="whisper-1"),
        llm=openai.LLM(model="gpt-4o"),
        tts=openai.TTS(voice="alloy"),
        vad=silero.VAD.load(),
    )

    await session.start(
        room=ctx.room,
        agent=HospitalAgent(),
    )


# ── Worker Bootstrap ────────────────────────────────────────────────

if __name__ == "__main__":
    agents.cli.run_app(
        agents.WorkerOptions(
            entrypoint_fnc=entrypoint,
            agent_name="aleem-voice-agent",
        ),
    )
