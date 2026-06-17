---
member_id: "builder-2"
ticket: "FIX-SHARED-CRIT-001"
priority: "critical"
est_hours: 2
assigned_at: "2026-06-15"
due_by: "2026-06-15"
status: done
lock: false
review_required: true
---

# Plan — builder-2: Fix Auth Response Unwrap + Fallback URL

## Objective
Fix CRITICAL auth response format mismatch and HIGH-priority shared package issues found by QA.

## Context from QA
Backend API wraps all responses in `{ success: bool, message: string, data: { ... } }` format. The frontend ApiClient returns the raw JSON, and auth hooks expect `{ user, token }` at the top level — but the backend sends `{ success, message, data: { user, token } }`. This means login never works — user and token are always undefined.

## Tasks

### Task A (CRITICAL): Fix ApiClient response unwrapping ✅
- File: `mobile/packages/shared/src/api/client.ts`
- Added envelope detection after `response.json()`: checks for `success`+`data` keys
- If envelope detected and `success===true`: returns `data.data` (strips envelope)
- If envelope detected and `success===false`: throws ApiError with message from response
- If no envelope: falls through to existing behavior (backward compatible)
- Login POST now correctly extracts `{ user, token }` from data envelope

### Task B (HIGH): Fix fallback URL port ✅
- File: `mobile/packages/shared/src/api/client.ts`
- Changed `'http://localhost:8080/api'` → `'http://localhost:9000/api'`

### Task C (LOW): Gate console.warn with __DEV__ ✅
- Files: `client.ts`, `useAuth.ts`, `useSocket.ts`
- All 10 `console.warn` statements wrapped with `if (__DEV__)`

## Acceptance Criteria
- [x] Auth response unwrapping works: login returns user+token correctly
- [x] Non-wrapped API responses still work (backward compatible)
- [x] Fallback URL uses port 9000
- [x] All console.warn gated behind __DEV__
- [x] `npx tsc --noEmit` passes in packages/shared
- [x] Login curl test succeeds end-to-end

## context_files
- mobile/packages/shared/src/api/client.ts
- mobile/packages/shared/src/hooks/useAuth.ts
- mobile/packages/shared/src/hooks/useSocket.ts
- team/GAPS.md

## quality_gates
- [x] `npx tsc --noEmit` passes in packages/shared
- [x] No `any` types in changed code
- [x] Login works: curl posts to backend and gets user+token
