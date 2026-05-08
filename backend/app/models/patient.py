"""
Patient document model.
Stores registered patient records with identity verification support.
"""

import uuid
from datetime import date, datetime, timezone
from typing import List, Optional

from beanie import Document, Indexed, before_event, Replace
from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.enums import BloodGroup, Gender


# ── Document ────────────────────────────────────────
class Patient(Document):
    patient_id: Indexed(str, unique=True) = Field(
        default_factory=lambda: f"PAT-{uuid.uuid4().hex[:8].upper()}"
    )
    full_name: str = Field(..., min_length=2, max_length=120)
    phone: Indexed(str, unique=True) = Field(..., pattern=r"^\+?[\d\s\-()]{7,20}$")
    email: Optional[EmailStr] = None
    date_of_birth: Optional[str] = Field(
        None, pattern=r"^\d{4}-\d{2}-\d{2}$", description="YYYY-MM-DD"
    )
    gender: Optional[Gender] = None
    blood_group: Optional[BloodGroup] = None
    address: Optional[str] = Field(None, max_length=500)
    emergency_contact: Optional[str] = Field(
        None, pattern=r"^\+?[\d\s\-()]{7,20}$"
    )
    emergency_contact_name: Optional[str] = None
    medical_history: Optional[str] = Field(None, max_length=2000)
    allergies: List[str] = Field(default_factory=list)
    is_verified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @field_validator("date_of_birth")
    @classmethod
    def validate_dob(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            dob = date.fromisoformat(v)
            if dob > date.today():
                raise ValueError("Date of birth cannot be in the future")
        return v

    @before_event(Replace)
    def bump_updated_at(self):
        self.updated_at = datetime.now(timezone.utc)

    class Settings:
        name = "patients"
        indexes = [
            "full_name",
            "date_of_birth",
        ]


# ── Schemas ─────────────────────────────────────────
class PatientCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    phone: str = Field(..., pattern=r"^\+?[\d\s\-()]{7,20}$")
    email: Optional[EmailStr] = None
    date_of_birth: Optional[str] = Field(None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    gender: Optional[Gender] = None
    blood_group: Optional[BloodGroup] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    allergies: List[str] = Field(default_factory=list)


class PatientUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=120)
    phone: Optional[str] = Field(None, pattern=r"^\+?[\d\s\-()]{7,20}$")
    email: Optional[EmailStr] = None
    date_of_birth: Optional[str] = Field(None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    gender: Optional[Gender] = None
    blood_group: Optional[BloodGroup] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    medical_history: Optional[str] = None
    allergies: Optional[List[str]] = None


class PatientResponse(BaseModel):
    id: str
    patient_id: str
    full_name: str
    phone: str
    email: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[Gender] = None
    blood_group: Optional[BloodGroup] = None
    allergies: List[str] = []
    is_verified: bool
    created_at: datetime

    @classmethod
    def from_doc(cls, patient: "Patient") -> "PatientResponse":
        return cls(
            id=str(patient.id),
            patient_id=patient.patient_id,
            full_name=patient.full_name,
            phone=patient.phone,
            email=patient.email,
            date_of_birth=patient.date_of_birth,
            gender=patient.gender,
            blood_group=patient.blood_group,
            allergies=patient.allergies,
            is_verified=patient.is_verified,
            created_at=patient.created_at,
        )


class PatientVerifyRequest(BaseModel):
    phone: str = Field(..., pattern=r"^\+?[\d\s\-()]{7,20}$")
    date_of_birth: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
