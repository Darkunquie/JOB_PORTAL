# 🗄️ Database Setup Guide

Complete guide for setting up the database on a new system.

---

## ⚠️ PRODUCTION vs DEVELOPMENT

### 🔴 **PRODUCTION** (Live/Client System)
```bash
# Use the production setup script
docker-compose exec backend python production_setup.py
```
- ✅ Creates tables
- ✅ Creates admin with strong password validation
- ❌ **NO dummy data**
- ❌ **NEVER run seed_data.py in production!**

### 🟢 **DEVELOPMENT** (Your Local Machine)
```bash
# Create tables
docker-compose exec backend python init_db.py

# Create admin
docker-compose exec backend python create_user.py

# (Optional) Add sample data for testing
docker-compose exec backend python seed_data.py
```
- ✅ Creates tables
- ✅ Creates admin
- ✅ Can add dummy data for testing

---

## 📋 Quick Start (New System Setup)

When you clone this project to a **new Windows system**, follow these steps:

### 1️⃣ **Start Docker Containers**
```bash
docker-compose up -d
```

Wait 10 seconds for all services to start.

### 2️⃣ **Database Tables (Auto-Created)**

**✅ Tables are created automatically on first startup!**

The backend will automatically create all database tables when it starts for the first time. You'll see this in the logs:

```
Checking database tables...
✅ Database tables ready
```

**No manual action needed!** The system uses `CREATE TABLE IF NOT EXISTS` logic, so:
- ✅ First run: Creates all tables
- ✅ Subsequent runs: Does nothing (tables already exist)
- ✅ Safe to run multiple times

### 3️⃣ **Create Admin Account**
```bash
docker-compose exec backend python create_user.py
```

Follow the interactive prompts:
```
📧 Enter user email: admin@yourcompany.com
🔒 Enter password: YourSecurePassword123!
👤 Enter full name: Admin User
📋 Select user role: 1 (Admin)

✅ USER CREATED SUCCESSFULLY!
```

### 4️⃣ **Login to Application**
- Frontend: http://localhost:3000
- Email: `admin@yourcompany.com`
- Password: `YourSecurePassword123!`

---

## 🔧 Detailed Commands

### **Check if Tables Exist**
```bash
# Access PostgreSQL
docker-compose exec db psql -U postgres -d jobmarket

# List all tables
\dt

# You should see:
#   users
#   profiles
#   companies
#   jobs
#   applications

# Exit
\q
```

### **Create Different User Types**

#### **Admin Account**
```bash
docker-compose exec backend python create_user.py
# Select role: 1 (Admin)
```

#### **Employer Account (Pre-approved)**
```bash
docker-compose exec backend python create_user.py
# Select role: 2 (Employer)
# Pre-approved: y
```

#### **Job Seeker Account**
```bash
docker-compose exec backend python create_user.py
# Select role: 3 (Job Seeker)
```

### **Add Sample Data (Optional)**
```bash
# Creates 3 employers, 3 companies, and 9 jobs
docker-compose exec backend python seed_data.py
```

Sample accounts created:
- `hr@techcorp.com` / `Password123!` (Employer)
- `hiring@startupxyz.com` / `Password123!` (Employer)
- `jobs@megacorp.com` / `Password123!` (Employer)

---

## 🗑️ Reset Database (Fresh Start)

If you want to delete everything and start fresh:

### **Complete Reset**
```bash
# Stop containers and remove volumes
docker-compose down -v

# Start containers again
docker-compose up -d

# Wait 10 seconds, then recreate tables
docker-compose exec backend python init_db.py

# Create admin account
docker-compose exec backend python create_user.py
```

### **Clear Data Only (Keep Tables)**
```bash
# Access database
docker-compose exec db psql -U postgres -d jobmarket

# Delete all data
DELETE FROM applications;
DELETE FROM jobs;
DELETE FROM companies;
DELETE FROM profiles;
DELETE FROM users;

# Exit
\q
```

---

## 💾 Backup & Restore

### **Backup Database**
```bash
# Export all data to backup.sql
docker-compose exec db pg_dump -U postgres jobmarket > backup.sql
```

### **Restore Database**
```bash
# Import data from backup.sql
docker-compose exec -T db psql -U postgres jobmarket < backup.sql
```

### **Transfer Database to Another System**

**On System A (Source):**
```bash
# Create backup
docker-compose exec db pg_dump -U postgres jobmarket > backup.sql
```

**Copy `backup.sql` to System B**

**On System B (Destination):**
```bash
# Start containers
docker-compose up -d

# Create tables
docker-compose exec backend python init_db.py

# Restore data
docker-compose exec -T db psql -U postgres jobmarket < backup.sql
```

---

## 🔍 Troubleshooting

### **Error: "relation 'users' does not exist"**
**Solution:** Tables haven't been created yet
```bash
docker-compose exec backend python init_db.py
```

### **Error: "User already exists"**
**Solution:** That email is already registered
```bash
# Use a different email, or delete the user in database
docker-compose exec db psql -U postgres -d jobmarket
DELETE FROM users WHERE email = 'your@email.com';
\q
```

### **Can't Login - "Account is disabled"**
**Solution:** Employer accounts need admin approval
- Login as admin
- Go to Dashboard → Pending Employer Approvals
- Click "Approve"

### **Forgot Admin Password**
**Solution:** Reset password directly in database
```bash
docker-compose exec backend python -c "
from app.auth.security import get_password_hash
from app.database import SessionLocal
from app.models import User

db = SessionLocal()
user = db.query(User).filter(User.email == 'admin@yourcompany.com').first()
if user:
    user.password_hash = get_password_hash('NewPassword123!')
    db.commit()
    print('✅ Password reset successfully!')
else:
    print('❌ User not found!')
db.close()
"
```

---

## 📊 Database Structure

### **Tables:**

**users**
- `id` - Primary key
- `email` - Login email (unique)
- `password_hash` - Encrypted password
- `role` - admin/employer/seeker
- `is_active` - Account status
- `created_at` - Registration date

**profiles**
- `id` - Primary key
- `user_id` - Foreign key to users
- `full_name` - User's full name
- `phone`, `location`, `skills_text`, etc.

**companies**
- `id` - Primary key
- `owner_id` - Foreign key to users (employer)
- `name` - Company name
- `description` - Company description

**jobs**
- `id` - Primary key
- `company_id` - Foreign key to companies
- `title` - Job title
- `description` - Job description
- `salary_min`, `salary_max` - Salary range
- `status` - open/closed

**applications**
- `id` - Primary key
- `job_id` - Foreign key to jobs
- `user_id` - Foreign key to users (job seeker)
- `resume_file_url` - Resume file path
- `status` - applied/reviewed/rejected/accepted

---

## 🔐 Default Credentials

After running `seed_data.py`:

**Employers:**
- Email: `hr@techcorp.com` / Password: `Password123!`
- Email: `hiring@startupxyz.com` / Password: `Password123!`
- Email: `jobs@megacorp.com` / Password: `Password123!`

**Note:** No default admin account - you must create it manually!

---

## 🎯 Common Workflows

### **Setting Up for Development**
```bash
docker-compose up -d
docker-compose exec backend python init_db.py
docker-compose exec backend python create_user.py  # Create admin
docker-compose exec backend python seed_data.py    # Add sample data (DEVELOPMENT ONLY!)
```

### **Setting Up for Production**
```bash
docker-compose up -d

# Use the production setup script (recommended)
docker-compose exec backend python production_setup.py

# OR manually:
# docker-compose exec backend python init_db.py
# docker-compose exec backend python create_user.py

# ⚠️ NEVER run seed_data.py in production!
# It contains dummy/fake data for testing only
```

### **Giving Access to Someone**
```bash
# Method 1: Let them register through the UI
# - Employers: Will need your (admin) approval
# - Job Seekers: Can login immediately

# Method 2: Create account for them
docker-compose exec backend python create_user.py
# Provide them with the email/password you set
```

---

## 📝 Important Notes

- ✅ Each system has its own database (data is not shared)
- ✅ Data persists between container restarts
- ⚠️ Running `docker-compose down -v` will DELETE all data
- ⚠️ Always backup before major changes
- 🔒 Change default passwords in production
- 🔒 Update database credentials in `docker-compose.yml` for production

---

## 🆘 Need Help?

If you encounter issues:
1. Check Docker containers are running: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Check database logs: `docker-compose logs db`
4. Restart containers: `docker-compose restart`

---

**Last Updated:** December 21, 2025
