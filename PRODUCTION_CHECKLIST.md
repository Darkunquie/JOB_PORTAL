# 🚀 Production Deployment Checklist

**IMPORTANT:** Follow this checklist before deploying to production/client systems.

---

## ✅ Pre-Deployment Checklist

### 🔒 Security

- [ ] **Change database credentials** in `docker-compose.yml`
  ```yaml
  POSTGRES_PASSWORD: CHANGE_THIS_TO_STRONG_PASSWORD
  ```

- [ ] **Set strong JWT_SECRET** in `backend/.env` or `backend/app/config.py`
  ```python
  JWT_SECRET = "CHANGE_THIS_TO_RANDOM_LONG_STRING"
  ```

- [ ] **Configure CORS** for your production domain in `backend/app/main.py`
  ```python
  origins = [
      "https://yourdomain.com",  # Your production domain
      # Remove localhost in production!
  ]
  ```

- [ ] **Enable HTTPS** - Use nginx with SSL certificates
  - Get SSL certificate (Let's Encrypt, Cloudflare, etc.)
  - Configure nginx to redirect HTTP to HTTPS

- [ ] **Review file upload limits** and storage location

- [ ] **Set secure cookie settings** in production

### 🗄️ Database

- [ ] **DO NOT run `seed_data.py`** - it contains fake/dummy data!

- [ ] **Use production setup script:**
  ```bash
  docker-compose exec backend python production_setup.py
  ```

- [ ] **Backup strategy configured**
  - Set up automated backups
  - Test restore process
  - Store backups securely off-site

- [ ] **Database credentials are strong**
  - Not default `postgres/postgres`
  - At least 16 characters
  - Mix of letters, numbers, symbols

### 📧 Email Configuration

- [ ] **Configure email service** for password resets
  - Update SMTP settings in `backend/app/config.py`
  - Test password reset emails work

### 🐳 Docker & Environment

- [ ] **Production docker-compose** configuration
  - Remove volume mounts for code (no hot-reload)
  - Set proper restart policies
  - Configure resource limits

- [ ] **Environment variables** set correctly
  - `ENVIRONMENT=production`
  - Debug mode disabled
  - Logging configured for production

### 🌐 Frontend

- [ ] **Update API URL** in frontend
  - Change from `localhost:8000` to production domain
  - Check `frontend/src/api/client.js`

- [ ] **Remove development tools**
  - No React DevTools in production build
  - Console.logs removed or disabled

### 📊 Monitoring & Logging

- [ ] **Set up logging**
  - Application logs
  - Error tracking (Sentry, etc.)
  - Access logs

- [ ] **Set up monitoring**
  - Server health
  - Database performance
  - Disk space alerts

### 🧪 Testing

- [ ] **Test complete user flows**
  - Admin login
  - Employer registration & approval
  - Job seeker registration & application
  - Password reset

- [ ] **Test on production-like environment first**
  - Staging server
  - Same OS, Docker version
  - Same network configuration

---

## 🔴 CRITICAL: What NOT to Do in Production

### ❌ **NEVER run these commands in production:**

```bash
# ❌ DO NOT RUN - Contains fake data!
docker-compose exec backend python seed_data.py

# ❌ DO NOT RUN - Development only!
docker-compose down -v  # Deletes all data!

# ❌ DO NOT RUN - Exposes database
docker-compose exec db psql -U postgres -d jobmarket
# (Unless you know what you're doing)
```

### ❌ **DO NOT:**
- Use default passwords (`postgres`, `admin123`, etc.)
- Expose database port to public internet
- Run with debug mode enabled
- Use HTTP instead of HTTPS
- Skip database backups
- Give admin access to everyone
- Use development tools in production

---

## 🟢 Production Setup Process

### **Step 1: Prepare Environment**
```bash
# Clone repository
git clone <your-repo-url>
cd JOB_SITE

# Update docker-compose.yml with production settings
# Update backend/.env with production credentials
```

### **Step 2: Start Services**
```bash
docker-compose up -d
```

### **Step 3: Database Tables (Auto-Created)**

**✅ Tables are automatically created on first startup!**

The backend will check and create tables when it starts. View the logs:

```bash
docker-compose logs backend
```

You should see:
```
Checking database tables...
✅ Database tables ready
```

**No manual action needed!**

### **Step 4: Create Admin Account**
```bash
# Wait 10 seconds for database to be ready

# Create admin using production setup script
docker-compose exec backend python production_setup.py
```

This will:
- ✅ Create admin account with strong password validation
- ✅ Require 8+ chars, uppercase, lowercase, numbers, symbols
- ❌ NO dummy/sample data

**OR** use the simpler create_user script:
```bash
docker-compose exec backend python create_user.py
# Select role: 1 (Admin)
```

### **Step 5: Verify Setup**
```bash
# Check all containers running
docker-compose ps

# Check backend logs
docker-compose logs backend --tail=50

# Check database logs
docker-compose logs db --tail=50
```

### **Step 5: Test Login**
- Go to https://yourdomain.com
- Login with admin credentials
- Verify admin dashboard loads

### **Step 6: Configure First Steps**
- [ ] Create employer approval workflow
- [ ] Test employer registration
- [ ] Test job posting
- [ ] Test job application

---

## 📦 First Production Deployment

### **Initial Data Setup:**

After running `production_setup.py`, your database has:
- ✅ Admin account (created during setup)
- ✅ Database structure (all tables)
- ❌ NO employers
- ❌ NO companies
- ❌ NO jobs
- ❌ NO job seekers

**This is correct for production!**

Real users will:
1. Register as employers (need admin approval)
2. Create companies
3. Post jobs
4. Job seekers register and apply

---

## 🔄 Updates & Maintenance

### **Deploying Code Updates:**
```bash
# Pull latest code
git pull

# Rebuild containers
docker-compose build --no-cache

# Restart services
docker-compose up -d
```

### **Database Backups:**
```bash
# Create backup
docker-compose exec db pg_dump -U postgres jobmarket > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore if needed
docker-compose exec -T db psql -U postgres jobmarket < backup_20231221_120000.sql
```

---

## 🆘 Production Troubleshooting

### **Can't create admin**
```bash
# Check database is running
docker-compose ps db

# Check database logs
docker-compose logs db
```

### **Frontend can't connect to backend**
- Check CORS settings
- Verify API URL in frontend
- Check backend is running: `docker-compose logs backend`

### **Database connection errors**
- Verify database credentials in docker-compose.yml
- Check DATABASE_URL in backend
- Ensure database container is healthy

---

## 📝 Post-Deployment

### **Documentation:**
- [ ] Document admin credentials (store securely!)
- [ ] Document backup procedures
- [ ] Document rollback procedures
- [ ] Create runbook for common issues

### **Monitoring:**
- [ ] Set up uptime monitoring
- [ ] Configure error alerts
- [ ] Monitor disk space
- [ ] Monitor database size

### **Security:**
- [ ] Schedule security audits
- [ ] Keep dependencies updated
- [ ] Monitor for vulnerabilities
- [ ] Review access logs regularly

---

## 🔐 Security Best Practices

1. **Passwords:**
   - Min 12 characters for admin
   - Mix uppercase, lowercase, numbers, symbols
   - Never share admin credentials
   - Change default passwords immediately

2. **Database:**
   - Not accessible from internet
   - Strong password (16+ chars)
   - Regular backups
   - Encrypted backups

3. **Application:**
   - HTTPS only
   - Secure cookies
   - CORS properly configured
   - Rate limiting enabled
   - File upload validation

4. **Server:**
   - Keep Docker updated
   - Keep OS updated
   - Firewall configured
   - Only necessary ports open

---

## ✅ Final Checklist Before Go-Live

- [ ] All security settings configured
- [ ] Database initialized with `production_setup.py`
- [ ] Admin account created and tested
- [ ] HTTPS working
- [ ] Email notifications working
- [ ] Backups configured and tested
- [ ] Monitoring set up
- [ ] Documentation complete
- [ ] Staging environment tested
- [ ] Rollback plan ready
- [ ] ❌ `seed_data.py` NOT run
- [ ] ❌ No dummy data in database
- [ ] ❌ Debug mode disabled
- [ ] ❌ Development tools removed

---

**Remember:** Production is for real users and real data. Never use dummy/sample data in production!

---

**Last Updated:** December 21, 2025
