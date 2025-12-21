from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Response
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate a bcrypt hash for a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.

    Args:
        data: Payload to encode in the token
        expires_delta: Custom expiration time, defaults to settings value

    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """
    Create a JWT refresh token with longer expiration.

    Args:
        data: Payload to encode in the token

    Returns:
        Encoded JWT refresh token
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decode and verify a JWT token.

    Args:
        token: JWT token to decode

    Returns:
        Decoded payload or None if invalid
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


def set_auth_cookie(response: Response, token: str, cookie_name: str = "access_token"):
    """
    Set authentication token as HttpOnly cookie.

    Args:
        response: FastAPI Response object
        token: JWT token to set
        cookie_name: Name of the cookie (default: access_token)
    """
    max_age = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60  # Convert to seconds

    response.set_cookie(
        key=cookie_name,
        value=token,
        httponly=settings.SESSION_COOKIE_HTTPONLY,  # Prevents JavaScript access (XSS protection)
        secure=settings.SESSION_COOKIE_SECURE,  # HTTPS only
        samesite=settings.SESSION_COOKIE_SAMESITE.lower(),  # CSRF protection
        max_age=max_age,
        path="/"
    )


def clear_auth_cookie(response: Response, cookie_name: str = "access_token"):
    """
    Clear authentication cookie.

    Args:
        response: FastAPI Response object
        cookie_name: Name of the cookie to clear
    """
    response.delete_cookie(
        key=cookie_name,
        path="/",
        httponly=settings.SESSION_COOKIE_HTTPONLY,
        secure=settings.SESSION_COOKIE_SECURE,
        samesite=settings.SESSION_COOKIE_SAMESITE.lower()
    )


def create_password_reset_token(email: str) -> str:
    """
    Create a password reset token.

    Args:
        email: User's email address

    Returns:
        Encoded JWT token for password reset
    """
    expire = datetime.utcnow() + timedelta(hours=1)  # 1 hour expiration
    to_encode = {"sub": email, "exp": expire, "type": "password_reset"}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_password_reset_token(token: str) -> Optional[str]:
    """
    Verify and decode password reset token.

    Args:
        token: Password reset token

    Returns:
        Email address if token valid, None otherwise
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "password_reset":
            return None
        email: str = payload.get("sub")
        return email
    except JWTError:
        return None
