"""
Aleem Voice Agent — LiveKit Agents Worker
==========================================
A production-grade voice AI receptionist for Aleem EHR Hospital.
Uses LiveKit Cloud for real-time voice transport with an
STT → LLM (GPT-4o) → TTS pipeline and function-calling tools.

Run locally:
    cd backend
    python -m app.livekit_agent dev
"""

import os
import uuid
from datetime import datetime, timezone
from typing import Optional

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
    function_tool,
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


# ── Hospital Receptionist Agent ─────────────────────────────────────

class HospitalAgent(Agent):
    """AI receptionist that handles appointment booking, rescheduling,
    cancellation, and doctor availability queries over voice."""

    def __init__(self) -> None:
        super().__init__(
            instructions=(
                "You are the AI receptionist for Aleem EHR Hospital. "
                "Your name is Aleem Voice Agent.\n\n"
                "You help patients with:\n"
                "1. Booking new appointments\n"
                "2. Rescheduling existing appointments\n"
                "3. Cancelling appointments\n"
                "4. Checking doctor availability\n"
                "5. General hospital inquiries\n\n"
                "RULES:\n"
                "- Always be polite, professional, and empathetic\n"
                "- Verify patient identity before making any changes "
                "(ask for phone number and date of birth)\n"
                "- When booking, confirm: doctor name, date, time slot, and reason\n"
                "- When rescheduling, confirm the original appointment details first\n"
                "- When cancelling, confirm the appointment and ask for the reason\n"
                "- If you're unsure, ask clarifying questions\n"
                "- Keep responses concise and natural for voice conversation "
                "(2-3 sentences max)\n"
                "- Never share other patients' information\n"
                "- If the patient has an emergency, advise them to call 911 "
                "or go to the ER\n"
                "- Use the provided function tools to perform actions when needed"
            ),
        )

    # ── Call lifecycle hooks ────────────────────────────────────────

    async def on_enter(self) -> None:
        """Create CallLog + Transcript when the agent starts."""
        await _ensure_db()

        from app.models.call_log import CallLog
        from app.models.transcript import Transcript
        from app.models.patient import Patient

        call_id = f"CALL-{uuid.uuid4().hex[:12].upper()}"
        self._call_id = call_id

        # Extract caller phone from SIP participant attributes
        caller_phone = "livekit-cloud"
        source = "web"
        if self.session and self.session.room_io:
            participant = self.session.room_io.linked_participant
            if participant:
                attrs = participant.attributes or {}
                # LiveKit sets sip.phoneNumber for SIP participants
                sip_phone = attrs.get("sip.phoneNumber", "")
                if sip_phone:
                    caller_phone = sip_phone
                    source = "telephony"

        call_log = CallLog(
            call_id=call_id,
            caller_phone=caller_phone,
            status="in_progress",
        )
        await call_log.insert()

        transcript = Transcript(call_id=call_id)
        await transcript.insert()

        # Try to identify patient by phone for SIP calls
        if source == "telephony" and caller_phone != "livekit-cloud":
            patient = await Patient.find_one(Patient.phone == caller_phone)
            if patient:
                call_log.patient_id = patient.patient_id
                call_log.patient_name = patient.full_name
                await call_log.save()

        logger.info(f"Voice call started: {call_id} from {caller_phone} ({source})")

        await self.session.generate_reply(
            instructions="Greet the patient warmly and ask how you can help them today."
        )

    # ── Function Tools ──────────────────────────────────────────────

    @function_tool()
    async def verify_patient(
        self,
        context: RunContext,
        phone: str,
        date_of_birth: str,
    ) -> dict:
        """Verify a patient's identity using their phone number and date of birth.

        Args:
            phone: Patient's phone number.
            date_of_birth: Patient's date of birth in YYYY-MM-DD format.
        """
        from app.models.patient import Patient

        patient = await Patient.find_one(Patient.phone == phone)
        if not patient:
            return {
                "verified": False,
                "error": "Patient not found with this phone number",
            }
        if patient.date_of_birth != date_of_birth:
            return {"verified": False, "error": "Date of birth does not match"}
        patient.is_verified = True
        await patient.save()
        return {
            "verified": True,
            "patient_id": patient.patient_id,
            "full_name": patient.full_name,
        }

    @function_tool()
    async def check_availability(
        self,
        context: RunContext,
        doctor_id: str,
        date: str,
    ) -> dict:
        """Check available appointment slots for a doctor on a specific date.

        Args:
            doctor_id: Doctor's employee ID (e.g. DOC001).
            date: Date to check in YYYY-MM-DD format.
        """
        from app.services.appointment_service import appointment_service

        try:
            result = await appointment_service.get_availability(doctor_id, date)
            return {
                "doctor": result.doctor_name,
                "date": result.date,
                "available_slots": [
                    s.time for s in result.slots if s.available
                ],
                "is_working_day": result.is_working_day,
                "message": result.message or "",
            }
        except Exception as e:
            return {"error": str(e)}

    @function_tool()
    async def book_appointment(
        self,
        context: RunContext,
        patient_id: str,
        doctor_id: str,
        date: str,
        time_slot: str,
        reason: str = "",
    ) -> dict:
        """Book a new appointment for a verified patient.

        Args:
            patient_id: Patient's ID (e.g. PAT-XXXXXXXX).
            doctor_id: Doctor's employee ID.
            date: Appointment date YYYY-MM-DD.
            time_slot: Time slot HH:MM (e.g. 10:00).
            reason: Reason for the visit.
        """
        from app.services.appointment_service import appointment_service
        from fastapi import HTTPException

        context.disallow_interruptions()
        try:
            appt = await appointment_service.book(
                patient_id=patient_id,
                doctor_id=doctor_id,
                appt_date=date,
                time_slot=time_slot,
                reason=reason,
                booked_via="voice",
                call_id=getattr(self, "_call_id", None),
            )
            return {
                "success": True,
                "appointment_id": appt.appointment_id,
                "patient_name": appt.patient_name,
                "doctor_name": appt.doctor_name,
                "date": appt.date,
                "time_slot": appt.time_slot,
            }
        except HTTPException as e:
            return {"error": e.detail}
        except Exception as e:
            return {"error": str(e)}

    @function_tool()
    async def reschedule_appointment(
        self,
        context: RunContext,
        appointment_id: str,
        new_date: str,
        new_time_slot: str,
    ) -> dict:
        """Reschedule an existing appointment to a new date and time.

        Args:
            appointment_id: The appointment ID to reschedule.
            new_date: New date YYYY-MM-DD.
            new_time_slot: New time slot HH:MM.
        """
        from app.services.appointment_service import appointment_service
        from fastapi import HTTPException

        context.disallow_interruptions()
        try:
            appt = await appointment_service.reschedule(
                appointment_id=appointment_id,
                new_date=new_date,
                new_time_slot=new_time_slot,
            )
            return {
                "success": True,
                "new_date": appt.date,
                "new_time": appt.time_slot,
            }
        except HTTPException as e:
            return {"error": e.detail}
        except Exception as e:
            return {"error": str(e)}

    @function_tool()
    async def cancel_appointment(
        self,
        context: RunContext,
        appointment_id: str,
        reason: str = "",
    ) -> dict:
        """Cancel an existing appointment.

        Args:
            appointment_id: The appointment ID to cancel.
            reason: Reason for cancellation.
        """
        from app.services.appointment_service import appointment_service
        from fastapi import HTTPException

        context.disallow_interruptions()
        try:
            appt = await appointment_service.cancel(
                appointment_id=appointment_id,
                reason=reason or "Cancelled via voice agent",
            )
            return {
                "success": True,
                "cancelled_appointment": appt.appointment_id,
            }
        except HTTPException as e:
            return {"error": e.detail}
        except Exception as e:
            return {"error": str(e)}

    @function_tool()
    async def list_doctors(
        self,
        context: RunContext,
        specialization: str = "",
    ) -> dict:
        """List available doctors, optionally filtered by specialization.

        Args:
            specialization: Filter by specialization (e.g. Cardiology, Pediatrics).
        """
        from app.models.doctor import Doctor

        query = {"is_active": True}
        if specialization:
            query["specialization"] = {
                "$regex": specialization,
                "$options": "i",
            }
        doctors = await Doctor.find(query).to_list()
        return {
            "doctors": [
                {
                    "employee_id": d.employee_id,
                    "name": d.full_name,
                    "specialization": d.specialization,
                }
                for d in doctors
            ]
        }

    @function_tool()
    async def get_patient_appointments(
        self,
        context: RunContext,
        patient_id: str,
    ) -> dict:
        """Get all upcoming appointments for a patient.

        Args:
            patient_id: Patient's ID.
        """
        from app.services.appointment_service import appointment_service
        from fastapi import HTTPException

        try:
            items, _ = await appointment_service.get_patient_appointments(
                patient_id, upcoming_only=True, limit=20
            )
            return {
                "appointments": [
                    {
                        "id": a.appointment_id,
                        "doctor": a.doctor_name,
                        "date": a.date,
                        "time": a.time_slot,
                        "status": (
                            a.status.value
                            if hasattr(a.status, "value")
                            else a.status
                        ),
                        "reason": a.reason or "",
                    }
                    for a in items
                ]
            }
        except HTTPException as e:
            return {"error": e.detail}
        except Exception as e:
            return {"error": str(e)}


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
