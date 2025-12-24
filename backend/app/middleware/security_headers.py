"""
Security Headers Middleware
Adds comprehensive security headers to protect against common web vulnerabilities
"""
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware that adds security headers to all responses

    Protects against:
    - XSS (Cross-Site Scripting)
    - Clickjacking
    - MIME type sniffing
    - Information leakage
    - Man-in-the-middle attacks
    """

    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)

        if not settings.ENABLE_SECURITY_HEADERS:
            return response

        # Content Security Policy (CSP)
        # Prevents XSS attacks by controlling resource loading
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "  # Allow inline scripts for React
            "style-src 'self' 'unsafe-inline'; "  # Allow inline styles
            "img-src 'self' data: https:; "  # Allow images from self, data URIs, and HTTPS
            "font-src 'self' data:; "
            "connect-src 'self' http://localhost:* http://backend:8000; "  # API connections
            "frame-ancestors 'none'; "  # Prevent embedding (anti-clickjacking)
            "base-uri 'self'; "
            "form-action 'self'"
        )

        # HTTP Strict Transport Security (HSTS)
        # Forces browsers to use HTTPS only
        if settings.is_production:
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )

        # X-Content-Type-Options
        # Prevents MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # X-Frame-Options
        # Prevents clickjacking by disallowing embedding in frames
        response.headers["X-Frame-Options"] = "DENY"

        # X-XSS-Protection
        # Enables XSS filter in older browsers
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Referrer-Policy
        # Controls how much referrer information is sent
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Permissions-Policy (formerly Feature-Policy)
        # Controls which browser features can be used
        response.headers["Permissions-Policy"] = (
            "geolocation=(), "
            "microphone=(), "
            "camera=(), "
            "payment=(), "
            "usb=(), "
            "magnetometer=(), "
            "gyroscope=(), "
            "accelerometer=()"
        )

        # X-Permitted-Cross-Domain-Policies
        # Restricts Adobe Flash and PDF cross-domain requests
        response.headers["X-Permitted-Cross-Domain-Policies"] = "none"

        # Remove server information
        # Prevents information leakage about backend stack
        if "Server" in response.headers:
            del response.headers["Server"]

        # X-Powered-By
        # Remove technology fingerprinting
        if "X-Powered-By" in response.headers:
            del response.headers["X-Powered-By"]

        return response
