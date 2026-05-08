from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime, timezone
import uuid
from app.models.patient import (
    Patient,
    PatientCreate,
    PatientUpdate,
    PatientResponse,
    PatientVerifyRequest,
)
from app.models.user import User
from app.core.security import get_current_user
from loguru import logger

router = APIRouter(prefix="/patients", tags=["Patients"])


def _generate_patient_id() -> str:
    return f"PAT-{uuid.uuid4().hex[:8].upper()}"


@router.get("/", response_model=List[PatientResponse])
async def list_patients(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    query = {}
    if search:
        query = {
            "$or": [
                {"full_name": {"$regex": search, "$options": "i"}},
                {"phone": {"$regex": search}},
                {"patient_id": {"$regex": search, "$options": "i"}},
            ]
        }
    patients = await Patient.find(query).skip(skip).limit(limit).to_list()
    return [PatientResponse.from_doc(p) for p in patients]


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: str,
    current_user: User = Depends(get_current_user),
):
    patient = await Patient.find_one(Patient.patient_id == patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return PatientResponse.from_doc(patient)


@router.post("/", response_model=PatientResponse, status_code=201)
async def create_patient(
    data: PatientCreate,
    current_user: User = Depends(get_current_user),
):
    existing = await Patient.find_one(Patient.phone == data.phone)
    if existing:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    patient = Patient(
        patient_id=_generate_patient_id(),
        full_name=data.full_name,
        phone=data.phone,
        email=data.email,
        date_of_birth=data.date_of_birth,
        gender=data.gender,
        address=data.address,
        emergency_contact=data.emergency_contact,
    )
    await patient.insert()
    logger.info(f"Patient created: {patient.patient_id}")
    return PatientResponse.from_doc(patient)


@router.put("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: str,
    data: PatientUpdate,
    current_user: User = Depends(get_current_user),
):
    patient = await Patient.find_one(Patient.patient_id == patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(patient, key, value)
    patient.updated_at = datetime.now(timezone.utc)
    await patient.save()
    return PatientResponse.from_doc(patient)


@router.delete("/{patient_id}", status_code=204)
async def delete_patient(
    patient_id: str,
    current_user: User = Depends(get_current_user),
):
    patient = await Patient.find_one(Patient.patient_id == patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    await patient.delete()
    logger.info(f"Patient deleted: {patient_id}")


@router.post("/verify", response_model=PatientResponse)
async def verify_patient(data: PatientVerifyRequest):
    """Voice agent uses this to verify patient identity by phone + DOB."""
    patient = await Patient.find_one(Patient.phone == data.phone)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if patient.date_of_birth != data.date_of_birth:
        raise HTTPException(status_code=401, detail="Verification failed")

    patient.is_verified = True
    patient.updated_at = datetime.now(timezone.utc)
    await patient.save()
    return PatientResponse.from_doc(patient)
