#!/bin/bash
# Quick deployment script for updates
# Run this on your VPS after pushing code changes

set -e  # Exit on error

echo "🚀 Starting Job Site deployment..."

# Configuration
PROJECT_DIR="/var/www/job-site"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Navigate to project directory
cd $PROJECT_DIR

# 1. Pull latest code
echo "📥 Pulling latest code from git..."
git pull origin main  # Change 'main' to your branch name

# 2. Update Backend
echo "🐍 Updating Python backend..."
cd $BACKEND_DIR

# Activate virtual environment
source venv/bin/activate

# Install/update dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Run database migrations
echo "🗄️ Running database migrations..."
alembic upgrade head

# Deactivate virtual environment
deactivate

# 3. Update Frontend
echo "⚛️ Updating React frontend..."
cd $FRONTEND_DIR

# Install/update dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Build production bundle
echo "🔨 Building frontend..."
npm run build

# 4. Restart Backend Service
echo "🔄 Restarting backend service..."
sudo systemctl restart job-site-backend

# Wait for service to start
sleep 2

# 5. Check service status
if sudo systemctl is-active --quiet job-site-backend; then
    echo "✅ Backend service is running"
else
    echo "❌ Backend service failed to start"
    sudo journalctl -u job-site-backend -n 20
    exit 1
fi

# 6. Reload Nginx (optional, only if config changed)
# sudo systemctl reload nginx

echo "✅ Deployment completed successfully!"
echo ""
echo "🔍 Check status:"
echo "   Backend: sudo systemctl status job-site-backend"
echo "   Logs: sudo journalctl -u job-site-backend -f"
echo ""
echo "🌐 Your site should be live at: https://jobs.yourdomain.com"
