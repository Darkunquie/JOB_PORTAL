from fastapi import Depends, Cookie, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, Union

from app.database import get_db
from app.models import User, UserRole
from app.errors import APIError
from app.auth.jwt import decode_token
from app.cache import cache

security = HTTPBearer(auto_error=False)

# --------------------------------------------------
# Cached user representation
# --------------------------------------------------
class CachedUser:
    def __init__(self, data: Dict[str, Any]):
        self.id = data["id"]
        self.email = data["email"]
        self.role = UserRole(data["role"])
        self.is_active = data["is_active"]


def _serialize_user_for_cache(user: User) -> Dict[str, Any]:
    return {
        "id": user.id,
        "email": user.email,
        "role": user.role.value,
        "is_active": user.is_active,
    }


def _reconstruct_user_from_cache(data: Dict[str, Any]) -> CachedUser:
    return CachedUser(data)

# --------------------------------------------------
# Token extraction
# --------------------------------------------------
def get_token_from_request(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    access_token: Optional[str] = Cookie(None),
) -> Optional[str]:
    if credentials and credentials.credentials:
        return credentials.credentials
    return access_token

# --------------------------------------------------
# Token validation
# --------------------------------------------------
def _decode_and_validate_token(token: Optional[str]) -> int:
    if not token:
        raise APIError(
            code="NOT_AUTHENTICATED",
            message="Authentication required",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    payload = decode_token(token, expected_type="access")
    user_id = payload.get("sub")

    if not user_id:
        raise APIError(
            code="INVALID_TOKEN",
            message="Invalid authentication token",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    return int(user_id)

# --------------------------------------------------
# User retrieval
# --------------------------------------------------
def _get_user_by_id(user_id: int, db: Session) -> Union[User, CachedUser]:
    cached = cache.get(f"user:{user_id}")
    if cached:
        return _reconstruct_user_from_cache(cached)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise APIError(
            code="USER_NOT_FOUND",
            message="User not found",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    cache.set(f"user:{user_id}", _serialize_user_for_cache(user), ttl_seconds=300)
    return user


def _check_user_active(user: Union[User, CachedUser]) -> None:
    if not user.is_active:
        raise APIError(
            code="ACCOUNT_DISABLED",
            message="User account is disabled",
            status_code=status.HTTP_403_FORBIDDEN,
        )

# --------------------------------------------------
# PUBLIC DEPENDENCY (FINAL FIX)
# --------------------------------------------------
def get_current_user(
    request: Request,                          # ✅ JUST THIS
    token: Optional[str] = Depends(get_token_from_request),
    db: Session = Depends(get_db),
) -> Union[User, CachedUser]:

    user_id = _decode_and_validate_token(token)
    user = _get_user_by_id(user_id, db)
    _check_user_active(user)

    request.state.user = user
    return user
# --------------------------------------------------
# ROLE HELPERS
# --------------------------------------------------
def require_admin(current_user=Depends(get_current_user)):
    if current_user.role != UserRole.admin:
        raise APIError(
            code="FORBIDDEN",
            message="Admin access required",
            status_code=status.HTTP_403_FORBIDDEN,
        )
    return current_user


def require_employer(current_user=Depends(get_current_user)):
    if current_user.role not in (UserRole.admin, UserRole.employer):
        raise APIError(
            code="FORBIDDEN",
            message="Employer access required",
            status_code=status.HTTP_403_FORBIDDEN,
        )
    return current_user


def require_seeker(current_user=Depends(get_current_user)):
    if current_user.role not in (UserRole.admin, UserRole.seeker):
        raise APIError(
            code="FORBIDDEN",
            message="Job seeker access required",
            status_code=status.HTTP_403_FORBIDDEN,
        )
    return current_user
