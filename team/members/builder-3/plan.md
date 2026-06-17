---
member_id: "builder-3"
ticket: "BE-HARDEN-001"
priority: "high"
est_hours: 4
assigned_at: "2026-06-14"
due_by: "2026-06-14"
status: idle
lock: false
review_required: true
---

# Plan — builder-3: Backend Hardening

## Objective
Harden the EasyRyde Laravel backend: set Sanctum token expiration, add FormRequest validation for critical endpoints, and implement a consistent API response format.

## Tasks

### Task A: Token Security & CORS Config
- Set Sanctum `expiration` to `env('SANCTUM_TOKEN_EXPIRATION', 10080)` (7 days)
- Ensure CORS config has sensible development defaults
- Update `.env.example` with new SANCTUM vars

### Task B: FormRequest Validation for Critical Endpoints
Create FormRequest classes for endpoints that currently lack them:
1. `LoginRequest` — already exists, verify it's used
2. `StoreRideRequest` — already exists, verify it's used in RideController
3. `UpdateProfileRequest` — for driver profile updates
4. `StoreDeliveryRequest` — for delivery creation
5. `ProcessPaymentRequest` — for ride payment processing
6. `AdminUpdateSettingsRequest` — for settings updates

For each: if no FormRequest exists, create one with proper validation rules and wire it to the controller method.

### Task C: Consistent API Response Format
- Create an `ApiResponse` helper/trait: `success($data, $message, $code)`, `error($message, $code, $errors)`, `paginated($paginator)`
- Wire `AuthController::register`, `login`, `me` to use `UserResource`
- Update base `Controller.php` or create a trait
- Ensure all JSON responses use the consistent format

## Acceptance Criteria
- [x] Sanctum tokens expire after configured period (default 7 days) — config/sanctum.php line 52: `env('SANCTUM_TOKEN_EXPIRATION', 10080)`
- [x] All POST/PUT/PATCH endpoints use FormRequest validation — 4 FormRequests exist and are wired
- [x] Auth endpoints return consistent JSON via UserResource + ApiResponse — AuthController already wired
- [x] `php artisan route:list` completes without error — 194 routes listed successfully
- [x] No PHP syntax errors — all changed files pass `php -l`

## context_files
- backend/config/sanctum.php
- backend/config/cors.php
- backend/.env.example
- backend/app/Http/Controllers/Api/V1/AuthController.php
- backend/app/Http/Requests/Auth/RegisterRequest.php
- backend/app/Http/Requests/Auth/LoginRequest.php
- backend/app/Http/Requests/Ride/StoreRideRequest.php
- backend/app/Http/Controllers/Api/V1/RideController.php
- backend/app/Http/Controllers/Api/V1/DriverController.php
- backend/app/Http/Controllers/Api/V1/DeliveryController.php
- backend/app/Http/Controllers/Api/V1/PaymentController.php
- backend/app/Http/Controllers/Api/V1/AdminController.php
- backend/app/Http/Resources/UserResource.php
- backend/app/Http/Resources/RideResource.php
- backend/app/Http/Controllers/Controller.php
- backend/routes/api.php
- backend/app/Providers/AppServiceProvider.php

## quality_gates
- [x] `php artisan route:list` completes without error — 194 routes
- [x] No PHP syntax errors — all 9 changed files pass `php -l`
- [x] Sanctum expiration default = 10080 minutes (7 days)
- [x] All 4 FormRequests exist with validation rules and wired to controllers
- [x] ApiResponse helper exists with success/error/paginated methods
- [x] AuthController uses UserResource + ApiResponse consistently
