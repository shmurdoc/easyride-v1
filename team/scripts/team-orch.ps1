param(
  [string]$command = ""
)

$scriptsDir = Split-Path -Parent $MyInvocation.MyCommand.Path

function Show-Help {
  Write-Host "team-orch -- Team Orchestration CLI"
  Write-Host ""
  Write-Host "Usage:"
  Write-Host "  team-orch validate          Validate all team file formats"
  Write-Host "  team-orch enforce           Run enforcement check (heartbeat + consistency)"
  Write-Host "  team-orch recover           Recover crashed/stale sessions"
  Write-Host ""
  Write-Host "Examples:"
  Write-Host "  team-orch validate"
  Write-Host "  team-orch enforce"
  Write-Host "  team-orch recover"
}

if ($command -eq "" -or $command -eq "--help" -or $command -eq "-h") {
  Show-Help
  exit 0
}

switch ($command.ToLower()) {
  "validate" {
    & "node" (Join-Path $scriptsDir "validate.mjs")
    exit $LASTEXITCODE
  }
  "enforce" {
    & "node" (Join-Path $scriptsDir "enforce.mjs")
    exit $LASTEXITCODE
  }
  "recover" {
    & "node" (Join-Path $scriptsDir "recover.mjs")
    exit $LASTEXITCODE
  }
  default {
    Write-Host "Unknown command: $command"
    Write-Host "Usage: team-orch validate|enforce|recover"
    exit 1
  }
}
