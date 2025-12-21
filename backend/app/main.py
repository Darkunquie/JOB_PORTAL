from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import time

from app.config import settings
from app.auth.routes import router as auth_router
from app.users.routes import router as users_router
from app.companies.routes import router as companies_router
from app.jobs.routes import router as jobs_router
from app.applications.routes import router as applications_router
from app.admin.routes import router as admin_router

# Rate limiting
from slowapi.errors import RateLimitExceeded
from app.middleware.rate_limiter import limiter, rate_limit_exceeded_handler

# Security headers
from app.middleware.security_headers import SecurityHeadersMiddleware

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    debug=settings.DEBUG,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# Security headers middleware (applied first)
app.add_middleware(SecurityHeadersMiddleware)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add processing time header to all responses."""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions gracefully."""
    import traceback
    import logging

    logger = logging.getLogger(__name__)

    # Always log the full error for debugging
    logger.error(f"Unhandled exception on {request.method} {request.url.path}")
    logger.error(f"Error type: {type(exc).__name__}")
    logger.error(f"Error message: {str(exc)}")
    logger.error(f"Traceback:\n{traceback.format_exc()}")

    if settings.DEBUG:
        raise exc

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An unexpected error occurred. Please try again later.",
            "error_type": type(exc).__name__ if settings.DEBUG else None
        }
    )


# Health check endpoints
@app.get("/health", tags=["System"])
def health_check():
    """
    Basic health check endpoint for monitoring.

    Returns simple system status.
    """
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME
    }


@app.get("/health/detailed", tags=["System"])
def detailed_health_check():
    """
    Comprehensive health check with feature validation and checksums.

    Returns detailed status of all system components, including:
    - Database connectivity
    - Table existence
    - Enum validation
    - Seed data verification
    - File upload system
    - API endpoint configuration
    - Individual checksums for each component
    - Overall system checksum

    This endpoint helps quickly identify which feature failed and why.
    """
    from app.health_check import get_health_report
    return get_health_report()


# Root endpoint
@app.get("/", tags=["System"])
def root():
    """
    Root endpoint with API information.
    """
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "docs": "/api/docs",
        "version": "1.0.0"
    }


# Mount static files for resume downloads
upload_dir = Path(settings.UPLOAD_DIR)
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_dir.parent / "uploads")), name="uploads")


# Register routers
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(users_router, prefix=settings.API_V1_PREFIX)
app.include_router(companies_router, prefix=settings.API_V1_PREFIX)
app.include_router(jobs_router, prefix=settings.API_V1_PREFIX)
app.include_router(applications_router, prefix=settings.API_V1_PREFIX)
app.include_router(admin_router, prefix=settings.API_V1_PREFIX)


# Startup event
@app.on_event("startup")
async def startup_event():
    """
    Run on application startup.

    Initialize necessary resources.
    """
    print(f"Starting {settings.PROJECT_NAME}...")
    print(f"Debug mode: {settings.DEBUG}")
    print(f"API documentation available at: /api/docs")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """
    Run on application shutdown.

    Cleanup resources.
    """
    print(f"Shutting down {settings.PROJECT_NAME}...")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
