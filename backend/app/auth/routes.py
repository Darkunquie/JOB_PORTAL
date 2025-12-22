from fastapi import APIRouter, Depends, status, Request, Response, Cookie
from sqlalchemy.orm import Session
from datetime import timedelta, datetime

from app.database import get_db
from app.models import User, Profile, UserRole, RefreshToken
from app.errors import APIError
from app.auth.schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
)
from app.auth.security import (
    verify_password,
    get_password_hash,
    set_auth_cookie,
    clear_auth_cookie,
)
from app.auth.jwt import create_token, decode_token
from app.auth.dependencies import get_current_user
from app.auth.token_util import hash_token
from app.middleware.rate_limiter import limiter
from app.middleware.rate_limits import (
    AUTH_LOGIN_LIMIT,
    AUTH_REGISTER_LIMIT,
)
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


# --------------------------------------------------
# Register
# --------------------------------------------------
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(AUTH_REGISTER_LIMIT)
def register(
    request: Request,                     # ✅ REQUIRED for SlowAPI
    register_data: RegisterRequest,
    db: Session = Depends(get_db),
):
    if db.query(User).filter(User.email == register_data.email).first():
        raise APIError(
            code="EMAIL_EXISTS",
            message="Email already registered",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    is_active = register_data.role != UserRole.employer

    user = User(
        email=register_data.email,
        password_hash=get_password_hash(register_data.password),
        role=register_data.role,
        is_active=is_active,
    )
    db.add(user)
    db.flush()

    profile = Profile(user_id=user.id, full_name=register_data.full_name)
    db.add(profile)
    db.commit()

    return UserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        full_name=profile.full_name,
    )


# --------------------------------------------------
# Login
# --------------------------------------------------
@router.post("/login", response_model=TokenResponse)
@limiter.limit(AUTH_LOGIN_LIMIT)
def login(
    request: Request,                     # ✅ REQUIRED
    response: Response,
    login_data: LoginRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == login_data.email).first()

    if not user or not verify_password(login_data.password, user.password_hash):
        raise APIError(
            code="AUTH_INVALID_CREDENTIALS",
            message="Invalid email or password",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.is_active:
        raise APIError(
            code="ACCOUNT_DISABLED",
            message="Account disabled",
            status_code=status.HTTP_403_FORBIDDEN,
        )

    access_token = create_token(
        user_id=user.id,
        role=user.role.value,
        token_type="access",
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    refresh_token = create_token(
        user_id=user.id,
        role=user.role.value,
        token_type="refresh",
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )

    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_token(refresh_token),
            expires_at=datetime.utcnow()
            + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )
    )
    db.commit()

    set_auth_cookie(response, access_token)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.SESSION_COOKIE_SECURE,
        samesite=settings.SESSION_COOKIE_SAMESITE,
    )

    return TokenResponse(access_token=access_token)


# --------------------------------------------------
# Refresh token
# --------------------------------------------------
@router.post("/refresh", response_model=TokenResponse)
@limiter.limit(AUTH_LOGIN_LIMIT)
def refresh_token(
    request: Request,                     # ✅ REQUIRED
    response: Response,
    refresh_token: str = Cookie(None),
    db: Session = Depends(get_db),
):
    if not refresh_token:
        raise APIError(
            code="REFRESH_TOKEN_MISSING",
            message="Refresh token required",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    payload = decode_token(refresh_token, expected_type="refresh")
    user_id = int(payload["sub"])

    token_hash = hash_token(refresh_token)

    stored = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked.is_(False),
            RefreshToken.expires_at > datetime.utcnow(),
        )
        .first()
    )

    if not stored:
        raise APIError(
            code="REFRESH_TOKEN_INVALID",
            message="Invalid refresh token",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    stored.revoked = True

    new_access = create_token(
        user_id=user_id,
        role=payload["role"],
        token_type="access",
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    new_refresh = create_token(
        user_id=user_id,
        role=payload["role"],
        token_type="refresh",
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )

    db.add(
        RefreshToken(
            user_id=user_id,
            token_hash=hash_token(new_refresh),
            expires_at=datetime.utcnow()
            + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )
    )
    db.commit()

    set_auth_cookie(response, new_access)
    response.set_cookie(
        key="refresh_token",
        value=new_refresh,
        httponly=True,
        secure=settings.SESSION_COOKIE_SECURE,
        samesite=settings.SESSION_COOKIE_SAMESITE,
    )

    return TokenResponse(access_token=new_access)


# --------------------------------------------------
# Logout
# --------------------------------------------------
@router.post("/logout")
@limiter.limit("10/minute")
def logout(
    request: Request,                     # ✅ REQUIRED
    response: Response,
    refresh_token: str = Cookie(None),
    db: Session = Depends(get_db),
):
    if refresh_token:
        db.query(RefreshToken).filter(
            RefreshToken.token_hash == hash_token(refresh_token)
        ).update({"revoked": True})
        db.commit()

    clear_auth_cookie(response)
    response.delete_cookie("refresh_token")

    return {"message": "Logged out successfully"}


# --------------------------------------------------
# Current user
# --------------------------------------------------
@router.get("/me", response_model=UserResponse)
@limiter.limit("30/minute")
def me(
    request: Request,                 # ✅ MUST be first
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(
        Profile.user_id == current_user.id
    ).first()

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        is_active=current_user.is_active,
        full_name=profile.full_name if profile else None,
    )

