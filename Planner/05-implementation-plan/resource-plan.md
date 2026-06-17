# EasyRyde — Resource Plan

**Phase:** 05 — Implementation Plan
**Version:** 1.0.0
**Updated:** 2026-06-17

---

## Team Structure

| Role | Member | Skills | Primary Focus |
|------|--------|--------|---------------|
| **Builder-1** | Mobile Developer (Android/Expo) | React Native, Expo, TypeScript, Maps, Offline-first | Mobile app tasks (E4, E5 food screens) |
| **Builder-2** | Shared/Metro Developer | TypeScript, Socket.io, WebSockets, React Native shared packages | Shared package, socket client, API client (E3, E4 shared) |
| **Builder-3** | Backend Developer (Laravel/PHP) | Laravel 13, PHP 8.4, PostgreSQL, Redis, Payment gateways | Backend tasks (E1, E2, E5 backend, E7) |
| **QA-Lead-Backend** | Backend QA Engineer | PHPUnit, Pest, Mockery, PHPStan | Backend tests (E6 unit + integration) |
| **QA-Lead-Frontend** | Mobile QA Engineer | Detox, Maestro, Appium | Mobile E2E tests (E6) |
| **QA-Lead-Integration** | Integration QA Engineer | Playwright, k6, OWASP ZAP | E2E admin, load, security tests (E6) |
| **Reviewer** | Senior Developer | All stacks | Code review gates after every builder task |
| **Debugger-1** | Bug Fix Engineer (Backend) | Laravel, PHP | Bug fixes found during QA (backend) |
| **Debugger-2** | Bug Fix Engineer (Mobile) | React Native, Expo | Bug fixes found during QA (mobile) |
| **Release Engineer** | DevOps Engineer | Docker, CI/CD, Monitoring, AWS | CI/CD, Docker, deploy, monitoring (E7) |

---

## Task Assignments by Epic

### E1: Production Hardening (40h)

| Task | Hours | Assigned | Reviewer |
|------|-------|----------|----------|
| E1-T1: FormRequest Validation | 16 | builder-3 | reviewer |
| E1-T2: .gitignore & Secrets | 4 | builder-3 | reviewer |
| E1-T3: .env.example | 4 | builder-3 | reviewer |
| E1-T4: Rate Limiting | 4 | builder-3 | reviewer |
| E1-T5: PII Encryption | 6 | builder-3 | reviewer |
| E1-T6: Sentry Config | 6 | builder-3 | reviewer |

### E2: Payment Integration (60h)

| Task | Hours | Assigned | Reviewer |
|------|-------|----------|----------|
| E2-T1: Stripe | 12 | builder-3 | reviewer |
| E2-T2: PayFast ITN | 10 | builder-3 | reviewer |
| E2-T3: Ozow | 10 | builder-3 | reviewer |
| E2-T4: Escrow | 8 | builder-3 | reviewer |
| E2-T5: Cash Reconciliation | 6 | builder-3 | reviewer |
| E2-T6: Refund Workflow | 6 | builder-3 | reviewer |
| E2-T7: Driver Payout Engine | 8 | builder-3 | reviewer |

### E3: Real-Time & Notifications (50h)

| Task | Hours | Assigned | Reviewer |
|------|-------|----------|----------|
| E3-T1: FCM Push | 12 | builder-2 | reviewer |
| E3-T2: GPS Tracking | 12 | builder-2 | reviewer |
| E3-T3: SMS Notifications | 6 | builder-3 | reviewer |
| E3-T4: Email Notifications | 6 | builder-3 | reviewer |
| E3-T5: Notification Center | 6 | builder-2 | reviewer |
| E3-T6: SOS System | 8 | builder-2 | reviewer |

### E4: Mobile UX & Edge Cases (80h)

| Task | Hours | Assigned | Reviewer |
|------|-------|----------|----------|
| E4-T1: Offline Mode | 12 | builder-1 | reviewer |
| E4-T2: Route Polylines | 8 | builder-1 | reviewer |
| E4-T3: Animated Driver Marker | 6 | builder-1 | reviewer |
| E4-T4: Deep Linking | 6 | builder-1 | reviewer |
| E4-T5: Pull-to-Refresh | 4 | builder-1 | reviewer |
| E4-T6: Form Validation | 4 | builder-1 | reviewer |
| E4-T7: Loading/Error/Empty | 10 | builder-1 | reviewer |
| E4-T8: Scheduled Rides UI | 8 | builder-1 | reviewer |
| E4-T9: Earnings Charts | 8 | builder-1 | reviewer |
| E4-T10: Biometrics | 6 | builder-1 | reviewer |
| Shared package (API client, socket, auth) | 8 | builder-2 | reviewer |

### E5: Admin Dashboard & Food (60h)

| Task | Hours | Assigned | Reviewer |
|------|-------|----------|----------|
| E5-T1: Live Dashboard | 12 | builder-3 | reviewer |
| E5-T2: Driver Documents | 10 | builder-3 | reviewer |
| E5-T3: Pricing Editor | 8 | builder-3 | reviewer |
| E5-T4: Restaurant CRUD | 8 | builder-1 | reviewer |
| E5-T5: Food Order Management | 10 | builder-1 | reviewer |
| E5-T6: Audit Log Viewer | 6 | builder-3 | reviewer |
| E5-T7: Driver Payout Panel | 6 | builder-3 | reviewer |

### E6: Testing & QA (70h)

| Task | Hours | Assigned | Reviewer |
|------|-------|----------|----------|
| E6-T1: Unit Tests | 20 | qa-lead-backend | reviewer |
| E6-T2: Integration Tests | 16 | qa-lead-backend | reviewer |
| E6-T3: Admin E2E Tests | 12 | qa-lead-integration | reviewer |
| E6-T4: Mobile E2E Tests | 8 | qa-lead-frontend | reviewer |
| E6-T5: Load Tests | 8 | qa-lead-integration | reviewer |
| E6-T6: Security Tests | 6 | qa-lead-integration | reviewer |

### E7: Deploy & Operations (50h)

| Task | Hours | Assigned | Reviewer |
|------|-------|----------|----------|
| E7-T1: Docker Production | 12 | release-engineer | reviewer |
| E7-T2: Monitoring Stack | 12 | release-engineer | reviewer |
| E7-T3: DB Backup | 8 | release-engineer | reviewer |
| E7-T4: CI/CD Pipeline | 12 | release-engineer | reviewer |
| E7-T5: Zero-Downtime Deploy | 6 | release-engineer | reviewer |

---

## Developer Load by Week

### builder-1 (Mobile — Android/Expo)

| Week | Tasks | Hours |
|------|-------|-------|
| W1   | — | 0 |
| W2   | — | 0 |
| W3   | — | 0 |
| W4   | E4-T1 (12h), E4-T2 (8h) | 20 |
| W5   | E4-T3 (6h), E4-T4 (6h), E4-T5 (4h) | 16 |
| W6   | E4-T6 (4h), E4-T7 (10h), E4-T8 (8h) | 22 |
| W7   | E4-T9 (8h), E4-T10 (6h), E5-T4 (8h), E5-T5 (10h) | 32 |
| W8   | Bug fixes from QA | var |
| **Total** | | **90** |

### builder-2 (Shared/Metro)

| Week | Tasks | Hours |
|------|-------|-------|
| W1   | — | 0 |
| W2   | E3-T1 (12h) | 12 |
| W3   | E3-T2 (12h) | 12 |
| W4   | E3-T5 (6h), E3-T6 (8h), Shared pkg (8h) | 22 |
| W5   | Bug fixes from QA | var |
| **Total** | | **54** |

### builder-3 (Backend — Laravel/PHP)

| Week | Tasks | Hours |
|------|-------|-------|
| W1   | E1-T1 (16h), E1-T2 (4h), E1-T3 (4h), E1-T4 (4h), E1-T5 (6h), E1-T6 (6h) | 40 |
| W2   | E2-T1 (12h), E2-T2 (10h), E2-T3 (10h), E2-T4 (8h) | 40 |
| W3   | E2-T5 (6h), E2-T6 (6h), E2-T7 (8h), E3-T3 (6h), E3-T4 (6h) | 32 |
| W4   | E5-T1 (12h) | 12 |
| W5   | E5-T2 (10h), E5-T3 (8h) | 18 |
| W6   | E5-T6 (6h), E5-T7 (6h), assist E5-T1 | 12 |
| W7   | Bug fixes, assist deploy prep | var |
| W8   | Support QA, bug fixes | var |
| **Total** | | **154+** |

### release-engineer (DevOps)

| Week | Tasks | Hours |
|------|-------|-------|
| W1   | — | 0 |
| W2   | — | 0 |
| W3   | — | 0 |
| W4   | — | 0 |
| W5   | E7-T1 (12h) | 12 |
| W6   | E7-T2 (12h), E7-T3 (8h) | 20 |
| W7   | E7-T4 (12h) | 12 |
| W8   | E7-T5 (6h), finalize | 6 |
| **Total** | | **50** |

### QA Team

| Week | qa-lead-backend | qa-lead-frontend | qa-lead-integration |
|------|-----------------|------------------|---------------------|
| W1   | E6 planning (4h) | E6 planning (2h) | E6 planning (2h) |
| W2   | E6-T1 start (10h) | — | — |
| W3   | E6-T1 (10h), E6-T2 start (8h) | — | — |
| W4   | E6-T2 (8h) | — | — |
| W5   | Debug + retest | — | E6-T3 (12h) |
| W6   | Debug + retest | E6-T4 (8h) | E6-T5 (8h) |
| W7   | Debug + retest | Debug | E6-T6 (6h), final E2E |
| W8   | Final regression | Final smoke | Final load + security |
| **Total** | **36h** | **10h** | **28h** |

---

## Reviewer Allocation

Every merge-ready branch is reviewed by `reviewer`. Estimated review load:

| Epic | Tasks | Est. Review Hours |
|------|-------|-------------------|
| E1 | 6 | 8 |
| E2 | 7 | 12 |
| E3 | 6 | 10 |
| E4 | 11 | 16 |
| E5 | 7 | 12 |
| E6 | 6 | 8 |
| E7 | 5 | 10 |
| **Total** | **48** | **76** |

Reviewer must be available within 4 hours of PR creation to avoid blocking.

---

## Debugger Allocation

Debuggers are **on-call** during QA phases. Estimated allocation:

| Phase | Debugger-1 (Backend) | Debugger-2 (Mobile) |
|-------|---------------------|---------------------|
| W2-W3 (E2 QA) | 8h | 0h |
| W4-W5 (E3/E4 QA) | 4h | 12h |
| W6-W7 (E5 QA) | 8h | 8h |
| W8-W10 (E6/E7 QA) | 12h | 8h |
| **Total** | **32h** | **28h** |

---

## Communication Channels

| Channel | Purpose | Participants |
|---------|---------|-------------|
| **Daily Standup** | 15min, what was done / blocked / next | All builders + QA |
| **PR Review Queue** | GitHub PRs tagged `needs-review` | reviewer + author |
| **Bug Tracker** | GitHub Issues with `bug` label | QA + debuggers |
| **Slack #easyryde-dev** | Async communication | All team |
| **Slack #easyryde-alerts** | CI/CD failures, production issues | All team |
| **Weekly Sync** | Milestone progress, blockers, decisions | Full team |

---

## Onboarding Checklist

For any new team member joining mid-project:

- [ ] Read `MASTER_PROJECT_PLAN.md` (architecture overview)
- [ ] Read `Planner/README.md` (plan structure)
- [ ] Read `Planner/03-system-design/*` (system design documents)
- [ ] Set up local development environment (docker-compose up)
- [ ] Run test suite: `php artisan test`
- [ ] Review 3 recently merged PRs to understand code style
- [ ] Pair with existing builder for first task

---

*End of resource-plan.md*
