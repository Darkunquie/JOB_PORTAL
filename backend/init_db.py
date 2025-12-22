"""
Database Initialization Script
"""

from app.database import engine, Base
from app.models import (
    User,
    Profile,
    Company,
    Job,
    Application,
    RefreshToken,  # 🔴 REQUIRED
)

print("\n" + "=" * 60)
print("       DATABASE INITIALIZATION")
print("=" * 60 + "\n")

print("📊 Creating database tables...")
Base.metadata.create_all(bind=engine)

print("\n📋 Tables registered in SQLAlchemy metadata:")
for table in Base.metadata.sorted_tables:
    print(f"   - {table.name}")

print("\n" + "=" * 60)
print("✅ DATABASE INITIALIZATION COMPLETE")
print("=" * 60 + "\n")
