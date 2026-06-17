# Plan: Build Rider Debug APK

## BUILD-RIDER-APK-002

### Status
- [x] Generate Hermes bytecode - DONE
- [x] Build Rider debug APK - DONE
- [x] APK file exists at `apps/rider/android/app/build/outputs/apk/debug/app-debug.apk` - DONE (149MB, 2026-06-13 15:41)
- [x] Rider bundle in APK is current generated one - DONE (HBC from 2026-06-13 15:17)
- [~] Rider app renders on emulator without fatal `prototype` error - PARTIAL (app starts, shows "Running main", but then errors with ExpoLocation)

### Issues Found
- `Cannot find native module 'ExpoLocation'` - Bundle references ExpoLocation but native module registration fails at runtime. This is a separate issue from the original `prototype` crash.
