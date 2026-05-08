from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.voice_agent import voice_agent_service
from app.services.livekit_service import livekit_service
from app.services.websocket_manager import ws_manager
from loguru import logger

router = APIRouter(prefix="/voice", tags=["Voice Agent"])


# ── LiveKit Cloud Agent ─────────────────────────────────────────────


@router.post(
    "/livekit/connect",
    summary="Get LiveKit connection details",
    description=(
        "Returns a LiveKit room token and URL so the frontend can connect "
        "to LiveKit Cloud. The server-side voice agent auto-joins via "
        "agent dispatch."
    ),
)
async def livekit_connect(caller_phone: str = "web-user"):
    """Create a room + caller token for the LiveKit-based voice agent."""
    data = livekit_service.create_room_and_token(caller_phone)
    return data


# ── Legacy REST / WS voice flow ─────────────────────────────────────


@router.post("/call/start")
async def start_call(caller_phone: str):
    """Initiate a new voice call session."""
    call_id = await voice_agent_service.start_call(caller_phone)
    room_name = f"call-{call_id}"

    agent_token = livekit_service.create_agent_token(room_name)
    caller_token = livekit_service.create_caller_token(room_name, caller_phone)

    return {
        "call_id": call_id,
        "room_name": room_name,
        "agent_token": agent_token,
        "caller_token": caller_token,
        "livekit_url": livekit_service.url,
    }


@router.post("/call/{call_id}/process")
async def process_speech(call_id: str, text: str):
    """Process transcribed speech and get agent response."""
    response = await voice_agent_service.process_utterance(call_id, text)
    return {"call_id": call_id, "response": response}


@router.post("/call/{call_id}/end")
async def end_call(call_id: str, summary: str = None):
    """End a voice call session."""
    await voice_agent_service.end_call(call_id, summary)
    return {"status": "completed", "call_id": call_id}


@router.websocket("/ws/call/{call_id}")
async def voice_websocket(websocket: WebSocket, call_id: str):
    """WebSocket for realtime voice streaming during a call.
    Receives transcribed text, sends agent responses."""
    await websocket.accept()
    logger.info(f"Voice WS connected for call: {call_id}")

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "transcript":
                # Patient speech transcribed
                text = data.get("text", "")
                response = await voice_agent_service.process_utterance(
                    call_id, text
                )
                await websocket.send_json(
                    {"type": "agent_response", "text": response}
                )

            elif msg_type == "end_call":
                await voice_agent_service.end_call(
                    call_id, data.get("summary")
                )
                await websocket.send_json({"type": "call_ended"})
                break

    except WebSocketDisconnect:
        logger.info(f"Voice WS disconnected for call: {call_id}")
        await voice_agent_service.end_call(call_id, "Call disconnected")
