from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from decimal import Decimal
from app.database import get_db
from app.models import User, Job, Company, UserRole, EmploymentType, JobStatus
from app.jobs.schemas import JobCreate, JobUpdate, JobResponse, JobWithCompanyResponse
from app.auth.dependencies import get_current_user, require_employer

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job: JobCreate,
    current_user: User = Depends(require_employer),
    db: Session = Depends(get_db)
):
    """
    Create a new job posting.

    Only employers and admins can create jobs.
    Employers can only create jobs for companies they own.
    """
    # Verify company exists and user has permission
    company = db.query(Company).filter(Company.id == job.company_id).first()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )

    # Check ownership (admin can create for any company)
    if company.owner_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create jobs for this company"
        )

    # Validate salary range
    if job.salary_min and job.salary_max and job.salary_min > job.salary_max:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="salary_min cannot be greater than salary_max"
        )

    new_job = Job(
        title=job.title,
        description=job.description,
        location=job.location,
        employment_type=job.employment_type,
        salary_min=job.salary_min,
        salary_max=job.salary_max,
        required_skills=job.required_skills,
        company_id=job.company_id,
        status=JobStatus.open
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return new_job


@router.get("", response_model=List[JobWithCompanyResponse])
def search_jobs(
    # Pagination
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    # Search filters
    search: Optional[str] = Query(None, description="Search in title and description"),
    location: Optional[str] = Query(None, description="Filter by location"),
    employment_type: Optional[EmploymentType] = Query(None, description="Filter by employment type"),
    salary_min: Optional[Decimal] = Query(None, ge=0, description="Minimum salary"),
    salary_max: Optional[Decimal] = Query(None, ge=0, description="Maximum salary"),
    skills: Optional[str] = Query(None, description="Filter by required skills (comma-separated)"),
    company_id: Optional[int] = Query(None, description="Filter by company ID"),
    db: Session = Depends(get_db)
):
    """
    Search and filter jobs (public endpoint).

    Advanced filtering capabilities:
    - Full-text search in title and description
    - Location filtering (partial match)
    - Employment type filtering
    - Salary range filtering
    - Skills filtering (comma-separated)
    - Company filtering

    Only returns jobs with status OPEN.
    """
    query = db.query(Job).filter(Job.status == JobStatus.open)

    # Apply filters
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Job.title.ilike(search_term),
                Job.description.ilike(search_term)
            )
        )

    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))

    if employment_type:
        query = query.filter(Job.employment_type == employment_type)

    if salary_min is not None:
        # Job's max salary should be >= user's min requirement
        query = query.filter(
            or_(
                Job.salary_max >= salary_min,
                Job.salary_max.is_(None)
            )
        )

    if salary_max is not None:
        # Job's min salary should be <= user's max budget
        query = query.filter(
            or_(
                Job.salary_min <= salary_max,
                Job.salary_min.is_(None)
            )
        )

    if skills:
        # Filter by skills (comma-separated, matches any)
        skill_list = [s.strip().lower() for s in skills.split(",")]
        skill_conditions = [Job.required_skills.ilike(f"%{skill}%") for skill in skill_list]
        query = query.filter(or_(*skill_conditions))

    if company_id:
        query = query.filter(Job.company_id == company_id)

    # Order by most recent first
    query = query.order_by(Job.created_at.desc())

    # Apply pagination
    jobs = query.offset(skip).limit(limit).all()

    return jobs


@router.get("/{job_id}", response_model=JobWithCompanyResponse)
def get_job(
    job_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific job by ID (public endpoint).
    """
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    return job


@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    job_update: JobUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a job posting.

    Only the company owner or admin can update the job.
    """
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    # Check ownership
    company = db.query(Company).filter(Company.id == job.company_id).first()
    if company.owner_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this job"
        )

    # Validate salary range if both are being updated
    update_data = job_update.dict(exclude_unset=True)
    new_min = update_data.get('salary_min', job.salary_min)
    new_max = update_data.get('salary_max', job.salary_max)

    if new_min and new_max and new_min > new_max:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="salary_min cannot be greater than salary_max"
        )

    # Update fields
    for field, value in update_data.items():
        setattr(job, field, value)

    db.commit()
    db.refresh(job)

    return job


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a job posting.

    Only the company owner or admin can delete the job.
    This will cascade delete all associated applications.
    """
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    # Check ownership
    company = db.query(Company).filter(Company.id == job.company_id).first()
    if company.owner_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this job"
        )

    db.delete(job)
    db.commit()

    return None
