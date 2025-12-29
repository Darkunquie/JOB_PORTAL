# 🚀 Quick Start Deployment Guide

## ✅ Code Successfully Pushed to GitHub!

Your secure code is now live at: https://github.com/Darkunquie/JOB_PORTAL

---

## 🎯 Deploy to Your VPS (Same Server as LMS)

Follow these steps to deploy on the same VPS where your LMS is running.

---

## 📋 Prerequisites

- ✅ Your VPS with LMS already running
- ✅ SSH access to your VPS
- ✅ Domain name (e.g., `jobs.yourdomain.com`) pointing to your VPS IP
- ✅ GitHub repository accessible from VPS

---

## 🚀 Deployment Steps

### Step 1: SSH into Your VPS

```bash
ssh username@your-vps-ip
```

---

### Step 2: Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.11
sudo apt install python3.11 python3.11-venv python3-pip -y

# Install PostgreSQL (if not already installed)
sudo apt install postgresql postgresql-contrib -y

# Install Nginx (if not already installed)
sudo apt install nginx -y

# Install Git (if not already installed)
sudo apt install git -y
```

---

### Step 3: Setup PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell, create database and user
CREATE DATABASE job_site_db;
CREATE USER job_site_user WITH PASSWORD 'YOUR_STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE job_site_db TO job_site_user;
\q
```

**Important**: Replace `YOUR_STRONG_PASSWORD_HERE` with a strong random password!

---

### Step 4: Clone Repository

```bash
# Create directory
sudo mkdir -p /var/www/job-site
sudo chown -R $USER:$USER /var/www/job-site

# Clone from GitHub
cd /var/www/job-site
git clone https://github.com/Darkunquie/JOB_PORTAL.git .
```

---

### Step 5: Setup Backend Environment

```bash
cd /var/www/job-site/backend

# Create virtual environment
python3.11 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

---

### Step 6: Create Production .env File

```bash
# Create .env file
nano .env
```

**Paste this content** (replace with YOUR values):

```env
# Database - USE YOUR STRONG PASSWORD
DATABASE_URL=postgresql://job_site_user:YOUR_STRONG_PASSWORD@localhost/job_site_db

# Security - GENERATE NEW SECRET KEY
SECRET_KEY=GENERATE_NEW_SECRET_KEY_HERE

# Security settings
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Environment
ENVIRONMENT=production
DEBUG=False

# CORS - YOUR ACTUAL DOMAIN
CORS_ORIGINS=https://jobs.yourdomain.com

# Email Configuration (use your SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password

# File uploads
UPLOAD_DIR=/var/www/job-site/backend/uploads
MAX_UPLOAD_SIZE=10485760

# Project settings
PROJECT_NAME=Job Marketplace
FRONTEND_URL=https://jobs.yourdomain.com
```

**Generate SECRET_KEY**:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
# Copy the output and paste it in SECRET_KEY above
```

**Save and exit**: Press `Ctrl+X`, then `Y`, then `Enter`

---

### Step 7: Run Database Migrations

```bash
# Make sure virtual environment is activated
source /var/www/job-site/backend/venv/bin/activate

# Run migrations
alembic upgrade head
```

---

### Step 8: Create Admin User

```bash
# Run secure admin creation script
python create_admin.py

# Enter your admin details when prompted:
# Email: your-admin-email@example.com
# Name: Your Name
# Password: [create a strong password]
```

**Save these credentials securely!** You'll need them to login.

---

### Step 9: Create Uploads Directory

```bash
# Create uploads directory
sudo mkdir -p /var/www/job-site/backend/uploads
sudo chown -R www-data:www-data /var/www/job-site/backend/uploads
sudo chmod 755 /var/www/job-site/backend/uploads
```

---

### Step 10: Setup Systemd Service

```bash
# Copy service file
sudo cp /var/www/job-site/deployment/systemd/job-site-backend.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable service (auto-start on boot)
sudo systemctl enable job-site-backend

# Start service
sudo systemctl start job-site-backend

# Check status
sudo systemctl status job-site-backend
```

**Should show**: `Active: active (running)`

If there's an error, check logs:
```bash
sudo journalctl -u job-site-backend -n 50
```

---

### Step 11: Build Frontend

```bash
cd /var/www/job-site/frontend

# Install Node.js dependencies (using your existing Node.js)
npm install

# Build for production
npm run build

# Verify dist folder was created
ls dist/
```

---

### Step 12: Configure Nginx

```bash
# Copy Nginx configuration
sudo cp /var/www/job-site/deployment/nginx/job-site.conf /etc/nginx/sites-available/

# Edit configuration - UPDATE YOUR DOMAIN
sudo nano /etc/nginx/sites-available/job-site.conf
```

**Change this line**:
```nginx
server_name jobs.yourdomain.com;  # ← Change to your actual domain
```

**Save and exit**: `Ctrl+X`, `Y`, `Enter`

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/job-site.conf /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

---

### Step 13: Setup SSL (HTTPS)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d jobs.yourdomain.com

# Follow prompts:
# - Enter email for renewal notifications
# - Agree to terms of service
# - Choose to redirect HTTP to HTTPS (recommended)

# Test auto-renewal
sudo certbot renew --dry-run
```

---

### Step 14: Configure Firewall (if UFW is enabled)

```bash
# Check if UFW is active
sudo ufw status

# If active, allow Nginx
sudo ufw allow 'Nginx Full'

# Check status again
sudo ufw status
```

---

## ✅ Verify Deployment

### Check Services

```bash
# Backend service
sudo systemctl status job-site-backend

# Nginx
sudo systemctl status nginx

# PostgreSQL
sudo systemctl status postgresql
```

### Test URLs

1. **Health Check**: `https://jobs.yourdomain.com/api/v1/health`
   - Should return: `{"status": "healthy"}`

2. **API Docs**: `https://jobs.yourdomain.com/api/docs`
   - Should show FastAPI Swagger UI

3. **Frontend**: `https://jobs.yourdomain.com`
   - Should show your React app

4. **Admin Login**: Login with credentials you created

---

## 🎯 Architecture Overview

```
Your VPS (Single Server)
├── Nginx (Port 80/443)
│   ├── lms.yourdomain.com → Node.js LMS (Port 3000)
│   └── jobs.yourdomain.com → Job Site
│       ├── /api/* → FastAPI Backend (Port 8000)
│       ├── /uploads/* → Resume Files
│       └── /* → React Frontend (Static)
│
├── Node.js LMS Process (Port 3000)
├── FastAPI Job Site (Port 8000)
└── PostgreSQL Database (Port 5432)
```

---

## 🔧 Common Issues & Solutions

### Backend won't start

```bash
# Check logs
sudo journalctl -u job-site-backend -n 50

# Common causes:
# 1. Wrong DATABASE_URL in .env
# 2. Port 8000 already in use
# 3. Missing dependencies

# Check if port 8000 is in use
sudo lsof -i :8000

# Restart service
sudo systemctl restart job-site-backend
```

### Frontend shows blank page

```bash
# Check Nginx error logs
sudo tail -f /var/log/nginx/job-site-error.log

# Common causes:
# 1. Build not complete (no dist folder)
# 2. Wrong root path in Nginx config

# Rebuild frontend
cd /var/www/job-site/frontend
npm run build
```

### Database connection fails

```bash
# Test database connection
psql -U job_site_user -d job_site_db -h localhost

# Check DATABASE_URL format in .env
# Must be: postgresql://user:password@host/database
```

### 502 Bad Gateway

```bash
# Backend service not running
sudo systemctl start job-site-backend

# Check Nginx upstream configuration
sudo nginx -t
```

---

## 📝 Maintenance Commands

### Update Application

```bash
cd /var/www/job-site

# Pull latest code
git pull origin master

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
sudo systemctl restart job-site-backend

# Update frontend
cd ../frontend
npm install
npm run build
```

### View Logs

```bash
# Backend logs
sudo journalctl -u job-site-backend -f

# Nginx access logs
sudo tail -f /var/log/nginx/job-site-access.log

# Nginx error logs
sudo tail -f /var/log/nginx/job-site-error.log
```

### Database Backup

```bash
# Backup database
sudo -u postgres pg_dump job_site_db > backup_$(date +%Y%m%d).sql

# Or use the backup script
cd /var/www/job-site/deployment/scripts
chmod +x backup.sh
./backup.sh
```

---

## 🎉 Success!

If all steps completed successfully:

✅ **Job Site is live**: `https://jobs.yourdomain.com`
✅ **API is working**: `https://jobs.yourdomain.com/api/docs`
✅ **Backend auto-restarts**: Systemd service enabled
✅ **HTTPS is configured**: SSL certificate installed
✅ **Both apps on same VPS**: LMS + Job Site running together

---

## 💡 Integration with LMS

### Link from LMS to Job Site

In your LMS frontend, add a link:

```html
<a href="https://jobs.yourdomain.com">Browse Jobs</a>
```

### Optional: Shared Authentication

If you want users to login once and access both LMS and Job Site:
- Both apps can use the same JWT SECRET_KEY
- Share tokens via cookies with same domain
- (This is advanced - deploy first, then enhance later)

---

## 📚 Additional Resources

- **Full Guide**: `/var/www/job-site/deployment/DEPLOYMENT_GUIDE.md`
- **Security Audit**: `/var/www/job-site/SECURITY_AUDIT_REPORT.md`
- **Local Dev**: `/var/www/job-site/LOCAL_DEVELOPMENT_SETUP.md`

---

## 🆘 Need Help?

### Check Status
```bash
# All services status
sudo systemctl status job-site-backend nginx postgresql

# View all logs
sudo journalctl -u job-site-backend -n 100
```

### Restart Everything
```bash
sudo systemctl restart job-site-backend
sudo systemctl restart nginx
```

---

## ✅ Deployment Complete!

Your Job Site is now deployed and running on the same VPS as your LMS! 🎉

**Cost Savings**: Running both apps on one VPS = 50% savings!

**Next Steps**:
1. Test all features (register, login, post jobs, apply)
2. Setup regular backups (use `deployment/scripts/backup.sh`)
3. Monitor logs for any issues
4. Enjoy your deployed application!
