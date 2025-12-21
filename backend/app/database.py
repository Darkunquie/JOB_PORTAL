from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Verify connections before use
    pool_size=20,  # Increased from 10 for better concurrency
    max_overflow=40,  # Increased from 20
    pool_recycle=3600,  # Recycle connections after 1 hour
    pool_timeout=30,  # Wait up to 30s for connection
    echo=False  # Disable SQL logging for performance
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    Database session dependency for FastAPI routes.
    Ensures proper session cleanup.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
