from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal
from app.models import EmploymentType, JobStatus


class JobCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    location: Optional[str] = Field(None, max_length=255)
    employment_type: EmploymentType
    salary_min: Optional[Decimal] = Field(None, ge=0)
    salary_max: Optional[Decimal] = Field(None, ge=0)
    required_skills: Optional[str] = None
    company_id: int


class JobUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1)
    location: Optional[str] = Field(None, max_length=255)
    employment_type: Optional[EmploymentType] = None
    salary_min: Optional[Decimal] = Field(None, ge=0)
    salary_max: Optional[Decimal] = Field(None, ge=0)
    required_skills: Optional[str] = None
    status: Optional[JobStatus] = None


class JobResponse(BaseModel):
    id: int
    title: str
    description: str
    location: Optional[str] = None
    employment_type: EmploymentType
    salary_min: Optional[Decimal] = None
    salary_max: Optional[Decimal] = None
    required_skills: Optional[str] = None
    company_id: int
    status: JobStatus
    created_at: datetime

    class Config:
        from_attributes = True


class CompanyInfo(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class JobWithCompanyResponse(BaseModel):
    id: int
    title: str
    description: str
    location: Optional[str] = None
    employment_type: EmploymentType
    salary_min: Optional[Decimal] = None
    salary_max: Optional[Decimal] = None
    required_skills: Optional[str] = None
    company_id: int
    company: CompanyInfo
    status: JobStatus
    created_at: datetime

    class Config:
        from_attributes = True
