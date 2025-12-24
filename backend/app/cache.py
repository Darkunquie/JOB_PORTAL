"""
Simple in-memory cache for frequently accessed data.
Uses TTL (time-to-live) to automatically expire cached entries.
"""
from typing import Any, Optional, Callable
from datetime import datetime, timedelta
from functools import wraps
import hashlib
import json


class SimpleCache:
    """Thread-safe in-memory cache with TTL support."""

    def __init__(self):
        self._cache = {}
        self._expiry = {}

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache if not expired."""
        if key in self._cache:
            if key in self._expiry and datetime.utcnow() < self._expiry[key]:
                return self._cache[key]
            else:
                # Expired, remove from cache
                self._cache.pop(key, None)
                self._expiry.pop(key, None)
        return None

    def set(self, key: str, value: Any, ttl_seconds: int = 300):
        """Set value in cache with TTL."""
        self._cache[key] = value
        self._expiry[key] = datetime.utcnow() + timedelta(seconds=ttl_seconds)

    def delete(self, key: str):
        """Delete specific key from cache."""
        self._cache.pop(key, None)
        self._expiry.pop(key, None)

    def clear(self):
        """Clear entire cache."""
        self._cache.clear()
        self._expiry.clear()

    def cleanup_expired(self):
        """Remove all expired entries."""
        now = datetime.utcnow()
        expired_keys = [
            key for key, expiry in self._expiry.items()
            if now >= expiry
        ]
        for key in expired_keys:
            self._cache.pop(key, None)
            self._expiry.pop(key, None)


# Global cache instance
cache = SimpleCache()


def cache_key(*args, **kwargs) -> str:
    """Generate cache key from function arguments."""
    key_data = {
        'args': args,
        'kwargs': kwargs
    }
    key_str = json.dumps(key_data, sort_keys=True, default=str)
    return hashlib.md5(key_str.encode()).hexdigest()


def cached(ttl_seconds: int = 300, key_prefix: str = ""):
    """
    Decorator to cache function results.

    Args:
        ttl_seconds: Time to live in seconds (default: 5 minutes)
        key_prefix: Prefix for cache key to avoid collisions

    Example:
        @cached(ttl_seconds=60, key_prefix="companies")
        def get_all_companies(db: Session):
            return db.query(Company).all()
    """
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            func_name = f"{key_prefix}:{func.__name__}" if key_prefix else func.__name__
            key = f"{func_name}:{cache_key(*args, **kwargs)}"

            # Try to get from cache
            cached_result = cache.get(key)
            if cached_result is not None:
                return cached_result

            # Execute function and cache result
            result = func(*args, **kwargs)
            cache.set(key, result, ttl_seconds)
            return result

        return wrapper
    return decorator


def invalidate_cache(key_prefix: str = ""):
    """
    Invalidate all cache entries with given prefix.

    Args:
        key_prefix: Prefix of cache keys to invalidate

    Example:
        invalidate_cache("companies")  # Clear all company-related cache
    """
    if not key_prefix:
        cache.clear()
        return

    # Remove all keys with matching prefix
    keys_to_delete = [
        key for key in cache._cache.keys()
        if key.startswith(key_prefix)
    ]
    for key in keys_to_delete:
        cache.delete(key)
