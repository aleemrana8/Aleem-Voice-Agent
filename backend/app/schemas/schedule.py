"""
Doctor scheduling schemas — request/response models for the
schedule management router.
"""

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field, field_validator, model_validator

from app.models.enums import DayOfWeek


# ═══════════════════════════════════════════════════
#  Embedded / shared types
# ═══════════════════════════════════════════════════

class BreakTimeSchema(BaseModel):
    """A break window within a working day."""
    start: str = Field(
        ..., pattern=r"^\d{2}:\d{2}$", description="Break start (HH:MM)",
        examples=["12:00"],
    )
    end: str = Field(
        ..., pattern=r"^\d{2}:\d{2}$", description="Break end (HH:MM)",
        examples=["13:00"],
    )
    label: str = Field(
        "Break", max_length=50, description="e.g. Lunch, Prayer, Tea",
    )

    @field_validator("end")
    @classmethod
    def end_after_start(cls, v: str, info) -> str:
        start = info.data.get("start")
        if start and v <= start:
            raise ValueError("Break end time must be after start time")
        return v


class DayScheduleSchema(BaseModel):
    """Working-hours definition for a single weekday."""
    start: str = Field(
        ..., pattern=r"^\d{2}:\d{2}$", description="Day start (HH:MM)",
        examples=["09:00"],
    )
    end: str = Field(
        ..., pattern=r"^\d{2}:\d{2}$", description="Day end (HH:MM)",
        examples=["17:00"],
    )
    slot_duration: int = Field(
        30, ge=5, le=120, description="Minutes per appointment slot",
    )
    breaks: List[BreakTimeSchema] = Field(
        default_factory=list,
        description="Break windows excluded from slot generation",
    )

    @field_validator("end")
    @classmethod
    def end_after_start(cls, v: str, info) -> str:
        start = info.data.get("start")
        if start and v <= start:
            raise ValueError("End time must be after start time")
        return v


# ═══════════════════════════════════════════════════
#  Weekly Schedule CRUD
# ═══════════════════════════════════════════════════

class SetWeeklyScheduleRequest(BaseModel):
    """Replace the entire weekly schedule for a doctor."""
    schedule: Dict[str, DayScheduleSchema] = Field(
        ..., description="Map of day name → working hours",
    )

    @field_validator("schedule")
    @classmethod
    def validate_days(cls, v):
        valid = {d.value for d in DayOfWeek}
        for key in v:
            if key not in valid:
                raise ValueError(f"Invalid day '{key}'. Use: {', '.join(sorted(valid))}")
        return v


class UpdateDayScheduleRequest(BaseModel):
    """Update the schedule for a single weekday."""
    start: str = Field(..., pattern=r"^\d{2}:\d{2}$", examples=["09:00"])
    end: str = Field(..., pattern=r"^\d{2}:\d{2}$", examples=["17:00"])
    slot_duration: int = Field(30, ge=5, le=120)
    breaks: List[BreakTimeSchema] = Field(default_factory=list)

    @field_validator("end")
    @classmethod
    def end_after_start(cls, v: str, info) -> str:
        start = info.data.get("start")
        if start and v <= start:
            raise ValueError("End time must be after start time")
        return v


class WeeklyScheduleResponse(BaseModel):
    """Full weekly schedule for a doctor."""
    doctor_id: str
    doctor_name: str
    schedule: Dict[str, DayScheduleSchema]
    working_days: List[str] = Field(description="Days the doctor works")
    off_days: List[str] = Field(description="Days the doctor is off")


# ═══════════════════════════════════════════════════
#  Holidays / Availability Overrides
# ═══════════════════════════════════════════════════

class CreateHolidayRequest(BaseModel):
    """Mark a doctor as unavailable on specific date(s)."""
    dates: List[str] = Field(
        ...,
        min_length=1,
        description="List of dates (YYYY-MM-DD) to mark as holidays",
        examples=[["2026-06-01", "2026-06-02"]],
    )
    reason: Optional[str] = Field(None, max_length=200, examples=["Annual leave"])
    override_type: str = Field(
        "holiday",
        description="holiday | leave",
    )

    @field_validator("dates")
    @classmethod
    def validate_date_format(cls, v):
        import re
        pattern = re.compile(r"^\d{4}-\d{2}-\d{2}$")
        for d in v:
            if not pattern.match(d):
                raise ValueError(f"Invalid date format: '{d}'. Use YYYY-MM-DD")
        return v

    @field_validator("override_type")
    @classmethod
    def valid_type(cls, v):
        if v not in ("holiday", "leave"):
            raise ValueError("override_type must be 'holiday' or 'leave'")
        return v


class CreateOverrideRequest(BaseModel):
    """Create a date-specific schedule override (modified hours, blocked slots, extra hours)."""
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$", examples=["2026-06-15"])
    is_available: bool = Field(True, description="False = entire day blocked")
    override_type: str = Field("custom", description="custom | extra_hours")
    override_start: Optional[str] = Field(
        None, pattern=r"^\d{2}:\d{2}$", description="Modified start time",
    )
    override_end: Optional[str] = Field(
        None, pattern=r"^\d{2}:\d{2}$", description="Modified end time",
    )
    blocked_slots: List[str] = Field(
        default_factory=list,
        description="Specific HH:MM slots to block",
    )
    override_breaks: List[BreakTimeSchema] = Field(
        default_factory=list,
        description="Break overrides for this specific date",
    )
    reason: Optional[str] = Field(None, max_length=200)

    @model_validator(mode="after")
    def validate_override_hours(self):
        if self.override_start and self.override_end:
            if self.override_end <= self.override_start:
                raise ValueError("override_end must be after override_start")
        if (self.override_start is None) != (self.override_end is None):
            raise ValueError("Provide both override_start and override_end, or neither")
        return self


class OverrideResponse(BaseModel):
    """A single date-specific override."""
    availability_id: str
    doctor_id: str
    date: str
    is_available: bool
    override_type: str
    override_start: Optional[str] = None
    override_end: Optional[str] = None
    blocked_slots: List[str] = []
    override_breaks: List[BreakTimeSchema] = []
    reason: Optional[str] = None
    created_at: datetime

    @classmethod
    def from_doc(cls, doc) -> "OverrideResponse":
        return cls(
            availability_id=doc.availability_id,
            doctor_id=doc.doctor_id,
            date=doc.date,
            is_available=doc.is_available,
            override_type=doc.override_type,
            override_start=doc.override_start,
            override_end=doc.override_end,
            blocked_slots=doc.blocked_slots,
            override_breaks=[
                BreakTimeSchema(start=b.start, end=b.end, label=b.label)
                for b in (doc.override_breaks or [])
            ],
            reason=doc.reason,
            created_at=doc.created_at,
        )


# ═══════════════════════════════════════════════════
#  Slot generation responses
# ═══════════════════════════════════════════════════

class SlotDetail(BaseModel):
    """A single time-slot with availability metadata."""
    time: str = Field(..., description="HH:MM")
    available: bool
    is_break: bool = Field(False, description="Falls within a break window")
    is_blocked: bool = Field(False, description="Explicitly blocked by override")
    is_booked: bool = Field(False, description="Occupied by an appointment")


class DayAvailabilityResponse(BaseModel):
    """Complete availability for a doctor on a single date."""
    doctor_id: str
    doctor_name: str
    date: str
    day: str = Field(..., description="Lowercase day of week")
    is_working_day: bool = True
    override_type: Optional[str] = None
    working_hours: Optional[Dict[str, str]] = Field(
        None, description='{"start": "09:00", "end": "17:00"}',
    )
    breaks: List[BreakTimeSchema] = []
    slots: List[SlotDetail] = []
    available_count: int = 0
    booked_count: int = 0
    break_count: int = 0
    blocked_count: int = 0
    total_count: int = 0
    message: Optional[str] = None


class WeeklyAvailabilityResponse(BaseModel):
    """Availability for an entire week (7 days)."""
    doctor_id: str
    doctor_name: str
    week_start: str = Field(..., description="Monday date (YYYY-MM-DD)")
    week_end: str = Field(..., description="Sunday date (YYYY-MM-DD)")
    days: List[DayAvailabilityResponse]
    total_available: int = 0
    total_booked: int = 0


class MonthlyAvailabilityResponse(BaseModel):
    """Monthly overview — one summary per day."""
    doctor_id: str
    doctor_name: str
    month: str = Field(..., description="YYYY-MM")
    days: List[DayAvailabilityResponse]
    working_days_count: int = 0
    holiday_count: int = 0
    total_available: int = 0
    total_booked: int = 0
