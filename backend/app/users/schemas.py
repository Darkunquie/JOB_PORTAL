from pydantic import BaseModel, Field
from typing import Optional


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    headline: Optional[str] = Field(None, max_length=500)
    profile_image_url: Optional[str] = Field(None, max_length=500)
    date_of_birth: Optional[str] = Field(None, max_length=50)
    phone: Optional[str] = Field(None, max_length=50)
    location: Optional[str] = Field(None, max_length=255)
    experience_text: Optional[str] = None
    skills_text: Optional[str] = None
    education_text: Optional[str] = None
    linkedin_url: Optional[str] = Field(None, max_length=500)
    github_url: Optional[str] = Field(None, max_length=500)
    portfolio_url: Optional[str] = Field(None, max_length=500)


class ProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    headline: Optional[str] = None
    profile_image_url: Optional[str] = None
    date_of_birth: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    experience_text: Optional[str] = None
    skills_text: Optional[str] = None
    education_text: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None

    class Config:
        from_attributes = True
