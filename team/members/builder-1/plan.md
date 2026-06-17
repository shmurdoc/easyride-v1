---
member_id: "builder-1"
ticket: "FIX-APPS-HIGH-001"
priority: "high"
est_hours: 3
assigned_at: "2026-06-15"
due_by: "2026-06-15"
status: done
lock: false
review_required: true
---

# Plan — builder-1: Fix App-Level QA Issues

## Objective
Fix HIGH and MEDIUM priority bugs found by QA across Rider, Driver, and Admin apps.

## Context from QA
Full QA review found 16 issues total. This task covers the app-level fixes (shared package fixes are handled by builder-2).

## Tasks

### Task A (HIGH): Fix double /v1/ prefix in receipt download
- File: `mobile/apps/rider/screens/RideHistoryScreen.tsx`
- Line ~50: `api.get('/v1/rides/' + item.id + '/receipt')` → `api.get('/rides/' + item.id + '/receipt')`
- ApiClient already prepends /v1/ to all requests

### Task B (HIGH): Fix Ozow EFT payment method ID
- File: `mobile/apps/rider/screens/PaymentScreen.tsx`
- Line ~32: Payment method ID generation from name produces 'ozoweft' instead of 'ozow'
- Fix: use a lookup map or correct the slug generation

### Task C (MEDIUM): Add ListEmptyComponent to FlatLists
- Files:
  - `mobile/apps/admin/screens/UsersScreen.tsx`
  - `mobile/apps/admin/screens/RidesScreen.tsx`
  - `mobile/apps/driver/screens/TripHistoryScreen.tsx`
  - `mobile/apps/driver/screens/EarningsScreen.tsx`
- Add a `<ListEmptyComponent>` that shows "No data available" or similar message

### Task D (MEDIUM): Add pull-to-refresh to list screens
- Files:
  - `mobile/apps/driver/screens/TripHistoryScreen.tsx`
  - `mobile/apps/admin/screens/UsersScreen.tsx`
  - `mobile/apps/admin/screens/DriversScreen.tsx`
  - `mobile/apps/admin/screens/RidesScreen.tsx`
- Add RefreshControl to FlatLists

### Task E (MEDIUM): Fix WalletScreen shared state
- File: `mobile/apps/rider/screens/WalletScreen.tsx`
- Deposit and Withdraw modals share `depositAmount` state — use separate state variables

### Task F (LOW): Add email validation to login forms
- Files:
  - `mobile/apps/rider/screens/LoginScreen.tsx`
  - `mobile/apps/driver/screens/LoginScreen.tsx`
  - `mobile/apps/admin/screens/LoginScreen.tsx`
- Use existing `validateEmail` from shared utils

### Task G (LOW): Fix Admin SettingsScreen
- File: `mobile/apps/admin/screens/SettingsScreen.tsx`
- Make inputs editable with save functionality (not just read-only display)
- Add safe check for Object.entries on non-object data

## Acceptance Criteria
- [ ] Receipt download URL fixed (no more double /v1/)
- [ ] Ozow EFT payment method ID matches constant
- [ ] All FlatLists have ListEmptyComponent
- [ ] Pull-to-refresh on all list screens
- [ ] Wallet deposit/withdraw use separate state
- [ ] Login forms validate email format
- [ ] SettingsScreen inputs editable
- [ ] `npx tsc --noEmit` passes for all 3 apps

## context_files
- mobile/apps/rider/screens/RideHistoryScreen.tsx
- mobile/apps/rider/screens/PaymentScreen.tsx
- mobile/apps/rider/screens/WalletScreen.tsx
- mobile/apps/rider/screens/LoginScreen.tsx
- mobile/apps/driver/screens/LoginScreen.tsx
- mobile/apps/driver/screens/TripHistoryScreen.tsx
- mobile/apps/driver/screens/EarningsScreen.tsx
- mobile/apps/admin/screens/LoginScreen.tsx
- mobile/apps/admin/screens/UsersScreen.tsx
- mobile/apps/admin/screens/RidesScreen.tsx
- mobile/apps/admin/screens/DriversScreen.tsx
- mobile/apps/admin/screens/SettingsScreen.tsx
- team/GAPS.md

## quality_gates
- [ ] `npx tsc --noEmit` passes for all 3 apps
- [ ] No silent catch blocks
- [ ] No console.log in production code
