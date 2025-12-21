from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models import UserRole


class UserListResponse(BaseModel):
    id: int
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime
    full_name: Optional[str] = None

    class Config:
        from_attributes = True


class UserStatusUpdate(BaseModel):
    is_active: bool


class UserRoleUpdate(BaseModel):
    role: UserRole
