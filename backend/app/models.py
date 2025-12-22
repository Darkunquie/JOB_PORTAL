from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime,
    Enum,
    Boolean,
    Numeric,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


# --------------------------------------------------
# ENUMS
# --------------------------------------------------

class UserRole(str, enum.Enum):
    admin = "admin"
    employer = "employer"
    seeker = "seeker"


class ApplicationStatus(str, enum.Enum):
    applied = "applied"
    reviewed = "reviewed"
    rejected = "rejected"
    accepted = "accepted"


class JobStatus(str, enum.Enum):
    open = "open"
    closed = "closed"


class EmploymentType(str, enum.Enum):
    full_time = "full_time"
    part_time = "part_time"
    contract = "contract"
    internship = "internship"


# --------------------------------------------------
# MODELS
# --------------------------------------------------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(254), unique=True, index=True, nullable=False)

    # 🔐 Allow bcrypt / argon2 safely
    password_hash = Column(String(255), nullable=False)

    role = Column(Enum(UserRole, native_enum=False), nullable=False, default=UserRole.seeker)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    profile = relationship(
        "Profile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    companies = relationship(
        "Company",
        back_populates="owner",
        cascade="all, delete-orphan",
    )
    applications = relationship(
        "Application",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    refresh_tokens = relationship(
        "RefreshToken",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # SHA256 hex = 64 chars
    token_hash = Column(String(64), unique=True, nullable=False, index=True)

    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="refresh_tokens")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    full_name = Column(String(100), nullable=False)

    user = relationship("User", back_populates="profile")


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)

    owner_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    owner = relationship("User", back_populates="companies")
    jobs = relationship(
        "Job",
        back_populates="company",
        cascade="all, delete-orphan",
    )


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True)
    title = Column(String(150), nullable=False, index=True)
    description = Column(Text, nullable=False)
    location = Column(String(150), index=True)

    employment_type = Column(
        Enum(EmploymentType, native_enum=False),
        nullable=False,
        index=True,
    )

    salary_min = Column(Numeric(10, 2))
    salary_max = Column(Numeric(10, 2))

    required_skills = Column(Text)

    company_id = Column(
        Integer,
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    status = Column(
        Enum(JobStatus, native_enum=False),
        nullable=False,
        default=JobStatus.open,
        index=True,
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    company = relationship("Company", back_populates="jobs")
    applications = relationship(
        "Application",
        back_populates="job",
        cascade="all, delete-orphan",
    )


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True)

    job_id = Column(
        Integer,
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    resume_file_url = Column(String(500), nullable=False)
    cover_letter = Column(Text)

    status = Column(
        Enum(ApplicationStatus, native_enum=False),
        nullable=False,
        default=ApplicationStatus.applied,
        index=True,
    )

    applied_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    job = relationship("Job", back_populates="applications")
    user = relationship("User", back_populates="applications")
