"""
Appointment request / response schemas.

Separated from the Beanie Document so that the API contract is independent
of the persistence layer.  Every schema carries its own field-level
documentation — Swagger picks it up automatically.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator

from app.models.enums import AppointmentStatus, BookingSource


# ── Request Bodies ──────────────────────────────────

class BookAppointmentRequest(BaseModel):
    """Body for POST /appointments — book a new appointment."""

    patient_id: str = Field(
        ..., min_length=3, description="Unique patient identifier (PAT-XXXXXXXX)"
    )
    doctor_id: str = Field(
        ..., min_length=3, description="Unique doctor identifier (DOC-XXXXXX)"
    )
    date: str = Field(
        ...,
        pattern=r"^\d{4}-\d{2}-\d{2}$",
        description="Appointment date in ISO-8601 format (YYYY-MM-DD)",
        examples=["2026-05-15"],
    )
    time_slot: str = Field(
        ...,
        pattern=r"^\d{2}:\d{2}$",
        description="Start time in 24-hour format (HH:MM)",
        examples=["09:30"],
    )
    duration: int = Field(
        30, ge=5, le=180, description="Duration in minutes (default 30)"
    )
    reason: Optional[str] = Field(
        None, max_length=500, description="Reason for visit"
    )
    booked_via: BookingSource = Field(
        BookingSource.DASHBOARD, description="Booking channel"
    )
    call_id: Optional[str] = Field(
        None, description="Linked voice call ID (set automatically for voice bookings)"
    )


class RescheduleAppointmentRequest(BaseModel):
    """Body for PUT /appointments/{id}/reschedule."""

    new_date: str = Field(
        ...,
        pattern=r"^\d{4}-\d{2}-\d{2}$",
        description="New date in ISO-8601 format",
        examples=["2026-05-20"],
    )
    new_time_slot: str = Field(
        ...,
        pattern=r"^\d{2}:\d{2}$",
        description="New start time in 24-hour format",
        examples=["14:00"],
    )
    reason: Optional[str] = Field(
        None, max_length=500, description="Reason for rescheduling"
    )

    @field_validator("new_time_slot")
    @classmethod
    def valid_time(cls, v: str) -> str:
        h, m = map(int, v.split(":"))
        if not (0 <= h <= 23 and 0 <= m <= 59):
            raise ValueError("Invalid time value")
        return v


class CancelAppointmentRequest(BaseModel):
    """Body for PUT /appointments/{id}/cancel."""

    reason: Optional[str] = Field(
        None, max_length=500, description="Cancellation reason"
    )
    cancelled_by: Optional[str] = Field(
        None, description="Identifier of the person/system cancelling"
    )


# ── Response Bodies ─────────────────────────────────

class AppointmentDetail(BaseModel):
    """Full appointment detail returned by single-item endpoints."""

    id: str = Field(..., description="MongoDB ObjectId")
    appointment_id: str = Field(..., description="Human-readable ID (APT-XXXXXXXX)")
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
    call_id: Optional[str] = None
    cancelled_at: Optional[datetime] = None
    cancelled_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_doc(cls, doc) -> "AppointmentDetail":
        return cls(
            id=str(doc.id),
            appointment_id=doc.appointment_id,
            patient_id=doc.patient_id,
            doctor_id=doc.doctor_id,
            patient_name=doc.patient_name,
            doctor_name=doc.doctor_name,
            date=doc.date,
            time_slot=doc.time_slot,
            duration=doc.duration,
            reason=doc.reason,
            status=doc.status,
            booked_via=doc.booked_via,
            notes=doc.notes,
            call_id=doc.call_id,
            cancelled_at=doc.cancelled_at,
            cancelled_by=doc.cancelled_by,
            created_at=doc.created_at,
            updated_at=doc.updated_at,
        )


class AppointmentListItem(BaseModel):
    """Slimmed-down appointment shown in list / history endpoints."""

    id: str
    appointment_id: str
    patient_name: str
    doctor_name: str
    date: str
    time_slot: str
    duration: int
    status: AppointmentStatus
    booked_via: BookingSource
    created_at: datetime

    @classmethod
    def from_doc(cls, doc) -> "AppointmentListItem":
        return cls(
            id=str(doc.id),
            appointment_id=doc.appointment_id,
            patient_name=doc.patient_name,
            doctor_name=doc.doctor_name,
            date=doc.date,
            time_slot=doc.time_slot,
            duration=doc.duration,
            status=doc.status,
            booked_via=doc.booked_via,
            created_at=doc.created_at,
        )


# ── Availability ────────────────────────────────────

class AvailabilityRequest(BaseModel):
    """Query parameters for doctor availability check."""

    doctor_id: str = Field(..., description="Doctor employee_id")
    date: str = Field(
        ...,
        pattern=r"^\d{4}-\d{2}-\d{2}$",
        description="Date to check (YYYY-MM-DD)",
        examples=["2026-05-15"],
    )


class TimeSlot(BaseModel):
    """A single time-slot with its booking state."""

    time: str = Field(..., description="HH:MM")
    available: bool


class AvailabilityResponse(BaseModel):
    """Doctor availability for a specific date."""

    doctor_id: str
    doctor_name: str
    date: str
    day: str = Field(..., description="Day of week (lowercase)")
    slots: List[TimeSlot] = Field(
        default_factory=list,
        description="All time slots with availability status",
    )
    available_count: int = 0
    booked_count: int = 0
    total_count: int = 0
    is_working_day: bool = True
    has_override: bool = Field(
        False, description="True if DoctorAvailability override exists for this date"
    )
    message: Optional[str] = None


# ── Stats ───────────────────────────────────────────

class AppointmentStatsResponse(BaseModel):
    """Dashboard appointment statistics."""

    total: int = 0
    scheduled: int = 0
    confirmed: int = 0
    completed: int = 0
    cancelled: int = 0
    rescheduled: int = 0
    no_show: int = 0
    today: int = 0
