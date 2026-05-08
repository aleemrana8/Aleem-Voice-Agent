from livekit import api as livekit_api
from app.core.config import settings
from loguru import logger


class LiveKitService:
    """Manages LiveKit rooms and tokens for voice calls."""

    def __init__(self):
        self.api_key = settings.LIVEKIT_API_KEY
        self.api_secret = settings.LIVEKIT_API_SECRET
        self.url = settings.LIVEKIT_URL

    def create_token(self, room_name: str, participant_name: str) -> str:
        """Generate a LiveKit access token for a participant."""
        token = livekit_api.AccessToken(self.api_key, self.api_secret)
        token.with_identity(participant_name)
        token.with_name(participant_name)
        grant = livekit_api.VideoGrants(
            room_join=True,
            room=room_name,
        )
        token.with_grants(grant)
        return token.to_jwt()

    def create_agent_token(self, room_name: str) -> str:
        """Create token for the AI agent to join a room."""
        return self.create_token(room_name, "aleem-voice-agent")

    def create_caller_token(self, room_name: str, caller_id: str) -> str:
        """Create token for the caller to join a room."""
        return self.create_token(room_name, f"caller-{caller_id}")


# Singleton
livekit_service = LiveKitService()
