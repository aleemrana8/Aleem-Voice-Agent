"""
Request ID middleware — attaches a unique X-Request-ID header to every
request/response cycle for distributed tracing and log correlation.
"""

import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from loguru import logger


class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = request_id

        with logger.contextualize(request_id=request_id):
            logger.debug(f"{request.method} {request.url.path}")
            response: Response = await call_next(request)

        response.headers["X-Request-ID"] = request_id
        return response
