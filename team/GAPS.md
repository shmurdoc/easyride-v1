---
project: "EasyRyde"
purpose: "Gap tracking — EasyRyde"
last_updated: "2026-06-13"
updated_by: "Leader"
---

# Gap Tracker — EasyRyde

## Open Gaps

_(none — all gaps closed)_

## Closed Gaps

| ID | Severity | Resolution |
|----|----------|------------|
| GAP-BUILD-MOBILE-001 | medium | Already compatible — expo-task-manager@12.0.6 works with installed expo-modules-core |
| GAP-BUILD-MOBILE-002 | medium | Already fixed — NDK 27.1.12297006 in use with full toolchain |
| GAP-TYPECHECK-001 | low | Already fixed — @types/react-native added as devDependency; `tsc --noEmit` exits 0 |
| GAP-BACKEND-TEST-COVERAGE-001 | medium | 39 tests written across 6 controller files, all passing |
| GAP-CI-CD-001 | high | `.github/workflows/ci.yml` created with backend-tests + android-build jobs |
| GAP-SECRETS-001 | critical | .env never tracked in git; APP_KEY rotated; .gitignore confirmed |
| QA-FRONTEND-001 | critical | **FIXED** — ApiClient now unwraps { success, data: { ... } } envelope in client.ts |
| QA-FRONTEND-002 | high | **FIXED** — .env files created for all 3 apps pointing to localhost:9000 |
| QA-FRONTEND-003 | high | **FIXED** — Receipt download URL no longer has double /v1/ prefix |
| QA-FRONTEND-004 | high | **FIXED** — Payment method IDs use hardcoded map instead of slug generation |
| QA-FRONTEND-005 | high | **FIXED** — ApiClient fallback URL changed from 8080 to 9000 |
| QA-FRONTEND-006 | medium | **FIXED** — ListEmptyComponent added to all 4 FlatLists |
| QA-FRONTEND-007 | medium | **FIXED** — RefreshControl added to all 4 list screens |
| QA-FRONTEND-008 | medium | **FIXED** — Separate depositAmount and withdrawAmount state variables |
| QA-FRONTEND-010 | low | **FIXED** — Email regex validation added to all 3 login forms |
| QA-FRONTEND-011 | low | **FIXED** — All console.warn gated behind __DEV__ flag |
| QA-FRONTEND-014 | low | **FIXED** — SettingsScreen inputs now editable with save functionality |
| QA-FRONTEND-015 | low | **FIXED** — Object.entries guarded with type check |
| QA-FRONTEND-009 | medium | **FIXED** — EXPO_PUBLIC_SOCKET_URL added to admin .env and .env.example |
| QA-FRONTEND-013 | low | **FIXED** — Navigation types created in shared/src/types/navigation.ts with typed params |
| QA-FRONTEND-016 | low | **FIXED** — graphql + wonka removed from rider package.json |
| QA-FRONTEND-012 | low | **FIXED** — i18n system created: en.ts (419 keys), useTranslation hook, applied to login/register screens + shared components (SplashScreen, ErrorState, ErrorBoundary) |
| QA-INTEGRATION-005 | low | **FIXED** — pytest.ini, requirements.txt, test_api_routes.py created; 2 tests passing |
| QA-INTEGRATION-001 | high | **FIXED** — ci.yml android-build uses matrix strategy with correct gradlew path |
| QA-INTEGRATION-002 | critical | **FIXED** — HealthCheckController now uses Redis::llen() instead of Redis::connection()->queue() |
| QA-INTEGRATION-003 | medium | **FIXED** — ci.yml now builds all 3 APKs (driver, rider, admin) via matrix strategy |
| QA-INTEGRATION-004 | low | **FIXED** — deploy.yml no longer uses deprecated --no-suggest flag |
