#!/bin/bash

# ==========================================
# Production Deployment Script
# Job Marketplace Platform v1.0.0
# ==========================================

set -e  # Exit on any error

echo "=========================================="
echo "Production Deployment Script"
echo "Job Marketplace Platform"
echo "Version: 1.0.0"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ==========================================
# Pre-Flight Checks
# ==========================================

echo "Running pre-flight checks..."
echo ""

# Check 1: Docker installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker installed${NC}"

# Check 2: Docker Compose installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose installed${NC}"

# Check 3: .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo ""
    echo "Please create .env file:"
    echo "  cp .env.production.template .env"
    echo "  nano .env  # Edit with your production values"
    exit 1
fi
echo -e "${GREEN}✅ .env file exists${NC}"

# Check 4: Production mode enabled
if ! grep -q "ENVIRONMENT=production" .env; then
    echo -e "${YELLOW}⚠️  WARNING: ENVIRONMENT not set to 'production'${NC}"
    echo "Current setting:"
    grep "ENVIRONMENT" .env || echo "  (not set)"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ Production mode enabled${NC}"
fi

# Check 5: DEBUG is False
if ! grep -q "DEBUG=False" .env; then
    echo -e "${RED}❌ DEBUG must be False in production${NC}"
    exit 1
fi
echo -e "${GREEN}✅ DEBUG mode disabled${NC}"

# Check 6: CORS_ORIGINS configured
if grep -q "localhost" .env | grep "CORS_ORIGINS"; then
    echo -e "${YELLOW}⚠️  WARNING: CORS_ORIGINS still contains 'localhost'${NC}"
    echo "This may be intentional for testing, but should be updated for production"
fi

# Check 7: SMTP configured
if grep -q "your-email@" .env; then
    echo -e "${YELLOW}⚠️  WARNING: SMTP appears to use placeholder values${NC}"
    echo "Password reset emails may not work correctly"
fi

echo ""
echo "Pre-flight checks complete!"
echo ""

# ==========================================
# Deployment Options
# ==========================================

echo "Select deployment action:"
echo "  1) Fresh deployment (rebuild containers)"
echo "  2) Update deployment (pull latest, rebuild)"
echo "  3) Restart services only"
echo "  4) Run database migrations only"
echo "  5) Full system check"
echo "  6) Rollback to previous version"
echo ""
read -p "Enter choice [1-6]: " choice

case $choice in
    1)
        echo ""
        echo "=========================================="
        echo "Fresh Deployment"
        echo "=========================================="
        echo ""

        echo "Stopping existing containers..."
        docker-compose down

        echo ""
        echo "Building containers..."
        docker-compose build --no-cache

        echo ""
        echo "Starting services..."
        docker-compose up -d

        echo ""
        echo "Waiting for services to be ready..."
        sleep 10

        echo ""
        echo "Running database migrations..."
        docker-compose exec -T backend alembic upgrade head

        echo ""
        echo -e "${GREEN}✅ Fresh deployment complete!${NC}"
        ;;

    2)
        echo ""
        echo "=========================================="
        echo "Update Deployment"
        echo "=========================================="
        echo ""

        echo "Pulling latest code..."
        git pull origin main || echo "No git repository or unable to pull"

        echo ""
        echo "Stopping services..."
        docker-compose down

        echo ""
        echo "Rebuilding containers..."
        docker-compose build

        echo ""
        echo "Starting services..."
        docker-compose up -d

        echo ""
        echo "Running migrations..."
        docker-compose exec -T backend alembic upgrade head

        echo ""
        echo -e "${GREEN}✅ Update deployment complete!${NC}"
        ;;

    3)
        echo ""
        echo "=========================================="
        echo "Restart Services"
        echo "=========================================="
        echo ""

        echo "Restarting all services..."
        docker-compose restart

        echo ""
        echo -e "${GREEN}✅ Services restarted!${NC}"
        ;;

    4)
        echo ""
        echo "=========================================="
        echo "Database Migrations"
        echo "=========================================="
        echo ""

        echo "Running migrations..."
        docker-compose exec -T backend alembic upgrade head

        echo ""
        echo "Current migration status:"
        docker-compose exec -T backend alembic current

        echo ""
        echo -e "${GREEN}✅ Migrations complete!${NC}"
        ;;

    5)
        echo ""
        echo "=========================================="
        echo "System Health Check"
        echo "=========================================="
        echo ""

        # Backend health
        echo "Checking backend health..."
        HEALTH=$(curl -s http://localhost:8000/api/v1/health 2>/dev/null || echo "FAILED")
        if echo "$HEALTH" | grep -q "healthy"; then
            echo -e "${GREEN}✅ Backend: healthy${NC}"
        else
            echo -e "${RED}❌ Backend: unhealthy${NC}"
        fi

        # Database connection
        echo ""
        echo "Checking database connection..."
        docker-compose exec -T db psql -U jobmarket -c "SELECT 1" > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Database: connected${NC}"
        else
            echo -e "${RED}❌ Database: connection failed${NC}"
        fi

        # Container status
        echo ""
        echo "Container status:"
        docker-compose ps

        # Recent errors
        echo ""
        echo "Recent errors (last 20 lines):"
        docker-compose logs --tail=20 backend | grep -i error || echo "No errors found"

        echo ""
        echo "System check complete!"
        ;;

    6)
        echo ""
        echo "=========================================="
        echo "Rollback"
        echo "=========================================="
        echo ""

        echo "WARNING: This will rollback to the previous deployment"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Rollback cancelled"
            exit 0
        fi

        echo ""
        echo "Stopping services..."
        docker-compose down

        echo ""
        echo "Rolling back git..."
        git reset --hard HEAD~1

        echo ""
        echo "Rebuilding containers..."
        docker-compose build

        echo ""
        echo "Starting services..."
        docker-compose up -d

        echo ""
        echo -e "${GREEN}✅ Rollback complete!${NC}"
        ;;

    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

# ==========================================
# Post-Deployment Checks
# ==========================================

echo ""
echo "=========================================="
echo "Post-Deployment Verification"
echo "=========================================="
echo ""

# Wait for services to stabilize
echo "Waiting for services to stabilize (10 seconds)..."
sleep 10

# Check backend health
echo ""
echo "Testing backend health endpoint..."
HEALTH_CHECK=$(curl -s http://localhost:8000/api/v1/health 2>/dev/null || echo "FAILED")

if echo "$HEALTH_CHECK" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
    echo "Response: $HEALTH_CHECK"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    echo "Response: $HEALTH_CHECK"
    echo ""
    echo "Recent backend logs:"
    docker-compose logs --tail=50 backend
fi

# Check container status
echo ""
echo "Container status:"
docker-compose ps

# Show logs
echo ""
echo "Recent logs (last 20 lines):"
docker-compose logs --tail=20

# ==========================================
# Monitoring Instructions
# ==========================================

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Monitor logs:"
echo "   docker-compose logs -f"
echo ""
echo "2. Check specific service:"
echo "   docker-compose logs -f backend"
echo "   docker-compose logs -f frontend"
echo ""
echo "3. View running containers:"
echo "   docker-compose ps"
echo ""
echo "4. Check backend health:"
echo "   curl http://localhost:8000/api/v1/health"
echo ""
echo "5. Access API documentation:"
echo "   http://localhost:8000/api/docs"
echo ""
echo "6. Monitor system resources:"
echo "   docker stats"
echo ""
echo "=========================================="
echo ""
echo "Production checklist:"
echo ""
echo "  [ ] HTTPS/SSL certificate installed"
echo "  [ ] DNS pointing to production server"
echo "  [ ] SMTP configured and tested"
echo "  [ ] Firewall rules configured"
echo "  [ ] Monitoring/alerts set up"
echo "  [ ] Database backups configured"
echo ""
echo "See PRODUCTION_DEPLOYMENT_CHECKLIST.md for details"
echo ""
echo "=========================================="
echo ""
echo -e "${GREEN}Deployment script finished!${NC}"
echo ""
