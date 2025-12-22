from fastapi import Depends, status
from app.auth.dependencies import get_current_user
from app.errors import APIError
from app.models import User, UserRole
from typing import List


def require_roles(allowed_roles: List[UserRole]):
    def checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise APIError(
                code="FORBIDDEN",
                message="You do not have permission to perform this action",
                status_code=status.HTTP_403_FORBIDDEN,
            )
        return current_user

    return checker
