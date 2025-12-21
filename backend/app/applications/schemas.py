from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models import ApplicationStatus


class ApplicationCreate(BaseModel):
    cover_letter: Optional[str] = Field(None, max_length=5000)


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus


class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    user_id: int
    resume_file_url: str
    cover_letter: Optional[str] = None
    status: ApplicationStatus
    applied_at: datetime

    class Config:
        from_attributes = True


class ApplicationWithDetailsResponse(BaseModel):
    id: int
    job_id: int
    job_title: str
    company_name: str
    user_id: int
    applicant_name: str
    applicant_email: str
    resume_file_url: str
    cover_letter: Optional[str] = None
    status: ApplicationStatus
    applied_at: datetime

    class Config:
        from_attributes = True
