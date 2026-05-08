from typing import Dict, Set
from fastapi import WebSocket
import json
from loguru import logger


class WebSocketManager:
    """Manages WebSocket connections for realtime dashboard updates.

    Supported event types:
    - appointment_created
    - appointment_rescheduled
    - appointment_cancelled
    - call_started
    - call_ended
    - transcript_update
    - notification_new
    - dashboard_refresh
    """

    def __init__(self):
        self._connections: Set[WebSocket] = set()
        self._subscriptions: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, channel: str = "dashboard"):
        await websocket.accept()
        self._connections.add(websocket)
        if channel not in self._subscriptions:
            self._subscriptions[channel] = set()
        self._subscriptions[channel].add(websocket)
        logger.info(f"WebSocket connected [{channel}]. Total: {len(self._connections)}")

        # Send initial connection confirmation
        try:
            await websocket.send_json({
                "type": "connected",
                "data": {"channel": channel, "active_connections": len(self._connections)},
            })
        except Exception:
            pass

        # Keep alive loop
        try:
            while True:
                data = await websocket.receive_text()
                # Handle ping/pong for keepalive
                if data == "ping":
                    await websocket.send_text("pong")
        except Exception:
            pass
        finally:
            self.disconnect(websocket)

    def disconnect(self, websocket: WebSocket):
        self._connections.discard(websocket)
        for channel_subs in self._subscriptions.values():
            channel_subs.discard(websocket)
        logger.info(f"WebSocket disconnected. Total: {len(self._connections)}")

    async def broadcast(self, message: dict, channel: str = None):
        """Send a message to all connected clients (or specific channel)."""
        dead = set()
        payload = json.dumps(message, default=str)

        targets = self._connections
        if channel and channel in self._subscriptions:
            targets = self._subscriptions[channel]

        for ws in targets:
            try:
                await ws.send_text(payload)
            except Exception:
                dead.add(ws)
        for ws in dead:
            self._connections.discard(ws)
            for channel_subs in self._subscriptions.values():
                channel_subs.discard(ws)

    async def broadcast_event(self, event_type: str, data: dict, channel: str = None):
        """Broadcast a typed event to all clients."""
        await self.broadcast({"type": event_type, "data": data}, channel)

    async def send_personal(self, websocket: WebSocket, message: dict):
        try:
            await websocket.send_json(message)
        except Exception:
            self._connections.discard(websocket)

    @property
    def active_connections(self) -> int:
        return len(self._connections)


# Singleton instance
ws_manager = WebSocketManager()
