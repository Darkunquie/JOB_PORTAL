#!/bin/bash
# Database backup script
# Run this regularly or setup as a cron job

set -e

# Configuration
DB_NAME="job_site_db"
BACKUP_DIR="/var/backups/job-site"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/job_site_db_$DATE.sql"
RETENTION_DAYS=7  # Keep backups for 7 days

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "🗄️ Starting database backup..."

# Backup database
sudo -u postgres pg_dump $DB_NAME > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

echo "✅ Backup created: ${BACKUP_FILE}.gz"

# Remove old backups
echo "🧹 Cleaning up old backups (older than $RETENTION_DAYS days)..."
find $BACKUP_DIR -name "job_site_db_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Backup completed successfully!"

# List recent backups
echo ""
echo "📋 Recent backups:"
ls -lht $BACKUP_DIR | head -5

# Optional: Upload to cloud storage
# aws s3 cp ${BACKUP_FILE}.gz s3://your-bucket/backups/
# rclone copy ${BACKUP_FILE}.gz remote:backups/
