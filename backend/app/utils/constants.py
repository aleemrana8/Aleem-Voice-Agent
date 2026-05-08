"""
Application-wide constants — single source of truth for enum-like values.
"""

# ── User Roles ──────────────────────────────────────
USER_ROLES = ("admin", "doctor", "staff")

# ── Appointment ─────────────────────────────────────
APPOINTMENT_STATUSES = (
    "scheduled",
    "confirmed",
    "completed",
    "cancelled",
    "rescheduled",
    "no_show",
)

BOOKING_SOURCES = ("voice", "dashboard", "api")

# ── Call Log ────────────────────────────────────────
CALL_STATUSES = ("in_progress", "completed", "failed", "dropped")

CALL_INTENTS = ("booking", "reschedule", "cancel", "inquiry", "general")

# ── Notification Types ──────────────────────────────
NOTIFICATION_TYPES = ("info", "success", "warning", "error")

# ── Pagination Defaults ────────────────────────────
DEFAULT_PAGE_SIZE = 50
MAX_PAGE_SIZE = 100

# ── Time ────────────────────────────────────────────
SLOT_DURATION_MINUTES = 30
