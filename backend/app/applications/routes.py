from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Job, Application, User, UserRole
from app.applications.schemas import (
    ApplicationCreate,
    ApplicationResponse,
)
from app.auth.permissions import require_roles
from app.middleware.rate_limiter import limiter
from app.middleware.rate_limits import (
    JOB_APPLY_LIMIT,
    PUBLIC_READ_LIMIT,
)
from app.cache import invalidate_cache

router = APIRouter(prefix="/applications", tags=["Applications"])


# --------------------------------------------------
# Apply to a job (RATE LIMITED)
# --------------------------------------------------
@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(JOB_APPLY_LIMIT)
def apply_to_job(
    request: Request,  # ✅ REQUIRED for SlowAPI
    application: ApplicationCreate,
    current_user: User = Depends(require_roles([UserRole.seeker])),
    db: Session = Depends(get_db),
):
    job = db.query(Job).filter(Job.id == application.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    existing = (
        db.query(Application)
        .filter(
            Application.job_id == application.job_id,
            Application.user_id == current_user.id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")

    new_application = Application(
        job_id=application.job_id,
        user_id=current_user.id,
        resume_url=application.resume_url,
        cover_letter=application.cover_letter,
    )

    db.add(new_application)
    db.commit()
    db.refresh(new_application)

    invalidate_cache("applications")
    return new_application


# --------------------------------------------------
# List applications (RATE LIMITED)
# --------------------------------------------------
@router.get("", response_model=List[ApplicationResponse])
@limiter.limit(PUBLIC_READ_LIMIT)
def list_applications(
    request: Request,  # ✅ REQUIRED for SlowAPI
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return db.query(Application).offset(skip).limit(limit).all()
