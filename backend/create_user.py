"""
User Creation Script

Create admin, employer, or job seeker accounts manually.

Usage:
    docker-compose exec backend python create_user.py
"""

from app.database import SessionLocal
from app.models import User, Profile, UserRole
from app.auth.security import get_password_hash

def create_user():
    db = SessionLocal()

    print("\n" + "="*60)
    print("          USER CREATION SCRIPT")
    print("="*60)

    # Get user details
    print("\n📧 Enter user email:")
    email = input("> ").strip()

    if not email:
        print("❌ Email is required!")
        return

    # Check if user exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        print(f"❌ User with email '{email}' already exists!")
        db.close()
        return

    print("\n🔒 Enter password:")
    password = input("> ").strip()

    if not password:
        print("❌ Password is required!")
        return

    print("\n👤 Enter full name:")
    full_name = input("> ").strip()

    if not full_name:
        print("❌ Full name is required!")
        return

    print("\n📋 Select user role:")
    print("   1. Admin (Full platform access)")
    print("   2. Employer (Can post jobs, manage companies)")
    print("   3. Job Seeker (Can search and apply to jobs)")
    role_choice = input("> ").strip()

    role_map = {
        "1": UserRole.admin,
        "2": UserRole.employer,
        "3": UserRole.seeker
    }

    role = role_map.get(role_choice)
    if not role:
        print("❌ Invalid role selection!")
        return

    # For employers, ask about approval status
    is_active = True
    if role == UserRole.employer:
        print("\n✅ Should this employer be pre-approved? (y/n)")
        print("   (Employers normally require admin approval)")
        approval = input("> ").strip().lower()
        is_active = approval == 'y'

    # Create user
    try:
        user = User(
            email=email,
            password_hash=get_password_hash(password),
            role=role,
            is_active=is_active
        )
        db.add(user)
        db.flush()  # Get user.id

        # Create profile
        profile = Profile(
            user_id=user.id,
            full_name=full_name
        )
        db.add(profile)
        db.commit()

        print("\n" + "="*60)
        print("✅ USER CREATED SUCCESSFULLY!")
        print("="*60)
        print(f"\n📧 Email:     {email}")
        print(f"🔒 Password:  {password}")
        print(f"👤 Name:      {full_name}")
        print(f"📋 Role:      {role.value}")
        print(f"✅ Active:    {is_active}")

        if role == UserRole.employer and not is_active:
            print("\n⚠️  Note: This employer account needs admin approval before login!")
            print("   Admin can approve at: http://localhost:3000/admin/dashboard")

        if role == UserRole.admin:
            print("\n🎉 Admin account created! You can now:")
            print("   - Login at: http://localhost:3000")
            print("   - Access admin dashboard")
            print("   - Approve pending employers")
            print("   - Manage all platform content")

        print("\n" + "="*60 + "\n")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error creating user: {str(e)}")
    finally:
        db.close()


if __name__ == "__main__":
    create_user()
