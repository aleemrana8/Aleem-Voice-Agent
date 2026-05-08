"""
Input validation helpers for common field formats.
"""

import re
from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException, status


_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
_TIME_RE = re.compile(r"^\d{2}:\d{2}$")
_PHONE_RE = re.compile(r"^\+?[\d\s\-()]{7,20}$")


def validate_date_format(value: str, field_name: str = "date") -> str:
    """Validate YYYY-MM-DD and confirm it's a real calendar date."""
    if not _DATE_RE.match(value):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid {field_name} format. Expected YYYY-MM-DD.",
        )
    try:
        datetime.strptime(value, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid {field_name}: not a valid calendar date.",
        )
    return value


def validate_time_slot(value: str) -> str:
    """Validate HH:MM time slot format."""
    if not _TIME_RE.match(value):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid time slot format. Expected HH:MM.",
        )
    hours, minutes = map(int, value.split(":"))
    if not (0 <= hours <= 23 and 0 <= minutes <= 59):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Time slot out of range.",
        )
    return value


def validate_phone(value: str) -> str:
    """Basic phone number format validation."""
    if not _PHONE_RE.match(value):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid phone number format.",
        )
    return value


def validate_object_id(value: str, field_name: str = "id") -> str:
    """Validate a MongoDB ObjectId string."""
    if not ObjectId.is_valid(value):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid {field_name}: not a valid ObjectId.",
        )
    return value
