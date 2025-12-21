from fastapi import APIRouter, Depends, HTTPException, status, Request, Response, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Profile
from app.auth.schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
    PasswordResetRequest,
    PasswordResetConfirm
)
from app.auth.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    set_auth_cookie,
    clear_auth_cookie,
    create_password_reset_token,
    verify_password_reset_token
)
from app.auth.dependencies import get_current_user
from app.middleware.rate_limiter import limiter, AUTH_RATE_LIMIT
from app.auth.email import EmailService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(AUTH_RATE_LIMIT)
def register(
    request: Request,
    register_data: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Register a new user account.

    Creates a new user with the specified role and automatically creates a profile.
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == register_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create user
    # Employers require admin approval, so set is_active to False
    is_active = register_data.role != UserRole.employer
    user = User(
        email=register_data.email,
        password_hash=get_password_hash(register_data.password),
        role=register_data.role,
        is_active=is_active
    )
    db.add(user)
    db.flush()  # Get user.id before commit

    # Create profile
    profile = Profile(
        user_id=user.id,
        full_name=register_data.full_name
    )
    db.add(profile)
    db.commit()
    db.refresh(user)
    db.refresh(profile)

    return UserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        full_name=profile.full_name
    )


@router.post("/login", response_model=TokenResponse)
@limiter.limit(AUTH_RATE_LIMIT)
def login(
    request: Request,
    response: Response,
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate user and return JWT access token.

    Sets token in both:
    1. HttpOnly cookie (for browser security - XSS protection)
    2. Response body (for backward compatibility with mobile/API clients)

    The cookie-based authentication is more secure for web browsers.
    """
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()

    # Verify credentials
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled"
        )

    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})

    # Set HttpOnly cookie (XSS protection)
    set_auth_cookie(response, access_token)

    # Also return in response body for backward compatibility
    return TokenResponse(access_token=access_token)


@router.post("/logout")
def logout(response: Response):
    """
    Logout user by clearing authentication cookie.

    For clients using Bearer tokens, simply delete the token client-side.
    """
    clear_auth_cookie(response)
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current authenticated user information.

    Supports both:
    - Bearer token in Authorization header
    - HttpOnly cookie authentication
    """
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        is_active=current_user.is_active,
        full_name=profile.full_name if profile else None
    )


@router.post("/password-reset/request")
@limiter.limit(AUTH_RATE_LIMIT)
async def request_password_reset(
    request: Request,
    reset_request: PasswordResetRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Request password reset email.

    Sends password reset email with token if user exists.
    Always returns success to prevent email enumeration attacks.
    """
    # Find user
    user = db.query(User).filter(User.email == reset_request.email).first()

    # Always return success to prevent email enumeration
    if user and user.is_active:
        # Generate reset token
        reset_token = create_password_reset_token(user.email)

        # Get user's name
        profile = db.query(Profile).filter(Profile.user_id == user.id).first()
        user_name = profile.full_name if profile else None

        # Send email in background
        background_tasks.add_task(
            EmailService.send_password_reset_email,
            to_email=user.email,
            reset_token=reset_token,
            user_name=user_name
        )

    return {
        "message": "If an account exists with that email, a password reset link has been sent."
    }


@router.post("/password-reset/confirm")
@limiter.limit(AUTH_RATE_LIMIT)
def confirm_password_reset(
    request: Request,
    reset_confirm: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """
    Confirm password reset with token and new password.

    Validates token and updates user's password.
    """
    # Verify token
    email = verify_password_reset_token(reset_confirm.token)

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token"
        )

    # Find user
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Update password
    user.password_hash = get_password_hash(reset_confirm.new_password)
    db.commit()

    return {"message": "Password has been reset successfully"}
