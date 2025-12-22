from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from pathlib import Path
import time
import logging
from sqlalchemy import text

# --------------------------------------------------
# BLOCKER 5.1.2 — Structured logging
# --------------------------------------------------
from app.logging_config import setup_logging, logger
setup_logging()

# --------------------------------------------------
# App imports
# --------------------------------------------------
from app.errors import APIError
from app.config import settings
from app.database import engine
from app.auth.routes import router as auth_router
from app.users.routes import router as users_router
from app.companies.routes import router as companies_router
from app.jobs.routes import router as jobs_router
from app.applications.routes import router as applications_router
from app.admin.routes import router as admin_router
from app.health_check import router as health_router

# --------------------------------------------------
# Rate limiting
# --------------------------------------------------
from slowapi.errors import RateLimitExceeded
from app.middleware.rate_limiter import limiter, rate_limit_exceeded_handler

# --------------------------------------------------
# Security & tracing
# --------------------------------------------------
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.middleware.request_id import request_id_middleware

# --------------------------------------------------
# Create FastAPI app
# --------------------------------------------------
app = FastAPI(
    title=settings.PROJECT_NAME,
    debug=settings.DEBUG,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

logger = logging.getLogger(__name__)

# --------------------------------------------------
# Startup readiness flag (BLOCKER 5.2)
# --------------------------------------------------
app.state.ready = False

# --------------------------------------------------
# Rate limiter
# --------------------------------------------------
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# --------------------------------------------------
# Middleware (ORDER MATTERS)
# --------------------------------------------------

# ✅ BLOCKER 5.1.3 — Request ID FIRST
app.middleware("http")(request_id_middleware)

# Security headers
app.add_middleware(SecurityHeadersMiddleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request timing
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    response.headers["X-Process-Time"] = str(time.time() - start_time)
    return response

# --------------------------------------------------
# Exception handlers
# --------------------------------------------------

@app.exception_handler(APIError)
async def api_error_handler(request: Request, exc: APIError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
            }
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid request data",
                "details": exc.errors(),
            }
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback

    logger.error(
        "Unhandled exception",
        extra={"request_id": getattr(request.state, "request_id", None)},
    )
    logger.error(traceback.format_exc())

    if settings.DEBUG:
        raise exc

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "Something went wrong. Please try again later.",
                "details": None,
            }
        },
    )

# --------------------------------------------------
# Health checks (BLOCKER 5.2)
# --------------------------------------------------

@app.get("/health", tags=["System"])
def health_check():
    return {"status": "healthy", "service": settings.PROJECT_NAME}


@app.get("/health/live", tags=["System"])
def liveness_check():
    """
    Liveness probe — process alive
    """
    return {"status": "alive", "service": settings.PROJECT_NAME}


@app.get("/health/ready", tags=["System"])
def readiness_check():
    """
    Readiness probe — traffic safe
    """
    if not app.state.ready:
        return JSONResponse(
            status_code=503,
            content={"status": "not_ready", "reason": "startup_in_progress"},
        )

    try:
        with engine.connect():
            pass
    except Exception:
        return JSONResponse(
            status_code=503,
            content={"status": "not_ready", "reason": "database_unavailable"},
        )

    return {"status": "ready", "service": settings.PROJECT_NAME}


@app.get("/health/detailed", tags=["System"])
def detailed_health_check():
    from app.health_check import get_health_report
    return get_health_report()

# --------------------------------------------------
# Root
# --------------------------------------------------
@app.get("/", tags=["System"])
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "docs": "/api/docs",
        "version": "1.0.0",
    }

# --------------------------------------------------
# Static files
# --------------------------------------------------
upload_dir = Path(settings.UPLOAD_DIR)
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")

# --------------------------------------------------
# Routers
# --------------------------------------------------
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(users_router, prefix=settings.API_V1_PREFIX)
app.include_router(companies_router, prefix=settings.API_V1_PREFIX)
app.include_router(jobs_router, prefix=settings.API_V1_PREFIX)
app.include_router(applications_router, prefix=settings.API_V1_PREFIX)
app.include_router(admin_router, prefix=settings.API_V1_PREFIX)
app.include_router(health_router)

# --------------------------------------------------
# Startup & Shutdown
# --------------------------------------------------
MAX_RETRIES = 10
RETRY_DELAY = 2  # seconds

@app.on_event("startup")
def startup_event():
    logger.info("🚀 Starting Job Marketplace")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug mode: {settings.DEBUG}")

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("✅ Database verified — app READY")
            break
        except Exception as e:
            logger.warning(
                f"⏳ Database not ready (attempt {attempt}/{MAX_RETRIES})"
            )
            time.sleep(RETRY_DELAY)
    else:
        logger.critical("❌ Database connection failed")
        raise RuntimeError("Database is not reachable")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info(f"🛑 Shutting down {settings.PROJECT_NAME}")
    engine.dispose()
