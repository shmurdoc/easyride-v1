@echo off
cd /d F:\EasyRyde\mobile\apps\rider
set PATH=C:\Users\madoc\AppData\Local\nvm\v22.16.0;%PATH%
del /q F:\EasyRyde\metro-bg5.log 2>nul
start "Metro Rider" cmd /c "F:\EasyRyde\mobile\apps\rider\node_modules\.bin\expo.cmd start --dev-client --port 8087 > F:\EasyRyde\metro-bg5.log 2>&1"

:wait
timeout /t 2 /nobreak >nul
netstat -an | findstr "0.0.0.0:8087" | findstr "LISTENING" >nul
if errorlevel 1 goto wait

echo Metro is ready on port 8087
