"""
CallLog document model.
Tracks every voice call session from initiation to completion.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from beanie import Document, Indexed, before_event, Replace
from pydantic import BaseModel, Field, computed_field

from app.models.enums import CallIntent, CallStatus


# ── Document ────────────────────────────────────────
class CallLog(Document):
    call_id: Indexed(str, unique=True) = Field(
        default_factory=lambda: f"CALL-{uuid.uuid4().hex[:12].upper()}"
    )
    caller_phone: str = Field(..., pattern=r"^\+?[\d\s\-()]{7,20}$")
    patient_id: Optional[str] = None
    patient_name: Optional[str] = None
    duration_seconds: int = Field(0, ge=0)
    status: CallStatus = CallStatus.IN_PROGRESS
    intent: Optional[CallIntent] = None
    outcome: Optional[str] = Field(None, max_length=500)
    summary: Optional[str] = Field(None, max_length=2000)
    agent_model: str = Field(default="gpt-4o", description="LLM model used")
    tool_calls_count: int = Field(0, ge=0, description="Number of function calls made")
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ended_at: Optional[datetime] = None

    @computed_field
    @property
    def duration_formatted(self) -> str:
        """Human-readable duration."""
        m, s = divmod(self.duration_seconds, 60)
        h, m = divmod(m, 60)
        if h:
            return f"{h}h {m}m {s}s"
        if m:
            return f"{m}m {s}s"
        return f"{s}s"

    @before_event(Replace)
    def compute_duration(self):
        if self.ended_at and self.created_at:
            delta = self.ended_at - self.created_at
            self.duration_seconds = max(0, int(delta.total_seconds()))

    class Settings:
        name = "call_logs"
        indexes = [
            "status",
            "caller_phone",
            "patient_id",
            "created_at",
        ]


# ── Response Schema ─────────────────────────────────
class CallLogResponse(BaseModel):
    id: str
    call_id: str
    caller_phone: str
    patient_id: Optional[str] = None
    patient_name: Optional[str] = None
    duration_seconds: int
    duration_formatted: str
    status: CallStatus
    intent: Optional[CallIntent] = None
    outcome: Optional[str] = None
    summary: Optional[str] = None
    agent_model: str
    tool_calls_count: int
    created_at: datetime
    ended_at: Optional[datetime] = None

    @classmethod
    def from_doc(cls, log: "CallLog") -> "CallLogResponse":
        return cls(
            id=str(log.id),
            call_id=log.call_id,
            caller_phone=log.caller_phone,
            patient_id=log.patient_id,
            patient_name=log.patient_name,
            duration_seconds=log.duration_seconds,
            duration_formatted=log.duration_formatted,
            status=log.status,
            intent=log.intent,
            outcome=log.outcome,
            summary=log.summary,
            agent_model=log.agent_model,
            tool_calls_count=log.tool_calls_count,
            created_at=log.created_at,
            ended_at=log.ended_at,
        )
