---
member_id: "release-engineer"
ticket: "GAP-CI-CD-001"
priority: "high"
est_hours: 3
assigned_at: "2026-06-13"
due_by: "2026-06-13"
status: idle
lock: false
---

# Plan — release-engineer: Set up CI/CD Pipeline

## Objective
Create GitHub Actions CI pipeline for backend tests + Android builds. Runs on every PR to main.

## Context
- No CI/CD pipeline exists
- Backend: PHP 8.4 / Laravel 11 with Pest tests
- Mobile: Expo SDK 51 / React Native 0.74, Gradle 8.6
- Android builds need JDK 21 + Android SDK

## Acceptance Criteria
- [ ] `backend/.github/workflows/ci.yml` (or root `.github/workflows/ci.yml`) created
- [ ] Backend tests run on every push/PR to main
- [ ] Android assembleDebug runs on every push/PR to main
- [ ] Pipeline passes on current codebase

## context_files
- backend/.github/ (if exists)
- .github/ (root level, if exists)
- backend/phpunit.xml
- backend/composer.json
- mobile/package.json

## quality_gates
- [ ] Workflow file is valid YAML
- [ ] Workflow references correct PHP/Node/Java versions
- [ ] Workflow would pass on current code
