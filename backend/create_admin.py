#!/usr/bin/env python3
"""
Secure Admin Creation Script
Creates an admin user with interactive input (no hardcoded credentials)
"""
import getpass
import sys
from app.database import SessionLocal
from app.models import User, Profile
from app.auth.security import get_password_hash


def validate_password(password: str) -> tuple[bool, str]:
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters"

    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(not c.isalnum() for c in password)

    if not (has_upper and has_lower and has_digit and has_special):
        return False, "Password must contain uppercase, lowercase, digit, and special character"

    return True, "Password is strong"


def create_admin():
    """Create admin user interactively"""
    print("=" * 60)
    print("CREATE ADMIN USER")
    print("=" * 60)
    print()

    db = SessionLocal()

    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.role == 'admin').first()
        if existing_admin:
            print("⚠️  An admin user already exists!")
            response = input("Do you want to create another admin? (yes/no): ").strip().lower()
            if response != 'yes':
                print("Aborted.")
                return

        # Get admin details
        email = input("Enter admin email: ").strip()
        if not email or '@' not in email:
            print("❌ Invalid email address")
            sys.exit(1)

        full_name = input("Enter admin full name: ").strip()
        if not full_name:
            print("❌ Full name is required")
            sys.exit(1)

        # Password requirements
        print()
        print("Password requirements:")
        print("  • Minimum 8 characters (12+ recommended)")
        print("  • At least one uppercase letter")
        print("  • At least one lowercase letter")
        print("  • At least one digit")
        print("  • At least one special character")
        print()

        # Get password with validation
        max_attempts = 3
        for attempt in range(max_attempts):
            password = getpass.getpass("Enter admin password: ")
            password_confirm = getpass.getpass("Confirm password: ")

            if password != password_confirm:
                print(f"❌ Passwords don't match. ({max_attempts - attempt - 1} attempts remaining)\n")
                continue

            is_valid, message = validate_password(password)
            if not is_valid:
                print(f"❌ {message}. ({max_attempts - attempt - 1} attempts remaining)\n")
                continue

            # Password is valid
            break
        else:
            print("❌ Maximum attempts exceeded")
            sys.exit(1)

        # Create admin user
        admin = User(
            email=email,
            password_hash=get_password_hash(password),
            role='admin',
            is_active=True
        )
        db.add(admin)
        db.flush()

        # Create profile
        profile = Profile(
            user_id=admin.id,
            full_name=full_name
        )
        db.add(profile)
        db.commit()

        print()
        print("=" * 60)
        print("✅ ADMIN USER CREATED SUCCESSFULLY!")
        print("=" * 60)
        print(f"Email: {email}")
        print(f"Name: {full_name}")
        print()
        print("⚠️  IMPORTANT: Save these credentials securely!")
        print("⚠️  Password is NOT displayed for security reasons.")
        print()
        print("You can now login to the admin panel with these credentials.")
        print()

    except Exception as e:
        db.rollback()
        print(f"❌ Error creating admin: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
