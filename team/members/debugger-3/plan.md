---
member_id: "debugger-3"
ticket: "GAP-TYPECHECK-001"
priority: "low"
est_hours: 1
assigned_at: "2026-06-13"
due_by: "2026-06-13"
status: idle
lock: false
---

# Plan — debugger-3: Fix Shared Package TypeScript Types

## Objective
Fix `packages/shared` TypeScript typecheck so `npx tsc --noEmit` exits 0 by adding missing `@types/react-native` as devDependency.

## Context
- `packages/shared` can't typecheck independently because `@types/react-native` is missing as devDependency
- The apps themselves have it (inherited from Expo SDK 51)

## Steps
1. Run `npx tsc --noEmit` in `mobile/packages/shared` to see the current errors
2. Check what types are missing
3. Add missing `@types/react-native` (or other missing `@types/*`) to `mobile/packages/shared/package.json` devDependencies
4. Run `npx tsc --noEmit` again — confirm 0 errors

## Acceptance Criteria
- [ ] `npx tsc --noEmit` in `packages/shared` exits 0
- [ ] Types added as devDependencies only (not dependencies)

## context_files
- mobile/packages/shared/package.json
- mobile/packages/shared/tsconfig.json

## quality_gates
- [ ] `npx tsc --noEmit` in shared package exits 0
