#!/bin/bash

set -e

BACKUP_DIR="/opt/phalaborwa/backups"
DB_NAME="${DB_DATABASE}"
DB_USER="${DB_USERNAME}"
DB_HOST="localhost"
DB_PORT="5432"
RETENTION_DAYS=30
DATE=$(date +%Y_%m_%d_%H_%M_%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup for $DB_NAME..."

pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  --format=custom \
  --compress=9 \
  --verbose \
  > "$BACKUP_FILE"

echo "[$(date)] Backup completed: $BACKUP_FILE"

find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "[$(date)] Old backups cleaned up (retention: $RETENTION_DAYS days)"

if [ -n "$AWS_S3_BUCKET" ]; then
  aws s3 cp "$BACKUP_FILE" "s3://$AWS_S3_BUCKET/backups/$(basename $BACKUP_FILE)"
  echo "[$(date)] Backup uploaded to S3"
fi

echo "[$(date)] Backup process complete"
