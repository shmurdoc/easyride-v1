$env:Path = "C:\Users\madoc\AppData\Local\nvm\v22.16.0;$env:Path"
$metroPort = 8085
$projectDir = "F:\EasyRyde\mobile\apps\rider"
$logFile = "F:\EasyRyde\metro-test.log"

# Start Metro
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "F:\EasyRyde\mobile\apps\rider\node_modules\.bin\expo.cmd"
$psi.Arguments = "start --dev-client --port $metroPort"
$psi.WorkingDirectory = $projectDir
$psi.UseShellExecute = $false
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.EnvironmentVariables["PATH"] = "C:\Users\madoc\AppData\Local\nvm\v22.16.0;$env:Path"

$proc = [System.Diagnostics.Process]::Start($psi)

# Wait for port to be ready
$timeout = 30
$ready = $false
for ($i = 0; $i -lt $timeout; $i++) {
    Start-Sleep -Seconds 1
    $connections = netstat -ano | Select-String ":$metroPort" | Select-String "LISTENING"
    if ($connections) {
        $ready = $true
        break
    }
}

if (-not $ready) {
    Write-Host "Metro did not start within $timeout seconds"
    try { $proc.Kill() } catch {}
    exit 1
}

Write-Host "Metro ready on port $metroPort (PID $($proc.Id))"

# Request bundle
$url = "http://localhost:$metroPort/node_modules/expo/AppEntry.bundle?platform=android&dev=true&minify=false"
try {
    $r = Invoke-WebRequest -Uri $url -TimeoutSec 120 -UseBasicParsing
    Write-Host "BUNDLE OK! Status=$($r.StatusCode) Size=$($r.Content.Length)"
    Write-Host "First 200: $($r.Content.Substring(0, [Math]::Min(200, $r.Content.Length)))"
} catch {
    Write-Host "BUNDLE ERROR: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $body = $reader.ReadToEnd()
        Write-Host "Error body: $body"
    }
}

# Kill Metro
try { $proc.Kill() } catch {}
