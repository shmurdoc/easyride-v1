# EasyRyde — Effort Estimates

**Phase:** 05 — Implementation Plan
**Version:** 1.0.0
**Updated:** 2026-06-17

---

## Estimation Method

All estimates are **bottom-up** — derived from individual implementation tasks (detailed-tasks.md) and summed to epic totals. Estimates include development time only; code review adds ~20% overhead per task.

**Assumptions:**
- Developer is familiar with Laravel 13, Expo RN, Socket.io
- Existing codebase compiles and runs
- No major architectural changes beyond what's specified
- Third-party API keys and accounts are available

---

## Epic E1: Production Hardening — 40h total

| Task ID | Task Name | Est. Hours | Dependencies | Assigned To |
|---------|-----------|-----------|--------------|-------------|
| E1-T1 | Create FormRequest Validation Classes | 16 | — | builder-3 |
| E1-T2 | Harden .gitignore and Remove Secrets | 4 | — | builder-3 |
| E1-T3 | Complete .env.example and Add Missing Keys | 4 | E1-T2 | builder-3 |
| E1-T4 | Wire Auth Rate Limiting | 4 | E1-T1 | builder-3 |
| E1-T5 | Encrypt PII Columns | 6 | E1-T1 | builder-3 |
| E1-T6 | Configure Sentry | 6 | E1-T3 | builder-3 |
| **E1 Total** | | **40** | | |

---

## Epic E2: Payment Integration — 60h total

| Task ID | Task Name | Est. Hours | Dependencies | Assigned To |
|---------|-----------|-----------|--------------|-------------|
| E2-T1 | Wire Stripe Integration | 12 | E1-T1, E1-T3 | builder-3 |
| E2-T2 | Wire PayFast ITN | 10 | E1-T1, E1-T3 | builder-3 |
| E2-T3 | Wire Ozow Integration | 10 | E1-T1, E1-T3 | builder-3 |
| E2-T4 | Implement Escrow System | 8 | E2-T1, E2-T2, E2-T3 | builder-3 |
| E2-T5 | Implement Cash Reconciliation | 6 | E1-T1 | builder-3 |
| E2-T6 | Implement Refund Workflow | 6 | E2-T1, E2-T2, E2-T3 | builder-3 |
| E2-T7 | Implement Driver Payout Engine | 8 | E2-T5 | builder-3 |
| **E2 Total** | | **60** | | |

---

## Epic E3: Real-Time & Notifications — 50h total

| Task ID | Task Name | Est. Hours | Dependencies | Assigned To |
|---------|-----------|-----------|--------------|-------------|
| E3-T1 | Wire FCM Push Notifications | 12 | E1-T1, E1-T3 | builder-2 |
| E3-T2 | Implement Background GPS Tracking | 12 | — | builder-2 |
| E3-T3 | Wire SMS Notifications | 6 | E1-T3 | builder-3 |
| E3-T4 | Wire Email Notifications | 6 | E1-T3 | builder-3 |
| E3-T5 | In-App Notification Center | 6 | E3-T1 | builder-2 |
| E3-T6 | SOS Alert System | 8 | E3-T1, E3-T3, E3-T4 | builder-2 |
| **E3 Total** | | **50** | | |

---

## Epic E4: Mobile UX & Edge Cases — 80h total

| Task ID | Task Name | Est. Hours | Dependencies | Assigned To |
|---------|-----------|-----------|--------------|-------------|
| E4-T1 | Offline Mode | 12 | — | builder-1 |
| E4-T2 | Route Polyline Rendering | 8 | — | builder-1 |
| E4-T3 | Animated Driver Marker | 6 | E3-T2 | builder-1 |
| E4-T4 | Deep Linking | 6 | — | builder-1 |
| E4-T5 | Pull-to-Refresh on Lists | 4 | E3-T5 | builder-1 |
| E4-T6 | Form Validation Feedback | 4 | — | builder-1 |
| E4-T7 | Loading/Error/Empty States | 10 | — | builder-1 |
| E4-T8 | Scheduled Rides UI | 8 | E3-T1 | builder-1 |
| E4-T9 | Driver Earnings Charts | 8 | — | builder-1 |
| E4-T10 | Biometric Authentication | 6 | — | builder-1 |
| Shared package work (API client, socket client) | 8 | — | builder-2 |
| **E4 Total** | | **80** | | |

---

## Epic E5: Admin Dashboard & Food — 60h total

| Task ID | Task Name | Est. Hours | Dependencies | Assigned To |
|---------|-----------|-----------|--------------|-------------|
| E5-T1 | Live Real-Time Dashboard | 12 | E3-T6 | builder-3 |
| E5-T2 | Driver Document Review | 10 | — | builder-3 |
| E5-T3 | Pricing Editor | 8 | E1-T1 | builder-3 |
| E5-T4 | Restaurant Management CRUD | 8 | — | builder-1 |
| E5-T5 | Food Order Management | 10 | E5-T4, E3-T1, E3-T2 | builder-1 |
| E5-T6 | Audit Log Viewer | 6 | — | builder-3 |
| E5-T7 | Driver Payout Panel | 6 | E2-T7 | builder-3 |
| **E5 Total** | | **60** | | |

---

## Epic E6: Testing & QA — 70h total

| Task ID | Task Name | Est. Hours | Dependencies | Assigned To |
|---------|-----------|-----------|--------------|-------------|
| E6-T1 | Unit Tests (16 test files) | 20 | Services exist | qa-lead-backend |
| E6-T2 | Integration Tests (16 test files) | 16 | Endpoints exist | qa-lead-backend |
| E6-T3 | Admin E2E Tests (10 Playwright specs) | 12 | E5 complete | qa-lead-integration |
| E6-T4 | Mobile E2E Smoke Tests (3 suites) | 8 | E4 complete | qa-lead-frontend |
| E6-T5 | Load Tests (6 k6 scenarios) | 8 | E7.1 staged env | qa-lead-integration |
| E6-T6 | Security Tests (6 suites) | 6 | E1.4 rate limits | qa-lead-integration |
| **E6 Total** | | **70** | | |

---

## Epic E7: Deploy & Operations — 50h total

| Task ID | Task Name | Est. Hours | Dependencies | Assigned To |
|---------|-----------|-----------|--------------|-------------|
| E7-T1 | Docker Production Config | 12 | — | release-engineer |
| E7-T2 | Monitoring Stack | 12 | E1-T6, E7-T1 | release-engineer |
| E7-T3 | Database Backup Automation | 8 | E7-T1 | release-engineer |
| E7-T4 | CI/CD Pipeline | 12 | E7-T1 | release-engineer |
| E7-T5 | Zero-Downtime Deployment | 6 | E7-T1, E7-T4 | release-engineer |
| **E7 Total** | | **50** | | |

---

## Summary Totals

| Epic | Hours | % of Total |
|------|-------|-----------|
| E1: Production Hardening | 40 | 9.8% |
| E2: Payment Integration | 60 | 14.6% |
| E3: Real-Time & Notifications | 50 | 12.2% |
| E4: Mobile UX & Edge Cases | 80 | 19.5% |
| E5: Admin Dashboard & Food | 60 | 14.6% |
| E6: Testing & QA | 70 | 17.1% |
| E7: Deploy & Operations | 50 | 12.2% |
| **Grand Total** | **410** | **100%** |

### Buffer Recommendation

| Buffer Type | Hours | Purpose |
|-------------|-------|---------|
| Code Review (20%) | 82 | Review gates after each task |
| Bug Fixing (15%) | 62 | Issues found during QA |
| Integration (10%) | 41 | Cross-team coordination |
| **Total Buffer** | **185** | |

**Estimate with buffer: 410 + 185 = 595 hours**

---

## Resource Loading

| Week | Track A (builder-3) | Track B (builder-2) | Track C (builder-1) |
|------|---------------------|---------------------|---------------------|
| W1   | 40h (E1)            | 0h                  | 0h                  |
| W2   | 40h (E2)            | 18h (E3)            | 0h                  |
| W3   | 20h (E2)            | 20h (E3)            | 0h                  |
| W4   | 12h (E3)            | 12h (E3, E4 shared) | 16h (E4)            |
| W5   | 24h (E5)            | 0h                  | 16h (E4)            |
| W6   | 24h (E5)            | 0h                  | 20h (E4)            |
| W7   | 12h (E5)            | 0h                  | 28h (E4)            |
| W8   | 0h                  | 0h                  | 0h (QA focus)       |
| W9   | 18h (E7)            | 0h                  | 0h                  |
| W10  | 12h (E7)            | 0h                  | 0h                  |

**Peak load:** builder-1 at 28h/week (W7), builder-3 at 40h/week (W1). All within normal capacity.

---

*End of effort-estimates.md*
