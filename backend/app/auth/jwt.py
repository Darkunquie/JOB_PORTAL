from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import status
from app.config import settings
from app.errors import APIError


def create_token(
    *,
    user_id: int,
    role: str,
    token_type: str,
    expires_delta: timedelta,
) -> str:
    if token_type not in {"access", "refresh"}:
        raise ValueError("Invalid token type")

    now = datetime.utcnow()
    payload = {
        "sub": str(user_id),
        "role": role,
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
    }

    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str, expected_type: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
    except JWTError:
        raise APIError(
            code="INVALID_TOKEN",
            message="Invalid or expired token",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    if payload.get("type") != expected_type:
        raise APIError(
            code="INVALID_TOKEN_TYPE",
            message="Invalid token type",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    return payload
