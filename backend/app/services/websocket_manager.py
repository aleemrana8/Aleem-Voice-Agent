from typing import Dict, Set
from fastapi import WebSocket
import json
from loguru import logger


class WebSocketManager:
    """Manages WebSocket connections for realtime dashboard updates."""

    def __init__(self):
        self._connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self._connections.add(websocket)
        logger.info(f"WebSocket connected. Total: {len(self._connections)}")

    def disconnect(self, websocket: WebSocket):
        self._connections.discard(websocket)
        logger.info(f"WebSocket disconnected. Total: {len(self._connections)}")

    async def broadcast(self, message: dict):
        """Send a message to all connected clients."""
        dead = set()
        payload = json.dumps(message, default=str)
        for ws in self._connections:
            try:
                await ws.send_text(payload)
            except Exception:
                dead.add(ws)
        for ws in dead:
            self._connections.discard(ws)

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
