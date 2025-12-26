# Job Site Deployment Guide - Same VPS as LMS

This guide explains how to deploy the Job Site (Python FastAPI + React) on the same VPS where your LMS (Node.js) is running.

## Architecture Overview

```
VPS Server
├── Nginx (Port 80/443) - Reverse Proxy
│   ├── lms.yourdomain.com → Node.js LMS (Port 3000)
│   └── jobs.yourdomain.com → Python FastAPI (Port 8000)
├── Node.js LMS Process (Port 3000)
├── Python FastAPI Backend (Port 8000)
├── PostgreSQL Database (Port 5432)
└── React Frontend (Static files served by Nginx)
```

## Prerequisites

- Ubuntu/Debian VPS with sudo access
- Domain names pointing to your VPS IP
- Your LMS already running on the VPS
- At least 2GB RAM recommended

## Step 1: Install Python and Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.11
sudo apt install python3.11 python3.11-venv python3-pip -y

# Install PostgreSQL (if not already installed)
sudo apt install postgresql postgresql-contrib -y

# Install Nginx (if not already installed)
sudo apt install nginx -y
```

## Step 2: Setup PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell, create database and user
CREATE DATABASE job_site_db;
CREATE USER job_site_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE job_site_db TO job_site_user;
\q
```

## Step 3: Deploy Backend (FastAPI)

```bash
# Create directory structure
sudo mkdir -p /var/www/job-site
sudo chown -R $USER:$USER /var/www/job-site

# Navigate to directory
cd /var/www/job-site

# Clone or upload your code
# Option 1: From GitHub
git clone <your-repo-url> .

# Option 2: Upload via SCP/SFTP
# scp -r ./backend user@your-vps:/var/www/job-site/

# Navigate to backend
cd backend

# Create virtual environment
python3.11 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create production .env file
nano .env
```

### Backend .env Configuration

Create `/var/www/job-site/backend/.env`:

```env
# Database
DATABASE_URL=postgresql://job_site_user:your_secure_password@localhost/job_site_db

# Security
SECRET_KEY=generate_a_very_long_random_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=https://jobs.yourdomain.com,https://lms.yourdomain.com

# Environment
ENVIRONMENT=production
DEBUG=False

# Email (configure your SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# File uploads
UPLOAD_DIR=/var/www/job-site/backend/uploads
MAX_UPLOAD_SIZE=10485760

# Project settings
PROJECT_NAME=Job Marketplace
FRONTEND_URL=https://jobs.yourdomain.com
```

### Generate Secret Key

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Run Database Migrations

```bash
# Make sure venv is activated
source /var/www/job-site/backend/venv/bin/activate

# Run migrations
alembic upgrade head

# Create admin user
python create_admin.py
```

## Step 4: Setup Systemd Service for Backend

```bash
# Copy service file
sudo cp /var/www/job-site/deployment/systemd/job-site-backend.service /etc/systemd/system/

# Edit if needed (check paths and user)
sudo nano /etc/systemd/system/job-site-backend.service

# Reload systemd
sudo systemctl daemon-reload

# Enable and start service
sudo systemctl enable job-site-backend
sudo systemctl start job-site-backend

# Check status
sudo systemctl status job-site-backend

# View logs
sudo journalctl -u job-site-backend -f
```

## Step 5: Build and Deploy Frontend (React)

```bash
# Navigate to frontend directory
cd /var/www/job-site/frontend

# Install Node.js dependencies (using your existing Node.js installation)
npm install

# Create production .env
nano .env.production
```

### Frontend .env.production

```env
VITE_API_URL=https://jobs.yourdomain.com/api
```

### Build Frontend

```bash
# Build for production
npm run build

# The build output will be in: /var/www/job-site/frontend/dist
```

## Step 6: Configure Nginx

```bash
# Copy Nginx configuration
sudo cp /var/www/job-site/deployment/nginx/job-site.conf /etc/nginx/sites-available/

# Edit the configuration and update your domain
sudo nano /etc/nginx/sites-available/job-site.conf

# Update these lines:
# - server_name jobs.yourdomain.com;
# - root /var/www/job-site/frontend/dist;

# Create symbolic link to enable the site
sudo ln -s /etc/nginx/sites-available/job-site.conf /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

## Step 7: Setup SSL with Let's Encrypt (HTTPS)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificates for Job Site
sudo certbot --nginx -d jobs.yourdomain.com

# Certbot will automatically configure HTTPS in Nginx

# Test auto-renewal
sudo certbot renew --dry-run
```

## Step 8: Create Upload Directory

```bash
# Create uploads directory
sudo mkdir -p /var/www/job-site/backend/uploads
sudo chown -R www-data:www-data /var/www/job-site/backend/uploads
sudo chmod 755 /var/www/job-site/backend/uploads
```

## Step 9: Setup Firewall (if not already configured)

```bash
# Allow Nginx
sudo ufw allow 'Nginx Full'

# Allow SSH (if not already allowed)
sudo ufw allow OpenSSH

# Enable firewall (if not already enabled)
sudo ufw enable

# Check status
sudo ufw status
```

## Step 10: Verify Both Applications

### Check Services

```bash
# Check Job Site backend
sudo systemctl status job-site-backend

# Check LMS (your existing Node.js app)
sudo systemctl status lms  # or pm2 list if using PM2

# Check Nginx
sudo systemctl status nginx

# Check PostgreSQL
sudo systemctl status postgresql
```

### Test URLs

1. **Job Site**: https://jobs.yourdomain.com
2. **Job Site API**: https://jobs.yourdomain.com/api/docs
3. **LMS**: https://lms.yourdomain.com

## Maintenance Commands

### Backend Updates

```bash
# Pull latest code
cd /var/www/job-site
git pull

# Activate venv and install any new dependencies
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Run new migrations
alembic upgrade head

# Restart backend service
sudo systemctl restart job-site-backend
```

### Frontend Updates

```bash
# Pull latest code
cd /var/www/job-site/frontend

# Install new dependencies
npm install

# Rebuild
npm run build

# Nginx will automatically serve new files
```

### View Logs

```bash
# Backend logs
sudo journalctl -u job-site-backend -f

# Nginx access logs
sudo tail -f /var/log/nginx/job-site-access.log

# Nginx error logs
sudo tail -f /var/log/nginx/job-site-error.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Database Backup

```bash
# Backup
sudo -u postgres pg_dump job_site_db > backup_$(date +%Y%m%d).sql

# Restore
sudo -u postgres psql job_site_db < backup_20250101.sql
```

## Resource Usage

Both applications running on the same VPS:

- **Node.js LMS**: ~200-500MB RAM
- **Python FastAPI**: ~200-400MB RAM
- **PostgreSQL**: ~100-300MB RAM
- **Nginx**: ~10-50MB RAM

**Total**: ~1-2GB RAM (2GB+ VPS recommended)

## Troubleshooting

### Backend won't start

```bash
# Check logs
sudo journalctl -u job-site-backend -n 50

# Check if port 8000 is in use
sudo lsof -i :8000

# Check Python path
which python3.11
```

### Database connection errors

```bash
# Verify PostgreSQL is running
sudo systemctl status postgresql

# Test database connection
psql -U job_site_user -d job_site_db -h localhost
```

### Nginx errors

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### 502 Bad Gateway

- Backend service not running: `sudo systemctl start job-site-backend`
- Wrong port in Nginx config: Check upstream port is 8000
- Firewall blocking: `sudo ufw status`

## Security Checklist

- [ ] Database password is strong and unique
- [ ] SECRET_KEY is random and secure (32+ characters)
- [ ] DEBUG=False in production .env
- [ ] HTTPS/SSL certificates installed
- [ ] Firewall (UFW) configured and enabled
- [ ] File upload size limits set
- [ ] CORS origins restricted to your domains only
- [ ] PostgreSQL only accepts local connections
- [ ] Regular backups scheduled

## Integration with LMS

Since both applications are on the same VPS:

### Option 1: Frontend Link from LMS to Job Site

```javascript
// In your LMS frontend
<a href="https://jobs.yourdomain.com">Browse Jobs</a>
```

### Option 2: API Integration (Cross-domain)

```javascript
// From LMS, call Job Site API
const response = await fetch('https://jobs.yourdomain.com/api/jobs/list', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Option 3: SSO/Shared Authentication

You can implement JWT token sharing between both applications:

1. User logs in to LMS
2. LMS generates JWT token
3. Token is valid for both LMS and Job Site (shared SECRET_KEY)
4. Job Site validates the same token

## Cost Savings

**Before**: 2 separate VPS = $10-20/month
**After**: 1 VPS with both apps = $5-10/month

**Savings**: 50% on hosting costs! 🎉

## Next Steps

1. Point your DNS records to the VPS IP
2. Complete SSL setup for secure HTTPS
3. Setup automated backups
4. Configure monitoring (optional: UptimeRobot, etc.)
5. Setup CI/CD for automatic deployments (optional)
