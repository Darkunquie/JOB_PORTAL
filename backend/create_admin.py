from app.database import SessionLocal
from app.models import User, Profile, UserRole
from app.auth.security import get_password_hash

db = SessionLocal()

# Create admin user
admin = User(
    email='yashwanthadepu007@gmail.com',
    password_hash=get_password_hash('Admin123!'),
    role='admin',  # Use string directly
    is_active=True
)
db.add(admin)
db.flush()

# Create profile
profile = Profile(
    user_id=admin.id,
    full_name='Yashwanth Adepu'
)
db.add(profile)
db.commit()
db.close()

print('✅ Admin created successfully!')
print('Email: yashwanthadepu007@gmail.com')
print('Password: Admin123!')
