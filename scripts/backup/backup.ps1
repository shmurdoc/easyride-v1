param(
    [string]$DBName = "easyryde",
    [string]$DBUser = "easyryde",
    [string]$DBHost = "localhost",
    [string]$DBPort = "5432",
    [string]$BackupDir = "C:\backups\easyryde",
    [string]$S3Bucket = "easyryde-backups",
    [string]$RetentionDays = "30"
)

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFile = "$BackupDir\daily\$DBName-$timestamp.dump"
$logFile = "$BackupDir\backup-$timestamp.log"

Write-Host "Starting backup at $timestamp" | Out-File -FilePath $logFile

# Create directories if they don't exist
New-Item -ItemType Directory -Force -Path "$BackupDir\daily" | Out-Null
New-Item -ItemType Directory -Force -Path "$BackupDir\weekly" | Out-Null
New-Item -ItemType Directory -Force -Path "$BackupDir\monthly" | Out-Null

# Run pg_dump
$env:PGPASSWORD = $env:DB_PASSWORD
& "pg_dump" --format=custom --compress=9 --file=$backupFile --host=$DBHost --port=$DBPort --username=$DBUser --dbname=$DBName

if ($LASTEXITCODE -eq 0) {
    Write-Host "Backup completed: $backupFile" | Out-File -FilePath $logFile -Append
    
    # Upload to S3
    & "aws" s3 cp $backupFile "s3://$S3Bucket/daily/$DBName-$timestamp.dump"
    Write-Host "Uploaded to S3" | Out-File -FilePath $logFile -Append
    
    # Weekly backup (Sunday)
    if ((Get-Date).DayOfWeek -eq 'Sunday') {
        Copy-Item $backupFile "$BackupDir\weekly\$DBName-weekly-$timestamp.dump"
        & "aws" s3 cp "$BackupDir\weekly\$DBName-weekly-$timestamp.dump" "s3://$S3Bucket/weekly/"
    }
    
    # Monthly backup (1st of month)
    if ((Get-Date).Day -eq 1) {
        Copy-Item $backupFile "$BackupDir\monthly\$DBName-monthly-$timestamp.dump"
        & "aws" s3 cp "$BackupDir\monthly\$DBName-monthly-$timestamp.dump" "s3://$S3Bucket/monthly/"
    }
    
    # Cleanup old files
    Get-ChildItem "$BackupDir\daily\*.dump" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$RetentionDays) } | Remove-Item
    Get-ChildItem "$BackupDir\weekly\*.dump" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-180) } | Remove-Item
    
    Write-Host "Backup rotation completed" | Out-File -FilePath $logFile -Append
} else {
    Write-Host "Backup FAILED" | Out-File -FilePath $logFile -Append
    exit 1
}
