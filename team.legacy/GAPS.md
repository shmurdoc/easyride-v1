---
project: "EasyRyde"
purpose: "Gap tracking — EasyRyde production readiness"
last_updated: "2026-06-08"
updated_by: "Leader"
---

# Gap Tracker — EasyRyde

## Open Gaps

### GAP-ANDROID-BUILD-001: Rider + Admin APKs not built
- **Severity**: high
- **Status**: open
- **Assign Type**: builder
- **Owner**: builder-1
- **Description**: Only the driver app has a prebuilt android/ directory. Rider and admin apps need `npx expo prebuild --platform android --clean` to generate native android/ directories, then `./gradlew assembleDebug` to produce APKs.
- **Acceptance**: APK files exist at `mobile/apps/rider/android/app/build/outputs/apk/debug/` and `mobile/apps/admin/android/app/build/outputs/apk/debug/`
- **Resolution**: Run prebuild for rider and admin, then assembleDebug for each.

### GAP-METRO-001: Metro dev server not reliably serving JS
- **Severity**: high
- **Status**: open
- **Assign Type**: builder
- **Owner**: builder-2
- **Description**: Port 8081 was occupied by stale node process. Must kill stale processes, verify adb reverse, start Expo dev-client, confirm JS bundle loads on emulator.
- **Acceptance**: Metro running on port 8081, emulator loads JS bundle, app renders.
- **Resolution**: Kill node processes on 8081, run `expo.cmd start --dev-client` in driver app, verify adb reverse.

### GAP-DESIGN-SYSTEM-001: Shared design system built, screens refactored
- **Severity**: medium
- **Status**: resolved
- **Owner**: Leader
- **Resolution**: Shared design tokens (dark theme), 25+ components, all 31 screens refactored. Resolved 2026-06-08.

### GAP-BACKEND-TESTS-001: 41/41 tests passing
- **Severity**: high
- **Status**: resolved
- **Owner**: Leader
- **Resolution**: Fixed migration syntax, PG-driver guard, duplicate columns, RefreshDatabase, surge assertion. Resolved 2026-06-08.

### GAP-TEAM-READY-001: Team repurposed for EasyRyde
- **Severity**: high
- **Status**: resolved
- **Owner**: Leader
- **Resolution**: team.config.json, DASHBOARD.md, GAPS.md, leader files updated for EasyRyde paths. Resolved 2026-06-08.

### GAP-BACKEND-TEST-COVERAGE-001: Missing controller tests (SOS, Food, Referral, Consent, KYC, Incidents, DataRetention)
- **Severity**: medium
- **Status**: open
- **Assign Type**: qa-lead-backend
- **Description**: 17 test files exist for 26 controllers. 7 controllers have no tests: SOSController, FoodDeliveryController, FoodAdminController, ReferralController, ConsentController, KYCController, IncidentsController, DataRetentionController.
- **Acceptance**: At least smoke tests for each missing controller. All pass.

### GAP-CI-CD-001: No GitHub Actions pipeline
- **Severity**: high
- **Status**: open
- **Assign Type**: release-engineer
- **Description**: No CI pipeline for backend tests or Android builds. Need .github/workflows/ci.yml.
- **Acceptance**: PRs run backend tests + Android assembleDebug.

### GAP-TYPECHECK-001: Shared package missing react-native types
- **Severity**: low
- **Status**: open
- **Assign Type**: builder
- **Owner**: builder-2
- **Description**: `packages/shared` can't typecheck independently because @types/react-native is missing as devDependency.
- **Acceptance**: `npx tsc --noEmit` in shared package exits 0.

### GAP-SECRETS-001: APP_KEY leaked in git
- **Severity**: critical
- **Status**: open
- **Assign Type**: release-engineer
- **Description**: `APP_KEY=base64:/GIi+EwBYPEgIUmBFDelvJRGQiEfKNEQ32bDKmbGuHQ=` committed in backend/.env at commit cd729cd. Must rotate and remove from git history.
- **Acceptance**: New APP_KEY generated, old one invalidated, .env removed from git tracking.
