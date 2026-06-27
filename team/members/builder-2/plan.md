---
objective: "Fix critical API contract mismatches between frontend and backend"
ticket: "FIX-API-CONTRACT-CRIT-001"
state: running
priority: "critical"
estimated_hours: 3
context_files:
  - mobile/packages/shared/src/api/index.ts
  - mobile/packages/shared/src/api/client.ts
  - backend/routes/api.php
  - backend/app/Http/Controllers/Api/V1/AuthController.php
  - backend/app/Http/Controllers/Api/V1/RideController.php
  - backend/app/Http/Controllers/Api/V1/DriverController.php
  - backend/app/Http/Controllers/Api/V1/AdminController.php
  - backend/app/Http/Controllers/Api/V1/PaymentController.php
quality_gates:
  - "Fix reports URL prefix: change frontend calls from /reports/* to /admin/reports/*"
  - "Fix auth/me response: update frontend to handle {user: User} envelope or change backend"
  - "Fix ride create response: handle {ride: Ride} envelope or change backend"
  - "Add PUT /drivers/vehicle backend route or change frontend to POST"
  - "Fix cancel field name: change frontend from 'reason' to 'cancellation_reason'"
  - "Fix payment processRide response handling"
  - "Verify all fixes don't break existing tests"
---

## Acceptance Criteria
- [ ] Reports API calls route to correct backend URLs
- [ ] auth.me() returns correctly-shaped user data
- [ ] rides.create() returns correctly-shaped ride data
- [ ] drivers.updateVehicle() doesn't 404
- [ ] rides.cancel() sends correct field name
- [ ] payments.processRide() handles response format
- [ ] All backend PHPUnit tests still pass
