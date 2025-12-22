from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import QueuePool
from app.config import settings

DATABASE_URL = settings.DATABASE_URL

# --------------------------------------------------
# SQLAlchemy Engine (PRODUCTION SAFE)
# --------------------------------------------------
engine = create_engine(
    DATABASE_URL,

    # 🔥 CONNECTION POOL SETTINGS (CRITICAL)
    poolclass=QueuePool,

    pool_size=20,
    max_overflow=30,
    pool_timeout=30,
    pool_recycle=1800,
    pool_pre_ping=True,

    echo=False,
    future=True,
)

# --------------------------------------------------
# Session factory
# --------------------------------------------------
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# --------------------------------------------------
# Base model
# --------------------------------------------------
Base = declarative_base()

# --------------------------------------------------
# Dependency
# --------------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
