@echo off
cd /d F:\EasyRyde\mobile\apps\rider
set PATH=C:\Users\madoc\AppData\Local\nvm\v22.16.0;%PATH%
del /q F:\EasyRyde\metro-bg.log 2>nul
start "Metro" cmd /c ""F:\EasyRyde\mobile\apps\rider\node_modules\.bin\expo.cmd" start --dev-client --port 8090 > "F:\EasyRyde\metro-bg.log" 2>&1"
