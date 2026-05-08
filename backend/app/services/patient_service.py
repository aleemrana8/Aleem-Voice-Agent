"""
Patient business-logic service layer.
Encapsulates patient CRUD and verification logic shared
between the REST API and the voice agent.
"""

import uuid
from datetime import datetime, timezone
from typing import List, Optional

from app.models.patient import Patient, PatientResponse
from fastapi import HTTPException
from loguru import logger


class PatientService:
    @staticmethod
    def _generate_id() -> str:
        return f"PAT-{uuid.uuid4().hex[:8].upper()}"

    async def create(
        self,
        full_name: str,
        phone: str,
        email: Optional[str] = None,
        date_of_birth: Optional[str] = None,
        gender: Optional[str] = None,
        address: Optional[str] = None,
        emergency_contact: Optional[str] = None,
    ) -> Patient:
        existing = await Patient.find_one(Patient.phone == phone)
        if existing:
            raise HTTPException(
                status_code=400, detail="Phone number already registered"
            )

        patient = Patient(
            patient_id=self._generate_id(),
            full_name=full_name,
            phone=phone,
            email=email,
            date_of_birth=date_of_birth,
            gender=gender,
            address=address,
            emergency_contact=emergency_contact,
        )
        await patient.insert()
        logger.info(f"Patient created: {patient.patient_id}")
        return patient

    async def get_by_id(self, patient_id: str) -> Patient:
        patient = await Patient.find_one(Patient.patient_id == patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        return patient

    async def get_by_phone(self, phone: str) -> Optional[Patient]:
        return await Patient.find_one(Patient.phone == phone)

    async def verify(self, phone: str, date_of_birth: str) -> Patient:
        patient = await Patient.find_one(Patient.phone == phone)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        if patient.date_of_birth != date_of_birth:
            raise HTTPException(status_code=401, detail="Verification failed")

        patient.is_verified = True
        patient.updated_at = datetime.now(timezone.utc)
        await patient.save()
        return patient

    async def search(
        self,
        query: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[Patient]:
        filters = {}
        if query:
            from app.utils.helpers import sanitize_search

            safe_q = sanitize_search(query)
            filters = {
                "$or": [
                    {"full_name": {"$regex": safe_q, "$options": "i"}},
                    {"phone": {"$regex": safe_q}},
                    {"patient_id": {"$regex": safe_q, "$options": "i"}},
                ]
            }
        return await Patient.find(filters).skip(skip).limit(limit).to_list()


# Singleton
patient_service = PatientService()
