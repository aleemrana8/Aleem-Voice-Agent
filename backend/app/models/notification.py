"""
Notification document model.
Supports targeted (user-specific) and broadcast notifications
with read tracking and optional deep-link support.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from beanie import Document, Indexed
from pydantic import BaseModel, Field

from app.models.enums import NotificationType


# ── Document ────────────────────────────────────────
class Notification(Document):
    notification_id: str = Field(
        default_factory=lambda: f"NTF-{uuid.uuid4().hex[:8].upper()}"
    )
    user_id: Optional[Indexed(str)] = None  # None = broadcast to all
    title: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1, max_length=2000)
    type: NotificationType = NotificationType.INFO
    read: bool = False
    read_at: Optional[datetime] = None
    link: Optional[str] = Field(None, max_length=500, description="Deep-link URL")
    metadata: Optional[dict] = Field(None, description="Extra context data")
    expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def mark_read(self):
        """Mark as read with timestamp."""
        self.read = True
        self.read_at = datetime.now(timezone.utc)

    @property
    def is_expired(self) -> bool:
        if self.expires_at is None:
            return False
        return datetime.now(timezone.utc) > self.expires_at

    class Settings:
        name = "notifications"
        indexes = [
            "user_id",
            "read",
            "type",
            "created_at",
            [("user_id", 1), ("read", 1), ("created_at", -1)],
        ]


# ── Response Schema ─────────────────────────────────
class NotificationCreate(BaseModel):
    user_id: Optional[str] = None
    title: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1, max_length=2000)
    type: NotificationType = NotificationType.INFO
    link: Optional[str] = None
    metadata: Optional[dict] = None


class NotificationResponse(BaseModel):
    id: str
    notification_id: str
    title: str
    message: str
    type: NotificationType
    read: bool
    read_at: Optional[datetime] = None
    link: Optional[str] = None
    created_at: datetime

    @classmethod
    def from_doc(cls, n: "Notification") -> "NotificationResponse":
        return cls(
            id=str(n.id),
            notification_id=n.notification_id,
            title=n.title,
            message=n.message,
            type=n.type,
            read=n.read,
            read_at=n.read_at,
            link=n.link,
            created_at=n.created_at,
        )
