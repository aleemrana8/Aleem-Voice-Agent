# ── API Routers ────────────────────────────────────
from app.routes import (
    auth,
    patients,
    doctors,
    appointments,
    calls,
    notifications,
    dashboard,
    voice,
    schedules,
    public,
)

ALL_ROUTERS = [
    auth.router,
    patients.router,
    doctors.router,
    appointments.router,
    calls.router,
    notifications.router,
    dashboard.router,
    voice.router,
    schedules.router,
    public.router,
]

__all__ = [
    "auth",
    "patients",
    "doctors",
    "appointments",
    "calls",
    "notifications",
    "dashboard",
    "voice",
    "schedules",
    "public",
    "ALL_ROUTERS",
]
