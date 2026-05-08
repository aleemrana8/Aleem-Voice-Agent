"""
Smoke tests — verify app boots and health endpoint responds.
These tests do NOT require a database connection.
"""

import pytest


def test_import_main():
    """Verify the main module imports without errors."""
    from app.main import app  # noqa: F401
    assert app is not None


def test_import_config():
    """Verify config loads with defaults."""
    from app.core.config import settings
    assert settings.APP_NAME == "Aleem Voice Agent"
    assert settings.APP_VERSION is not None


def test_import_models():
    """Verify all document models import cleanly."""
    from app.models import ALL_DOCUMENT_MODELS
    assert len(ALL_DOCUMENT_MODELS) == 7


def test_import_routes():
    """Verify all route modules import."""
    from app.routes import ALL_ROUTERS
    assert len(ALL_ROUTERS) == 8


def test_constants():
    """Verify constants are defined."""
    from app.utils.constants import (
        APPOINTMENT_STATUSES,
        CALL_STATUSES,
        USER_ROLES,
    )
    assert "admin" in USER_ROLES
    assert "scheduled" in APPOINTMENT_STATUSES
    assert "completed" in CALL_STATUSES


def test_helpers():
    """Verify helper functions work."""
    from app.utils.helpers import generate_id, utc_now, format_duration

    pid = generate_id("PAT")
    assert pid.startswith("PAT-")
    assert len(pid) == 12  # PAT- + 8 hex chars

    now = utc_now()
    assert now.tzinfo is not None

    assert format_duration(3661) == "1h 1m 1s"


def test_validators():
    """Verify validators accept/reject correctly."""
    from app.utils.validators import (
        _DATE_RE,
        _TIME_RE,
        _PHONE_RE,
    )

    assert _DATE_RE.match("2025-01-15")
    assert not _DATE_RE.match("15-01-2025")

    assert _TIME_RE.match("09:30")
    assert not _TIME_RE.match("9:30am")

    assert _PHONE_RE.match("+1-555-123-4567")
    assert _PHONE_RE.match("03001234567")
