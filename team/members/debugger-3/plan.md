---
objective: "Investigate 68 backend PHPUnit test failures — find root cause"
ticket: "FIX-BACKEND-TEST-FAILURES-001"
state: running
priority: "critical"
estimated_hours: 2
context_files:
  - backend/phpunit.xml
  - backend/tests/
  - backend/app/Services/EscrowService.php
  - backend/tests/Feature/AdminTest.php
  - backend/app/Services/FoodDeliveryService.php
quality_gates:
  - "Run PHPUnit to reproduce failures"
  - "Categorize failures by root cause (env config vs real bug)"
  - "Fix any simple config issues (DB setup, env vars)"
  - "For real bugs: report with file/line and proposed fix"
  - "Verify all tests pass after fixes"
---

## Acceptance Criteria
- [ ] Root cause identified for each failing test
- [ ] Tests categorized: env vs bug
- [ ] Env-config issues fixed
- [ ] Real bugs reported with fix suggestions
