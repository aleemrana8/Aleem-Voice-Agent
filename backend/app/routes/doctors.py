from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime, timezone
from app.models.doctor import (
    Doctor,
    DoctorCreate,
    DoctorUpdate,
    DoctorResponse,
    DoctorAvailabilityRequest,
)
from app.models.appointment import Appointment
from app.models.user import User
from app.core.security import get_current_user, get_current_admin
from loguru import logger

router = APIRouter(prefix="/doctors", tags=["Doctors"])


@router.get("/", response_model=List[DoctorResponse])
async def list_doctors(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    specialization: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    query = {"is_active": True}
    if specialization:
        query["specialization"] = {"$regex": specialization, "$options": "i"}
    doctors = await Doctor.find(query).skip(skip).limit(limit).to_list()
    return [DoctorResponse.from_doc(d) for d in doctors]


@router.get("/{employee_id}", response_model=DoctorResponse)
async def get_doctor(
    employee_id: str,
    current_user: User = Depends(get_current_user),
):
    doctor = await Doctor.find_one(Doctor.employee_id == employee_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return DoctorResponse.from_doc(doctor)


@router.post("/", response_model=DoctorResponse, status_code=201)
async def create_doctor(
    data: DoctorCreate,
    admin: User = Depends(get_current_admin),
):
    existing = await Doctor.find_one(Doctor.employee_id == data.employee_id)
    if existing:
        raise HTTPException(status_code=400, detail="Employee ID already exists")

    doctor = Doctor(**data.model_dump())
    await doctor.insert()
    logger.info(f"Doctor created: {data.employee_id}")
    return DoctorResponse.from_doc(doctor)


@router.put("/{employee_id}", response_model=DoctorResponse)
async def update_doctor(
    employee_id: str,
    data: DoctorUpdate,
    admin: User = Depends(get_current_admin),
):
    doctor = await Doctor.find_one(Doctor.employee_id == employee_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(doctor, key, value)
    doctor.updated_at = datetime.now(timezone.utc)
    await doctor.save()
    return DoctorResponse.from_doc(doctor)


@router.delete("/{employee_id}", status_code=204)
async def delete_doctor(
    employee_id: str,
    admin: User = Depends(get_current_admin),
):
    doctor = await Doctor.find_one(Doctor.employee_id == employee_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    doctor.is_active = False
    doctor.updated_at = datetime.now(timezone.utc)
    await doctor.save()
    logger.info(f"Doctor deactivated: {employee_id}")


@router.post("/availability")
async def check_availability(data: DoctorAvailabilityRequest):
    """Check available slots for a doctor on a given date.
    Used by both dashboard and voice agent."""
    doctor = await Doctor.find_one(Doctor.employee_id == data.doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Determine the day of week
    from datetime import datetime as dt

    target_date = dt.strptime(data.date, "%Y-%m-%d")
    day_name = target_date.strftime("%A").lower()

    if day_name not in doctor.schedule:
        return {"available_slots": [], "message": f"Doctor not available on {day_name}"}

    day_schedule = doctor.schedule[day_name]

    # Generate all possible slots
    all_slots = []
    start_hour, start_min = map(int, day_schedule.start.split(":"))
    end_hour, end_min = map(int, day_schedule.end.split(":"))
    current_minutes = start_hour * 60 + start_min
    end_minutes = end_hour * 60 + end_min

    while current_minutes + day_schedule.slot_duration <= end_minutes:
        h, m = divmod(current_minutes, 60)
        all_slots.append(f"{h:02d}:{m:02d}")
        current_minutes += day_schedule.slot_duration

    # Get booked slots for that day
    booked = await Appointment.find(
        Appointment.doctor_id == data.doctor_id,
        Appointment.date == data.date,
        Appointment.status.is_in(["scheduled", "confirmed"]),
    ).to_list()
    booked_slots = {a.time_slot for a in booked}

    available = [s for s in all_slots if s not in booked_slots]
    return {
        "doctor": doctor.full_name,
        "date": data.date,
        "available_slots": available,
        "total_slots": len(all_slots),
        "booked_slots": len(booked_slots),
    }
