"""
Workflow Engine API routes.
Exposes the FSM state machine for monitoring and testing.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field

from app.core.security import get_current_user
from app.models.user import User
from app.services.workflow_engine import workflow_engine, ConversationState

router = APIRouter(prefix="/workflow", tags=["Workflow Engine"])


class WorkflowTransitionRequest(BaseModel):
    call_id: str
    event: str = Field(..., description="Event type: user_utterance, slot_selected, confirmation")
    data: dict = Field(default_factory=dict, description="Event payload with extracted entities")


@router.get("/sessions")
async def get_active_sessions(
    current_user: User = Depends(get_current_user),
):
    """Get all active workflow sessions (for dashboard monitoring)."""
    sessions = {}
    for call_id, ctx in workflow_engine._sessions.items():
        sessions[call_id] = {
            "call_id": ctx.call_id,
            "state": ctx.state,
            "intent": ctx.intent,
            "doctor_name": ctx.doctor_name,
            "location": ctx.location,
            "date": ctx.date,
            "time_slot": ctx.time_slot,
            "patient_name": ctx.patient_name,
            "patient_verified": ctx.patient_verified,
            "turn_count": ctx.turn_count,
            "created_at": ctx.created_at.isoformat(),
        }
    return {"active_sessions": len(sessions), "sessions": sessions}


@router.get("/sessions/{call_id}")
async def get_session_state(
    call_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get detailed state of a specific conversation session."""
    ctx = workflow_engine.get_session(call_id)
    if not ctx:
        return {"error": "Session not found", "call_id": call_id}
    return {
        "call_id": ctx.call_id,
        "state": ctx.state,
        "intent": ctx.intent,
        "doctor_name": ctx.doctor_name,
        "doctor_id": ctx.doctor_id,
        "location": ctx.location,
        "date": ctx.date,
        "time_slot": ctx.time_slot,
        "patient_id": ctx.patient_id,
        "patient_name": ctx.patient_name,
        "patient_phone": ctx.patient_phone,
        "patient_verified": ctx.patient_verified,
        "appointment_id": ctx.appointment_id,
        "available_slots": ctx.available_slots,
        "turn_count": ctx.turn_count,
        "created_at": ctx.created_at.isoformat(),
        "last_agent_message": ctx.last_agent_message,
    }


@router.post("/transition")
async def trigger_transition(
    req: WorkflowTransitionRequest,
    current_user: User = Depends(get_current_user),
):
    """Manually trigger a state transition (for testing/debugging)."""
    result = await workflow_engine.transition(req.call_id, req.event, req.data)
    return result


@router.get("/states")
async def get_available_states(
    current_user: User = Depends(get_current_user),
):
    """Get all possible conversation states for reference."""
    return {
        "states": [s.value for s in ConversationState],
        "description": {
            "greeting": "Initial greeting delivered",
            "identify_intent": "Waiting to detect user intent",
            "collect_provider": "Collecting doctor selection",
            "collect_location": "Collecting location preference",
            "collect_date": "Collecting appointment date",
            "check_availability": "Checking scheduling engine",
            "offer_slots": "Presenting available slots",
            "confirm_slot": "Waiting for slot confirmation",
            "collect_patient_info": "Collecting patient details",
            "save_appointment": "Executing booking",
            "confirm_booking": "Booking confirmed, asking if done",
            "verify_patient": "Verifying patient identity",
            "find_appointment": "Looking up patient appointments",
            "reschedule": "Reschedule sub-flow",
            "confirm_cancel": "Confirming cancellation",
            "save_cancel": "Executing cancellation",
            "end_call": "Ending conversation",
            "fallback": "Recovery from unrecognized input",
            "escalate": "Transfer to human operator",
        },
    }
