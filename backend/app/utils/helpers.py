"""
General-purpose helpers used across the application.
"""

import uuid
from datetime import datetime, timezone
from typing import Tuple
from fastapi import Query


def generate_id(prefix: str = "ID") -> str:
    """Generate a prefixed unique identifier.

    Examples:
        generate_id("PAT")  → "PAT-A1B2C3D4"
        generate_id("CALL") → "CALL-E5F6A7B8C9D0"
    """
    return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"


def utc_now() -> datetime:
    """Return current UTC datetime (timezone-aware)."""
    return datetime.now(timezone.utc)


def paginate_params(
    skip: int = Query(0, ge=0, description="Records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Max records to return"),
) -> Tuple[int, int]:
    """FastAPI dependency for standard pagination."""
    return skip, limit


def format_duration(seconds: int) -> str:
    """Format seconds into human-readable duration.

    Example: format_duration(3661) → "1h 1m 1s"
    """
    hours, remainder = divmod(seconds, 3600)
    minutes, secs = divmod(remainder, 60)
    parts = []
    if hours:
        parts.append(f"{hours}h")
    if minutes:
        parts.append(f"{minutes}m")
    parts.append(f"{secs}s")
    return " ".join(parts)


def sanitize_search(query: str) -> str:
    """Escape regex special characters in user search input."""
    import re
    return re.escape(query.strip())
