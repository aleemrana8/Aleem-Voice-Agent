"""
Doctor document model + DoctorAvailability model.
Stores physician profiles with embedded weekly schedules
and a separate availability collection for date-specific overrides.
"""

import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional

from beanie import Document, Indexed, before_event, Replace
from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.enums import DayOfWeek


# ── Embedded Schemas ────────────────────────────────
class DaySchedule(BaseModel):
    """A doctor's working hours for a single day."""
    start: str = Field(..., pattern=r"^\d{2}:\d{2}$", description="HH:MM")
    end: str = Field(..., pattern=r"^\d{2}:\d{2}$", description="HH:MM")
    slot_duration: int = Field(30, ge=5, le=120, description="Minutes per slot")

    @field_validator("end")
    @classmethod
    def end_after_start(cls, v: str, info) -> str:
        start = info.data.get("start")
        if start and v <= start:
            raise ValueError("End time must be after start time")
        return v


# ── Doctor Document ─────────────────────────────────
class Doctor(Document):
    employee_id: Indexed(str, unique=True) = Field(
        default_factory=lambda: f"DOC-{uuid.uuid4().hex[:6].upper()}"
    )
    full_name: str = Field(..., min_length=2, max_length=120)
    specialization: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., pattern=r"^\+?[\d\s\-()]{7,20}$")
    email: Optional[EmailStr] = None
    qualification: Optional[str] = Field(None, max_length=200)
    experience_years: Optional[int] = Field(None, ge=0, le=60)
    consultation_fee: Optional[float] = Field(None, ge=0)
    schedule: Dict[str, DaySchedule] = Field(
        default_factory=dict,
        description="Weekly schedule keyed by lowercase day name",
    )
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @field_validator("schedule")
    @classmethod
    def validate_schedule_keys(cls, v: Dict[str, DaySchedule]) -> Dict[str, DaySchedule]:
        valid_days = {d.value for d in DayOfWeek}
        for key in v:
            if key not in valid_days:
                raise ValueError(
                    f"Invalid day '{key}'. Must be one of: {', '.join(valid_days)}"
                )
        return v

    @before_event(Replace)
    def bump_updated_at(self):
        self.updated_at = datetime.now(timezone.utc)

    class Settings:
        name = "doctors"
        indexes = [
            "specialization",
            "is_active",
        ]


# ── DoctorAvailability Document ────────────────────
class DoctorAvailability(Document):
    """
    Date-specific availability overrides (holidays, extra hours, blocks).
    Separate from the weekly schedule embedded in Doctor.
    """
    availability_id: str = Field(
        default_factory=lambda: f"AVL-{uuid.uuid4().hex[:8].upper()}"
    )
    doctor_id: Indexed(str)
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    is_available: bool = True
    override_start: Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}$")
    override_end: Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}$")
    blocked_slots: List[str] = Field(
        default_factory=list, description="List of HH:MM slots blocked"
    )
    reason: Optional[str] = Field(None, max_length=200)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "doctor_availability"
        indexes = [
            [("doctor_id", 1), ("date", 1)],
        ]


# ── Request/Response Schemas ───────────────────────
class DoctorCreate(BaseModel):
    employee_id: Optional[str] = None
    full_name: str = Field(..., min_length=2, max_length=120)
    specialization: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., pattern=r"^\+?[\d\s\-()]{7,20}$")
    email: Optional[EmailStr] = None
    qualification: Optional[str] = None
    experience_years: Optional[int] = Field(None, ge=0, le=60)
    consultation_fee: Optional[float] = Field(None, ge=0)
    schedule: Dict[str, DaySchedule] = Field(default_factory=dict)


class DoctorUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=120)
    specialization: Optional[str] = None
    phone: Optional[str] = Field(None, pattern=r"^\+?[\d\s\-()]{7,20}$")
    email: Optional[EmailStr] = None
    qualification: Optional[str] = None
    experience_years: Optional[int] = Field(None, ge=0, le=60)
    consultation_fee: Optional[float] = Field(None, ge=0)
    schedule: Optional[Dict[str, DaySchedule]] = None
    is_active: Optional[bool] = None


class DoctorResponse(BaseModel):
    id: str
    employee_id: str
    full_name: str
    specialization: str
    phone: str
    email: Optional[str] = None
    qualification: Optional[str] = None
    experience_years: Optional[int] = None
    consultation_fee: Optional[float] = None
    schedule: Dict[str, DaySchedule] = {}
    is_active: bool
    created_at: datetime

    @classmethod
    def from_doc(cls, doctor: "Doctor") -> "DoctorResponse":
        return cls(
            id=str(doctor.id),
            employee_id=doctor.employee_id,
            full_name=doctor.full_name,
            specialization=doctor.specialization,
            phone=doctor.phone,
            email=doctor.email,
            qualification=doctor.qualification,
            experience_years=doctor.experience_years,
            consultation_fee=doctor.consultation_fee,
            schedule=doctor.schedule,
            is_active=doctor.is_active,
            created_at=doctor.created_at,
        )


class DoctorAvailabilityRequest(BaseModel):
    doctor_id: str
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")


class DoctorAvailabilityResponse(BaseModel):
    doctor: str
    date: str
    available_slots: List[str]
    total_slots: int
    booked_slots: int
    is_override: bool = False
