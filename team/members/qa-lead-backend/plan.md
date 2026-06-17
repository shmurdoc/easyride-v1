---
member_id: "qa-lead-backend"
ticket: "GAP-BACKEND-TEST-COVERAGE-001"
priority: "medium"
est_hours: 3
assigned_at: "2026-06-13"
due_by: "2026-06-13"
status: done
lock: false
---

# Plan — qa-lead-backend: Write Missing Controller Tests

## Objective
Write smoke tests for 7 controllers that have no tests: SOSController, FoodDeliveryController, FoodAdminController, ReferralController, ConsentController, KYCController, IncidentsController, DataRetentionController.

## Context
- Backend uses Laravel 11 with Pest PHP testing framework
- Existing tests are in `backend/tests/` — follow their patterns
- Backend API runs on PHP 8.4

## Acceptance Criteria
- [ ] Smoke test for each missing controller (8 total)
- [ ] All tests pass
- [ ] Tests follow existing code patterns (Pest)
- [ ] No regressions to existing tests

## context_files
- backend/tests/
- backend/app/Http/Controllers/
- backend/routes/
- backend/phpunit.xml

## quality_gates
- [ ] All tests pass (`cd backend && php vendor/bin/pest`)
- [ ] Coverage for all 8 missing controllers
- [ ] No regressions
