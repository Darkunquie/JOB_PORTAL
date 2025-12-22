# 📜 Database Setup Scripts

Choose the right script for your environment.

---

## 🔴 **PRODUCTION** (Client/Live System)

### Use this for production deployment:
```bash
docker-compose exec backend python production_setup.py
```

**What it does:**
- ✅ Creates all database tables
- ✅ Creates admin account with strong password validation
- ✅ Secure, production-ready setup
- ❌ **NO dummy/fake data**

---

## 🟢 **DEVELOPMENT** (Your Local Machine)

### Step 1: Create Tables
```bash
docker-compose exec backend python init_db.py
```

### Step 2: Create Admin
```bash
docker-compose exec backend python create_user.py
```

### Step 3: (Optional) Add Sample Data
```bash
docker-compose exec backend python seed_data.py
```
**⚠️ WARNING:** Only for development! Creates fake employers, companies, and jobs.

---

## 📋 **Script Descriptions**

### `production_setup.py` 🔴
- **Use for:** Production/Client systems
- **Creates:** Tables + Admin (with strong password requirements)
- **Data:** No dummy data
- **Run:** Once per new system

### `init_db.py` 🟢
- **Use for:** Development
- **Creates:** Database tables only
- **Data:** No users or data
- **Run:** Once per new system

### `create_user.py` 🟢
- **Use for:** Development or manual user creation
- **Creates:** Admin, Employer, or Job Seeker accounts
- **Data:** Single user account
- **Run:** Any time you need a new user

### `seed_data.py` ⚠️ **DEVELOPMENT ONLY**
- **Use for:** Development/Testing ONLY
- **Creates:** 3 employers, 3 companies, 9 jobs
- **Data:** FAKE/DUMMY data
- **Run:** Only in development
- **❌ NEVER** run in production!

---

## 🚨 **CRITICAL**

### ❌ **DO NOT run in production:**
```bash
# This contains FAKE data!
docker-compose exec backend python seed_data.py
```

### ✅ **DO run in production:**
```bash
# Production-ready setup
docker-compose exec backend python production_setup.py
```

---

## 📚 More Information

- **Complete Setup Guide:** `../DATABASE_SETUP.md`
- **Production Checklist:** `../PRODUCTION_CHECKLIST.md`

---
