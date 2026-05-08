from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime, timezone
from app.models.appointment import (
    Appointment,
    AppointmentCreate,
    AppointmentReschedule,
    AppointmentResponse,
)
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.notification import Notification
from app.models.user import User
from app.core.security import get_current_user
from app.services.websocket_manager import ws_manager
from loguru import logger

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.get("/", response_model=List[AppointmentResponse])
async def list_appointments(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    date: Optional[str] = None,
    doctor_id: Optional[str] = None,
    patient_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    query = {}
    if status:
        query["status"] = status
    if date:
        query["date"] = date
    if doctor_id:
        query["doctor_id"] = doctor_id
    if patient_id:
        query["patient_id"] = patient_id

    appointments = (
        await Appointment.find(query)
        .sort("-created_at")
        .skip(skip)
        .limit(limit)
        .to_list()
    )
    return [AppointmentResponse.from_doc(a) for a in appointments]


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: str,
    current_user: User = Depends(get_current_user),
):
    appt = await Appointment.get(appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return AppointmentResponse.from_doc(appt)


@router.post("/", response_model=AppointmentResponse, status_code=201)
async def create_appointment(
    data: AppointmentCreate,
    current_user: User = Depends(get_current_user),
):
    # Validate patient
    patient = await Patient.find_one(Patient.patient_id == data.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Validate doctor
    doctor = await Doctor.find_one(Doctor.employee_id == data.doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Check slot availability
    existing = await Appointment.find_one(
        Appointment.doctor_id == data.doctor_id,
        Appointment.date == data.date,
        Appointment.time_slot == data.time_slot,
        Appointment.status.is_in(["scheduled", "confirmed"]),
    )
    if existing:
        raise HTTPException(status_code=409, detail="Time slot already booked")

    appt = Appointment(
        patient_id=data.patient_id,
        doctor_id=data.doctor_id,
        patient_name=patient.full_name,
        doctor_name=doctor.full_name,
        date=data.date,
        time_slot=data.time_slot,
        duration=data.duration,
        reason=data.reason,
        booked_via=data.booked_via,
    )
    await appt.insert()
    logger.info(
        f"Appointment created: {patient.full_name} with {doctor.full_name} on {data.date} at {data.time_slot}"
    )

    # Create notification
    notif = Notification(
        title="New Appointment",
        message=f"{patient.full_name} booked with {doctor.full_name} on {data.date} at {data.time_slot}",
        type="success",
    )
    await notif.insert()

    # Broadcast realtime update
    await ws_manager.broadcast(
        {
            "type": "appointment_created",
            "data": AppointmentResponse.from_doc(appt).model_dump(mode="json"),
        }
    )

    return AppointmentResponse.from_doc(appt)


@router.put("/{appointment_id}/reschedule", response_model=AppointmentResponse)
async def reschedule_appointment(
    appointment_id: str,
    data: AppointmentReschedule,
    current_user: User = Depends(get_current_user),
):
    appt = await Appointment.get(appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if appt.status in ("cancelled", "completed"):
        raise HTTPException(
            status_code=400, detail=f"Cannot reschedule {appt.status} appointment"
        )

    # Check new slot availability
    existing = await Appointment.find_one(
        Appointment.doctor_id == appt.doctor_id,
        Appointment.date == data.new_date,
        Appointment.time_slot == data.new_time_slot,
        Appointment.status.is_in(["scheduled", "confirmed"]),
    )
    if existing and str(existing.id) != appointment_id:
        raise HTTPException(status_code=409, detail="New time slot already booked")

    appt.date = data.new_date
    appt.time_slot = data.new_time_slot
    appt.status = "rescheduled"
    appt.notes = data.reason or appt.notes
    appt.updated_at = datetime.now(timezone.utc)
    await appt.save()

    logger.info(f"Appointment rescheduled: {appointment_id}")

    notif = Notification(
        title="Appointment Rescheduled",
        message=f"{appt.patient_name}'s appointment moved to {data.new_date} at {data.new_time_slot}",
        type="warning",
    )
    await notif.insert()

    await ws_manager.broadcast(
        {
            "type": "appointment_rescheduled",
            "data": AppointmentResponse.from_doc(appt).model_dump(mode="json"),
        }
    )
    return AppointmentResponse.from_doc(appt)


@router.put("/{appointment_id}/cancel", response_model=AppointmentResponse)
async def cancel_appointment(
    appointment_id: str,
    reason: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    appt = await Appointment.get(appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if appt.status == "cancelled":
        raise HTTPException(status_code=400, detail="Already cancelled")

    appt.status = "cancelled"
    appt.notes = reason or "Cancelled"
    appt.updated_at = datetime.now(timezone.utc)
    await appt.save()

    logger.info(f"Appointment cancelled: {appointment_id}")

    notif = Notification(
        title="Appointment Cancelled",
        message=f"{appt.patient_name}'s appointment on {appt.date} has been cancelled",
        type="error",
    )
    await notif.insert()

    await ws_manager.broadcast(
        {
            "type": "appointment_cancelled",
            "data": AppointmentResponse.from_doc(appt).model_dump(mode="json"),
        }
    )
    return AppointmentResponse.from_doc(appt)


@router.get("/stats/summary")
async def appointment_stats(current_user: User = Depends(get_current_user)):
    """Dashboard summary statistics."""
    total = await Appointment.count()
    scheduled = await Appointment.find(
        Appointment.status == "scheduled"
    ).count()
    completed = await Appointment.find(
        Appointment.status == "completed"
    ).count()
    cancelled = await Appointment.find(
        Appointment.status == "cancelled"
    ).count()

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    today_count = await Appointment.find(Appointment.date == today).count()

    return {
        "total": total,
        "scheduled": scheduled,
        "completed": completed,
        "cancelled": cancelled,
        "today": today_count,
    }
