---
member_id: "debugger-1"
ticket: "FIX-RIDER-EXPO-LOCATION"
priority: "high"
est_hours: 1
assigned_at: "2026-06-13"
due_by: "2026-06-13"
status: idle
lock: false
---

# Plan — debugger-1: Fix ExpoLocation Native Module on Rider

## Objective
Investigate and fix `Cannot find native module 'ExpoLocation'` runtime error on rider app. The app starts (shows "Running main") but then fails with this error.

## Context
- Rider APK builds and installs (149 MB)
- App starts but `ExpoLocation` native module not found
- `expo-location@~17.0.0` is in rider's `package.json` and `app.json` (as a plugin)
- `expo-location` exists at `F:\EasyRyde\mobile\node_modules\expo-location\android\` (has native Android code)

## Potential Root Causes
1. `expo-location` not linked in Gradle — check `apps/rider/android/app/build.gradle` for dependency
2. `settings.gradle` missing the module include
3. `ExpoModulesPackage` registration missing
4. Expo prebuild needed — `npx expo prebuild` would regenerate Android project

## Acceptance Criteria
- [ ] Root cause identified
- [ ] Fix applied (surgical — avoid full `npx expo prebuild` if possible to keep debuggableVariants fix)
- [ ] Rider APK rebuilt and re-tested
- [ ] `Cannot find native module 'ExpoLocation'` error gone

## context_files
- mobile/apps/rider/android/app/build.gradle
- mobile/apps/rider/android/app/src/main/assets/index.android.bundle
- mobile/apps/rider/android/app/src/main/AndroidManifest.xml
- mobile/apps/rider/android/settings.gradle
- mobile/apps/rider/android/app/src/main/java/**/MainApplication.kt
- mobile/apps/rider/package.json
- mobile/apps/rider/app.json

## quality_gates
- [ ] Root cause documented
- [ ] Fix does not break existing debuggableVariants fix
- [ ] APK rebuilds and app runs without ExpoLocation error
