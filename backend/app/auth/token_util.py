import hashlib


def hash_token(token: str) -> str:
    """
    Hash refresh tokens before storing in DB.
    Uses SHA256 (fast + safe for non-password tokens).
    """
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
