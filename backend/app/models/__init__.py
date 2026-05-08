# ── Document Models ────────────────────────────────
from app.models.enums import (
    UserRole,
    Gender,
    BloodGroup,
    AppointmentStatus,
    BookingSource,
    CallStatus,
    CallIntent,
    Speaker,
    NotificationType,
    DayOfWeek,
)
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor, DoctorAvailability
from app.models.appointment import Appointment
from app.models.call_log import CallLog
from app.models.transcript import Transcript
from app.models.notification import Notification

ALL_DOCUMENT_MODELS = [
    User,
    Patient,
    Doctor,
    DoctorAvailability,
    Appointment,
    CallLog,
    Transcript,
    Notification,
]

__all__ = [
    # Enums
    "UserRole",
    "Gender",
    "BloodGroup",
    "AppointmentStatus",
    "BookingSource",
    "CallStatus",
    "CallIntent",
    "Speaker",
    "NotificationType",
    "DayOfWeek",
    # Documents
    "User",
    "Patient",
    "Doctor",
    "DoctorAvailability",
    "Appointment",
    "CallLog",
    "Transcript",
    "Notification",
    "ALL_DOCUMENT_MODELS",
]
