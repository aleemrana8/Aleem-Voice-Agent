from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from app.models.call_log import CallLog, CallLogResponse
from app.models.transcript import Transcript, TranscriptResponse
from app.models.user import User
from app.core.security import get_current_user
from loguru import logger

router = APIRouter(prefix="/calls", tags=["Call Logs"])


@router.get("/", response_model=List[CallLogResponse])
async def list_call_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    query = {}
    if status:
        query["status"] = status
    logs = (
        await CallLog.find(query).sort("-created_at").skip(skip).limit(limit).to_list()
    )
    return [CallLogResponse.from_doc(l) for l in logs]


@router.get("/{call_id}", response_model=CallLogResponse)
async def get_call_log(
    call_id: str,
    current_user: User = Depends(get_current_user),
):
    log = await CallLog.find_one(CallLog.call_id == call_id)
    if not log:
        raise HTTPException(status_code=404, detail="Call log not found")
    return CallLogResponse.from_doc(log)


@router.get("/{call_id}/transcript", response_model=TranscriptResponse)
async def get_transcript(
    call_id: str,
    current_user: User = Depends(get_current_user),
):
    transcript = await Transcript.find_one(Transcript.call_id == call_id)
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")
    return TranscriptResponse.from_doc(transcript)


@router.get("/stats/summary")
async def call_stats(current_user: User = Depends(get_current_user)):
    total = await CallLog.count()
    completed = await CallLog.find(CallLog.status == "completed").count()
    failed = await CallLog.find(CallLog.status == "failed").count()
    in_progress = await CallLog.find(CallLog.status == "in_progress").count()

    return {
        "total": total,
        "completed": completed,
        "failed": failed,
        "in_progress": in_progress,
    }
