from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.appointment import Appointment
from app.models.call_log import CallLog
from app.models.transcript import Transcript
from app.models.notification import Notification
from loguru import logger


class Database:
    client: AsyncIOMotorClient = None

    @classmethod
    async def connect(cls):
        logger.info(f"Connecting to MongoDB: {settings.MONGO_DB_NAME}")
        cls.client = AsyncIOMotorClient(settings.MONGO_URI)
        await init_beanie(
            database=cls.client[settings.MONGO_DB_NAME],
            document_models=[
                User,
                Patient,
                Doctor,
                Appointment,
                CallLog,
                Transcript,
                Notification,
            ],
        )
        logger.info("MongoDB connected and Beanie initialized")

    @classmethod
    async def disconnect(cls):
        if cls.client:
            cls.client.close()
            logger.info("MongoDB disconnected")


async def get_database():
    return Database.client[settings.MONGO_DB_NAME]
