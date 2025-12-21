"""
Rate Limiting Middleware
Protects against brute force attacks and DDoS
"""
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[f"{settings.RATE_LIMIT_PER_MINUTE}/minute"] if settings.RATE_LIMIT_ENABLED else [],
    enabled=settings.RATE_LIMIT_ENABLED
)

# Custom rate limit for authentication endpoints (stricter)
AUTH_RATE_LIMIT = "5/minute"

# Custom rate limit for file upload endpoints
UPLOAD_RATE_LIMIT = "10/minute"

# Custom rate limit for search/query endpoints
SEARCH_RATE_LIMIT = "30/minute"


async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> Response:
    """
    Custom handler for rate limit exceeded errors
    """
    client_ip = get_remote_address(request)
    logger.warning(
        f"Rate limit exceeded for {client_ip} on {request.method} {request.url.path}"
    )

    return JSONResponse(
        status_code=429,
        content={
            "error": "rate_limit_exceeded",
            "message": "Too many requests. Please try again later.",
            "detail": str(exc.detail) if hasattr(exc, 'detail') else "Rate limit exceeded"
        },
        headers={
            "Retry-After": "60",
            "X-RateLimit-Limit": str(settings.RATE_LIMIT_PER_MINUTE),
            "X-RateLimit-Remaining": "0"
        }
    )


def get_rate_limit_key(request: Request) -> str:
    """
    Custom key function that uses both IP and user ID if authenticated
    """
    # Get IP address
    client_ip = get_remote_address(request)

    # Try to get user ID from request state (set by auth middleware)
    user_id = getattr(request.state, 'user_id', None)

    # Combine IP and user ID for better rate limiting
    if user_id:
        return f"{client_ip}:{user_id}"

    return client_ip
