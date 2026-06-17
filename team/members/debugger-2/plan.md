---
member_id: "debugger-2"
ticket: "FIX-PROTOTYPE-WARNING"
priority: "medium"
est_hours: 2
assigned_at: "2026-06-13"
due_by: "2026-06-13"
status: blocked
lock: false
---

# Plan — debugger-2: Fix `Cannot read property 'prototype' of undefined` Warning

## Objective
Investigate and fix the `TypeError: Cannot read property 'prototype' of undefined` error that appears during app startup. It currently appears only on the admin app (and sometimes driver) but is non-fatal. The goal is to eliminate it entirely.

## Context
- Error appears once during startup in all 3 apps: `TypeError: Cannot read property 'prototype' of undefined, js engine: hermes`
- It's non-fatal — the app continues and renders (appears on a non-critical module path)
- Root cause from earlier investigation: Gradle's auto-bundle generates a different module ordering that puts the error on a critical path (blocking registerRootComponent), while manual bundles put it on a non-critical path
- The error exists in both the Gradle-generated AND manually-generated bundles — suggesting it's a code-level issue, not just ordering
- Likely a version mismatch where a class/function expected to have a `.prototype` property doesn't (e.g., an arrow function or ES6 class used where a constructor function is expected)

## Investigation Steps
1. Read the JS bundle and find the module that references `.prototype` of undefined
2. The bundle is at `apps/admin/android/app/src/main/assets/index.android.bundle`
3. Search for `.prototype` in the bundle and trace back to the source module
4. Use source map if available to map back to original source
5. Identify the actual code causing the issue (likely in `@easyryde/shared` or a third-party dependency)

## Potential Fixes
- If in shared package: fix the source code to handle the undefined case
- If in a third-party dependency: check for an updated version or add a defensive check
- If a transpilation issue: check babel/metro configuration

## Acceptance Criteria
- [ ] Root cause identified (which module/file throws the error)
- [ ] Fix applied to source code
- [ ] New bundle generated and APK rebuilt
- [ ] `prototype` error no longer appears in logcat

## context_files
- mobile/apps/admin/android/app/src/main/assets/index.android.bundle
- mobile/apps/admin/index.js
- mobile/apps/admin/package.json
- mobile/packages/shared/src/
- mobile/metro.config.js (if exists)
- mobile/babel.config.js
- mobile/package.json

## quality_gates
- [ ] App starts without `prototype` error
- [ ] APK builds
- [ ] No regressions in app functionality
