param(
    [string]$BackupFile,
    [string]$DBName = "easyryde",
    [string]$DBUser = "easyryde",
    [string]$DBHost = "localhost",
    [string]$DBPort = "5432"
)

$env:PGPASSWORD = $env:DB_PASSWORD

Write-Host "Dropping existing connections..."
& "psql" --host=$DBHost --port=$DBPort --username=$DBUser --dbname=$DBName -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$DBName' AND pid <> pg_backend_pid();"

Write-Host "Dropping and recreating database..."
& "psql" --host=$DBHost --port=$DBPort --username=$DBUser -c "DROP DATABASE IF EXISTS $DBName;"
& "psql" --host=$DBHost --port=$DBPort --username=$DBUser -c "CREATE DATABASE $DBName;"

Write-Host "Restoring from backup: $BackupFile"
& "pg_restore" --dbname=$DBName --host=$DBHost --port=$DBPort --username=$DBUser --jobs=4 --verbose $BackupFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "Restore completed successfully"
} else {
    Write-Host "Restore FAILED"
    exit 1
}
