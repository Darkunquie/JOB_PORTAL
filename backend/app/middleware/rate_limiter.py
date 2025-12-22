"""
Rate Limiting Middleware
Protects against brute force attacks and abuse
"""
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from fastapi import Request, Response
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)


# --------------------------------------------------
# Rate limit key (IP + user if available)
# --------------------------------------------------
def rate_limit_key(request: Request) -> str:
    """
    Use user ID when authenticated, otherwise fallback to IP.
    """
    user = getattr(request.state, "user", None)
    if user:
        return f"user:{user.id}"
    return get_remote_address(request)


# --------------------------------------------------
# Initialize limiter
# --------------------------------------------------
limiter = Limiter(
    key_func=rate_limit_key,
    enabled=True,
)


# --------------------------------------------------
# Custom exception handler
# --------------------------------------------------
async def rate_limit_exceeded_handler(
    request: Request,
    exc: RateLimitExceeded,
) -> Response:
    key = rate_limit_key(request)

    logger.warning(
        f"Rate limit exceeded | key={key} | "
        f"{request.method} {request.url.path}"
    )

    return JSONResponse(
        status_code=429,
        content={
            "error": {
                "code": "RATE_LIMIT_EXCEEDED",
                "message": "Too many requests. Please try again later.",
                "details": None,
            }
        },
        headers={
            "Retry-After": "60",
        },
    )
