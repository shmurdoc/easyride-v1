@echo off
REM Run backend tests with code coverage using PHP 8.4.22 NTS VS17
cd /d "%~dp0"
C:\php84\php.exe artisan config:clear --ansi @no_additional_args
C:\php84\php.exe artisan test --coverage
