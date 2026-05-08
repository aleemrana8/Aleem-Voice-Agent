"""
Application-wide constants — single source of truth for enum-like values.
Enum classes live in app.models.enums; this file holds non-enum constants.
"""

from app.models.enums import (
    AppointmentStatus,
    BookingSource,
    CallIntent,
    CallStatus,
    NotificationType,
    UserRole,
)

# ── Re-exports for backward compatibility ──────────
USER_ROLES = tuple(r.value for r in UserRole)
APPOINTMENT_STATUSES = tuple(s.value for s in AppointmentStatus)
BOOKING_SOURCES = tuple(s.value for s in BookingSource)
CALL_STATUSES = tuple(s.value for s in CallStatus)
CALL_INTENTS = tuple(i.value for i in CallIntent)
NOTIFICATION_TYPES = tuple(t.value for t in NotificationType)

# ── Pagination Defaults ────────────────────────────
DEFAULT_PAGE_SIZE = 50
MAX_PAGE_SIZE = 100

# ── Time ────────────────────────────────────────────
SLOT_DURATION_MINUTES = 30
