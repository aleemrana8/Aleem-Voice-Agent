import uuid
from datetime import datetime, timezone
from typing import Optional
from app.models.call_log import CallLog
from app.models.transcript import Transcript, TranscriptEntry
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.doctor import Doctor
from app.services.llm_service import llm_service
from app.services.websocket_manager import ws_manager
from loguru import logger


class VoiceAgentService:
    """Orchestrates the voice agent call flow:
    Incoming audio → STT → LLM → Action execution → TTS → Audio out
    """

    async def start_call(self, caller_phone: str) -> str:
        """Initialize a new call session. Returns call_id."""
        call_id = f"CALL-{uuid.uuid4().hex[:12].upper()}"

        # Create call log
        call_log = CallLog(
            call_id=call_id,
            caller_phone=caller_phone,
            status="in_progress",
        )
        await call_log.insert()

        # Create transcript document
        transcript = Transcript(call_id=call_id)
        await transcript.insert()

        # Try to identify patient by phone
        patient = await Patient.find_one(Patient.phone == caller_phone)
        if patient:
            call_log.patient_id = patient.patient_id
            call_log.patient_name = patient.full_name
            await call_log.save()

        # Broadcast call started
        await ws_manager.broadcast(
            {
                "type": "call_started",
                "data": {
                    "call_id": call_id,
                    "caller_phone": caller_phone,
                    "patient_name": patient.full_name if patient else None,
                },
            }
        )

        logger.info(f"Call started: {call_id} from {caller_phone}")
        return call_id

    async def process_utterance(
        self, call_id: str, text: str
    ) -> str:
        """Process transcribed patient speech and return agent response."""
        # Save patient utterance to transcript
        await self._add_transcript_entry(call_id, "patient", text)

        # Get LLM response
        response = await llm_service.chat(call_id, text)

        # Parse and execute any actions in the response
        response = await self._execute_actions(call_id, response)

        # Save agent response to transcript
        await self._add_transcript_entry(call_id, "agent", response)

        # Broadcast transcript update
        await ws_manager.broadcast(
            {
                "type": "transcript_update",
                "data": {
                    "call_id": call_id,
                    "speaker": "agent",
                    "text": response,
                },
            }
        )

        return response

    async def end_call(self, call_id: str, summary: Optional[str] = None):
        """End the call session and update records."""
        call_log = await CallLog.find_one(CallLog.call_id == call_id)
        if call_log:
            call_log.status = "completed"
            call_log.ended_at = datetime.now(timezone.utc)
            call_log.summary = summary or "Call completed"
            if call_log.created_at:
                delta = datetime.now(timezone.utc) - call_log.created_at
                call_log.duration_seconds = int(delta.total_seconds())
            await call_log.save()

        llm_service.clear_history(call_id)

        await ws_manager.broadcast(
            {"type": "call_ended", "data": {"call_id": call_id}}
        )
        logger.info(f"Call ended: {call_id}")

    async def _add_transcript_entry(
        self, call_id: str, speaker: str, text: str
    ):
        transcript = await Transcript.find_one(Transcript.call_id == call_id)
        if transcript:
            entry = TranscriptEntry(
                speaker=speaker,
                text=text,
                timestamp=datetime.now(timezone.utc),
            )
            transcript.entries.append(entry)
            transcript.updated_at = datetime.now(timezone.utc)
            await transcript.save()

    async def _execute_actions(self, call_id: str, response: str) -> str:
        """Parse LLM response for action calls and execute them.
        In production, this would use function-calling LLM features.
        For now, the LLM response is returned as-is with contextual data."""
        # Update call intent based on conversation
        call_log = await CallLog.find_one(CallLog.call_id == call_id)
        if call_log:
            lower = response.lower()
            if "book" in lower or "schedule" in lower:
                call_log.intent = "booking"
            elif "reschedule" in lower:
                call_log.intent = "reschedule"
            elif "cancel" in lower:
                call_log.intent = "cancel"
            elif "available" in lower or "availability" in lower:
                call_log.intent = "inquiry"
            await call_log.save()

        return response


# Singleton
voice_agent_service = VoiceAgentService()
