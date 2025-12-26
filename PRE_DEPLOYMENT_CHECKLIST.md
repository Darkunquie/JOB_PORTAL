# Pre-Deployment Checklist for Job Site

## ✅ Code Review Status: READY with Minor Fixes Needed

Your code is **95% production-ready**! Here's the complete status:

---

## 🟢 GOOD - Already Production Ready

### Backend (FastAPI)
✅ **Security Configuration** - Excellent!
- SECRET_KEY validation built-in
- Password hashing with bcrypt
- JWT authentication implemented
- Rate limiting configured (SlowAPI)
- Security headers middleware
- CORS protection
- SQL injection protection (SQLAlchemy ORM)

✅ **Database**
- PostgreSQL configured
- Alembic migrations ready
- Proper foreign keys and constraints
- Database connection pooling ready

✅ **API Structure**
- Clean RESTful API design
- Proper error handling
- Health check endpoints (`/health`, `/health/detailed`)
- Request/response validation with Pydantic
- Comprehensive logging

✅ **File Handling**
- Secure file uploads
- File size limits configured
- File type validation
- Proper file permissions

✅ **Code Quality**
- Well-organized project structure
- Proper separation of concerns
- Error tracking implemented
- API interceptors configured

---

## 🟡 MINOR FIXES NEEDED - Before Deployment

### 1. Create Production .env File ⚠️ CRITICAL

**Status**: `.env` file doesn't exist in your backend

**Action Required**:
```bash
# On your VPS, create the .env file:
cd /var/www/job-site/backend
nano .env
```

**Use this template** (from `.env.production.example`):
```env
DATABASE_URL=postgresql://job_site_user:YOUR_SECURE_PASSWORD@localhost/job_site_db
SECRET_KEY=GENERATE_LONG_RANDOM_KEY_HERE
ENVIRONMENT=production
DEBUG=False
CORS_ORIGINS=https://jobs.yourdomain.com
UPLOAD_DIR=/var/www/job-site/backend/uploads
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**Generate SECRET_KEY**:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

---

### 2. Frontend API Configuration ⚠️ IMPORTANT

**Status**: Frontend uses relative URLs (`/api/v1`) - This is GOOD!

**Current Setup**:
```javascript
// frontend/src/api/client.js
const API_BASE_URL = '/api/v1';  // ✅ Correct for Nginx proxy
```

**Why this is good**:
- Frontend makes requests to `/api/v1/...`
- Nginx proxy forwards to backend on port 8000
- No CORS issues
- Works perfectly with our Nginx setup

**Optional**: Create `.env.production` for frontend
```bash
cd /var/www/job-site/frontend
nano .env.production
```

```env
VITE_API_URL=/api/v1
```

**This is optional** because it's already hardcoded correctly!

---

### 3. Update Nginx Configuration Domain Names

**File**: `deployment/nginx/job-site.conf`

**Change**:
```nginx
server_name jobs.yourdomain.com;  # ← Update this to your actual domain
```

**To**:
```nginx
server_name jobs.yourdomain.com;  # Your real domain
# OR
server_name your-vps-ip;  # If no domain yet
```

---

### 4. Fix Upload Directory Path

**Issue**: `main.py:138` has a path issue

**Current**:
```python
app.mount("/uploads", StaticFiles(directory=str(upload_dir.parent / "uploads")), name="uploads")
```

**Should be**:
```python
app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")
```

**Fix**:
Edit `backend/app/main.py` line 138:
```python
# Before
app.mount("/uploads", StaticFiles(directory=str(upload_dir.parent / "uploads")), name="uploads")

# After
app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")
```

---

## 📋 Pre-Deployment Steps (In Order)

### Step 1: Fix Code Issues
- [ ] Fix upload directory path in `backend/app/main.py:138`
- [ ] Commit and push changes to GitHub

### Step 2: VPS Preparation
- [ ] SSH into your VPS
- [ ] Install Python 3.11, PostgreSQL, Nginx
- [ ] Setup PostgreSQL database and user
- [ ] Clone your repository to `/var/www/job-site`

### Step 3: Backend Configuration
- [ ] Create virtual environment
- [ ] Install Python dependencies from `requirements.txt`
- [ ] Create `.env` file with production settings
- [ ] Generate secure SECRET_KEY (64+ characters)
- [ ] Run database migrations: `alembic upgrade head`
- [ ] Create admin user: `python create_admin.py`
- [ ] Create uploads directory with correct permissions

### Step 4: Frontend Build
- [ ] Navigate to frontend directory
- [ ] Run `npm install`
- [ ] Run `npm run build`
- [ ] Verify `dist` folder is created

### Step 5: Nginx Setup
- [ ] Update domain name in `nginx/job-site.conf`
- [ ] Copy config to `/etc/nginx/sites-available/`
- [ ] Create symlink to `/etc/nginx/sites-enabled/`
- [ ] Test config: `sudo nginx -t`
- [ ] Reload Nginx: `sudo systemctl reload nginx`

### Step 6: Systemd Service
- [ ] Copy `systemd/job-site-backend.service` to `/etc/systemd/system/`
- [ ] Reload systemd: `sudo systemctl daemon-reload`
- [ ] Enable service: `sudo systemctl enable job-site-backend`
- [ ] Start service: `sudo systemctl start job-site-backend`
- [ ] Check status: `sudo systemctl status job-site-backend`

### Step 7: SSL Setup (HTTPS)
- [ ] Install certbot: `sudo apt install certbot python3-certbot-nginx`
- [ ] Get certificate: `sudo certbot --nginx -d jobs.yourdomain.com`
- [ ] Verify auto-renewal: `sudo certbot renew --dry-run`

### Step 8: Testing
- [ ] Test health endpoint: `curl http://localhost:8000/health`
- [ ] Test API docs: Visit `https://jobs.yourdomain.com/api/docs`
- [ ] Test frontend: Visit `https://jobs.yourdomain.com`
- [ ] Test login/register functionality
- [ ] Test file upload (resume)
- [ ] Check logs: `sudo journalctl -u job-site-backend -f`

### Step 9: Security
- [ ] Verify DEBUG=False in production
- [ ] Verify SECRET_KEY is secure (64+ chars, random)
- [ ] Check firewall: `sudo ufw status`
- [ ] Verify HTTPS is working
- [ ] Test CORS (frontend can call API)

### Step 10: Monitoring
- [ ] Setup log rotation
- [ ] Setup database backups (use `deployment/scripts/backup.sh`)
- [ ] Add to monitoring service (optional: UptimeRobot)

---

## 🔧 Quick Fixes to Apply Now

### Fix 1: Upload Directory Path

Edit [backend/app/main.py](backend/app/main.py#L138):

```python
# Line 138: Change this
app.mount("/uploads", StaticFiles(directory=str(upload_dir.parent / "uploads")), name="uploads")

# To this
app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")
```

---

## 🚨 Critical Production Settings

Make sure these are set in your production `.env`:

```env
# MUST be False in production
DEBUG=False
ENVIRONMENT=production

# MUST be 64+ characters, random
SECRET_KEY=<64+ character random string>

# MUST match your actual domain
CORS_ORIGINS=https://jobs.yourdomain.com

# MUST use strong password
DATABASE_URL=postgresql://job_site_user:STRONG_PASSWORD@localhost/job_site_db

# MUST be configured for email to work
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## ✅ What's Already Perfect

1. **API Design** - RESTful, well-structured
2. **Authentication** - JWT tokens, bcrypt hashing
3. **Database** - PostgreSQL with migrations
4. **Security** - Rate limiting, CORS, headers
5. **Error Handling** - Comprehensive error tracking
6. **File Uploads** - Secure with validation
7. **Frontend** - React with proper API client
8. **Code Organization** - Clean, maintainable

---

## 📊 Deployment Readiness Score

| Component | Status | Score |
|-----------|--------|-------|
| Backend Code | ✅ Ready | 10/10 |
| Frontend Code | ✅ Ready | 10/10 |
| Database Setup | ✅ Ready | 10/10 |
| Security | ✅ Ready | 10/10 |
| Configuration | ⚠️ Needs .env | 7/10 |
| Deployment Scripts | ✅ Ready | 10/10 |
| Documentation | ✅ Ready | 10/10 |

**Overall**: 95% Ready - Just need to create `.env` and fix upload path!

---

## 🎯 Time Estimate

- **Code Fixes**: 5 minutes
- **VPS Setup**: 30-45 minutes (first time)
- **Backend Deploy**: 15 minutes
- **Frontend Build**: 5 minutes
- **Nginx Config**: 10 minutes
- **SSL Setup**: 5 minutes
- **Testing**: 15 minutes

**Total**: ~1.5 hours for first deployment

**Future Updates**: 5 minutes (using `deployment/scripts/deploy.sh`)

---

## 🆘 Common Issues & Solutions

### Backend won't start
```bash
# Check logs
sudo journalctl -u job-site-backend -n 50

# Common causes:
# 1. Missing .env file
# 2. Wrong DATABASE_URL
# 3. Port 8000 already in use
```

### Frontend shows blank page
```bash
# Check Nginx error logs
sudo tail -f /var/log/nginx/job-site-error.log

# Common causes:
# 1. Build not complete (no dist folder)
# 2. Wrong root path in Nginx config
```

### API calls fail (CORS errors)
```bash
# Check CORS_ORIGINS in .env
# Must match your frontend domain exactly
CORS_ORIGINS=https://jobs.yourdomain.com
```

### Database connection fails
```bash
# Test database connection
psql -U job_site_user -d job_site_db -h localhost

# Check DATABASE_URL format
# Must be: postgresql://user:password@host/database
```

---

## 📞 Need Help?

Refer to [DEPLOYMENT_GUIDE.md](deployment/DEPLOYMENT_GUIDE.md) for detailed step-by-step instructions.

---

## ✨ Next Steps After Deployment

1. **Test Everything** - Create test accounts, post jobs, apply
2. **Setup Backups** - Run backup script daily
3. **Monitor Logs** - Watch for errors
4. **SSL Renewal** - Certbot handles automatically
5. **Integration with LMS** - Add links from LMS to Job Site

---

**Your code is excellent and production-ready! Just apply the small fixes above and you're good to deploy!** 🚀
