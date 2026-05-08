"""
Finite State Machine Workflow Engine — 24-State Production Implementation
=========================================================================
Backend-controlled conversation state machine for Aleem Hospital.

AI (LLM) is ONLY used for:
  - intent extraction
  - entity extraction
  - spelling confirmation
  - conversational response generation
  - summarization

ALL business logic is handled HERE or in backend services:
  - scheduling, validation, conflicts, slot locking, patient verification,
    booking, rescheduling, cancellation, EHR sync, dashboard sync.

States (24):
  GREETING → IDENTIFY_INTENT
  → VERIFY_EXISTING_PATIENT → PATIENT_LOOKUP
  → REGISTER_NEW_PATIENT → COLLECT_FIRST_NAME → COLLECT_LAST_NAME
    → SPELLING_CONFIRMATION → COLLECT_DOB → COLLECT_PHONE
  → COLLECT_LOCATION → COLLECT_PROVIDER → COLLECT_DATE
  → CHECK_AVAILABILITY → OFFER_SLOTS → SELECT_SLOT → CONFIRM_APPOINTMENT
  → SAVE_APPOINTMENT
  → RESCHEDULE_FLOW → CANCEL_FLOW → CONFIRM_CANCELLATION
  → END_CALL → FALLBACK → ESCALATE_TO_HUMAN
"""

from __future__ import annotations

from enum import StrEnum
from typing import Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from loguru import logger


# ── Conversation States ─────────────────────────────────────────────

class ConversationState(StrEnum):
    GREETING = "greeting"
    IDENTIFY_INTENT = "identify_intent"
    VERIFY_EXISTING_PATIENT = "verify_existing_patient"
    REGISTER_NEW_PATIENT = "register_new_patient"
    COLLECT_FIRST_NAME = "collect_first_name"
    COLLECT_LAST_NAME = "collect_last_name"
    SPELLING_CONFIRMATION = "spelling_confirmation"
    COLLECT_DOB = "collect_dob"
    COLLECT_PHONE = "collect_phone"
    PATIENT_LOOKUP = "patient_lookup"
    COLLECT_LOCATION = "collect_location"
    COLLECT_PROVIDER = "collect_provider"
    COLLECT_DATE = "collect_date"
    CHECK_AVAILABILITY = "check_availability"
    OFFER_SLOTS = "offer_slots"
    SELECT_SLOT = "select_slot"
    CONFIRM_APPOINTMENT = "confirm_appointment"
    SAVE_APPOINTMENT = "save_appointment"
    RESCHEDULE_FLOW = "reschedule_flow"
    CANCEL_FLOW = "cancel_flow"
    CONFIRM_CANCELLATION = "confirm_cancellation"
    END_CALL = "end_call"
    FALLBACK = "fallback"
    ESCALATE_TO_HUMAN = "escalate_to_human"


class Intent(StrEnum):
    BOOK_APPOINTMENT = "book_appointment"
    RESCHEDULE_APPOINTMENT = "reschedule_appointment"
    CANCEL_APPOINTMENT = "cancel_appointment"
    CHECK_AVAILABILITY = "check_availability"
    VERIFY_PATIENT = "verify_patient"
    REGISTER_NEW_PATIENT = "register_new_patient"
    REPEAT_INFORMATION = "repeat_information"
    CHANGE_SLOT = "change_slot"
    CHANGE_DATE = "change_date"
    CHANGE_PROVIDER = "change_provider"
    CHANGE_LOCATION = "change_location"
    HUMAN_HANDOFF = "human_handoff"
    UNKNOWN = "unknown"


# ── Session Context ─────────────────────────────────────────────────

class SessionContext(BaseModel):
    """All extracted data for a single call conversation."""

    call_id: str
    state: ConversationState = ConversationState.GREETING
    previous_state: Optional[ConversationState] = None
    intent: Optional[Intent] = None

    # Patient identification
    patient_type: Optional[str] = None  # "existing" | "new"
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    first_name_confirmed: bool = False
    last_name_confirmed: bool = False
    spelling_field: Optional[str] = None  # which field we're confirming spelling for
    date_of_birth: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    patient_id: Optional[str] = None
    patient_name: Optional[str] = None
    patient_verified: bool = False

    # Booking context
    doctor_name: Optional[str] = None
    doctor_id: Optional[str] = None
    location: Optional[str] = None
    date: Optional[str] = None
    time_slot: Optional[str] = None
    reason: Optional[str] = None
    available_slots: list[str] = Field(default_factory=list)

    # Appointment context (reschedule/cancel)
    appointment_id: Optional[str] = None
    original_date: Optional[str] = None
    original_time: Optional[str] = None
    original_doctor: Optional[str] = None

    # Conversation
    turn_count: int = 0
    fallback_count: int = 0
    last_agent_message: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        use_enum_values = True


# ── Transition Result ───────────────────────────────────────────────

class TransitionResult(BaseModel):
    """What the voice agent should do after a state transition."""

    state: str
    action: str  # "speak" | "listen" | "transfer" | "hangup"
    message: str  # Natural language for TTS
    data: dict = Field(default_factory=dict)
    require_input: bool = True  # Whether we need user input next


# ── Workflow Engine ─────────────────────────────────────────────────

class WorkflowEngine:
    """
    Event-driven finite state machine for voice conversations.
    Each call has its own SessionContext. All transitions are
    driven by backend logic — NOT by LLM prompts.
    """

    def __init__(self):
        self._sessions: dict[str, SessionContext] = {}

    # ── Session Management ──────────────────────────────────────────

    def create_session(self, call_id: str, caller_phone: str = "") -> SessionContext:
        ctx = SessionContext(
            call_id=call_id,
            phone=caller_phone if caller_phone and caller_phone != "livekit-cloud" else None,
            state=ConversationState.GREETING,
        )
        self._sessions[call_id] = ctx
        logger.info(f"[FSM] Session created: {call_id}")
        return ctx

    def get_session(self, call_id: str) -> Optional[SessionContext]:
        return self._sessions.get(call_id)

    def end_session(self, call_id: str):
        self._sessions.pop(call_id, None)
        logger.info(f"[FSM] Session ended: {call_id}")

    # ── Main Transition ─────────────────────────────────────────────

    async def transition(
        self, call_id: str, event: str, data: dict[str, Any] | None = None
    ) -> TransitionResult:
        ctx = self._sessions.get(call_id)
        if not ctx:
            return TransitionResult(
                state="error", action="speak",
                message="I'm sorry, there was a system error. Please call back.",
                data={"error": "session_not_found"},
            )

        data = data or {}
        ctx.turn_count += 1
        prev_state = ctx.state

        result = await self._dispatch(ctx, event, data)

        ctx.previous_state = prev_state
        ctx.last_agent_message = result.message
        logger.info(f"[FSM] {call_id}: {prev_state} --({event})--> {ctx.state}")
        return result

    async def _dispatch(self, ctx: SessionContext, event: str, data: dict) -> TransitionResult:
        handlers = {
            ConversationState.GREETING: self._h_greeting,
            ConversationState.IDENTIFY_INTENT: self._h_identify_intent,
            ConversationState.VERIFY_EXISTING_PATIENT: self._h_verify_existing_patient,
            ConversationState.REGISTER_NEW_PATIENT: self._h_register_new_patient,
            ConversationState.COLLECT_FIRST_NAME: self._h_collect_first_name,
            ConversationState.COLLECT_LAST_NAME: self._h_collect_last_name,
            ConversationState.SPELLING_CONFIRMATION: self._h_spelling_confirmation,
            ConversationState.COLLECT_DOB: self._h_collect_dob,
            ConversationState.COLLECT_PHONE: self._h_collect_phone,
            ConversationState.PATIENT_LOOKUP: self._h_patient_lookup,
            ConversationState.COLLECT_LOCATION: self._h_collect_location,
            ConversationState.COLLECT_PROVIDER: self._h_collect_provider,
            ConversationState.COLLECT_DATE: self._h_collect_date,
            ConversationState.CHECK_AVAILABILITY: self._h_check_availability,
            ConversationState.OFFER_SLOTS: self._h_offer_slots,
            ConversationState.SELECT_SLOT: self._h_select_slot,
            ConversationState.CONFIRM_APPOINTMENT: self._h_confirm_appointment,
            ConversationState.SAVE_APPOINTMENT: self._h_save_appointment,
            ConversationState.RESCHEDULE_FLOW: self._h_reschedule_flow,
            ConversationState.CANCEL_FLOW: self._h_cancel_flow,
            ConversationState.CONFIRM_CANCELLATION: self._h_confirm_cancellation,
            ConversationState.END_CALL: self._h_end_call,
            ConversationState.FALLBACK: self._h_fallback,
            ConversationState.ESCALATE_TO_HUMAN: self._h_escalate,
        }
        handler = handlers.get(ctx.state, self._h_fallback)
        return await handler(ctx, event, data)

    # ────────────────────────────────────────────────────────────────
    #  STATE HANDLERS
    # ────────────────────────────────────────────────────────────────

    async def _h_greeting(self, ctx: SessionContext, event: str, data: dict) -> TransitionResult:
        ctx.state = ConversationState.IDENTIFY_INTENT
        return TransitionResult(
            state=ctx.state, action="speak",
            message=(
                "Assalam-o-Alaikum. Welcome to Aleem Hospital. "
                "I'm your AI healthcare assistant. "
                "I can help you with appointment scheduling, rescheduling, "
                "cancellations, and doctor availability. "
                "How may I help you today?"
            ),
        )

    async def _h_identify_intent(self, ctx: SessionContext, event: str, data: dict) -> TransitionResult:
        intent_str = data.get("intent", "unknown")
        entities = data.get("entities", {})
        self._absorb_entities(ctx, entities)

        intent_map = {
            "book_appointment": Intent.BOOK_APPOINTMENT,
            "reschedule_appointment": Intent.RESCHEDULE_APPOINTMENT,
            "cancel_appointment": Intent.CANCEL_APPOINTMENT,
            "check_availability": Intent.CHECK_AVAILABILITY,
            "human_handoff": Intent.HUMAN_HANDOFF,
            "change_slot": Intent.CHANGE_SLOT,
            "change_date": Intent.CHANGE_DATE,
            "change_provider": Intent.CHANGE_PROVIDER,
            "change_location": Intent.CHANGE_LOCATION,
        }
        ctx.intent = intent_map.get(intent_str, Intent.UNKNOWN)

        if ctx.intent in (Intent.BOOK_APPOINTMENT, Intent.CHECK_AVAILABILITY):
            if ctx.patient_verified:
                return await self._route_booking(ctx)
            ctx.state = ConversationState.VERIFY_EXISTING_PATIENT
            return TransitionResult(
                state=ctx.state, action="speak",
                message=(
                    "I'd be happy to help you with that. "
                    "Are you an existing patient at Aleem Hospital, or is this your first visit?"
                ),
                data={"options": ["existing", "new"]},
            )

        elif ctx.intent == Intent.RESCHEDULE_APPOINTMENT:
            if ctx.patient_verified:
                ctx.state = ConversationState.RESCHEDULE_FLOW
                return await self._h_reschedule_flow(ctx, "start", {})
            ctx.state = ConversationState.VERIFY_EXISTING_PATIENT
            return TransitionResult(
                state=ctx.state, action="speak",
                message=(
                    "I can help you reschedule. Let me verify your identity first. "
                    "Are you an existing patient?"
                ),
            )

        elif ctx.intent == Intent.CANCEL_APPOINTMENT:
            if ctx.patient_verified:
                ctx.state = ConversationState.CANCEL_FLOW
                return await self._h_cancel_flow(ctx, "start", {})
            ctx.state = ConversationState.VERIFY_EXISTING_PATIENT
            return TransitionResult(
                state=ctx.state, action="speak",
                message=(
                    "I can help you cancel your appointment. "
                    "Let me verify your identity first. Are you an existing patient?"
                ),
            )

        elif ctx.intent == Intent.HUMAN_HANDOFF:
            ctx.state = ConversationState.ESCALATE_TO_HUMAN
            return await self._h_escalate(ctx, event, data)

        else:
            ctx.fallback_count += 1
            if ctx.fallback_count >= 3:
                ctx.state = ConversationState.ESCALATE_TO_HUMAN
                return await self._h_escalate(ctx, event, data)
            ctx.state = ConversationState.FALLBACK
            return await self._h_fallback(ctx, event, data)

    # ── Patient Verification ────────────────────────────────────────

    async def _h_verify_existing_patient(self, ctx: SessionContext, event: str, data: dict) -> TransitionResult:
        patient_type = data.get("patient_type") or data.get("entities", {}).get("patient_type")

        if not patient_type:
            return TransitionResult(
                state=ctx.state, action="speak",
                message="Are you an existing patient, or would you like to register as a new patient?",
            )

        if patient_type.lower() in ("existing", "yes", "old"):
            ctx.patient_type = "existing"
            ctx.state = ConversationState.COLLECT_FIRST_NAME
            return TransitionResult(
                state=ctx.state, action="speak",
                message="Great. Let me verify your identity. Could you please spell your first name for me?",
            )
        else:
            ctx.patient_type = "new"
            ctx.state = ConversationState.COLLECT_FIRST_NAME
            return TransitionResult(
                state=ctx.state, action="speak",
                message=(
                    "Welcome! I'll register you as a new patient. "
                    "Let's start with your first name. Could you please spell it out for me?"
                ),
            )

    async def _h_register_new_patient(self, ctx: SessionContext, event: str, data: dict) -> TransitionResult:
        ctx.state = ConversationState.COLLECT_FIRST_NAME
        return TransitionResult(
            state=ctx.state, action="speak",
            message="Could you please spell your first name for me?",
        )

    async def _h_collect_first_name(self, ctx: SessionContext, event: str, data: dict) -> TransitionResult:
        first_name = data.get("first_name") or data.get("entities", {}).get("first_name")
        spelled = data.get("spelled_text") or data.get("entities", {}).get("spelled_text")

        name = spelled or first_name
        if not name:
            return TransitionResult(
                state=ctx.state, action="speak",
                message="I didn't catch that. Could you please spell your first name letter by letter?",
            )

        ctx.first_name = name.strip().title()
        ctx.spelling_field = "first_name"
        ctx.state = ConversationState.SPELLING_CONFIRMATION
        return TransitionResult(
            state=ctx.state, action="speak",
            message=f"I have your first name as {ctx.first_name}. Is that correct?",
            data={"field": "first_name", "value": ctx.first_name},
        )

    async def _h_collect_last_name(self, ctx: SessionContext, event: str, data: dict) -> TransitionResult:
        last_name = data.get("last_name") or data.get("entities", {}).get("last_name")
        spelled = data.get("spelled_text") or data.get("entities", {}).get("spelled_text")

        name = spelled or last_name
        if not name:
            return TransitionResult(
                state=ctx.state, action="speak",
                message="Could you please spell your last name letter by letter?",
            )

        ctx.last_name = name.strip().title()
        ctx.spelling_field = "last_name"
        ctx.state = ConversationState.SPELLING_CONFIRMATION
        return TransitionResult(
            state=ctx.state, action="speak",
            message=f"I have your last name as {ctx.last_name}. Is that correct?",
            data={"field": "last_name", "value": ctx.last_name},
        )

    async def _h_spelling_confirmation(self, ctx: SessionContext, event: str, data: dict) -> TransitionResult:
        confirmed = data.get("confirmed")

        if confirmed is None:
            field_label = ctx.spelling_field.replace("_", " ") if ctx.spelling_field else "name"
            return TransitionResult(
                state=ctx.state, action="speak",
                message=f"Is the {field_label} correct? Please say yes or no.",
            )

        if not confirmed:
            if ctx.spelling_field == "first_name":
                ctx.first_name = None
                ctx.first_name_confirmed = False
                ctx.state = ConversationState.COLLECT_FIRST_NAME
                return TransitionResult(
                    state=ctx.state, action="speak",
                    message="No problem. Please spell your first name again.",
                )
            else:
                ctx.last_name = None
                ctx.last_name_confirmed = False
                ctx.state = ConversationState.COLLECT_LAST_NAME
                return TransitionResult(
                    state=ctx.state, action="speak",
                    message="No problem. Please spell your last name again.",
                )

        # Confirmed
        if ctx.spelling_field == "first_name":
            ctx.first_name_confirmed = True
            ctx.state = ConversationState.COLLECT_LAST_NAME
            return TransitionResult(
                state=ctx.state, action="speak",
                message="Thank you. Now please spell your last name.",
            )
        else:
            ctx.last_name_confirmed = True
            ctx.patient_name = f"{ctx.first_name} {ctx.last_name}"
            ctx.state = ConversationState.COLLECT_DOB
            return TransitionResult(
                state=ctx.state, action="speak",
                message="Thank you. What is your date of birth? Please say it as month, day, year.",
            )

    async def _h_collect_dob(self, ctx: SessionContext, event: str, data: dict) -> TransitionResult:
        dob = data.get("date_of_birth") or data.get("entities", {}).get("date_of_birth")
        if not dob:
            return TransitionResult(
                state=ctx.state, action="speak",
                message="I need your date of birth. Please say it as month, day, year. For example, January 15, 1990.",
            )

        ctx.date_of_birth = dob

        if ctx.patient_type == "existing":
            ctx.state = ConversationState.PATIENT_LOOKUP
            return await self._h_patient_lookup(ctx, "lookup", data)
        else:
            ctx.state = ConversationState.COLLECT_PHONE
            return TransitionResult(
                state=ctx.state, action="speak",
                message="What is your phone number?",
            )

    async def _h_collect_phone(self, ctx: SessionContext, event: str, data: dict) -> TransitionResult:
        phone = data.get("phone") or data.get("entities", {}).get("phone")
        if not phone:
            return TransitionResult(
                state=ctx.state, action="speak",
                message="I need your phone number. Please say it now.",
            )

        ctx.phone = phone

        if ctx.patient_type == "new":
            return await self._register_patient(ctx)
        else:
            ctx.state = ConversationState.PATIENT_LOOKUP
            return await self._h_patient_lookup(ctx, "lookup", data)

    async def _h_patient_lookup(self, ctx: SessionContext, event: str, data: dict) -> TransitionResult:
        from app.models.patient import Patient

        full_name = f"{ctx.first_name} {ctx.last_name}".strip()

        patient = await Patient.find_one({
            "full_name": {"$regex": f"^{full_name}$", "$options": "i"},
            "date_of_birth": ctx.date_of_birth,
        })

        if not patient and ctx.phone:
            patient = await Patient.find_one(Patient.phone == ctx.phone)

        if patient:
            ctx.patient_id = patient.patient_id
            ctx.patient_name = patient.full_name
            ctx.phone = patient.phone
            ctx.patient_verified = True

            # Broadcast event
            from app.services.websocket_manager import ws_manager
            await ws_manager.broadcast_event("patient_verified", {
                "patient_id": patient.patient_id,
                "name": patient.full_name,
                "call_id": ctx.call_id,
            })

            return await self._route_after_verification(ctx)
        else:
            ctx.state = ConversationState.VERIFY_EXISTING_PATIENT
            return TransitionResult(
                state=ctx.state, action="speak",
                message=(
                    f"I couldn't find a record for {full_name} with that date of birth. "
                    "Would you like to register as a new patient?"
                ),
                data={"suggest_new": True},
            )

    async def _register_patient(self, ctx: SessionContext) -> TransitionResult:
        from app.models.patient import Patient
        import uuid

        existing = await Patient.find_one(Patient.phone == ctx.phone)
        if existing:
            ctx.patient_id = existing.patient_id
            ctx.patient_name = existing.full_name
            ctx.patient_verified = True
            return await self._route_after_verification(ctx)

        patient = Patient(
            patient_id=f"PAT-{uuid.uuid4().hex[:8].upper()}",
            full_name=f"{ctx.first_name} {ctx.last_name}",
            phone=ctx.phone,
            date_of_birth=ctx.date_of_birth,
            gender=ctx.gender,
            email=ctx.email,
            address=ctx.address,
        )
        await patient.insert()

        ctx.patient_id = patient.patient_id
        ctx.patient_name = patient.full_name
        ctx.patient_verified = True

        logger.info(f"[FSM] New patient registered: {patient.patient_id}")

        from app.services.websocket_manager import ws_manager
        await ws_manager.broadcast_event("patient_created", {
            "patient_id": patient.patient_id,
            "name": patient.full_name,
            "call_id": ctx.call_id,
        })

        try:
            from app.services.audit_service import audit_service
            await audit_service.log_patient_created(patient.patient_id, "voice")
        except Exception:
            pass

        try:
            from app.services.ehr_service import ehr_service
            await ehr_service.sync_patient_created(patient)
        except Exception:
            pass

        return await self._route_after_verification(ctx)

    async def _route_after_verification(self, ctx: SessionContext) -> TransitionResult:
        if ctx.intent in (Intent.BOOK_APPOINTMENT, Intent.CHECK_AVAILABILITY):
            return await self._route_booking(ctx)
        elif ctx.intent == Intent.RESCHEDULE_APPOINTMENT:
            ctx.state = ConversationState.RESCHEDULE_FLOW
            return await self._h_reschedule_flow(ctx, "start", {})
        elif ctx.intent == Intent.CANCEL_APPOINTMENT:
            ctx.state = ConversationState.CANCEL_FLOW
            return await self._h_cancel_flow(ctx, "start", {})
        else:
            return await self._route_booking(ctx)

    # ── Booking Flow ────────────────────────────────────────────────

    async def _route_booking(self, ctx: SessionContext) -> TransitionResult:
        if not ctx.location:
            ctx.state = ConversationState.COLLECT_LOCATION
            return TransitionResult(
                state=ctx.state, action="speak",
                message="Which location would you prefer? Islamabad or Multan?",
                data={"options": ["Islamabad", "Multan"]},
            )
        if not ctx.doctor_name:
            ctx.state = ConversationState.COLLECT_PROVIDER
            return TransitionResult(
                state=ctx.state, action="speak",
                message="Which doctor would you like to see? Dr Aleem, Dr Mohsin, or Dr Zain?",
                data={"options": ["Dr Aleem", "Dr Mohsin", "Dr Zain"]},
            )
        if not ctx.date:
            ctx.state = ConversationState.COLLECT_DATE
            return TransitionResult(
                state=ctx.state, action="speak",
                message="Which date would you prefer for your appointment?",
            )
        ctx.state = ConversationState.CHECK_AVAILABILITY
        return await self._h_check_availability(ctx, "auto", {})

    async def _h_collect_location(self, ctx: SessionContext, event: str, data: dict) -> TransitionResult:
        location = data.get("location") or data.get("entities", {}).get("location")
        valid = {"islamabad", "multan"}

        if not location or location.lower() not in valid:
            return TransitionResult(
                state=ctx.state, action="speak",
                message="We have two locations: Islamabad and Multan. Which would you prefer?",
                data={"options": ["Islamabad", "Multan"]},
            )

        ctx.location = location.strip().title()
        return await self._route_booking(ctx)

    async def _h_collect_provider(self, ctx: SessionContext, event: str, data: dict) -> TransitionResult:
        doctor = data.get("provider") or data.get("doctor") or data.get("entities", {}).get("provider")

        if not doctor:
            return TransitionResult(
                state=ctx.state, action="speak",
                message="Which doctor would you like to see? Dr Aleem, Dr Mohsin, or Dr Zain?",
            )

        from app.models.doctor import Doctor
        doc = await Doctor.find_one({
            "full_name": {"$regex": doctor, "$options": "i"},
            "is_active": True,
        })
        if not doc:
            return TransitionResult(
                state=ctx.state, action="speak",
                message=(
                    f"I couldn't find a doctor named {doctor}. "
                    "Our available doctors are Dr Aleem, Dr Mohsin, and Dr Zain."
                ),
            )

        ctx.doctor_name = doc.full_name
        ctx.doctor_id = doc.employee_id
        return await self._route_booking(ctx)

    async def _h_collect_date(self, ctx: SessionContext, event: str, data: dict) -> TransitionResult:
        date_str = data.get("date") or data.get("entities", {}).get("date")
        if not date_str:
            return TransitionResult(
                state=ctx.state, action="speak",
                message="What date would you like? For example, tomorrow, or May 15th.",
            )

        from datetime import date as date_type
        try:
            parsed = date_type.fromisoformat(date_str)
            if parsed < date_type.today():
                return TransitionResult(
                    state=ctx.state, action="speak",
                    message="That date is in the past. Please choose a future date.",
                )
        except ValueError:
            return TransitionResult(
                state=ctx.state, action="speak",
                message="I couldn't understand that date. Could you say it again? For example, May 15, 2026.",
            )

        ctx.date = date_str
        return await self._route_booking(ctx)

    async def _h_check_availability(self, ctx: SessionContext, event: str, data: dict) -> TransitionResult:
        from app.services.scheduling_engine import scheduling_engine

        try:
            result = await scheduling_engine.get_available_slots(
                doctor_id=ctx.doctor_id,
                date=ctx.date,
                location=ctx.location,
            )

            if not result["available_slots"]:
                saved_date = ctx.date
                ctx.date = None
                ctx.state = ConversationState.COLLECT_DATE
                return TransitionResult(
                    state=ctx.state, action="speak",
                    message=(
                        f"I'm sorry, {ctx.doctor_name} has no available slots on "
                        f"{self._format_date(saved_date)}. "
                        "Would you like to try a different date?"
                    ),
                    data={"no_slots": True},
                )

            ctx.available_slots = result["available_slots"]
            ctx.state = ConversationState.OFFER_SLOTS
            return await self._h_offer_slots(ctx, "auto", {})

        except Exception as e:
            logger.error(f"[FSM] Availability check failed: {e}")
            return TransitionResult(
                state=ctx.state, action="speak",
                message="I'm having trouble checking availability. Let me try again.",
                data={"error": str(e)},
            )

    async def _h_offer_slots(self, ctx: SessionContext, event: str, data: dict) -> TransitionResult:
        if not ctx.available_slots:
            ctx.state = ConversationState.COLLECT_DATE
            return TransitionResult(
                state=ctx.state, action="speak",
                message="There are no available slots. Would you like to try another date?",
            )

        if ctx.time_slot and ctx.time_slot in ctx.available_slots:
            ctx.state = ConversationState.CONFIRM_APPOINTMENT
            return await self._h_confirm_appointment(ctx, "auto", {})

        slot_list = self._format_slots_for_voice(ctx.available_slots[:8])
        ctx.state = ConversationState.SELECT_SLOT
        return TransitionResult(
            state=ctx.state, action="speak",
            message=f"Available slots are: {slot_list}. Which slot would you like?",
            data={"available_slots": ctx.available_slots},
        )

    async def _h_select_slot(self, ctx: SessionContext, event: str, data: dict) -> TransitionResult:
        selected = data.get("time_slot") or data.get("entities", {}).get("time_preference")

        change_intent = data.get("intent") or data.get("entities", {}).get("intent")
        if change_intent in ("change_slot", "change_date", "change_provider", "change_location"):
            return await self._handle_change(ctx, change_intent, data)

        if not selected:
            slot_list = self._format_slots_for_voice(ctx.available_slots[:8])
            return TransitionResult(
                state=ctx.state, action="speak",
                message=f"Please select one of these slots: {slot_list}",
            )

        if selected not in ctx.available_slots:
            return TransitionResult(
                state=ctx.state, action="speak",
                message=f"{self._format_time(selected)} is not available. Please choose from the available slots.",
            )

        ctx.time_slot = selected
        ctx.state = ConversationState.CONFIRM_APPOINTMENT
        return await self._h_confirm_appointment(ctx, "auto", {})

    async def _h_confirm_appointment(self, ctx: SessionContext, event: str, data: dict) -> TransitionResult:
        confirmed = data.get("confirmed")

        if confirmed is None:
            return TransitionResult(
                state=ctx.state, action="speak",
                message=(
                    f"Please confirm. Your appointment with {ctx.doctor_name} "
                    f"at Aleem Hospital {ctx.location} branch "
                    f"is scheduled for {self._format_date(ctx.date)} at {self._format_time(ctx.time_slot)}. "
                    "Shall I confirm this?"
                ),
                data={
                    "doctor": ctx.doctor_name,
                    "location": ctx.location,
                    "date": ctx.date,
                    "time_slot": ctx.time_slot,
                },
            )

        if not confirmed:
            return TransitionResult(
                state=ctx.state, action="speak",
                message="No problem. Would you like to change the slot, date, doctor, or location?",
                data={"allow_changes": True},
            )

        ctx.state = ConversationState.SAVE_APPOINTMENT
        return await self._h_save_appointment(ctx, "auto", {})

    async def _h_save_appointment(self, ctx: SessionContext, event: str, data: dict) -> TransitionResult:
        from app.services.scheduling_engine import scheduling_engine

        try:
            result = await scheduling_engine.book_appointment(
                patient_id=ctx.patient_id,
                doctor_id=ctx.doctor_id,
                date=ctx.date,
                time_slot=ctx.time_slot,
                location=ctx.location,
                reason=ctx.reason or "Booked via AI voice agent",
                call_id=ctx.call_id,
            )

            ctx.appointment_id = result["appointment_id"]
            ctx.state = ConversationState.END_CALL
            return TransitionResult(
                state=ctx.state, action="speak",
                message=(
                    f"Your appointment has been booked successfully. "
                    f"Your appointment ID is {result['appointment_id']}. "
                    f"Doctor {ctx.doctor_name}, {self._format_date(ctx.date)} "
                    f"at {self._format_time(ctx.time_slot)}, {ctx.location} branch. "
                    "Is there anything else I can help you with?"
                ),
                data={"appointment_id": result["appointment_id"], "booked": True},
            )
        except Exception as e:
            logger.error(f"[FSM] Booking failed: {e}")
            return TransitionResult(
                state=ctx.state, action="speak",
                message=f"I'm sorry, I couldn't complete the booking: {str(e)}. Would you like to try a different slot?",
                data={"error": str(e)},
            )

    # ── Reschedule Flow ─────────────────────────────────────────────

    async def _h_reschedule_flow(self, ctx: SessionContext, event: str, data: dict) -> TransitionResult:
        from app.services.scheduling_engine import scheduling_engine

        if event == "start" or not ctx.appointment_id:
            appointments = await scheduling_engine.get_patient_upcoming_appointments(ctx.patient_id)

            if not appointments:
                ctx.state = ConversationState.END_CALL
                return TransitionResult(
                    state=ctx.state, action="speak",
                    message=(
                        f"{ctx.patient_name}, you don't have any upcoming appointments. "
                        "Would you like to book a new one?"
                    ),
                )

            if len(appointments) == 1:
                a = appointments[0]
                ctx.appointment_id = a["appointment_id"]
                ctx.original_date = a["date"]
                ctx.original_time = a["time_slot"]
                ctx.original_doctor = a["doctor_name"]
                ctx.doctor_id = a["doctor_id"]
                ctx.doctor_name = a["doctor_name"]
                ctx.location = a.get("location", ctx.location)

                ctx.date = None
                ctx.time_slot = None
                ctx.state = ConversationState.COLLECT_DATE
                return TransitionResult(
                    state=ctx.state, action="speak",
                    message=(
                        f"I found your appointment with {a['doctor_name']} on "
                        f"{self._format_date(a['date'])} at {self._format_time(a['time_slot'])}. "
                        "What new date would you like?"
                    ),
                    data={"appointment": a},
                )
            else:
                desc = "; ".join(
                    f"{a['appointment_id']}: {a['doctor_name']} on {a['date']} at {a['time_slot']}"
                    for a in appointments
                )
                return TransitionResult(
                    state=ctx.state, action="speak",
                    message=f"You have {len(appointments)} upcoming appointments: {desc}. Which one would you like to reschedule?",
                    data={"appointments": appointments},
                )
        else:
            try:
                result = await scheduling_engine.reschedule_appointment(
                    appointment_id=ctx.appointment_id,
                    new_date=ctx.date,
                    new_time_slot=ctx.time_slot,
                )
                ctx.state = ConversationState.END_CALL
                return TransitionResult(
                    state=ctx.state, action="speak",
                    message=(
                        f"Your appointment has been rescheduled to "
                        f"{self._format_date(ctx.date)} at {self._format_time(ctx.time_slot)}. "
                        "Is there anything else I can help with?"
                    ),
                    data={"rescheduled": True},
                )
            except Exception as e:
                return TransitionResult(
                    state=ctx.state, action="speak",
                    message=f"I couldn't reschedule: {str(e)}. Would you like to try different options?",
                )

    # ── Cancel Flow ─────────────────────────────────────────────────

    async def _h_cancel_flow(self, ctx: SessionContext, event: str, data: dict) -> TransitionResult:
        from app.services.scheduling_engine import scheduling_engine

        if event == "start" or not ctx.appointment_id:
            appointments = await scheduling_engine.get_patient_upcoming_appointments(ctx.patient_id)

            if not appointments:
                ctx.state = ConversationState.END_CALL
                return TransitionResult(
                    state=ctx.state, action="speak",
                    message="You don't have any upcoming appointments to cancel. Would you like to book one?",
                )

            if len(appointments) == 1:
                a = appointments[0]
                ctx.appointment_id = a["appointment_id"]
                ctx.state = ConversationState.CONFIRM_CANCELLATION
                return TransitionResult(
                    state=ctx.state, action="speak",
                    message=(
                        f"I found your appointment with {a['doctor_name']} on "
                        f"{self._format_date(a['date'])} at {self._format_time(a['time_slot'])}. "
                        "Are you sure you want to cancel it?"
                    ),
                )
            else:
                desc = "; ".join(
                    f"{a['appointment_id']}: {a['doctor_name']} on {a['date']} at {a['time_slot']}"
                    for a in appointments
                )
                return TransitionResult(
                    state=ctx.state, action="speak",
                    message=f"You have {len(appointments)} appointments: {desc}. Which one would you like to cancel?",
                    data={"appointments": appointments},
                )

        ctx.state = ConversationState.CONFIRM_CANCELLATION
        return await self._h_confirm_cancellation(ctx, event, data)

    async def _h_confirm_cancellation(self, ctx: SessionContext, event: str, data: dict) -> TransitionResult:
        confirmed = data.get("confirmed")

        if confirmed is None:
            return TransitionResult(
                state=ctx.state, action="speak",
                message="Are you sure you want to cancel this appointment? Please say yes or no.",
            )

        if not confirmed:
            ctx.state = ConversationState.END_CALL
            return TransitionResult(
                state=ctx.state, action="speak",
                message="Okay, your appointment will remain as scheduled. Is there anything else?",
            )

        from app.services.scheduling_engine import scheduling_engine
        try:
            await scheduling_engine.cancel_appointment(
                appointment_id=ctx.appointment_id,
                reason="Cancelled via AI voice agent",
            )
            ctx.state = ConversationState.END_CALL
            return TransitionResult(
                state=ctx.state, action="speak",
                message=(
                    f"Your appointment {ctx.appointment_id} has been cancelled. "
                    "Is there anything else I can help with?"
                ),
                data={"cancelled": True},
            )
        except Exception as e:
            return TransitionResult(
                state=ctx.state, action="speak",
                message=f"I couldn't cancel the appointment: {str(e)}",
            )

    # ── End / Fallback / Escalate ───────────────────────────────────

    async def _h_end_call(self, ctx: SessionContext, event: str, data: dict) -> TransitionResult:
        needs_more = data.get("needs_more") or data.get("confirmed")

        if needs_more:
            ctx.intent = None
            ctx.doctor_name = None
            ctx.doctor_id = None
            ctx.location = None
            ctx.date = None
            ctx.time_slot = None
            ctx.appointment_id = None
            ctx.available_slots = []
            ctx.state = ConversationState.IDENTIFY_INTENT
            return TransitionResult(
                state=ctx.state, action="speak",
                message="Sure, how else can I help you?",
            )

        self.end_session(ctx.call_id)
        return TransitionResult(
            state=ConversationState.END_CALL, action="hangup",
            message="Thank you for calling Aleem Hospital. Have a great day! Allah Hafiz.",
            require_input=False,
        )

    async def _h_fallback(self, ctx: SessionContext, event: str, data: dict) -> TransitionResult:
        ctx.fallback_count += 1
        if ctx.fallback_count >= 3:
            ctx.state = ConversationState.ESCALATE_TO_HUMAN
            return await self._h_escalate(ctx, event, data)

        ctx.state = ConversationState.IDENTIFY_INTENT
        return TransitionResult(
            state=ctx.state, action="speak",
            message=(
                "I'm not sure I understood. I can help you book, reschedule, "
                "or cancel an appointment. What would you like to do?"
            ),
        )

    async def _h_escalate(self, ctx: SessionContext, event: str, data: dict) -> TransitionResult:
        return TransitionResult(
            state=ConversationState.ESCALATE_TO_HUMAN, action="transfer",
            message="Let me connect you with a staff member who can better assist you. Please hold.",
            data={"escalated": True},
            require_input=False,
        )

    # ── Change Handlers ─────────────────────────────────────────────

    async def _handle_change(self, ctx: SessionContext, change_type: str, data: dict) -> TransitionResult:
        if change_type == "change_slot":
            ctx.time_slot = None
            slot_list = self._format_slots_for_voice(ctx.available_slots[:8])
            ctx.state = ConversationState.SELECT_SLOT
            return TransitionResult(
                state=ctx.state, action="speak",
                message=f"No problem. Available slots are: {slot_list}. Which one?",
            )
        elif change_type == "change_date":
            ctx.date = None
            ctx.time_slot = None
            ctx.available_slots = []
            ctx.state = ConversationState.COLLECT_DATE
            return TransitionResult(
                state=ctx.state, action="speak",
                message="What date would you prefer instead?",
            )
        elif change_type == "change_provider":
            ctx.doctor_name = None
            ctx.doctor_id = None
            ctx.date = None
            ctx.time_slot = None
            ctx.available_slots = []
            ctx.state = ConversationState.COLLECT_PROVIDER
            return TransitionResult(
                state=ctx.state, action="speak",
                message="Which doctor would you prefer? Dr Aleem, Dr Mohsin, or Dr Zain?",
            )
        elif change_type == "change_location":
            ctx.location = None
            ctx.state = ConversationState.COLLECT_LOCATION
            return TransitionResult(
                state=ctx.state, action="speak",
                message="Which location? Islamabad or Multan?",
            )
        return await self._h_fallback(ctx, "change", data)

    # ── Helpers ──────────────────────────────────────────────────────

    def _absorb_entities(self, ctx: SessionContext, entities: dict):
        mapping = {
            "first_name": "first_name", "last_name": "last_name",
            "provider": "doctor_name", "doctor": "doctor_name",
            "location": "location", "date": "date",
            "time_preference": "time_slot", "phone": "phone",
            "date_of_birth": "date_of_birth", "patient_name": "patient_name",
            "reason": "reason",
        }
        for key, attr in mapping.items():
            val = entities.get(key)
            if val:
                setattr(ctx, attr, val)

    def _format_slots_for_voice(self, slots: list[str]) -> str:
        formatted = [self._format_time(s) for s in slots]
        if len(formatted) <= 2:
            return " and ".join(formatted)
        return ", ".join(formatted[:-1]) + f", and {formatted[-1]}"

    @staticmethod
    def _format_time(time_24h: str) -> str:
        try:
            h, m = map(int, time_24h.split(":"))
            period = "AM" if h < 12 else "PM"
            h12 = h % 12 or 12
            if m == 0:
                return f"{h12} {period}"
            return f"{h12}:{m:02d} {period}"
        except (ValueError, AttributeError):
            return time_24h

    @staticmethod
    def _format_date(date_str: str) -> str:
        try:
            from datetime import date as d
            dt = d.fromisoformat(date_str)
            return dt.strftime("%B %d, %Y")
        except (ValueError, AttributeError):
            return date_str


# Singleton
workflow_engine = WorkflowEngine()
