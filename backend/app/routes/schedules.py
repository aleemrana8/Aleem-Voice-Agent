"""
Doctor scheduling management router.

Endpoints for weekly schedule CRUD, holiday/override management,
and dynamic slot generation (daily, weekly, monthly views).
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from loguru import logger

from app.core.security import get_current_admin, get_current_user
from app.models.user import User
from app.schemas.schedule import (
    CreateHolidayRequest,
    CreateOverrideRequest,
    DayAvailabilityResponse,
    MonthlyAvailabilityResponse,
    OverrideResponse,
    SetWeeklyScheduleRequest,
    UpdateDayScheduleRequest,
    WeeklyAvailabilityResponse,
    WeeklyScheduleResponse,
)
from app.services.schedule_service import schedule_service

router = APIRouter(prefix="/schedules", tags=["Doctor Schedules"])


# ═══════════════════════════════════════════════════
#  Weekly Schedule CRUD
# ═══════════════════════════════════════════════════

@router.get(
    "/{doctor_id}/weekly",
    response_model=WeeklyScheduleResponse,
    summary="Get weekly schedule",
    description="Return the doctor's base weekly schedule with working hours, slot durations, and break timings.",
)
async def get_weekly_schedule(
    doctor_id: str,
    current_user: User = Depends(get_current_user),
):
    return await schedule_service.get_weekly_schedule(doctor_id)


@router.put(
    "/{doctor_id}/weekly",
    response_model=WeeklyScheduleResponse,
    summary="Set weekly schedule",
    description=(
        "Replace the entire weekly schedule for a doctor. "
        "Each day can have different working hours, slot durations, and break windows."
    ),
)
async def set_weekly_schedule(
    doctor_id: str,
    body: SetWeeklyScheduleRequest,
    admin: User = Depends(get_current_admin),
):
    return await schedule_service.set_weekly_schedule(doctor_id, body.schedule)


@router.put(
    "/{doctor_id}/weekly/{day}",
    response_model=WeeklyScheduleResponse,
    summary="Update single day schedule",
    description="Update working hours, slot duration, and breaks for a specific weekday.",
    responses={
        400: {"description": "Invalid day name"},
    },
)
async def update_day_schedule(
    doctor_id: str,
    day: str,
    body: UpdateDayScheduleRequest,
    admin: User = Depends(get_current_admin),
):
    return await schedule_service.update_day_schedule(
        doctor_id=doctor_id,
        day=day,
        start=body.start,
        end=body.end,
        slot_duration=body.slot_duration,
        breaks=body.breaks,
    )


@router.delete(
    "/{doctor_id}/weekly/{day}",
    response_model=WeeklyScheduleResponse,
    summary="Remove day from schedule",
    description="Remove a weekday from the schedule, marking it as a day off.",
)
async def remove_day_schedule(
    doctor_id: str,
    day: str,
    admin: User = Depends(get_current_admin),
):
    return await schedule_service.remove_day_schedule(doctor_id, day)


# ═══════════════════════════════════════════════════
#  Holidays & Overrides
# ═══════════════════════════════════════════════════

@router.post(
    "/{doctor_id}/holidays",
    response_model=List[OverrideResponse],
    status_code=201,
    summary="Create holidays / leave",
    description=(
        "Mark one or more dates as unavailable for a doctor. "
        "Supports bulk creation. Existing overrides for those dates are replaced."
    ),
)
async def create_holidays(
    doctor_id: str,
    body: CreateHolidayRequest,
    admin: User = Depends(get_current_admin),
):
    return await schedule_service.create_holidays(
        doctor_id=doctor_id,
        dates=body.dates,
        reason=body.reason,
        override_type=body.override_type,
    )


@router.post(
    "/{doctor_id}/overrides",
    response_model=OverrideResponse,
    status_code=201,
    summary="Create schedule override",
    description=(
        "Create a date-specific override: modified hours, blocked slots, "
        "extra hours, or break changes. Upserts if an override already exists."
    ),
)
async def create_override(
    doctor_id: str,
    body: CreateOverrideRequest,
    admin: User = Depends(get_current_admin),
):
    return await schedule_service.create_override(
        doctor_id=doctor_id,
        date=body.date,
        is_available=body.is_available,
        override_type=body.override_type,
        override_start=body.override_start,
        override_end=body.override_end,
        blocked_slots=body.blocked_slots,
        override_breaks=body.override_breaks,
        reason=body.reason,
    )


@router.get(
    "/{doctor_id}/overrides",
    response_model=List[OverrideResponse],
    summary="List overrides",
    description="List all date-specific overrides for a doctor, optionally filtered by date range or type.",
)
async def list_overrides(
    doctor_id: str,
    date_from: Optional[str] = Query(
        None, pattern=r"^\d{4}-\d{2}-\d{2}$", description="Start date filter",
    ),
    date_to: Optional[str] = Query(
        None, pattern=r"^\d{4}-\d{2}-\d{2}$", description="End date filter",
    ),
    override_type: Optional[str] = Query(
        None, description="Filter: holiday | leave | custom | extra_hours",
    ),
    current_user: User = Depends(get_current_user),
):
    return await schedule_service.list_overrides(
        doctor_id=doctor_id,
        date_from=date_from,
        date_to=date_to,
        override_type=override_type,
    )


@router.delete(
    "/{doctor_id}/overrides/{date}",
    status_code=204,
    summary="Delete override",
    description="Remove a date-specific override, reverting to the base weekly schedule.",
)
async def delete_override(
    doctor_id: str,
    date: str,
    admin: User = Depends(get_current_admin),
):
    await schedule_service.delete_override(doctor_id, date)


# ═══════════════════════════════════════════════════
#  Dynamic Slot Generation
# ═══════════════════════════════════════════════════

@router.get(
    "/{doctor_id}/availability/daily",
    response_model=DayAvailabilityResponse,
    summary="Daily availability",
    description=(
        "Generate all time slots for a doctor on a specific date with "
        "detailed per-slot status (available, break, blocked, booked)."
    ),
)
async def daily_availability(
    doctor_id: str,
    date: str = Query(
        ..., pattern=r"^\d{4}-\d{2}-\d{2}$", description="Date (YYYY-MM-DD)",
    ),
    current_user: User = Depends(get_current_user),
):
    return await schedule_service.get_day_availability(doctor_id, date)


@router.get(
    "/{doctor_id}/availability/weekly",
    response_model=WeeklyAvailabilityResponse,
    summary="Weekly availability",
    description=(
        "Generate availability for an entire week (Mon-Sun). "
        "Automatically snaps to the Monday of the requested week."
    ),
)
async def weekly_availability(
    doctor_id: str,
    week_start: str = Query(
        ...,
        pattern=r"^\d{4}-\d{2}-\d{2}$",
        description="Any date in the target week (snaps to Monday)",
    ),
    current_user: User = Depends(get_current_user),
):
    return await schedule_service.get_weekly_availability(doctor_id, week_start)


@router.get(
    "/{doctor_id}/availability/monthly",
    response_model=MonthlyAvailabilityResponse,
    summary="Monthly availability",
    description=(
        "Generate a per-day availability summary for an entire month. "
        "Includes working days count, holiday count, and total slot stats."
    ),
)
async def monthly_availability(
    doctor_id: str,
    month: str = Query(
        ...,
        pattern=r"^\d{4}-\d{2}$",
        description="Month (YYYY-MM)",
        examples=["2026-06"],
    ),
    current_user: User = Depends(get_current_user),
):
    return await schedule_service.get_monthly_availability(doctor_id, month)
