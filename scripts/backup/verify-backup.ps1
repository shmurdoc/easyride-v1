param(
    [string]$BackupFile,
    [string]$StagingDB = "easyryde_staging",
    [string]$DBUser = "easyryde",
    [string]$DBHost = "localhost"
)

Write-Host "Verifying backup: $BackupFile"

# Restore to staging
& "pg_restore" --dbname=$stagingDB --host=$DBHost --username=$DBUser --jobs=2 --verbose $BackupFile

if ($LASTEXITCODE -eq 0) {
    # Run integrity checks
    $tables = @("users", "rides", "payments", "driver_profiles")
    foreach ($table in $tables) {
        $count = & "psql" --host=$DBHost --username=$DBUser --dbname=$stagingDB -t -c "SELECT COUNT(*) FROM $table;"
        Write-Host "$table: $count rows" -NoNewline
        if ([int]$count -gt 0) { Write-Host " ✓" } else { Write-Host " ✗ EMPTY!" }
    }
    
    Write-Host "Backup verification completed"
} else {
    Write-Host "Backup verification FAILED"
    exit 1
}
