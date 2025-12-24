#!/bin/bash
set -e

echo "🚀 Starting Job Market Backend..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
python << END
import sys
import time
import psycopg2
from sqlalchemy import create_engine
import os

max_tries = 30
tries = 0

while tries < max_tries:
    try:
        database_url = os.getenv('DATABASE_URL')
        engine = create_engine(database_url)
        conn = engine.connect()
        conn.close()
        print("✅ Database is ready!")
        sys.exit(0)
    except Exception as e:
        tries += 1
        print(f"⏳ Database not ready yet (attempt {tries}/{max_tries})...")
        time.sleep(2)

print("❌ Database failed to become ready in time")
sys.exit(1)
END

# Run database migrations
echo "📦 Running database migrations..."
alembic upgrade head

# Initialize admin user if not exists
echo "👤 Checking admin user..."
python << END
import os
from app.database import SessionLocal
from app.models import User, Profile, UserRole
from app.auth.security import get_password_hash

# Get admin credentials from environment variables
admin_email = os.getenv('ADMIN_EMAIL', 'admin@jobmarket.com')
admin_password = os.getenv('ADMIN_PASSWORD', 'Admin123!')
admin_name = os.getenv('ADMIN_NAME', 'System Administrator')

db = SessionLocal()

try:
    # Check if admin already exists
    existing_admin = db.query(User).filter(User.role == UserRole.admin).first()

    if existing_admin:
        print(f"✅ Admin user already exists: {existing_admin.email}")
    else:
        # Create admin user
        admin = User(
            email=admin_email,
            password_hash=get_password_hash(admin_password),
            role=UserRole.admin,
            is_active=True
        )
        db.add(admin)
        db.flush()

        # Create profile
        profile = Profile(
            user_id=admin.id,
            full_name=admin_name
        )
        db.add(profile)
        db.commit()

        print("=" * 60)
        print("✅ ADMIN USER CREATED SUCCESSFULLY!")
        print("=" * 60)
        print(f"📧 Email: {admin_email}")
        print(f"🔑 Password: {admin_password}")
        print("=" * 60)
        print("⚠️  IMPORTANT: Change this password after first login!")
        print("=" * 60)
except Exception as e:
    print(f"❌ Error creating admin: {e}")
    db.rollback()
finally:
    db.close()
END

echo "✅ Initialization complete!"
echo ""
echo "🚀 Starting application server..."

# Execute the main command (passed as arguments to this script)
exec "$@"
