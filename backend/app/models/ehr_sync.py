"""
EHR Sync Log document model.
Tracks all synchronization events between the voice agent system
and the Aleem EHR platform for audit and retry purposes.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from beanie import Document, Indexed
from pydantic import BaseModel, Field

from app.models.enums import EHRSyncStatus, EHRSyncType


class EHRSyncLog(Document):
    sync_id: Indexed(str, unique=True) = Field(
        default_factory=lambda: f"SYNC-{uuid.uuid4().hex[:8].upper()}"
    )
    sync_type: EHRSyncType
    entity_id: Indexed(str)  # appointment_id, patient_id, call_id, etc.
    entity_type: str  # "appointment", "patient", "call_log"
    status: EHRSyncStatus = EHRSyncStatus.PENDING
    payload: Optional[dict] = None
    response_data: Optional[dict] = None
    error_message: Optional[str] = Field(None, max_length=2000)
    retry_count: int = Field(0, ge=0)
    max_retries: int = Field(3, ge=1)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    synced_at: Optional[datetime] = None
    next_retry_at: Optional[datetime] = None

    def mark_success(self, response_data: dict = None):
        self.status = EHRSyncStatus.SYNCED
        self.synced_at = datetime.now(timezone.utc)
        self.response_data = response_data

    def mark_failed(self, error: str):
        self.retry_count += 1
        self.error_message = error
        if self.retry_count >= self.max_retries:
            self.status = EHRSyncStatus.FAILED
        else:
            self.status = EHRSyncStatus.RETRY

    class Settings:
        name = "ehr_sync_logs"
        indexes = [
            "sync_type",
            "entity_id",
            "status",
            "created_at",
            [("status", 1), ("next_retry_at", 1)],
        ]


class EHRSyncLogResponse(BaseModel):
    id: str
    sync_id: str
    sync_type: EHRSyncType
    entity_id: str
    entity_type: str
    status: EHRSyncStatus
    error_message: Optional[str] = None
    retry_count: int
    created_at: datetime
    synced_at: Optional[datetime] = None

    @classmethod
    def from_doc(cls, doc: EHRSyncLog) -> "EHRSyncLogResponse":
        return cls(
            id=str(doc.id),
            sync_id=doc.sync_id,
            sync_type=doc.sync_type,
            entity_id=doc.entity_id,
            entity_type=doc.entity_type,
            status=doc.status,
            error_message=doc.error_message,
            retry_count=doc.retry_count,
            created_at=doc.created_at,
            synced_at=doc.synced_at,
        )
