from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Job, User, UserRole
from app.jobs.schemas import JobCreate, JobUpdate, JobResponse
from app.auth.permissions import require_roles
from app.middleware.rate_limiter import limiter
from app.middleware.rate_limits import (
    JOB_CREATE_LIMIT,
    PUBLIC_READ_LIMIT,
)
from app.cache import invalidate_cache

router = APIRouter(prefix="/jobs", tags=["Jobs"])


# --------------------------------------------------
# Create job (RATE LIMITED)
# --------------------------------------------------
@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(JOB_CREATE_LIMIT)
def create_job(
    request: Request,  # ✅ REQUIRED for SlowAPI
    job: JobCreate,
    current_user: User = Depends(require_roles([UserRole.admin, UserRole.employer])),
    db: Session = Depends(get_db),
):
    new_job = Job(
        **job.dict(),
        employer_id=current_user.id,
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    invalidate_cache("jobs")
    return new_job


# --------------------------------------------------
# List jobs (RATE LIMITED)
# --------------------------------------------------
@router.get("", response_model=List[JobResponse])
@limiter.limit(PUBLIC_READ_LIMIT)
def list_jobs(
    request: Request,  # ✅ REQUIRED for SlowAPI
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return db.query(Job).offset(skip).limit(limit).all()


# --------------------------------------------------
# My jobs (NO rate limit)
# --------------------------------------------------
@router.get("/my-jobs", response_model=List[JobResponse])
def my_jobs(
    current_user: User = Depends(require_roles([UserRole.admin, UserRole.employer])),
    db: Session = Depends(get_db),
):
    return db.query(Job).filter(Job.employer_id == current_user.id).all()
