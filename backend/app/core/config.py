from pydantic_settings import BaseSettings
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    # ── App ─────────────────────────────────────────
    APP_NAME: str = "Aleem Voice Agent"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    ALLOWED_HOSTS: List[str] = ["*"]

    # ── MongoDB ─────────────────────────────────────
    MONGO_URI: str = os.getenv(
        "MONGO_URI",
        "mongodb://admin:aleemehr2024@localhost:27017/aleem_ehr?authSource=admin",
    )
    MONGO_DB_NAME: str = os.getenv("MONGO_DB_NAME", "aleem_ehr")

    # ── JWT ─────────────────────────────────────────
    JWT_SECRET: str = os.getenv("JWT_SECRET", "change-me-in-production")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRATION_MINUTES: int = int(os.getenv("JWT_EXPIRATION_MINUTES", "1440"))

    # ── CORS ────────────────────────────────────────
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # ── Rate Limiting ───────────────────────────────
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "120"))

    # ── LiveKit ─────────────────────────────────────
    LIVEKIT_URL: str = os.getenv(
        "LIVEKIT_URL",
        "wss://aleem-voice-agent-44niowom.livekit.cloud",
    )
    LIVEKIT_API_KEY: str = os.getenv("LIVEKIT_API_KEY", "")
    LIVEKIT_API_SECRET: str = os.getenv("LIVEKIT_API_SECRET", "")

    # ── SIP / Telephony ────────────────────────────
    SIP_TRUNK_ID: str = os.getenv("SIP_TRUNK_ID", "ST_JT7r83zg3brC")
    SIP_PHONE_NUMBER: str = os.getenv("SIP_PHONE_NUMBER", "4406848838")

    # ── OpenAI ──────────────────────────────────────
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o")

    # ── Logging ─────────────────────────────────────
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
