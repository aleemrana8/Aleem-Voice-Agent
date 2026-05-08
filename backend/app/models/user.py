"""
AdminUsers document model.
Stores authenticated system users (admins, doctors, staff).
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from beanie import Document, Indexed, before_event, Replace, Insert
from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.enums import UserRole


# ── Document ────────────────────────────────────────
class User(Document):
    uid: str = Field(default_factory=lambda: f"USR-{uuid.uuid4().hex[:8].upper()}")
    email: Optional[str] = None
    username: Optional[Indexed(str)] = None
    hashed_password: str
    full_name: str = Field(..., min_length=2, max_length=100)
    role: UserRole = UserRole.STAFF
    is_active: bool = True
    last_login: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @before_event(Replace)
    def bump_updated_at(self):
        self.updated_at = datetime.now(timezone.utc)

    class Settings:
        name = "users"
        indexes = [
            "uid",
            "role",
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "email": "admin@aleemehr.com",
                "full_name": "System Admin",
                "role": "admin",
            }
        }


# ── Request / Response Schemas ──────────────────────
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=100)
    role: UserRole = UserRole.STAFF

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    uid: str
    email: Optional[str] = None
    username: Optional[str] = None
    full_name: str
    role: UserRole
    is_active: bool
    last_login: Optional[datetime] = None
    created_at: datetime

    @classmethod
    def from_doc(cls, user: "User") -> "UserResponse":
        return cls(
            id=str(user.id),
            uid=user.uid,
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            last_login=user.last_login,
            created_at=user.created_at,
        )


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
