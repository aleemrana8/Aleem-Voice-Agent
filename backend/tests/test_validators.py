"""
Unit tests for utility validators.
"""

import pytest
from fastapi import HTTPException


def test_validate_date_format_valid():
    from app.utils.validators import validate_date_format

    assert validate_date_format("2025-06-15") == "2025-06-15"
    assert validate_date_format("2024-02-29") == "2024-02-29"  # leap year


def test_validate_date_format_invalid():
    from app.utils.validators import validate_date_format

    with pytest.raises(HTTPException):
        validate_date_format("2025-13-01")  # invalid month

    with pytest.raises(HTTPException):
        validate_date_format("not-a-date")

    with pytest.raises(HTTPException):
        validate_date_format("2023-02-29")  # not a leap year


def test_validate_time_slot_valid():
    from app.utils.validators import validate_time_slot

    assert validate_time_slot("09:00") == "09:00"
    assert validate_time_slot("23:59") == "23:59"
    assert validate_time_slot("00:00") == "00:00"


def test_validate_time_slot_invalid():
    from app.utils.validators import validate_time_slot

    with pytest.raises(HTTPException):
        validate_time_slot("25:00")

    with pytest.raises(HTTPException):
        validate_time_slot("abc")


def test_validate_phone_valid():
    from app.utils.validators import validate_phone

    assert validate_phone("+1-555-123-4567") == "+1-555-123-4567"
    assert validate_phone("03001234567") == "03001234567"


def test_validate_phone_invalid():
    from app.utils.validators import validate_phone

    with pytest.raises(HTTPException):
        validate_phone("abc")

    with pytest.raises(HTTPException):
        validate_phone("12")


def test_validate_object_id_valid():
    from app.utils.validators import validate_object_id

    oid = "507f1f77bcf86cd799439011"
    assert validate_object_id(oid) == oid


def test_validate_object_id_invalid():
    from app.utils.validators import validate_object_id

    with pytest.raises(HTTPException):
        validate_object_id("not-an-object-id")
