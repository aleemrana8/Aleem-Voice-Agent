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
from app.schemas.schedule import (
    SetWeeklyScheduleRequest,
    UpdateDayScheduleRequest,
    WeeklyScheduleResponse,
    CreateHolidayRequest,
    CreateOverrideRequest,
    OverrideResponse,
    DayAvailabilityResponse,
    WeeklyAvailabilityResponse,
    MonthlyAvailabilityResponse,
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
    "SetWeeklyScheduleRequest",
    "UpdateDayScheduleRequest",
    "WeeklyScheduleResponse",
    "CreateHolidayRequest",
    "CreateOverrideRequest",
    "OverrideResponse",
    "DayAvailabilityResponse",
    "WeeklyAvailabilityResponse",
    "MonthlyAvailabilityResponse",
]
