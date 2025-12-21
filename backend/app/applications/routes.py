from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import User, Application, Job, Company, Profile, UserRole, ApplicationStatus
from app.applications.schemas import (
    ApplicationCreate,
    ApplicationStatusUpdate,
    ApplicationResponse,
    ApplicationWithDetailsResponse
)
from app.auth.dependencies import get_current_user, require_seeker
from app.storage.file_handler import file_handler

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("/jobs/{job_id}/apply", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def apply_to_job(
    job_id: int,
    resume: UploadFile = File(..., description="Resume file (PDF, DOC, DOCX)"),
    cover_letter: Optional[str] = Form(None, max_length=5000),
    current_user: User = Depends(require_seeker),
    db: Session = Depends(get_db)
):
    """
    Apply to a job posting.

    Only job seekers can apply. Requires resume upload.
    Users cannot apply to the same job twice.
    """
    # Verify job exists and is open
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    if job.status != "open":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This job is no longer accepting applications"
        )

    # Check for duplicate application
    existing_application = db.query(Application).filter(
        Application.job_id == job_id,
        Application.user_id == current_user.id
    ).first()

    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied to this job"
        )

    # Save resume file
    try:
        resume_url = await file_handler.save_resume(resume, current_user.id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload resume: {str(e)}"
        )

    # Create application
    application = Application(
        job_id=job_id,
        user_id=current_user.id,
        resume_file_url=resume_url,
        cover_letter=cover_letter,
        status=ApplicationStatus.applied
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    return application


@router.get("/my-applications", response_model=List[ApplicationWithDetailsResponse])
def get_my_applications(
    current_user: User = Depends(require_seeker),
    db: Session = Depends(get_db)
):
    """
    Get all applications submitted by the current user.

    Only accessible by job seekers.
    """
    applications = db.query(
        Application.id,
        Application.job_id,
        Application.user_id,
        Application.resume_file_url,
        Application.cover_letter,
        Application.status,
        Application.applied_at,
        Job.title.label("job_title"),
        Company.name.label("company_name"),
        Profile.full_name.label("applicant_name"),
        User.email.label("applicant_email")
    ).join(
        Job, Application.job_id == Job.id
    ).join(
        Company, Job.company_id == Company.id
    ).join(
        User, Application.user_id == User.id
    ).join(
        Profile, User.id == Profile.user_id
    ).filter(
        Application.user_id == current_user.id
    ).order_by(
        Application.applied_at.desc()
    ).all()

    return [
        ApplicationWithDetailsResponse(
            id=app.id,
            job_id=app.job_id,
            job_title=app.job_title,
            company_name=app.company_name,
            user_id=app.user_id,
            applicant_name=app.applicant_name,
            applicant_email=app.applicant_email,
            resume_file_url=app.resume_file_url,
            cover_letter=app.cover_letter,
            status=app.status,
            applied_at=app.applied_at
        )
        for app in applications
    ]


@router.get("/employer/applications", response_model=List[ApplicationWithDetailsResponse])
def get_employer_applications(
    job_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all applications for jobs posted by the current employer.

    Optional filtering by job_id.
    Only accessible by employers and admins.
    """
    if current_user.role not in [UserRole.employer, UserRole.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Employer or admin access required"
        )

    # Build base query
    query = db.query(
        Application.id,
        Application.job_id,
        Application.user_id,
        Application.resume_file_url,
        Application.cover_letter,
        Application.status,
        Application.applied_at,
        Job.title.label("job_title"),
        Company.name.label("company_name"),
        Profile.full_name.label("applicant_name"),
        User.email.label("applicant_email")
    ).join(
        Job, Application.job_id == Job.id
    ).join(
        Company, Job.company_id == Company.id
    ).join(
        User, Application.user_id == User.id
    ).join(
        Profile, User.id == Profile.user_id
    )

    # Filter by company ownership (admins see all)
    if current_user.role == UserRole.employer:
        query = query.filter(Company.owner_id == current_user.id)

    # Filter by job_id if provided
    if job_id:
        query = query.filter(Application.job_id == job_id)

    applications = query.order_by(Application.applied_at.desc()).all()

    return [
        ApplicationWithDetailsResponse(
            id=app.id,
            job_id=app.job_id,
            job_title=app.job_title,
            company_name=app.company_name,
            user_id=app.user_id,
            applicant_name=app.applicant_name,
            applicant_email=app.applicant_email,
            resume_file_url=app.resume_file_url,
            cover_letter=app.cover_letter,
            status=app.status,
            applied_at=app.applied_at
        )
        for app in applications
    ]


@router.put("/{application_id}/status", response_model=ApplicationResponse)
def update_application_status(
    application_id: int,
    status_update: ApplicationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update application status.

    Only the employer who owns the job or admin can update status.
    """
    application = db.query(Application).filter(Application.id == application_id).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    # Verify ownership
    job = db.query(Job).filter(Job.id == application.job_id).first()
    company = db.query(Company).filter(Company.id == job.company_id).first()

    if company.owner_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this application"
        )

    application.status = status_update.status
    db.commit()
    db.refresh(application)

    return application


@router.get("/{application_id}", response_model=ApplicationWithDetailsResponse)
def get_application_details(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific application.

    Accessible by the applicant, the employer, or admin.
    """
    application = db.query(
        Application.id,
        Application.job_id,
        Application.user_id,
        Application.resume_file_url,
        Application.cover_letter,
        Application.status,
        Application.applied_at,
        Job.title.label("job_title"),
        Company.name.label("company_name"),
        Profile.full_name.label("applicant_name"),
        User.email.label("applicant_email")
    ).join(
        Job, Application.job_id == Job.id
    ).join(
        Company, Job.company_id == Company.id
    ).join(
        User, Application.user_id == User.id
    ).join(
        Profile, User.id == Profile.user_id
    ).filter(
        Application.id == application_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    # Check authorization: applicant, employer, or admin
    job = db.query(Job).filter(Job.id == application.job_id).first()
    company = db.query(Company).filter(Company.id == job.company_id).first()

    is_applicant = application.user_id == current_user.id
    is_employer = company.owner_id == current_user.id
    is_admin = current_user.role == UserRole.admin

    if not (is_applicant or is_employer or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this application"
        )

    return ApplicationWithDetailsResponse(
        id=application.id,
        job_id=application.job_id,
        job_title=application.job_title,
        company_name=application.company_name,
        user_id=application.user_id,
        applicant_name=application.applicant_name,
        applicant_email=application.applicant_email,
        resume_file_url=application.resume_file_url,
        cover_letter=application.cover_letter,
        status=application.status,
        applied_at=application.applied_at
    )
