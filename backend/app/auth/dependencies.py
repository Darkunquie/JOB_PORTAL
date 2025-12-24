from fastapi import Depends, HTTPException, status, Request, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import User, UserRole
from app.auth.security import decode_access_token

security = HTTPBearer(auto_error=False)  # Make it optional


def get_token_from_request(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    access_token: Optional[str] = Cookie(None)
) -> Optional[str]:
    """
    Extract JWT token from either Authorization header or HttpOnly cookie.

    Priority:
    1. Authorization header (Bearer token)
    2. HttpOnly cookie (access_token)

    Args:
        request: FastAPI Request object
        credentials: HTTP authorization credentials (Bearer token)
        access_token: Token from HttpOnly cookie

    Returns:
        JWT token string or None
    """
    # First, check for Bearer token in Authorization header
    if credentials and credentials.credentials:
        return credentials.credentials

    # Second, check for token in HttpOnly cookie
    if access_token:
        return access_token

    return None


def get_current_user(
    token: Optional[str] = Depends(get_token_from_request),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get the current authenticated user from JWT token.

    Supports both:
    - Bearer token in Authorization header (for API calls)
    - HttpOnly cookie (for browser requests)

    Args:
        token: JWT token from either header or cookie
        db: Database session

    Returns:
        Current authenticated user

    Raises:
        HTTPException: If token is invalid or user not found
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id_str: str = payload.get("sub")
    if user_id_str is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = int(user_id_str)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Dependency to ensure user is active."""
    return current_user


def require_role(allowed_roles: List[UserRole]):
    """
    Dependency factory to enforce role-based access control.

    Args:
        allowed_roles: List of roles allowed to access the endpoint

    Returns:
        Dependency function that validates user role

    Example:
        @app.get("/admin/users", dependencies=[Depends(require_role([UserRole.admin]))])
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[role.value for role in allowed_roles]}"
            )
        return current_user

    return role_checker


# Convenience dependencies for common role checks
def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to require admin role."""
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


def require_employer(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to require employer role."""
    if current_user.role not in [UserRole.admin, UserRole.employer]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Employer access required"
        )
    return current_user


def require_seeker(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to require job seeker role."""
    if current_user.role not in [UserRole.admin, UserRole.seeker]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Job seeker access required"
        )
    return current_user
