# Test Strategy

**Phase:** 06 — Quality Plan  
**Document:** Test Strategy  
**Version:** 1.0.0  
**Date:** 2026-06-17  
**Status:** Draft

---

## 1. Overview

This document defines the comprehensive test strategy for EasyRyde across five test levels. The strategy covers the full stack: Laravel 13 backend (26 controllers, 32 services), Expo React Native mobile apps (rider, driver, admin), web admin dashboard, real-time Socket.io server, payment integrations (Stripe, PayFast, Ozow), and PostgreSQL 16 data layer.

**Current baseline:** 239 existing tests  
**Target:** Full regression suite, critical journey E2E, load-tested to 100+ concurrent rides, security-scanned for HIGH/CRITICAL vulnerabilities.

---

## 2. Test Levels

### 2.1 Unit Tests — Target: 85% Service Coverage

All 32 service classes require unit tests. PHPUnit + Mockery is the standard toolchain. Each service test covers the happy path, at least two error paths, and relevant edge cases.

#### Critical Services (Must have >90% coverage)

| Service | Priority | Risk if Untested |
|---------|----------|-------------------|
| `FareCalculationService` | Critical | Incorrect fare → revenue loss or rider complaints |
| `RideMatchingService` | Critical | Failed matching → no rides, lost revenue |
| `PaymentService` | Critical | Payment errors → financial loss, PCI risk |
| `WalletService` | Critical | Balance errors → financial disputes |
| `SurgePricingService` | High | Wrong surge → demand/supply imbalance |
| `PromoCodeService` | High | Abuse → revenue leakage |
| `RatingService` | High | Wrong ratings → driver/rider disputes |
| `DeliveryService` | High | Failed delivery → customer churn |
| `ReferralService` | Medium | Abuse → fake referrals, payout loss |

#### Unit Test Template

```php
<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\FareCalculationService;
use App\Models\Ride;
use Mockery;

class FareCalculationServiceTest extends TestCase
{
    public function test_calculates_fare_for_standard_ride()
    {
        // Happy path
    }

    public function test_throws_exception_for_missing_pickup_coordinates()
    {
        // Error path
    }

    public function test_applies_surge_pricing_correctly()
    {
        // Edge case
    }

    public function test_returns_zero_fare_for_cancelled_ride()
    {
        // Edge case
    }
}
```

#### Service Test Inventory

| Service | Test File | Priority | Status |
|---------|-----------|----------|--------|
| FareCalculationService | `tests/Unit/Services/FareCalculationServiceTest.php` | P0 | Planned |
| RideMatchingService | `tests/Unit/Services/RideMatchingServiceTest.php` | P0 | Planned |
| PaymentService | `tests/Unit/Services/PaymentServiceTest.php` | P0 | Planned |
| WalletService | `tests/Unit/Services/WalletServiceTest.php` | P0 | Planned |
| SurgePricingService | `tests/Unit/Services/SurgePricingServiceTest.php` | P1 | Planned |
| PromoCodeService | `tests/Unit/Services/PromoCodeServiceTest.php` | P1 | Planned |
| RatingService | `tests/Unit/Services/RatingServiceTest.php` | P1 | Planned |
| DeliveryService | `tests/Unit/Services/DeliveryServiceTest.php` | P1 | Planned |
| ReferralService | `tests/Unit/Services/ReferralServiceTest.php` | P2 | Planned |
| NotificationService | `tests/Unit/Services/NotificationServiceTest.php` | P2 | Planned |
| DriverEarningsService | `tests/Unit/Services/DriverEarningsServiceTest.php` | P2 | Planned |
| SOSService | `tests/Unit/Services/SOSServiceTest.php` | P2 | Planned |
| ScheduleRideService | `tests/Unit/Services/ScheduleRideServiceTest.php` | P2 | Planned |
| UserVerificationService | `tests/Unit/Services/UserVerificationServiceTest.php` | P2 | Planned |
| DocumentVerificationService | `tests/Unit/Services/DocumentVerificationServiceTest.php` | P2 | Planned |
| LocationHistoryService | `tests/Unit/Services/LocationHistoryServiceTest.php` | P2 | Planned |
| FleetManagementService | `tests/Unit/Services/FleetManagementServiceTest.php` | P2 | Planned |
| OnboardingService | `tests/Unit/Services/OnboardingServiceTest.php` | P3 | Planned |
| SupportTicketService | `tests/Unit/Services/SupportTicketServiceTest.php` | P3 | Planned |
| AnalyticsService | `tests/Unit/Services/AnalyticsServiceTest.php` | P3 | Planned |
| AuditLogService | `tests/Unit/Services/AuditLogServiceTest.php` | P3 | Planned |
| ExportService | `tests/Unit/Services/ExportServiceTest.php` | P3 | Planned |
| BackupService | `tests/Unit/Services/BackupServiceTest.php` | P3 | Planned |
| WebhookService | `tests/Unit/Services/WebhookServiceTest.php` | P3 | Planned |
| SmsService | `tests/Unit/Services/SmsServiceTest.php` | P3 | Planned |
| EmailService | `tests/Unit/Services/EmailServiceTest.php` | P3 | Planned |
| PushNotificationService | `tests/Unit/Services/PushNotificationServiceTest.php` | P3 | Planned |
| GeoCodingService | `tests/Unit/Services/GeoCodingServiceTest.php` | P3 | Planned |
| MapService | `tests/Unit/Services/MapServiceTest.php` | P3 | Planned |
| TranslationService | `tests/Unit/Services/TranslationServiceTest.php` | P3 | Planned |
| ConfigService | `tests/Unit/Services/ConfigServiceTest.php` | P3 | Planned |
| FeatureFlagService | `tests/Unit/Services/FeatureFlagServiceTest.php` | P3 | Planned |

---

### 2.2 Integration Tests — Target: 100% Endpoint Coverage

Every API endpoint requires a Feature Test in Laravel. Tests use `RefreshDatabase` to ensure isolation and `Sanctum::actingAs()` for authenticated scenarios.

#### Auth Flow Integration

```
Test sequence: register → verify email → login → access protected resource → refresh token → logout
```

#### Ride Lifecycle Integration

```
Test sequence: request ride → driver accepts → driver arrives → ride starts → ride completes → payment processed → rating submitted
```

#### Payment Flow Integration

```
Test sequence: initiate payment → Stripe webhook received → payment confirmed → wallet credited → receipt generated
```

#### Admin Flow Integration

```
Test sequence: admin login → dashboard loads → approve driver → update fare settings → view ride history → manage disputes
```

#### Integration Test Template

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use App\Models\User;
use App\Models\Ride;

class RideLifecycleTest extends TestCase
{
    use RefreshDatabase;

    public function test_complete_ride_lifecycle()
    {
        $rider = User::factory()->rider()->create();
        $driver = User::factory()->driver()->create();

        Sanctum::actingAs($rider);

        // 1. Request ride
        $rideResponse = $this->postJson('/api/v1/rides', [
            'pickup_latitude' => -23.9468,
            'pickup_longitude' => 29.4726,
            'dropoff_latitude' => -23.9500,
            'dropoff_longitude' => 29.4800,
            'category' => 'standard',
        ]);
        $rideResponse->assertStatus(201);
        $rideId = $rideResponse->json('ride.id');

        // 2. More lifecycle steps...
    }
}
```

---

### 2.3 E2E Tests — Target: Critical Journeys

#### Web Admin — Playwright

| Journey | Test File | Priority |
|---------|-----------|----------|
| Admin login + dashboard loads | `e2e/admin/login.spec.ts` | P0 |
| Approve driver application | `e2e/admin/approve-driver.spec.ts` | P0 |
| View and filter ride history | `e2e/admin/ride-history.spec.ts` | P1 |
| Update fare settings | `e2e/admin/fare-settings.spec.ts` | P1 |
| Manage disputes | `e2e/admin/disputes.spec.ts` | P2 |
| View analytics dashboard | `e2e/admin/analytics.spec.ts` | P2 |

#### Mobile Apps — Maestro / Detox

| Journey | Platform | Test File | Priority |
|---------|----------|-----------|----------|
| Rider books a ride | iOS/Android | `e2e/mobile/rider-books-ride.yml` | P0 |
| Driver accepts a ride | iOS/Android | `e2e/mobile/driver-accepts-ride.yml` | P0 |
| Rider tracks ride in real-time | iOS/Android | `e2e/mobile/rider-tracks-ride.yml` | P1 |
| Rider pays with wallet | iOS/Android | `e2e/mobile/rider-pays-wallet.yml` | P1 |
| Driver completes trip | iOS/Android | `e2e/mobile/driver-completes-trip.yml` | P1 |
| Rider rates driver | iOS/Android | `e2e/mobile/rider-rates-driver.yml` | P2 |
| Rider calls SOS | iOS/Android | `e2e/mobile/rider-sos.yml` | P2 |

---

### 2.4 Load Tests — Target: Peak Capacity

#### k6 Scripts

| Test | Script | VUs | Duration | Threshold |
|------|--------|-----|----------|-----------|
| Ride request flood | `load-tests/ride-load-test.js` | 100 concurrent | 5min | p95 < 500ms |
| WebSocket connections | `load-tests/websocket-test.js` | 10K concurrent | 10min | p95 < 200ms |
| Payment webhook flood | `load-tests/payment-flood-test.js` | 50 concurrent | 3min | error rate < 1% |
| Search + list queries | `load-tests/search-test.js` | 100 concurrent | 3min | p95 < 800ms |
| Driver location updates | `load-tests/location-update-test.js` | 200 concurrent | 5min | p95 < 300ms |

#### Existing Load Test Reference

The file `load-tests/ride-load-test.js` exists and covers login → ride creation → ride history → wallet → notifications. This script needs expansion to:

1. Randomize user credentials per VU (avoid token reuse collision)
2. Add payment confirmation step
3. Add WebSocket connection + event subscription
4. Add driver acceptance simulation
5. Assert on ride lifecycle state transitions

#### Target Thresholds

| Metric | Target | Measurement |
|--------|--------|-------------|
| API p95 response time | < 500ms | k6 http_req_duration |
| WebSocket p95 latency | < 200ms | Socket.io event timing |
| Error rate | < 1% | k6 error threshold |
| Successful ride creation rate (load) | > 95% | Custom k6 check |

---

### 2.5 Security Tests

#### OWASP ZAP Passive Scan

Run against staging deployment before every release. Generates an HTML report with alerts ranked by risk. Block release on any HIGH or CRITICAL finding.

**Scan targets:**
- `https://staging.easyryde.co.za/api/v1/` (API)
- `https://admin-staging.easyryde.co.za/` (Admin dashboard)

#### Semgrep SAST

Rules configured for PHP (Laravel) and TypeScript (React Native + Node.js).

| Rule Set | Languages | Checks |
|----------|-----------|--------|
| `p/php` | PHP | SQL injection, XXE, command injection, file inclusion |
| `p/typescript` | TS | XSS, prototype pollution, path traversal |
| `p/owasp-top-ten` | PHP, TS | OWASP Top 10 categories |
| Custom rules | PHP | Raw DB::statement, request->input without validation, mass assignment |

Run semgrep in CI on every PR. Block on any HIGH or CRITICAL finding.

#### Manual Review Areas

| Area | Vulnerability Class | Why Manual |
|------|-------------------|------------|
| `DB::statement()` calls in session fallback | SQL injection | Dynamic SQL strings, hard to detect statically |
| Admin settings inputs (email templates, SMS text) | XSS | User-controlled content rendered in dashboard |
| All state-changing endpoints | CSRF | Sanctum SPA auth may miss same-origin checks |
| Ride resource endpoints (`/rides/{id}`) | IDOR | Need to verify user can only access own rides |
| Payment webhook handler | Signature verification | Business logic errors hard to test automatically |
| Driver document upload | Path traversal | ZIP slip, filename injection |

---

## 3. Quality Gates

| Gate | When | Tool | Criteria | Blocking |
|------|------|------|----------|----------|
| G1 | Pre-commit | PHPStan | Level 5, zero errors | Yes |
| G2 | PR | PHPUnit | All tests pass, coverage ≥ 80% | Yes |
| G3 | PR | ESLint (TS) / Pint (PHP) | Zero errors | Yes |
| G4 | Merge | k6 load test | p95 < 500ms, error rate < 1% | Yes |
| G5 | Staging deploy | Playwright E2E | All critical journeys pass | Yes |
| G6 | Pre-release | OWASP ZAP | No HIGH or CRITICAL findings | Yes |
| G7 | Post-deploy | Health check monitor | All health endpoints return 200 | Alert, not block |

### Gate Failure Procedures

| Gate Failure | Action | Owner |
|--------------|--------|-------|
| G1 (PHPStan pre-commit) | Fix type errors before commit | Developer |
| G2 (Tests fail) | Fix broken test or code, re-run CI | Developer |
| G3 (Lint errors) | Auto-fix with Pint/ESLint, re-push | Developer |
| G4 (Load test fails) | Profile bottleneck, optimize, re-run | Backend lead |
| G5 (E2E fails) | Debug test or app, re-deploy staging | QA lead |
| G6 (ZAP finds HIGH) | Fix vulnerability, re-scan | Security lead |
| G7 (Health check fails) | Rollback deployment, investigate | Release engineer |

---

## 4. Test Environment Strategy

| Environment | Purpose | Data | Access |
|-------------|---------|------|--------|
| Local dev | Unit + feature tests | SQLite in-memory / RefreshDatabase | Developer |
| CI (GitHub Actions) | PR gates | PostgreSQL ephemeral | Automated |
| Staging | E2E + load + security tests | Anonymized production-like data | QA team |
| Production | Canary + smoke tests | Live data (read-only) | Automated |

---

## 5. Test Execution Cadence

| Frequency | Tests | Runner | Notify |
|-----------|-------|--------|--------|
| On every push | Unit + feature tests | GitHub Actions | PR author |
| On PR to main | All of above + lint + PHPStan | GitHub Actions | PR author + reviewer |
| On merge to main | Full suite + load tests | GitHub Actions | Team channel |
| Hourly on staging | E2E critical journeys | Playwright CI | Slack on failure |
| Daily on staging | Full E2E + security scan | Cron job | Slack report |
| Weekly on staging | Full load test suite | k6 + CI | Email report |

---

## 6. Test Data Management

- **Factories:** Laravel model factories for all entities (User, Ride, Payment, Driver, etc.)
- **Seeders:** DatabaseSeeder produces realistic test data for local dev and staging
- **Anonymization:** Production data snapshots anonymized before restoring to staging
- **Cleanup:** Test orders/payments voided weekly on staging; no real charges in test mode

---

## 7. Tools & Dependencies

| Tool | Version | Purpose |
|------|---------|---------|
| PHPUnit | 11.x | Unit + feature tests (PHP) |
| Mockery | 1.6+ | Mock objects for service tests |
| Playwright | Latest | Web admin E2E tests |
| Maestro | Latest | Mobile E2E tests |
| k6 | Latest | Load and stress tests |
| OWASP ZAP | Latest | DAST security scanning |
| Semgrep | Latest | SAST static analysis |
| PHPStan | Level 5 | Static type analysis |
| Pint | Laravel 13 | PHP code style |
| ESLint | Latest | TypeScript code style |

---

## 8. Reporting

| Artifact | Format | Audience | Frequency |
|----------|--------|----------|-----------|
| Test run summary | JUnit XML + HTML | CI dashboard | Every run |
| Coverage report | HTML (PHPUnit) | Developers | Every PR |
| Load test report | JSON + HTML (k6) | Engineering | Every merge |
| E2E test report | HTML (Playwright) | QA team | Every staging deploy |
| Security scan report | HTML (ZAP) | Security lead | Pre-release |
| Quality dashboard | Grafana | Whole team | Real-time |

---

## 9. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Flaky E2E tests | Medium | High | Retry logic, wait strategies, CI retry |
| Load tests not representative | Medium | High | Production traffic shaping, gradual ramp |
| Coverage target missed | Low | Medium | PR gate enforces coverage, exceptions require lead approval |
| Security scan false positives | Medium | Low | Manual triage, suppress known FP patterns |
| Test environment not matching production | Low | High | Docker Compose parity, same PostgreSQL/Redis versions |

---

## 10. Sign-Off Criteria

- [ ] All P0 services have unit tests with >85% coverage
- [ ] All API endpoints have at least one feature test
- [ ] E2E critical journeys pass on staging
- [ ] Load test thresholds met (p95 < 500ms API, < 1% errors)
- [ ] OWASP ZAP scan shows no HIGH/CRITICAL findings
- [ ] Quality gates G1-G6 pass for current release
