"""
EHR Integration API routes.
Provides endpoints for EHR sync status, retry, and audit log access.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from loguru import logger

from app.core.security import get_current_user, get_current_admin
from app.models.ehr_sync import EHRSyncLog, EHRSyncLogResponse
from app.models.enums import EHRSyncStatus, EHRSyncType
from app.models.user import User
from app.services.ehr_service import ehr_service

router = APIRouter(prefix="/ehr", tags=["EHR Integration"])


@router.get("/sync/stats")
async def ehr_sync_stats(current_user: User = Depends(get_current_user)):
    """Get EHR synchronization statistics."""
    return await ehr_service.get_sync_stats()


@router.get("/sync/logs", response_model=List[EHRSyncLogResponse])
async def list_sync_logs(
    status: Optional[EHRSyncStatus] = None,
    sync_type: Optional[EHRSyncType] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
):
    """List EHR sync logs with optional filtering."""
    query = {}
    if status:
        query["status"] = status.value
    if sync_type:
        query["sync_type"] = sync_type.value

    logs = (
        await EHRSyncLog.find(query)
        .sort("-created_at")
        .skip(skip)
        .limit(limit)
        .to_list()
    )
    return [EHRSyncLogResponse.from_doc(log) for log in logs]


@router.post("/sync/retry")
async def retry_failed_syncs(admin: User = Depends(get_current_admin)):
    """Retry all pending/failed EHR sync operations."""
    count = await ehr_service.retry_failed_syncs()
    return {"retried": count, "message": f"Retried {count} sync operations"}


@router.get("/sync/{sync_id}")
async def get_sync_log(
    sync_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get details of a specific sync log entry."""
    log = await EHRSyncLog.find_one(EHRSyncLog.sync_id == sync_id)
    if not log:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Sync log not found")
    return {
        "id": str(log.id),
        "sync_id": log.sync_id,
        "sync_type": log.sync_type,
        "entity_id": log.entity_id,
        "entity_type": log.entity_type,
        "status": log.status,
        "payload": log.payload,
        "response_data": log.response_data,
        "error_message": log.error_message,
        "retry_count": log.retry_count,
        "max_retries": log.max_retries,
        "created_at": log.created_at,
        "synced_at": log.synced_at,
        "next_retry_at": log.next_retry_at,
    }
