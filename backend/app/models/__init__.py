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
    EHRSyncType,
    EHRSyncStatus,
)
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor, DoctorAvailability
from app.models.appointment import Appointment
from app.models.call_log import CallLog
from app.models.transcript import Transcript
from app.models.notification import Notification
from app.models.ehr_sync import EHRSyncLog
from app.models.audit_log import AuditLog

ALL_DOCUMENT_MODELS = [
    User,
    Patient,
    Doctor,
    DoctorAvailability,
    Appointment,
    CallLog,
    Transcript,
    Notification,
    EHRSyncLog,
    AuditLog,
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
    "EHRSyncLog",
    "AuditLog",
    "ALL_DOCUMENT_MODELS",
]
