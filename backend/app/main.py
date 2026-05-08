from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.core.config import settings
from app.core.database import Database
from app.core.logging import setup_logging
from app.core.security import get_password_hash
from app.middleware.request_id import RequestIDMiddleware
from app.middleware.rate_limiter import RateLimiterMiddleware
from app.middleware.error_handlers import register_error_handlers
from app.services.websocket_manager import ws_manager
from app.models.user import User
from app.models.doctor import Doctor, DaySchedule, BreakTime
from app.models.enums import UserRole
from app.routes import (
    auth, patients, doctors, appointments,
    calls, notifications, dashboard, voice, schedules, ehr,
    audit, workflow,
)

logger = setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    await Database.connect()

    # Seed admin user if not exists
    existing_admin = await User.find_one(User.username == settings.ADMIN_USERNAME)
    if not existing_admin:
        admin = User(
            username=settings.ADMIN_USERNAME,
            email=f"{settings.ADMIN_USERNAME}@aleemehr.com",
            hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
            full_name=settings.ADMIN_FULL_NAME,
            role=UserRole.ADMIN,
        )
        await admin.insert()
        logger.info(f"Admin user created: {settings.ADMIN_USERNAME}")
    else:
        logger.info(f"Admin user exists: {settings.ADMIN_USERNAME}")

    # Seed doctors if not exists
    doctor_count = await Doctor.find(Doctor.is_active == True).count()
    if doctor_count == 0:
        schedule = {
            day: DaySchedule(
                start="15:00", end="00:00", slot_duration=30,
                breaks=[BreakTime(start="20:00", end="21:00", label="Evening Break")],
            )
            for day in ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        }
        doctors_data = [
            {"employee_id": "DOC001", "full_name": "Dr Aleem", "specialization": "General Medicine", "phone": "+923001234501", "locations": ["Islamabad", "Multan"]},
            {"employee_id": "DOC002", "full_name": "Dr Mohsin", "specialization": "General Medicine", "phone": "+923001234502", "locations": ["Islamabad"]},
            {"employee_id": "DOC003", "full_name": "Dr Zain", "specialization": "General Medicine", "phone": "+923001234503", "locations": ["Multan"]},
        ]
        for d in doctors_data:
            doc = Doctor(**d, schedule=schedule)
            await doc.insert()
        logger.info("Seeded 3 doctors: Dr Aleem, Dr Mohsin, Dr Zain")
    else:
        logger.info(f"Doctors exist: {doctor_count} active")

    logger.info("All systems operational")
    yield
    # Shutdown
    await Database.disconnect()
    logger.info("Application shutdown complete")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI Hospital Voice Agent & EHR System",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# ── Middleware Stack (order matters: last added = first executed) ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(RequestIDMiddleware)
app.add_middleware(RateLimiterMiddleware)
if not settings.DEBUG:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS,
    )

# ── Error Handlers ──────────────────────────────────
register_error_handlers(app)

# ── API Routes ──────────────────────────────────────
api_prefix = "/api/v1"
app.include_router(auth.router, prefix=api_prefix)
app.include_router(patients.router, prefix=api_prefix)
app.include_router(doctors.router, prefix=api_prefix)
app.include_router(appointments.router, prefix=api_prefix)
app.include_router(calls.router, prefix=api_prefix)
app.include_router(notifications.router, prefix=api_prefix)
app.include_router(dashboard.router, prefix=api_prefix)
app.include_router(voice.router, prefix=api_prefix)
app.include_router(schedules.router, prefix=api_prefix)
app.include_router(ehr.router, prefix=api_prefix)
app.include_router(audit.router, prefix=api_prefix)
app.include_router(workflow.router, prefix=api_prefix)


# ── Dashboard WebSocket ─────────────────────────────
@app.websocket("/ws/dashboard")
async def dashboard_websocket(websocket: WebSocket):
    await ws_manager.connect(websocket, channel="dashboard")


@app.websocket("/ws/calls")
async def calls_websocket(websocket: WebSocket):
    await ws_manager.connect(websocket, channel="calls")


# ── Health Check ────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/", tags=["Root"])
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs" if settings.DEBUG else "Disabled in production",
    }
