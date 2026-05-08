"""
In-memory sliding-window rate limiter middleware.
Production deployments should swap this for Redis-backed limiting.
"""

import time
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from app.core.config import settings


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """Simple per-IP rate limiter.

    Settings pulled from config:
        RATE_LIMIT_PER_MINUTE  – max requests per window (default 120)
    """

    def __init__(self, app, calls: int = 0, period: int = 60):
        super().__init__(app)
        self.calls = calls or settings.RATE_LIMIT_PER_MINUTE
        self.period = period
        self._buckets: dict[str, list[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks
        if request.url.path in ("/health", "/docs", "/openapi.json"):
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        window_start = now - self.period

        # Prune old timestamps
        bucket = self._buckets[client_ip]
        self._buckets[client_ip] = [t for t in bucket if t > window_start]

        if len(self._buckets[client_ip]) >= self.calls:
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Rate limit exceeded. Try again later.",
                    "retry_after": self.period,
                },
                headers={"Retry-After": str(self.period)},
            )

        self._buckets[client_ip].append(now)
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self.calls)
        response.headers["X-RateLimit-Remaining"] = str(
            self.calls - len(self._buckets[client_ip])
        )
        return response
