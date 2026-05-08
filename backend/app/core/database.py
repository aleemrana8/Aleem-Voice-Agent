from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
from app.models import ALL_DOCUMENT_MODELS
from loguru import logger


class Database:
    client: AsyncIOMotorClient = None

    @classmethod
    async def connect(cls):
        logger.info(f"Connecting to MongoDB: {settings.MONGO_DB_NAME}")
        cls.client = AsyncIOMotorClient(
            settings.MONGO_URI,
            maxPoolSize=50,
            minPoolSize=10,
            serverSelectionTimeoutMS=5000,
        )
        await init_beanie(
            database=cls.client[settings.MONGO_DB_NAME],
            document_models=ALL_DOCUMENT_MODELS,
        )
        logger.info("MongoDB connected and Beanie initialized")

    @classmethod
    async def disconnect(cls):
        if cls.client:
            cls.client.close()
            logger.info("MongoDB disconnected")

    @classmethod
    async def ping(cls) -> bool:
        """Verify database connectivity."""
        try:
            await cls.client.admin.command("ping")
            return True
        except Exception:
            return False


async def get_database():
    return Database.client[settings.MONGO_DB_NAME]
