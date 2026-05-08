"""
Appointment API router.

All business logic lives in AppointmentService — this module is purely
responsible for HTTP concerns: request parsing, auth, response formatting.
"""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from loguru import logger

from app.core.security import get_current_user
from app.models.enums import AppointmentStatus
from app.models.user import User
from app.schemas.appointment import (
    AppointmentDetail,
    AppointmentListItem,
    AppointmentStatsResponse,
    AvailabilityResponse,
    BookAppointmentRequest,
    CancelAppointmentRequest,
    RescheduleAppointmentRequest,
)
from app.schemas.common import PaginatedResponse
from app.services.appointment_service import appointment_service

router = APIRouter(prefix="/appointments", tags=["Appointments"])


# ────────────────────────────────────────────────────
#  Book Appointment
# ────────────────────────────────────────────────────
@router.post(
    "/",
    response_model=AppointmentDetail,
    status_code=201,
    summary="Book a new appointment",
    description=(
        "Create an appointment after validating the patient, doctor, "
        "schedule, and slot availability.  Returns **409** if the slot "
        "is already occupied."
    ),
    responses={
        201: {"description": "Appointment created successfully"},
        404: {"description": "Patient or doctor not found"},
        409: {"description": "Time-slot conflict"},
    },
)
async def book_appointment(
    body: BookAppointmentRequest,
    current_user: User = Depends(get_current_user),
):
    appt = await appointment_service.book(
        patient_id=body.patient_id,
        doctor_id=body.doctor_id,
        appt_date=body.date,
        time_slot=body.time_slot,
        duration=body.duration,
        reason=body.reason,
        booked_via=body.booked_via.value,
        call_id=body.call_id,
        location=getattr(body, "location", None),
    )
    return AppointmentDetail.from_doc(appt)


# ────────────────────────────────────────────────────
#  Reschedule Appointment
# ────────────────────────────────────────────────────
@router.put(
    "/{appointment_id}/reschedule",
    response_model=AppointmentDetail,
    summary="Reschedule an existing appointment",
    description=(
        "Move an active appointment to a new date/time.  Validates "
        "the new slot against the doctor's schedule and existing bookings."
    ),
    responses={
        200: {"description": "Appointment rescheduled"},
        400: {"description": "Appointment cannot be rescheduled (terminal status)"},
        404: {"description": "Appointment not found"},
        409: {"description": "New time-slot conflict"},
    },
)
async def reschedule_appointment(
    appointment_id: str,
    body: RescheduleAppointmentRequest,
    current_user: User = Depends(get_current_user),
):
    appt = await appointment_service.reschedule(
        appointment_id=appointment_id,
        new_date=body.new_date,
        new_time_slot=body.new_time_slot,
        reason=body.reason,
    )
    return AppointmentDetail.from_doc(appt)


# ────────────────────────────────────────────────────
#  Cancel Appointment
# ────────────────────────────────────────────────────
@router.put(
    "/{appointment_id}/cancel",
    response_model=AppointmentDetail,
    summary="Cancel an appointment",
    description="Cancel an active appointment. Already cancelled or completed appointments cannot be cancelled.",
    responses={
        200: {"description": "Appointment cancelled"},
        400: {"description": "Already cancelled or completed"},
        404: {"description": "Appointment not found"},
    },
)
async def cancel_appointment(
    appointment_id: str,
    body: CancelAppointmentRequest = CancelAppointmentRequest(),
    current_user: User = Depends(get_current_user),
):
    appt = await appointment_service.cancel(
        appointment_id=appointment_id,
        reason=body.reason,
        cancelled_by=body.cancelled_by or current_user.email,
    )
    return AppointmentDetail.from_doc(appt)


# ────────────────────────────────────────────────────
#  Get Doctor Availability
# ────────────────────────────────────────────────────
@router.get(
    "/availability",
    response_model=AvailabilityResponse,
    summary="Get doctor availability for a date",
    description=(
        "Returns every time slot for the requested doctor on the given date, "
        "including which slots are booked or blocked.  Accounts for "
        "DoctorAvailability overrides (holidays, modified hours, blocked slots)."
    ),
    responses={
        200: {"description": "Availability retrieved"},
        404: {"description": "Doctor not found"},
    },
)
async def get_availability(
    doctor_id: str = Query(..., description="Doctor employee_id"),
    date: str = Query(
        ..., pattern=r"^\d{4}-\d{2}-\d{2}$", description="Date (YYYY-MM-DD)"
    ),
    current_user: User = Depends(get_current_user),
):
    return await appointment_service.get_availability(doctor_id, date)


# ────────────────────────────────────────────────────
#  Get Single Appointment
# ────────────────────────────────────────────────────
@router.get(
    "/{appointment_id}",
    response_model=AppointmentDetail,
    summary="Get appointment details",
    description="Retrieve full details for a single appointment by its ID (MongoDB _id or APT-XXXXXXXX).",
    responses={
        200: {"description": "Appointment details"},
        404: {"description": "Appointment not found"},
    },
)
async def get_appointment(
    appointment_id: str,
    current_user: User = Depends(get_current_user),
):
    appt = await appointment_service.get_by_id(appointment_id)
    return AppointmentDetail.from_doc(appt)


# ────────────────────────────────────────────────────
#  List Appointments (filterable)
# ────────────────────────────────────────────────────
@router.get(
    "/",
    response_model=PaginatedResponse[AppointmentListItem],
    summary="List appointments",
    description=(
        "Paginated appointment list with optional filters: status, date range, "
        "doctor, or patient."
    ),
)
async def list_appointments(
    status: Optional[AppointmentStatus] = Query(None, description="Filter by status"),
    doctor_id: Optional[str] = Query(None, description="Filter by doctor"),
    patient_id: Optional[str] = Query(None, description="Filter by patient"),
    date_from: Optional[str] = Query(
        None, pattern=r"^\d{4}-\d{2}-\d{2}$", description="Start date (inclusive)"
    ),
    date_to: Optional[str] = Query(
        None, pattern=r"^\d{4}-\d{2}-\d{2}$", description="End date (inclusive)"
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
):
    items, total = await appointment_service.list_appointments(
        patient_id=patient_id,
        doctor_id=doctor_id,
        appt_status=status,
        date_from=date_from,
        date_to=date_to,
        skip=skip,
        limit=limit,
    )
    return PaginatedResponse[AppointmentListItem].build(
        items=[AppointmentListItem.from_doc(a) for a in items],
        total=total,
        skip=skip,
        limit=limit,
    )


# ────────────────────────────────────────────────────
#  Patient Appointments
# ────────────────────────────────────────────────────
@router.get(
    "/patient/{patient_id}",
    response_model=PaginatedResponse[AppointmentListItem],
    summary="Get patient appointments",
    description="All appointments for a specific patient. Set `upcoming_only=true` to see only future active appointments.",
    responses={
        200: {"description": "Patient appointments"},
        404: {"description": "Patient not found"},
    },
)
async def get_patient_appointments(
    patient_id: str,
    upcoming_only: bool = Query(False, description="Only upcoming active appointments"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
):
    items, total = await appointment_service.get_patient_appointments(
        patient_id,
        upcoming_only=upcoming_only,
        skip=skip,
        limit=limit,
    )
    return PaginatedResponse[AppointmentListItem].build(
        items=[AppointmentListItem.from_doc(a) for a in items],
        total=total,
        skip=skip,
        limit=limit,
    )


# ────────────────────────────────────────────────────
#  Appointment History
# ────────────────────────────────────────────────────
@router.get(
    "/history/",
    response_model=PaginatedResponse[AppointmentListItem],
    summary="Appointment history",
    description="Past appointments with terminal status (completed, cancelled, no-show). Filter by patient or doctor.",
)
async def appointment_history(
    patient_id: Optional[str] = Query(None, description="Filter by patient"),
    doctor_id: Optional[str] = Query(None, description="Filter by doctor"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
):
    items, total = await appointment_service.get_history(
        patient_id=patient_id,
        doctor_id=doctor_id,
        skip=skip,
        limit=limit,
    )
    return PaginatedResponse[AppointmentListItem].build(
        items=[AppointmentListItem.from_doc(a) for a in items],
        total=total,
        skip=skip,
        limit=limit,
    )


# ────────────────────────────────────────────────────
#  Stats
# ────────────────────────────────────────────────────
@router.get(
    "/stats/summary",
    response_model=AppointmentStatsResponse,
    summary="Appointment statistics",
    description="Aggregate counts broken down by status, including today's appointments.",
)
async def appointment_stats(
    current_user: User = Depends(get_current_user),
):
    return await appointment_service.get_stats()
