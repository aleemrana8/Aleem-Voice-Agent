"""
Public API router — unauthenticated endpoints for the public website.

Provides:
- GET  /public/doctors       — list active doctors
- POST /public/availability  — check slot availability
- POST /public/book          — book appointment (auto-creates patient)
"""

from typing import Optional

from fastapi import APIRouter, HTTPException, status
from loguru import logger
from pydantic import BaseModel, Field

from app.models.doctor import Doctor
from app.models.patient import Patient
from app.services.appointment_service import appointment_service
from app.services.doctor_service import doctor_service
from app.services.livekit_service import livekit_service

router = APIRouter(prefix="/public", tags=["Public"])


# ── Schemas ─────────────────────────────────────────

class PublicDoctorResponse(BaseModel):
    doctor_id: str
    name: str
    specialization: str
    locations: list[str]
    qualification: str
    consultation_fee: float


class AvailabilityRequest(BaseModel):
    doctor_id: str = Field(..., min_length=3)
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")


class PublicBookRequest(BaseModel):
    doctor_id: str = Field(..., min_length=3)
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    time_slot: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    patient_name: str = Field(..., min_length=2, max_length=120)
    patient_phone: str = Field(..., min_length=7, max_length=20)
    reason: Optional[str] = Field(None, max_length=500)


# ── Endpoints ───────────────────────────────────────

@router.get("/doctors", response_model=list[PublicDoctorResponse])
async def list_public_doctors():
    """List all active doctors (no auth required)."""
    doctors = await Doctor.find(Doctor.is_active == True).to_list()
    return [
        PublicDoctorResponse(
            doctor_id=d.employee_id,
            name=d.full_name,
            specialization=d.specialization,
            locations=getattr(d, "locations", ["Islamabad"]),
            qualification=d.qualification or "",
            consultation_fee=d.consultation_fee or 0,
        )
        for d in doctors
    ]


@router.post("/availability")
async def check_public_availability(body: AvailabilityRequest):
    """Check doctor availability for a date (no auth required)."""
    return await doctor_service.check_availability(body.doctor_id, body.date)


@router.post("/book")
async def book_public_appointment(body: PublicBookRequest):
    """Book appointment from public website (auto-creates patient if needed)."""

    # Find or create patient by phone
    patient = await Patient.find_one(Patient.phone == body.patient_phone)
    if not patient:
        patient = Patient(
            full_name=body.patient_name,
            phone=body.patient_phone,
        )
        await patient.insert()
        logger.info(f"Public booking: created patient {patient.patient_id} ({body.patient_name})")

    # Book appointment
    try:
        appt = await appointment_service.book(
            patient_id=patient.patient_id,
            doctor_id=body.doctor_id,
            appt_date=body.date,
            time_slot=body.time_slot,
            reason=body.reason,
            booked_via="website",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Public booking error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "appointment_id": appt.appointment_id,
        "patient_name": patient.full_name,
        "doctor_name": appt.doctor_name,
        "date": appt.date,
        "time_slot": appt.time_slot,
        "status": appt.status.value if hasattr(appt.status, "value") else appt.status,
        "message": "Appointment booked successfully",
    }


# ── LiveKit Voice Agent ─────────────────────────────


@router.post("/livekit/connect")
async def public_livekit_connect():
    """Get a LiveKit room token to connect with the AI voice agent.
    No authentication required — anyone can start a voice call."""
    try:
        data = livekit_service.create_room_and_token("web-user")
        return data
    except Exception as e:
        logger.error(f"LiveKit connect error: {e}")
        raise HTTPException(status_code=500, detail="Could not start voice call")
