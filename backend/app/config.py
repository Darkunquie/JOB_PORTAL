from pydantic_settings import BaseSettings
from typing import List, Optional
import secrets


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # Security - CRITICAL: Must be overridden in production
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours for better UX
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Application
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Job Marketplace"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # File Upload
    UPLOAD_DIR: str = "/app/uploads"
    MAX_UPLOAD_SIZE: int = 5242880  # 5MB
    ALLOWED_RESUME_TYPES: str = "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    # Email (for password reset, verification)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM: Optional[str] = None
    SMTP_TLS: bool = True

    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_PER_MINUTE: int = 60

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: Optional[str] = "./logs/app.log"

    # Error Tracking
    SENTRY_DSN: Optional[str] = None

    # Security Headers
    ENABLE_SECURITY_HEADERS: bool = True

    # Session/Cookie Settings
    SESSION_COOKIE_SECURE: bool = True  # HTTPS only
    SESSION_COOKIE_HTTPONLY: bool = True  # Prevent XSS
    SESSION_COOKIE_SAMESITE: str = "Strict"  # CSRF protection

    @property
    def allowed_resume_types_list(self) -> List[str]:
        return [t.strip() for t in self.ALLOWED_RESUME_TYPES.split(",")]

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT.lower() == "development"

    def validate_security(self) -> List[str]:
        """Validate security configuration and return warnings"""
        warnings = []

        if self.is_production:
            if len(self.SECRET_KEY) < 64:
                warnings.append("SECRET_KEY should be at least 64 characters in production")
            if "CHANGE" in self.SECRET_KEY.upper() or "YOUR-" in self.SECRET_KEY.upper():
                warnings.append("SECRET_KEY appears to be a placeholder - use a secure random value")
            if self.DEBUG:
                warnings.append("DEBUG mode should be disabled in production")
            if not self.SESSION_COOKIE_SECURE:
                warnings.append("SESSION_COOKIE_SECURE should be True in production (requires HTTPS)")

        return warnings

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

# Validate security on startup
if security_warnings := settings.validate_security():
    import logging
    logger = logging.getLogger(__name__)
    for warning in security_warnings:
        logger.warning(f"Security Warning: {warning}")
