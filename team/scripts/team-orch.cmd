@echo off
setlocal enabledelayedexpansion
set SCRIPTS_DIR=%~dp0
if "%1"=="" goto :help
if /i "%1"=="validate" goto :validate
if /i "%1"=="enforce" goto :enforce
if /i "%1"=="recover" goto :recover
echo Unknown command: %1
echo Usage: team-orch validate^|enforce^|recover
exit /b 1

:help
echo team-orch -- Team Orchestration CLI
echo.
echo Usage:
echo   team-orch validate          Validate all team file formats
echo   team-orch enforce           Run enforcement check (heartbeat + consistency)
echo   team-orch recover           Recover crashed/stale sessions
echo.
echo Examples:
echo   team-orch validate
echo   team-orch enforce
echo   team-orch recover
exit /b 0

:validate
node "%SCRIPTS_DIR%validate.mjs"
exit /b %ERRORLEVEL%

:enforce
node "%SCRIPTS_DIR%enforce.mjs"
exit /b %ERRORLEVEL%

:recover
node "%SCRIPTS_DIR%recover.mjs"
exit /b %ERRORLEVEL%
