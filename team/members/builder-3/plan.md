---
objective: "Fix PHP version mismatch between CI files"
ticket: "FIX-PHP-VERSION-001"
state: running
priority: "medium"
estimated_hours: 0.5
context_files:
  - .github/workflows/ci.yml
  - .github/workflows/deploy.yml
quality_gates:
  - "Align PHP versions across all CI files to 8.4"
  - "Verify no syntax conflicts with PHP 8.4 features in use"
---

## Acceptance Criteria
- [ ] ci.yml uses PHP 8.4 to match deploy.yml and composer.json requirements
- [ ] No regressions in CI test execution
