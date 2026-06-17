# EasyRyde — Milestones

**Phase:** 04 — Work Breakdown
**Version:** 1.0.0
**Updated:** 2026-06-17

---

## Milestone Overview

| # | Milestone | Target Week | Est. Effort | Gate Criteria |
|---|-----------|-------------|-------------|---------------|
| M1 | **Secure Foundation** | End W1 | 40h | All tests pass, no secrets in repo, .env complete, rate limiting active, Sentry wired |
| M2 | **Money Works** | End W3 | 60h | Payment flow end-to-end on staging with test cards, wallet, escrow |
| M3 | **Real-Time + Push** | End W4 | 50h | Real-time ride tracking end-to-end, push notifications, GPS, SOS, chat |
| M4 | **Production Mobile Apps** | End W7 | 80h | Offline mode, deep links, animated maps, error/loading/empty states, biometrics |
| M5 | **Admin + Food** | End W8 | 60h | Full admin dashboard, food delivery lifecycle, pricing editor, audit trail |
| M6 | **Quality + Deploy** | End W10 | 120h | 85%+ test coverage, E2E pass, load tests pass, monitoring live, backups running |

**Total effort:** 410h across 10 weeks

---

## M1: Secure Foundation

**Target:** End of Week 1 (40h)
**Focus:** E1 — Production Hardening

### Key Deliverables

| Deliverable | Stories |
|-------------|---------|
| 26 FormRequest classes with validation + authorization | E1.1 |
| Clean .gitignore, rotated secrets, no credentials in repo | E1.2 |
| Complete .env.example + .env.production templates | E1.3 |
| Auth rate limiting (tiered: login/register/general) | E1.4 |
| PII columns encrypted (phone, email, ID, license) | E1.5 |
| Sentry error + performance monitoring wired | E1.6 |

### Gate Criteria (ALL must pass)

- [ ] **All 26 FormRequests exist and are wired to controllers** — verify each POST/PUT/PATCH endpoint returns the correct validation error format
- [ ] **No secrets in repo** — `git log -p` scan shows no API keys, passwords, or credentials; `storage/*.json` and Firebase key in `.gitignore`
- [ ] **`.env.example` complete** — every key referenced in `config/*.php` has a documented entry; `.env.production` exists
- [ ] **Rate limiting active** — `/api/v1/auth/login` returns 429 after 10 requests/minute; `X-RateLimit-*` headers present
- [ ] **PII columns encrypted** — `phone_number` and `email` values are ciphertext in database; `User::find(1)->phone_number` returns plaintext
- [ ] **Sentry reporting** — `SENTRY_DSN` configured; test exception appears in Sentry dashboard; performance traces visible
- [ ] **CI passes** — `php artisan test` passes; PHPStan at level 5; no lint violations

### Exit Criteria

- All E1 stories marked done
- CI green on main branch
- Team has `.env.production` template ready for production
- Code review performed by reviewer on all 30+ files changed

---

## M2: Money Works

**Target:** End of Week 3 (60h)
**Focus:** E2 — Payment Integration

### Key Deliverables

| Deliverable | Stories |
|-------------|---------|
| Stripe payment intents + webhooks end-to-end | E2.1 |
| PayFast ITN verification + redirect flow | E2.2 |
| Ozow signature verification + webhook flow | E2.3 |
| 24-hour escrow with auto-release | E2.4 |
| Cash payment reconciliation flow | E2.5 |
| Full refund workflow (admin approve → gateway → wallet) | E2.6 |
| Driver payout/settlement engine (daily/weekly) | E2.7 |

### Gate Criteria (ALL must pass)

- [ ] **Stripe flow works end-to-end** — create payment intent → confirm → webhook received → payment recorded in DB → wallet credited
- [ ] **PayFast ITN validates correctly** — signature verification passes for valid ITN, rejects invalid; return URL redirects to app
- [ ] **Ozow webhook verifies** — HMAC-SHA256 signature verified; `Complete/Cancelled/Error` statuses handled; idempotency enforced
- [ ] **Escrow system functional** — payment held 24 hours after ride complete; auto-releases after timer; disputes halt release
- [ ] **Cash reconciliation accurate** — driver marks cash paid; platform fee deducted; daily reconciliation report generated
- [ ] **Refund workflow complete** — rider requests → admin reviews → gateway refunds → wallet credited (or original method)
- [ ] **Driver payout processes** — daily payouts > R200, weekly < R200; bank details encrypted; failed payouts retried
- [ ] **Staging test passes** — full payment flow on staging with test cards for all 3 gateways + cash + wallet

### Exit Criteria

- All E2 stories marked done
- Test cards used to verify each gateway on staging
- Webhook endpoints secured with IP allowlisting and signature verification
- Payment flow documented for operations team
- Escrow release tested with 1-hour window (shortened in test mode)

---

## M3: Real-Time + Push

**Target:** End of Week 4 (50h)
**Focus:** E3 — Real-Time & Notifications

### Key Deliverables

| Deliverable | Stories |
|-------------|---------|
| FCM push notifications for all ride events | E3.1 |
| Background GPS tracking (driver app) | E3.2 |
| SMS notifications (Twilio) for critical events | E3.3 |
| Email notifications (SendGrid/Mailgun) | E3.4 |
| In-app notification center with deep links | E3.5 |
| SOS alert system (multi-channel escalation) | E3.6 |

### Gate Criteria (ALL must pass)

- [ ] **Push notifications deliver** — ride_accepted triggers push to rider device within 5s; push token registration works; deactivation on logout
- [ ] **GPS tracking works in background** — driver app sends location every 5-10s; driver marked offline after 10min stale; foreground service active on Android
- [ ] **SMS sends for critical events** — ride confirmation SMS arrives; SOS alert SMS sent to emergency contact within 30s
- [ ] **Email sends for transactional events** — payment receipt email delivered; driver approval email with correct template
- [ ] **Notification center functional** — API returns paginated notifications; read/unread toggle works; deep link from push opens correct screen
- [ ] **SOS system tested** — trigger → 10s countdown → cancel (no dispatch) vs no-cancel (multi-channel dispatch); admin dashboard receives WebSocket event with map pin
- [ ] **Staging test passes** — full ride with push notifications, GPS tracking, SOS scenario

### Exit Criteria

- All E3 stories marked done
- Push notification delivery rate > 99% on staging
- GPS updates at 5-second intervals with < 200ms WebSocket latency
- SOS end-to-end test: trigger to admin dashboard alert in < 10s
- Notification templates reviewed for SA mobile audience (isiXhosa/English)

---

## M4: Production Mobile Apps

**Target:** End of Week 7 (80h)
**Focus:** E4 — Mobile UX & Edge Cases

### Key Deliverables

| Deliverable | Stories |
|-------------|---------|
| Offline mode (cache + queue + banner) | E4.1 |
| Route polyline rendering (OSRM) | E4.2 |
| Animated driver marker (smooth interpolation) | E4.3 |
| Deep linking (easyryde:// scheme) | E4.4 |
| Pull-to-refresh on all list screens | E4.5 |
| Form validation feedback (real-time) | E4.6 |
| Loading/error/empty states on all screens | E4.7 |
| Scheduled rides UI (date picker + recurring) | E4.8 |
| Driver earnings charts (daily/weekly/monthly) | E4.9 |
| Biometric authentication (fingerprint/face) | E4.10 |

### Gate Criteria (ALL must pass)

- [ ] **Offline mode works** — airplane mode → cached data displayed → offline banner shown → ride request queued → reconnects → request sent → banner dismissed
- [ ] **Route polylines render** — OSRM polyline decoded and displayed on map; route updates on deviation; traffic-aware coloring
- [ ] **Driver marker animates smoothly** — no position jumps; rotation matches heading; 2s interpolation between updates
- [ ] **Deep links navigate correctly** — `easyryde://ride/{id}` opens ride detail; push notification deep link lands on correct screen; cold start handled
- [ ] **Pull-to-refresh works everywhere** — every list screen refreshes; loading spinner matches brand color; offline shows toast
- [ ] **Form validation feedback immediate** — email/phone/password validated on blur; inline errors shown; submit disabled until valid
- [ ] **All states covered** — every screen has loading, error (with retry), and empty (with CTA) states
- [ ] **Scheduled rides functional** — date picker shows 7 days; recurring options save; ride auto-dispatches 15min before
- [ ] **Earnings charts render** — daily/weekly/monthly tabs; bar chart with trend; tooltip on tap; pull-to-refresh
- [ ] **Biometric login works** — enable in settings → next login prompts biometric → fallback to password after 3 failures
- [ ] **App Store build passes** — `eas build --platform all` succeeds; no build errors; no privacy permission issues

### Exit Criteria

- All E4 stories marked done
- Rider and Driver apps build successfully for both iOS and Android
- All screens navigable with full back/forward flow
- UX review by designer/PM (subjective pass)
- Performance: no jank on mid-range Android device (e.g., Samsung A52)
- Offline mode tested on device with airplane mode toggle

---

## M5: Admin + Food

**Target:** End of Week 8 (60h)
**Focus:** E5 — Admin Dashboard & Food

### Key Deliverables

| Deliverable | Stories |
|-------------|---------|
| Live real-time admin dashboard (metrics + map) | E5.1 |
| Driver document review workflow (FICA/KYC) | E5.2 |
| Pricing editor with audit trail | E5.3 |
| Restaurant management CRUD | E5.4 |
| Food order management and dispatch | E5.5 |
| Audit log viewer with filters | E5.6 |
| Driver payout/settlement admin panel | E5.7 |

### Gate Criteria (ALL must pass)

- [ ] **Dashboard metrics live-update** — new ride appears on dashboard without page refresh; metric cards show correct totals; sparkline charts render
- [ ] **Driver document workflow complete** — admin views documents inline (image/pdf); approve/reject with reason; driver notified via push + email
- [ ] **Pricing editor functional** — edit base_fare, per_km, surge multiplier; changes saved to audit log; publish workflow (draft → preview → publish)
- [ ] **Restaurant CRUD complete** — add/edit/delete restaurant; menu management with categories and items; operating hours; delivery radius
- [ ] **Food order lifecycle works** — order created → admin sees → dispatched to driver → status updated → delivered
- [ ] **Audit log viewer shows all changes** — filter by action type, user, date, resource; expand row shows old/new values; CSV export
- [ ] **Payout panel functional** — list pending/completed payouts; trigger manual payout; retry failed; export CSV
- [ ] **Staging test passes** — admin on staging can manage all platform operations end-to-end

### Exit Criteria

- All E5 stories marked done
- Admin web dashboard deployed to staging
- At least 1 restaurant partner onboarded (test data)
- Food order dispatched to test driver on staging
- Audit log retention policy configured
- All pricing changes logged and reversible

---

## M6: Quality + Deploy

**Target:** End of Week 10 (120h combined)
**Focus:** E6 + E7 — Testing, QA, Deploy & Operations

### Key Deliverables

| Deliverable | Stories |
|-------------|---------|
| 16 unit test files (85% service coverage) | E6.1 |
| 16 integration test files (all endpoints) | E6.2 |
| Admin E2E tests (10 Playwright specs) | E6.3 |
| Mobile smoke tests (3 Detox/Maestro suites) | E6.4 |
| Load tests (6 k6 scenarios) | E6.5 |
| Security tests (6 test suites) | E6.6 |
| Production Docker config with health checks | E7.1 |
| Sentry + Prometheus + Grafana stack | E7.2 |
| Database backup automation (S3 + PITR) | E7.3 |
| CI/CD pipeline (lint → test → build → deploy → smoke) | E7.4 |
| Zero-downtime blue/green deployment | E7.5 |

### Gate Criteria (ALL must pass)

- [ ] **85% unit test coverage** on service classes; 70% overall code coverage
- [ ] **All API endpoints tested** — every endpoint has happy path + error path + auth test
- [ ] **Admin E2E passes** — 10 Playwright specs all pass in headless Chrome, no flaky tests
- [ ] **Mobile smoke tests pass** — rider, driver, admin apps pass critical path smoke tests
- [ ] **Load tests meet targets** — p95 API < 500ms, p95 WebSocket < 200ms, error rate < 0.1%, zero crashes at 100 concurrent users
- [ ] **Security tests pass** — no SQLi, XSS, CSRF, rate limit bypass, auth bypass, webhook forgery
- [ ] **Docker containers healthy** — all services have health checks passing; resource limits set; no warnings in logs
- [ ] **Monitoring stack operational** — Sentry reporting errors; Prometheus collecting metrics; Grafana dashboards rendering; alerts configured
- [ ] **Backup automation running** — daily backup completed; S3 upload verified; restore procedure documented
- [ ] **CI/CD pipeline green** — push to main → lint → test → build → deploy to staging → smoke test → blue/green deploy to production
- [ ] **Zero-downtime verified** — deploy with active users shows < 1s downtime; rollback works in under 2 minutes
- [ ] **All security headers present** — HSTS, CSP, X-Frame-Options, X-Content-Type-Options

### Exit Criteria

- All E6 and E7 stories marked done
- Production deployment live and accepting traffic
- Monitoring dashboards show healthy metrics
- Backup verified (restored to staging)
- Runbook documented for operations team
- Post-deploy canary check: monitor for 24 hours, no critical errors
- CEO signoff obtained (final audit complete)

---

## Milestone Tracker

| Milestone | Status | Planned | Actual | Variance |
|-----------|--------|---------|--------|----------|
| M1: Secure Foundation | ❌ Not started | W1 | — | — |
| M2: Money Works | ❌ Not started | W3 | — | — |
| M3: Real-Time + Push | ❌ Not started | W4 | — | — |
| M4: Production Mobile Apps | ❌ Not started | W7 | — | — |
| M5: Admin + Food | ❌ Not started | W8 | — | — |
| M6: Quality + Deploy | ❌ Not started | W10 | — | — |

---

*End of milestones.md*
