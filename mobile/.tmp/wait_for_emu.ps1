$env:ANDROID_SDK_ROOT = "C:\Users\madoc\AppData\Local\Android\Sdk"
$env:ANDROID_AVD_HOME = "F:\AndroidAVD"
$env:TMP = "F:\EasyRyde\mobile\.tmp"
$env:TEMP = "F:\EasyRyde\mobile\.tmp"
$log = "F:\EasyRyde\mobile\.tmp\emu_wait.log"

function Log { param($m) "$(Get-Date -Format HH:mm:ss): $m" | Out-File -Append $log }

Log "Starting emulator monitor..."
$connected = $false
for ($i = 0; $i -lt 60; $i++) {
    $devices = & "C:\Users\madoc\AppData\Local\Android\Sdk\platform-tools\adb.exe" devices 2>&1
    if ($devices -match "emulator-\d+") {
        Log "Device online: $devices"
        $connected = $true
        break
    }
    Log "Tick $($i+1)/60"
    Start-Sleep -Seconds 10
}

if ($connected) {
    Log "Waiting for boot complete..."
    for ($i = 0; $i -lt 30; $i++) {
        $boot = & "C:\Users\madoc\AppData\Local\Android\Sdk\platform-tools\adb.exe" shell getprop sys.boot_completed 2>&1
        if ($boot -match "1") {
            Log "Boot complete!"
            break
        }
        Start-Sleep -Seconds 5
    }
    Log "Installing APK..."
    $install = & "C:\Users\madoc\AppData\Local\Android\Sdk\platform-tools\adb.exe" install "F:\EasyRyde\mobile\apps\rider\android\app\build\outputs\apk\debug\app-debug.apk" 2>&1
    Log "Install result: $install"
} else {
    Log "Never connected"
    $procs = Get-Process -Name "qemu*","emulator*" -ErrorAction SilentlyContinue | Select-Object Id,ProcessName
    Log "Running procs: $($procs | Out-String)"
}

Log "Monitor done"
