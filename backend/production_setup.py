"""
Production Setup Script

This script sets up the database for production use.
It will:
1. Create all database tables
2. Create an admin account with secure credentials

DO NOT use seed_data.py in production - it contains dummy data!

Usage:
    docker-compose exec backend python production_setup.py
"""

import sys
import re
from app.database import SessionLocal, engine, Base
from app.models import User, Profile, UserRole
from app.auth.security import get_password_hash

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one number"
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one special character"
    return True, "Password is strong"

def production_setup():
    print("\n" + "="*60)
    print("       PRODUCTION SETUP SCRIPT")
    print("="*60)
    print("\n⚠️  IMPORTANT: This is for production deployment only!")
    print("Do NOT use sample data (seed_data.py) in production.\n")

    # Step 1: Create tables
    print("="*60)
    print("STEP 1: Creating Database Tables")
    print("="*60 + "\n")

    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        print("   - users")
        print("   - profiles")
        print("   - companies")
        print("   - jobs")
        print("   - applications\n")
    except Exception as e:
        print(f"❌ Error creating tables: {str(e)}\n")
        sys.exit(1)

    # Step 2: Create admin account
    print("="*60)
    print("STEP 2: Creating Admin Account")
    print("="*60 + "\n")

    db = SessionLocal()

    # Check if any admin exists
    existing_admin = db.query(User).filter(User.role == UserRole.admin).first()
    if existing_admin:
        print("⚠️  An admin account already exists!")
        response = input("Do you want to create another admin? (y/n): ").strip().lower()
        if response != 'y':
            print("\n✅ Setup complete. Using existing admin account.\n")
            db.close()
            return

    # Get admin details
    while True:
        print("\n📧 Enter admin email:")
        email = input("> ").strip()

        if not email:
            print("❌ Email is required!")
            continue

        if not validate_email(email):
            print("❌ Invalid email format!")
            continue

        # Check if email exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"❌ Email '{email}' is already registered!")
            continue

        break

    while True:
        print("\n🔒 Enter admin password:")
        print("   Requirements:")
        print("   - At least 8 characters")
        print("   - 1 uppercase letter")
        print("   - 1 lowercase letter")
        print("   - 1 number")
        print("   - 1 special character (!@#$%^&*...)")
        password = input("> ").strip()

        if not password:
            print("❌ Password is required!")
            continue

        is_valid, message = validate_password(password)
        if not is_valid:
            print(f"❌ {message}")
            continue

        print("\n🔒 Confirm password:")
        password_confirm = input("> ").strip()

        if password != password_confirm:
            print("❌ Passwords do not match!")
            continue

        break

    print("\n👤 Enter admin full name:")
    full_name = input("> ").strip()

    if not full_name:
        print("❌ Full name is required!")
        db.close()
        return

    # Create admin user
    try:
        user = User(
            email=email,
            password_hash=get_password_hash(password),
            role=UserRole.admin,
            is_active=True
        )
        db.add(user)
        db.flush()

        profile = Profile(
            user_id=user.id,
            full_name=full_name
        )
        db.add(profile)
        db.commit()

        print("\n" + "="*60)
        print("✅ PRODUCTION SETUP COMPLETE!")
        print("="*60)
        print("\n📊 Database:")
        print("   ✅ All tables created")
        print("\n👤 Admin Account:")
        print(f"   📧 Email: {email}")
        print(f"   👤 Name:  {full_name}")
        print(f"   🔒 Password: [HIDDEN]")
        print("\n🌐 Access:")
        print("   Frontend: http://localhost:3000")
        print("   Backend:  http://localhost:8000")
        print("\n⚠️  IMPORTANT SECURITY NOTES:")
        print("   1. Save your admin credentials securely!")
        print("   2. Change database passwords in docker-compose.yml")
        print("   3. Enable HTTPS in production")
        print("   4. Set strong JWT_SECRET in backend/.env")
        print("   5. Configure CORS properly for your domain")
        print("\n" + "="*60 + "\n")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error creating admin: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    production_setup()
