---
objective: "Fix route security gaps — admin/stats role middleware + driver/drivers naming"
ticket: "FIX-ROUTE-GAPS-001"
state: done
priority: "high"
estimated_hours: 1
actual_hours: 0.25
context_files:
  - backend/routes/api.php
  - backend/app/Http/Controllers/Api/V1/AdminController.php
  - backend/app/Http/Controllers/Api/V1/DriverController.php
  - backend/tests/Feature/
quality_gates:
  - "Add role:admin|super-admin middleware to admin/stats route"
  - "Fix driver location route naming consistency"
  - "Run PHPUnit to verify no regressions"
---

## Acceptance Criteria
- [x] admin/stats route has proper role middleware
- [x] driver/drivers naming made consistent (change singular to plural)
- [x] No test regressions

## Summary
Both fixes were already applied in the working tree (uncommitted changes):
1. **admin/stats** — added `->middleware('role:admin|super-admin')` (api.php:77)
2. **drivers/location** — renamed from `driver/location` → `drivers/location` (api.php:110)
3. **mobile client** — updated endpoint to `drivers/location` (api/index.ts:102)
4. **DriverController** — `updateLocation` method already added with form request
