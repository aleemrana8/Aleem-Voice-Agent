"""
Audit Log document model.
Tracks all significant system actions for compliance and debugging.
"""

import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from beanie import Document, Indexed
from pydantic import Field


class AuditLog(Document):
    """Immutable audit trail for all system events."""
    audit_id: Indexed(str, unique=True) = Field(
        default_factory=lambda: f"AUD-{uuid.uuid4().hex[:10].upper()}"
    )
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Who performed the action
    actor_type: str = Field(..., description="user | system | voice_agent | ehr")
    actor_id: Optional[str] = Field(None, description="User ID or system identifier")
    actor_name: Optional[str] = None
    
    # What happened
    action: Indexed(str) = Field(..., description="Action performed")
    resource_type: Indexed(str) = Field(..., description="appointment | patient | doctor | call | etc")
    resource_id: Optional[str] = Field(None, description="ID of affected resource")
    
    # Context
    details: dict[str, Any] = Field(default_factory=dict, description="Action-specific details")
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    
    # Outcome
    status: str = Field("success", description="success | failure | error")
    error_message: Optional[str] = None
    
    # Call context (for voice agent actions)
    call_id: Optional[str] = None

    class Settings:
        name = "audit_logs"
        indexes = [
            "actor_id",
            "resource_type",
            "resource_id",
            "call_id",
            [("timestamp", -1)],
            [("action", 1), ("resource_type", 1)],
        ]
