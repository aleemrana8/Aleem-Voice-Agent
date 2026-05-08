"""
Shared Pydantic schemas used across multiple modules.
"""

from datetime import datetime
from typing import Any, Generic, List, Optional, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class SuccessResponse(BaseModel):
    """Standard success envelope."""
    success: bool = True
    message: str = "OK"
    data: Optional[Any] = None


class ErrorResponse(BaseModel):
    """Standard error envelope."""
    success: bool = False
    error: str
    status_code: int
    details: Optional[Any] = None


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated list response."""
    items: List[T]
    total: int
    skip: int
    limit: int
    has_more: bool

    @classmethod
    def build(cls, items: List[T], total: int, skip: int, limit: int):
        return cls(
            items=items,
            total=total,
            skip=skip,
            limit=limit,
            has_more=(skip + limit) < total,
        )


class HealthResponse(BaseModel):
    """Health-check response."""
    status: str = "healthy"
    app: str
    version: str
    timestamp: datetime


class StatsBase(BaseModel):
    """Base for dashboard stat summaries."""
    total: int = 0
    today: int = 0


class AppointmentStats(StatsBase):
    scheduled: int = 0
    completed: int = 0
    cancelled: int = 0


class CallStats(StatsBase):
    completed: int = 0
    failed: int = 0
    in_progress: int = 0


class DashboardStats(BaseModel):
    total_patients: int = 0
    total_doctors: int = 0
    total_appointments: int = 0
    today_appointments: int = 0
    total_calls: int = 0
    active_calls: int = 0
    appointment_breakdown: AppointmentStats = AppointmentStats()
