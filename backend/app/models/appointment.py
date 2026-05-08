"""
Appointment document model.
Includes slot-level conflict prevention via compound unique index
and model validators for scheduling rules.
"""

import uuid
from datetime import date, datetime, timezone
from typing import Optional

from beanie import Document, Indexed, before_event, Insert, Replace
from pydantic import BaseModel, Field, field_validator, model_validator

from app.models.enums import AppointmentStatus, BookingSource


# ── Document ────────────────────────────────────────
class Appointment(Document):
    appointment_id: str = Field(
        default_factory=lambda: f"APT-{uuid.uuid4().hex[:8].upper()}"
    )
    patient_id: Indexed(str)
    doctor_id: Indexed(str)
    patient_name: str
    doctor_name: str
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    time_slot: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    duration: int = Field(30, ge=5, le=180, description="Duration in minutes")
    reason: Optional[str] = Field(None, max_length=500)
    status: AppointmentStatus = AppointmentStatus.SCHEDULED
    notes: Optional[str] = Field(None, max_length=1000)
    booked_via: BookingSource = BookingSource.VOICE
    call_id: Optional[str] = None
    cancelled_at: Optional[datetime] = None
    cancelled_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @field_validator("date")
    @classmethod
    def date_not_in_past(cls, v: str) -> str:
        if date.fromisoformat(v) < date.today():
            raise ValueError("Appointment date cannot be in the past")
        return v

    @field_validator("time_slot")
    @classmethod
    def valid_time(cls, v: str) -> str:
        h, m = map(int, v.split(":"))
        if not (0 <= h <= 23 and 0 <= m <= 59):
            raise ValueError("Invalid time slot")
        return v

    @model_validator(mode="after")
    def validate_cancellation(self):
        """Ensure cancelled_at is set when status is cancelled."""
        if self.status == AppointmentStatus.CANCELLED and not self.cancelled_at:
            self.cancelled_at = datetime.now(timezone.utc)
        return self

    @before_event(Replace)
    def bump_updated_at(self):
        self.updated_at = datetime.now(timezone.utc)

    class Settings:
        name = "appointments"
        indexes = [
            "appointment_id",
            "status",
            "date",
            # Compound index for conflict prevention:
            # Only one active appointment per doctor+date+time_slot
            [("doctor_id", 1), ("date", 1), ("time_slot", 1), ("status", 1)],
            # Patient appointment lookup
            [("patient_id", 1), ("date", 1)],
        ]

    # ── Conflict Check (class method) ──────────────
    @classmethod
    async def has_conflict(
        cls, doctor_id: str, appt_date: str, time_slot: str, exclude_id: str = None
    ) -> bool:
        """Check if a time slot is already booked for a doctor on a given date."""
        query = {
            "doctor_id": doctor_id,
            "date": appt_date,
            "time_slot": time_slot,
            "status": {"$in": [
                AppointmentStatus.SCHEDULED.value,
                AppointmentStatus.CONFIRMED.value,
            ]},
        }
        if exclude_id:
            from bson import ObjectId
            query["_id"] = {"$ne": ObjectId(exclude_id)}
        count = await cls.find(query).count()
        return count > 0


# ── Request/Response Schemas ───────────────────────
class AppointmentCreate(BaseModel):
    patient_id: str
    doctor_id: str
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    time_slot: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    duration: int = Field(30, ge=5, le=180)
    reason: Optional[str] = Field(None, max_length=500)
    booked_via: BookingSource = BookingSource.DASHBOARD


class AppointmentReschedule(BaseModel):
    new_date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    new_time_slot: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    reason: Optional[str] = Field(None, max_length=500)


class AppointmentResponse(BaseModel):
    id: str
    appointment_id: str
    patient_id: str
    doctor_id: str
    patient_name: str
    doctor_name: str
    date: str
    time_slot: str
    duration: int
    reason: Optional[str] = None
    status: AppointmentStatus
    booked_via: BookingSource
    notes: Optional[str] = None
    cancelled_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_doc(cls, appt: "Appointment") -> "AppointmentResponse":
        return cls(
            id=str(appt.id),
            appointment_id=appt.appointment_id,
            patient_id=appt.patient_id,
            doctor_id=appt.doctor_id,
            patient_name=appt.patient_name,
            doctor_name=appt.doctor_name,
            date=appt.date,
            time_slot=appt.time_slot,
            duration=appt.duration,
            reason=appt.reason,
            status=appt.status,
            booked_via=appt.booked_via,
            notes=appt.notes,
            cancelled_at=appt.cancelled_at,
            created_at=appt.created_at,
            updated_at=appt.updated_at,
        )
