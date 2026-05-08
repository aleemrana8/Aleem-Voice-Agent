from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Database
from app.core.logging import setup_logging
from app.services.websocket_manager import ws_manager
from app.routes import auth, patients, doctors, appointments, calls, notifications, dashboard, voice

logger = setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    await Database.connect()
    yield
    # Shutdown
    await Database.disconnect()
    logger.info("Application shutdown")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI Hospital Voice Agent & EHR System",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


# ── Dashboard WebSocket ─────────────────────────────
@app.websocket("/ws/dashboard")
async def dashboard_websocket(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Keep-alive / ping-pong
            if data == "ping":
                await ws_manager.send_personal(websocket, {"type": "pong"})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


# ── Health Check ────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }
