"""
Centralized rate limit definitions.

All limits are defined here to:
- Keep policy in one place
- Avoid magic strings in routes
- Make future tuning safe and easy

Limits are applied via:
@limiter.limit(LIMIT_NAME)
"""

# --------------------------------------------------
# Authentication (VERY STRICT)
# --------------------------------------------------

# Login attempts (brute-force protection)
AUTH_LOGIN_LIMIT = "5/minute"

# New account registrations
AUTH_REGISTER_LIMIT = "3/minute"

# Password reset requests (email abuse protection)
PASSWORD_RESET_LIMIT = "3/hour"


# --------------------------------------------------
# Write / Mutating actions
# --------------------------------------------------

# Job posting creation
JOB_CREATE_LIMIT = "5/hour"

# Job applications per user
JOB_APPLY_LIMIT = "10/hour"

# Company creation
COMPANY_CREATE_LIMIT = "3/day"


# --------------------------------------------------
# Public read-only endpoints
# --------------------------------------------------

# Job search, listings, public fetches
PUBLIC_READ_LIMIT = "60/minute"


# --------------------------------------------------
# File uploads
# --------------------------------------------------

# Resume uploads, profile images, documents
UPLOAD_LIMIT = "10/minute"
