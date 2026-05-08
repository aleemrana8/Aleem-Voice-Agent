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
from app.models.user import User
from app.core.security import get_current_user, get_current_admin
from app.services.doctor_service import doctor_service
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


@router.post(
    "/availability",
    summary="Check doctor availability",
    description=(
        "Returns available time slots for a doctor on a given date. "
        "Accounts for DoctorAvailability overrides and existing bookings."
    ),
)
async def check_availability(data: DoctorAvailabilityRequest):
    """Check available slots for a doctor on a given date.
    Used by both dashboard and voice agent."""
    return await doctor_service.check_availability(data.doctor_id, data.date)
