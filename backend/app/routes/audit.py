"""
Audit Log API routes.
GET audit trails for compliance and debugging.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query

from app.core.security import get_current_user
from app.models.user import User
from app.services.audit_service import audit_service

router = APIRouter(prefix="/audit", tags=["Audit Logs"])


@router.get("/logs")
async def get_audit_logs(
    resource_type: Optional[str] = Query(None, description="Filter by resource type"),
    action: Optional[str] = Query(None, description="Filter by action"),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
):
    """Get recent audit log entries."""
    logs = await audit_service.get_recent_logs(
        limit=limit, resource_type=resource_type, action=action
    )
    return {
        "total": len(logs),
        "logs": [
            {
                "audit_id": log.audit_id,
                "timestamp": log.timestamp.isoformat(),
                "actor_type": log.actor_type,
                "actor_id": log.actor_id,
                "actor_name": log.actor_name,
                "action": log.action,
                "resource_type": log.resource_type,
                "resource_id": log.resource_id,
                "status": log.status,
                "error_message": log.error_message,
                "details": log.details,
                "call_id": log.call_id,
            }
            for log in logs
        ],
    }


@router.get("/logs/resource/{resource_type}/{resource_id}")
async def get_resource_audit_trail(
    resource_type: str,
    resource_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get full audit trail for a specific resource."""
    logs = await audit_service.get_logs_for_resource(resource_type, resource_id)
    return {
        "resource_type": resource_type,
        "resource_id": resource_id,
        "total": len(logs),
        "logs": [
            {
                "audit_id": log.audit_id,
                "timestamp": log.timestamp.isoformat(),
                "action": log.action,
                "actor_type": log.actor_type,
                "actor_name": log.actor_name,
                "status": log.status,
                "details": log.details,
            }
            for log in logs
        ],
    }


@router.get("/logs/call/{call_id}")
async def get_call_audit_trail(
    call_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get all audit events associated with a call."""
    logs = await audit_service.get_logs_for_call(call_id)
    return {
        "call_id": call_id,
        "total": len(logs),
        "logs": [
            {
                "audit_id": log.audit_id,
                "timestamp": log.timestamp.isoformat(),
                "action": log.action,
                "resource_type": log.resource_type,
                "resource_id": log.resource_id,
                "details": log.details,
            }
            for log in logs
        ],
    }
