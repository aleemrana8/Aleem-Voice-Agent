# ── Schemas ────────────────────────────────────────
from app.schemas.common import (
    PaginatedResponse,
    SuccessResponse,
    ErrorResponse,
    HealthResponse,
)
from app.schemas.appointment import (
    BookAppointmentRequest,
    RescheduleAppointmentRequest,
    CancelAppointmentRequest,
    AppointmentDetail,
    AppointmentListItem,
    AvailabilityRequest,
    AvailabilityResponse,
    AppointmentStatsResponse,
)

__all__ = [
    "PaginatedResponse",
    "SuccessResponse",
    "ErrorResponse",
    "HealthResponse",
    "BookAppointmentRequest",
    "RescheduleAppointmentRequest",
    "CancelAppointmentRequest",
    "AppointmentDetail",
    "AppointmentListItem",
    "AvailabilityRequest",
    "AvailabilityResponse",
    "AppointmentStatsResponse",
]
