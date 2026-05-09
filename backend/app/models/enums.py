"""
Enum definitions for all document models.
Using str-based enums so they serialize to JSON strings in MongoDB and API responses.
"""

from enum import StrEnum


# ── User / Admin ────────────────────────────────────
class UserRole(StrEnum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    STAFF = "staff"


# ── Patient ─────────────────────────────────────────
class Gender(StrEnum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class BloodGroup(StrEnum):
    A_POS = "A+"
    A_NEG = "A-"
    B_POS = "B+"
    B_NEG = "B-"
    AB_POS = "AB+"
    AB_NEG = "AB-"
    O_POS = "O+"
    O_NEG = "O-"


# ── Appointment ─────────────────────────────────────
class AppointmentStatus(StrEnum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    RESCHEDULED = "rescheduled"
    NO_SHOW = "no_show"


class BookingSource(StrEnum):
    VOICE = "voice"
    DASHBOARD = "dashboard"
    API = "api"
    WEBSITE = "website"


# ── Call Log ────────────────────────────────────────
class CallStatus(StrEnum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    DROPPED = "dropped"


class CallIntent(StrEnum):
    BOOKING = "booking"
    RESCHEDULE = "reschedule"
    CANCEL = "cancel"
    INQUIRY = "inquiry"
    GENERAL = "general"


# ── Transcript ──────────────────────────────────────
class Speaker(StrEnum):
    AGENT = "agent"
    PATIENT = "patient"
    SYSTEM = "system"


# ── Notification ────────────────────────────────────
class NotificationType(StrEnum):
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"


# ── EHR Integration ────────────────────────────────
class EHRSyncType(StrEnum):
    APPOINTMENT_CREATED = "appointment_created"
    APPOINTMENT_RESCHEDULED = "appointment_rescheduled"
    APPOINTMENT_CANCELLED = "appointment_cancelled"
    PATIENT_CREATED = "patient_created"
    PATIENT_UPDATED = "patient_updated"
    CALL_LOG_SYNCED = "call_log_synced"
    TRANSCRIPT_SYNCED = "transcript_synced"


class EHRSyncStatus(StrEnum):
    PENDING = "pending"
    SYNCED = "synced"
    FAILED = "failed"
    RETRY = "retry"


# ── Day of Week ─────────────────────────────────────
class DayOfWeek(StrEnum):
    MONDAY = "monday"
    TUESDAY = "tuesday"
    WEDNESDAY = "wednesday"
    THURSDAY = "thursday"
    FRIDAY = "friday"
    SATURDAY = "saturday"
    SUNDAY = "sunday"
