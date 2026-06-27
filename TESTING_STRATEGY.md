# EasyRyde Comprehensive Testing Strategy

**Platform:** Ride-hailing for South Africa (Phalaborwa launch)
**Stack:** Laravel API + Socket.IO + React Native (Expo) + Playwright Web Admin
**Last Updated:** 2026-06-26

---

## Table of Contents

1. [Test Pyramid](#1-test-pyramid)
2. [Backend Test Gaps](#2-backend-test-gaps)
3. [Mobile Test Plan](#3-mobile-test-plan)
4. [Socket Server Testing](#4-socket-server-testing)
5. [Payment Testing](#5-payment-testing)
6. [Location Testing](#6-location-testing)
7. [Offline Testing](#7-offline-testing)
8. [Performance Testing](#8-performance-testing)
9. [Security Testing](#9-security-testing)
10. [User Acceptance Testing](#10-user-acceptance-testing)
11. [CI/CD Test Integration](#11-cicd-test-integration)
12. [Bug Severity Classification](#12-bug-severity-classification)

---

## 1. Test Pyramid

### Target Ratios Per App

| App | Unit | Integration | E2E | Notes |
|-----|------|-------------|-----|-------|
| **Backend (Laravel)** | 60% | 30% | 10% | Current: ~36 unit + 30 feature. Need more unit for services, more feature for edge cases |
| **Web Admin (Playwright)** | — | — | 100% | Current: 10 spec files. Already E2E-focused, correct for admin panel |
| **Rider App** | 50% | 30% | 20% | Current: 0 unit tests. Critical gap |
| **Driver App** | 50% | 30% | 20% | Current: 0 unit tests. Critical gap |
| **Admin App** | 50% | 30% | 20% | Current: 0 unit tests. Critical gap |
| **Socket Server** | 40% | 40% | 20% | Current: 1 test file (8 tests). Need load + scenario tests |
| **Shared Package** | 70% | 20% | 10% | Current: 0 tests. Pure utility code, easy to unit test |

### Coverage Targets

| Metric | Target | Current Estimate |
|--------|--------|-----------------|
| Backend line coverage | >80% | ~60% |
| Backend branch coverage | >70% | ~45% |
| Mobile component coverage | >70% | 0% |
| Socket handler coverage | >90% | ~30% |
| Web E2E critical paths | 100% | ~70% |

---

## 2. Backend Test Gaps

### 2.1 Endpoints Lacking Feature Test Coverage

Cross-referencing `routes/api.php` against `tests/Feature/`:

| Endpoint Group | Routes | Feature Tests | Gap |
|---------------|--------|---------------|-----|
| **Social Auth** | `GET /{provider}/redirect`, `GET /{provider}/callback` | None | No OAuth flow tests |
| **TOTP 2FA** | `POST /admin/totp/enable`, `verify`, `disable` | None | No 2FA lifecycle tests |
| **Driver Location** | `POST /drivers/location` | None (standalone) | Only tested via ride flow |
| **Driver Profile** | `PUT /drivers/profile`, `POST /drivers/vehicle` | None | No profile update tests |
| **Driver Nearby** | `GET /drivers/nearby-rides` | None | No geo-proximity tests |
| **Payment Dispute** | `POST /payments/{payment}/dispute` | None | No dispute flow tests |
| **Stripe Intent** | `POST /payments/stripe/create-intent`, `confirm` | None | No Stripe integration tests |
| **Wallet Deposit/Withdraw** | `POST /wallet/deposit`, `POST /wallet/withdraw` | Partial | No withdrawal tests |
| **Scheduled Rides** | `GET /scheduled-rides`, `POST /`, `POST /{id}/cancel` | Partial | No cancel test |
| **KYC Download** | `GET /kyc/{verification}/{documentType}` | None | No document download tests |
| **Incident Evidence** | `GET /incidents/{incident}/evidence/{index}` | None | No evidence download tests |
| **Data Rights (POPIA)** | `GET /data/export`, `POST /anonymize`, `DELETE /erasure` | None | No GDPR/POPIA tests |
| **Consent** | `GET /consent`, `POST /grant`, `POST /revoke`, `GET /history` | None | No consent lifecycle tests |
| **Reporting Export** | `GET /admin/reports/revenue/export` | None | No CSV/export tests |
| **Admin Payouts** | `GET /admin/payouts`, `summary`, `POST /{payout}/retry` | None | No payout tests |
| **Food Admin** | `POST /admin/food/restaurants`, `PUT`, `DELETE menu-items` | None | No food admin CRUD tests |
| **Partner Webhooks** | `POST /webhooks/partner/order`, `status` | None | No partner integration tests |

### 2.2 Unit Test Gaps

| Service | Current Tests | Missing Scenarios |
|---------|--------------|-------------------|
| **FareCalculationService** | Basic fare tests | Surge multiplier edge cases, minimum fare, airport surcharge, late-night rates, promo code stacking |
| **RideMatchingService** | Basic matching | No drivers available, driver timeout (5s), max distance filter, category filtering, concurrent match requests |
| **PaymentService** | Basic process | Idempotency, partial refunds, multi-method split, currency rounding (ZAR cents), webhook race conditions |
| **EscrowService** | Basic escrow | Release timing, dispute hold, auto-release on timeout, partial release |
| **WalletService** | Basic operations | Concurrent deposits, overdraft prevention, transaction atomicity, balance race conditions |
| **PayoutService** | Basic payout | Batch payout, failed payout retry, bank validation (SA banks), minimum payout threshold |
| **SurgePricingService** | Basic surge | Time-of-day triggers, weather API integration, demand radius, max surge cap, surge history |
| **ReferralService** | Basic referral | Self-referral prevention, referral chain (A→B→C), bonus caps, expired referrals |
| **PushNotificationService** | Basic push | FCM/APNs token refresh, notification grouping, deep link payloads, quiet hours |
| **SmsService** | Basic SMS | Rate limiting, template validation, delivery confirmation, international numbers |
| **EmailService** | Basic email | Template rendering, attachment handling, bounce handling, unsubscribe |
| **RatingService** | Basic rating | Duplicate rating prevention, rating window expiry, driver rating impact on matching |
| **CashReconciliationService** | Basic recon | Discrepancy detection, bulk reconciliation, driver cash collection |

### 2.3 Missing Test Categories

```
tests/
├── Unit/
│   ├── Services/           # Already have some
│   ├── Jobs/               # Have 5 job tests
│   ├── Middleware/          # Have 3 middleware tests
│   ├── Observers/          # MISSING - no observer tests
│   ├── Events/             # MISSING - no event tests
│   ├── Notifications/      # MISSING - no notification class tests
│   ├── Policies/           # MISSING - no policy tests
│   ├── Rules/              # MISSING - no validation rule tests
│   └── Casts/              # MISSING - no cast tests
├── Feature/
│   ├── Http/               # Organize by controller
│   ├── Jobs/               # MISSING - no feature-level job tests
│   └── Events/             # MISSING - no event feature tests
└── Integration/            # MISSING - entire directory
    ├── PaymentGateway/     # Stripe/PayFast/Ozow sandbox tests
    ├── SocketServer/       # API ↔ Socket integration
    └── External/           # Google Places, FCM, Twilio
```

### 2.4 Priority Test Implementations

**P0 — Must have before launch:**

```php
// Feature: Scheduled ride cancel
test_scheduled_ride_can_be_cancelled_before_pickup_time()
test_scheduled_ride_cannot_be_cancelled_after_pickup_time()
test_scheduled_ride_auto_cancels_after_pickup_window()

// Feature: Wallet deposit/withdraw
test_wallet_deposit_via_stripe_sandbox()
test_wallet_deposit_via_payfast_sandbox()
test_wallet_withdraw_to_bank_account()
test_wallet_withdraw_insufficient_balance()
test_wallet_concurrent_deposits_maintain_consistency()

// Feature: Payment dispute
test_user_can_dispute_payment_within_24h()
test_dispute_prevents_driver_payout()
test_admin_can_resolve_dispute()

// Feature: POPIA data rights
test_user_can_export_personal_data()
test_user_can_request_anonymization()
test_user_can_request_erasure()
test_erasure_removes_pii_but_keeps_financial_records()
```

**P1 — Should have before launch:**

```php
// Feature: Social auth
test_google_oauth_redirect()
test_google_oauth_callback_creates_user()
test_google_oauth_callback_links_existing_user()

// Feature: TOTP 2FA
test_admin_can_enable_totp()
test_totp_verification_required_after_enable()
test_admin_can_disable_totp()
test_invalid_totp_code_rejected()

// Feature: Incident management
test_user_can_submit_incident_with_evidence()
test_admin_can_assign_incident()
test_admin_can_escalate_incident()
test_incident_evidence_downloadable()

// Feature: Reporting
test_revenue_report_date_range()
test_revenue_export_csv_download()
test_driver_performance_report()
test_ride_statistics_report()
```

---

## 3. Mobile Test Plan

### 3.1 Unit Tests (Jest + React Native Testing Library)

**Framework:** Jest + `@testing-library/react-native`
**Location:** `mobile/apps/{rider,driver,admin}/__tests__/`

#### Rider App Unit Tests

```
__tests__/
├── screens/
│   ├── LoginScreen.test.tsx          # Form validation, submit handling, error states
│   ├── HomeScreen.test.tsx           # Map init, search input, quick actions
│   ├── RideTrackingScreen.test.tsx   # Status display, driver info, cancel button
│   ├── RatingScreen.test.tsx         # Star selection, submit, validation
│   ├── PaymentScreen.test.tsx        # Method selection, confirmation, error handling
│   ├── RideHistory.test.tsx          # List rendering, pagination, empty state
│   ├── WalletScreen.test.tsx         # Balance display, transactions, deposit
│   └── ChatScreen.test.tsx           # Message list, send, keyboard handling
├── components/
│   ├── AnimatedDriverMarker.test.tsx # Animation, position updates
│   ├── RideStatusBadge.test.tsx      # Status → color mapping
│   ├── FareEstimateCard.test.tsx     # Price display, category selection
│   └── OfflineBanner.test.tsx        # Visibility toggle
├── hooks/
│   ├── useAuth.test.ts               # Login, logout, token refresh, 401 handling
│   ├── useRide.test.ts               # Create, cancel, track, complete
│   ├── useSocket.test.ts             # Connect, reconnect, event handling
│   └── useLocation.test.ts           # Permission, tracking, background
└── utils/
    ├── fareCalculator.test.ts        # Fare math, surge, promo codes
    ├── formatters.test.ts            # Currency (ZAR), distance, time
    └── validators.test.ts            # Email, phone, password
```

#### Driver App Unit Tests

```
__tests__/
├── screens/
│   ├── DriverHomeScreen.test.tsx     # Earnings cards, online toggle
│   ├── ActiveRideScreen.test.tsx     # Map, buttons, status transitions
│   ├── TripHistory.test.tsx          # List, pagination
│   └── EarningsScreen.test.tsx       # Summary, breakdown
├── hooks/
│   ├── useDriverLocation.test.ts     # Background tracking, toggle
│   ├── useRideRequests.test.ts       # Socket events, accept/decline
│   └── useEarnings.test.ts           # API fetch, formatting
└── services/
    ├── backgroundLocation.test.ts    # Task registration, update interval
    └── rideRequestNotification.test.ts # Alert display, timeout
```

#### Admin App Unit Tests

```
__tests__/
├── screens/
│   ├── AdminDashboard.test.tsx       # Metrics, refresh, animated numbers
│   ├── UsersList.test.tsx            # Search, pagination, role badges
│   ├── DriversList.test.tsx          # Approve/reject, online status
│   ├── RidesList.test.tsx            # Status filters, detail modal
│   └── SettingsScreen.test.tsx       # Edit, save, type badges
└── hooks/
    ├── useAdminDashboard.test.ts     # API fetch, error handling
    └── useAdminActions.test.ts       # Approve, reject, update
```

### 3.2 Integration Tests

**Framework:** Jest with MSW (Mock Service Worker) for API mocking

```
__tests__/integration/
├── auth-flow.test.tsx                # Login → token → me → logout
├── ride-lifecycle.test.tsx           # Request → match → track → complete → rate
├── payment-flow.test.tsx             # Select method → pay → confirm → receipt
├── offline-recovery.test.tsx         # Offline → queue → online → flush
├── socket-reconnection.test.tsx      # Disconnect → retry → reconnect
└── navigation.test.tsx               # Tab navigation, stack push/pop, deep links
```

### 3.3 E2E Tests (Detox)

**Framework:** Detox (already configured)
**Location:** `mobile/e2e/`

Current smoke tests are minimal. Expand to:

```
e2e/
├── rider/
│   ├── auth-flow.e2e.ts             # Login, register, logout, token persistence
│   ├── ride-booking.e2e.ts          # Full ride flow: search → book → track → rate
│   ├── payment.e2e.ts               # Select method → pay → receipt
│   ├── wallet.e2e.ts                # View balance → transactions
│   ├── ride-history.e2e.ts          # View past rides → detail
│   └── offline.e2e.ts               # Airplane mode → queue → reconnect
├── driver/
│   ├── auth-flow.e2e.ts             # Login → dashboard
│   ├── ride-management.e2e.ts       # Go online → accept → arrive → start → complete
│   ├── earnings.e2e.ts              # View earnings → trips
│   └── background-location.e2e.ts   # Background tracking verification
├── admin/
│   ├── dashboard.e2e.ts             # Load metrics → refresh
│   ├── user-management.e2e.ts       # List → search → view
│   ├── driver-management.e2e.ts     # List → approve → reject
│   └── ride-management.e2e.ts       # List → filter → detail
└── cross-app/
    ├── rider-driver-ride.e2e.ts     # Rider books, driver accepts, complete ride
    └── admin-ride-monitor.e2e.ts    # Admin watches live ride
```

### 3.4 Mobile Test Execution

```bash
# Unit tests
cd mobile && npx jest --coverage

# Per-app unit tests
cd mobile/apps/rider && npx jest
cd mobile/apps/driver && npx jest
cd mobile/apps/admin && npx jest

# E2E tests (requires running emulator)
cd mobile && npx detox test --configuration android.emu.debug

# Specific E2E test
cd mobile && npx detox test e2e/rider/ride-booking.e2e.ts --configuration android.emu.debug
```

---

## 4. Socket Server Testing

### 4.1 Current State

The existing `socket.test.js` covers basic happy paths with 8 tests. Missing:
- Authentication/authorization
- Concurrent connections
- Race conditions
- Error handling
- Redis integration
- Room management
- Rate limiting

### 4.2 Unit Tests (Mocha + Chai)

Expand `socket-server/tests/`:

```
tests/
├── handlers/
│   ├── ride.test.js                  # All ride handler events
│   ├── driver.test.js                # Driver handlers
│   ├── chat.test.js                  # Chat handlers
│   ├── delivery.test.js              # Delivery handlers
│   ├── admin.test.js                 # Admin handlers
│   └── foodOrder.test.js             # Food order handlers
├── middleware/
│   ├── auth.test.js                  # JWT validation, role checks
│   └── rateLimit.test.js             # Rate limiting
├── services/
│   ├── geo.test.js                   # Geospatial queries
│   ├── redis.test.js                 # Redis operations
│   └── notification.test.js          # Push notification dispatch
└── integration/
    ├── ride-flow.test.js             # Full ride lifecycle via sockets
    ├── concurrent-claims.test.js     # Multiple drivers accepting same ride
    ├── reconnection.test.js          # Disconnect/reconnect behavior
    └── room-management.test.js       # Join/leave rooms, broadcast scoping
```

### 4.3 Critical Test Cases

```javascript
// Race condition: Two drivers accept same ride simultaneously
it('should only allow one driver to claim a ride', async () => {
  const driver1 = await connectDriver('driver-1');
  const driver2 = await connectDriver('driver-2');

  // Both emit accept at the same time
  await Promise.all([
    driver1.emit('driver:accept-ride', { rideId: 'ride-123', riderId: 'rider-1' }),
    driver2.emit('driver:accept-ride', { rideId: 'ride-123', riderId: 'rider-1' }),
  ]);

  // Only one should succeed (Lua script ensures atomicity)
  const claims = await redis.keys('ride:claim:ride-123');
  expect(claims).to.have.length(1);
});

// Authentication: Invalid JWT rejected
it('should reject connection with invalid token', (done) => {
  const client = ClientIO(`http://localhost:${port}`, {
    auth: { token: 'invalid-jwt' },
  });
  client.on('connect_error', (err) => {
    expect(err.message).to.include('authentication');
    done();
  });
});

// Rate limiting: Location updates throttled
it('should reject location updates faster than 1/second', async () => {
  const client = await connectDriver('driver-1');
  const results = [];
  for (let i = 0; i < 5; i++) {
    results.push(
      client.emitWithAck('driver:location-update', {
        lat: -23.94 + i * 0.001,
        lng: 29.47,
      })
    );
  }
  const responses = await Promise.all(results);
  const rejected = responses.filter(r => r.error);
  expect(rejected.length).to.be.greaterThan(0);
});

// Room scoping: Rider only sees their ride events
it('should not deliver ride events to unrelated riders', async () => {
  const rider1 = await connectRider('rider-1');
  const rider2 = await connectRider('rider-2');

  let received = false;
  rider2.on('ride:accepted', () => { received = true; });

  // Rider1's ride is accepted
  await emitRideAccepted('ride-for-rider-1');
  await sleep(200);

  expect(received).to.be.false;
});
```

### 4.4 Load Testing Strategy

**Tool:** k6 with WebSocket support

```javascript
// socket-load-test.js
export const options = {
  scenarios: {
    // 500 concurrent socket connections
    connection_storm: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 500 },
        { duration: '5m', target: 500 },
        { duration: '1m', target: 0 },
      ],
    },
    // Ride request burst: 100 rides in 30 seconds
    ride_burst: {
      executor: 'constant-arrival-rate',
      rate: 100,
      duration: '30s',
      preAllocatedVUs: 100,
    },
    // Location updates: 200 drivers updating every 5s
    location_stream: {
      executor: 'constant-vus',
      vus: 200,
      duration: '10m',
    },
  },
  thresholds: {
    ws_connecting: ['p(95)<500'],
    ws_msgs_sent: ['rate>100'],
    ws_session_duration: ['avg>60000'],
  },
};
```

**Infrastructure:**
- Use Redis adapter (`@socket.io/redis-adapter`) in test to validate multi-node broadcast
- Run socket server with `NODE_ENV=test` and in-memory Redis (`redis-memory-server`)
- Monitor: connection count, memory per connection, event latency, Redis command rate

### 4.5 Socket Server Monitoring Metrics

Track during load tests:
- `ws_connections_active` — Current connected clients
- `ws_messages_per_second` — Throughput
- `ws_message_latency_p95` — End-to-end event latency
- `ws_reconnection_rate` — Clients reconnecting per minute
- `redis_commands_per_second` — Redis load
- `memory_per_connection` — MB per socket connection
- `ride_claim_success_rate` — % of ride claims that succeed on first try

---

## 5. Payment Testing

### 5.1 Sandbox Strategy

| Provider | Sandbox Environment | Test Credentials | Key Behavior |
|----------|-------------------|------------------|--------------|
| **Stripe** | Stripe Test Mode | `pk_test_*`, `sk_test_*` | Use test card `4242 4242 4242 4242` |
| **PayFast** | PayFast Sandbox | Sandbox merchant ID + key | Use sandbox URL `sandbox.payfast.co.za` |
| **Ozow** | Ozow Test Mode | Test API keys | Use test bank account numbers |
| **Wallet** | Internal | N/A | Direct DB manipulation for balance |

### 5.2 Payment Test Matrix

```
tests/Feature/Payment/
├── StripePaymentTest.php
│   ├── test_stripe_intent_creation()
│   ├── test_stripe_payment_success()
│   ├── test_stripe_payment_declined()
│   ├── test_stripe_insufficient_funds()
│   ├── test_stripe_expired_card()
│   ├── test_stripe_network_error_retry()
│   ├── test_stripe_idempotency_key()
│   ├── test_stripe_webhook_signature_validation()
│   ├── test_stripe_webhook_duplicate_event()
│   ├── test_stripe_refund_full()
│   ├── test_stripe_refund_partial()
│   └── test_stripe_refund_after_dispute()
├── PayFastPaymentTest.php
│   ├── test_payfast_payment_init()
│   ├── test_payfast_return_url_success()
│   ├── test_payfast_return_url_cancel()
│   ├── test_payfast_webhook_valid_signature()
│   ├── test_payfast_webhook_invalid_signature_rejected()
│   ├── test_payfast_webhook_duplicate()
│   └── test_payfast_sandbox_full_flow()
├── OzowPaymentTest.php
│   ├── test_ozow_payment_init()
│   ├── test_ozow_return_url_success()
│   ├── test_ozow_return_url_cancel()
│   ├── test_ozow_webhook_valid()
│   ├── test_ozow_webhook_invalid_rejected()
│   └── test_ozow_sandbox_full_flow()
├── WalletPaymentTest.php
│   ├── test_wallet_payment_sufficient_balance()
│   ├── test_wallet_payment_insufficient_balance()
│   ├── test_wallet_deduction_atomic()
│   ├── test_wallet_concurrent_payments()
│   ├── test_wallet_deposit_via_stripe()
│   └── test_wallet_deposit_via_payfast()
├── RefundTest.php
│   ├── test_refund_prevents_double_refund()
│   ├── test_refund_updates_wallet_balance()
│   ├── test_refund_driver_deduction()
│   └── test_refund_escrow_release()
└── PaymentRouterTest.php (exists)
    ├── test_route_to_stripe_for_card()
    ├── test_route_to_wallet_for_wallet()
    ├── test_route_to_payfast_for_eft()
    └── test_default_route_fallback()
```

### 5.3 Stripe Test Cards

| Card Number | Behavior | Use Case |
|-------------|----------|----------|
| `4242 4242 4242 4242` | Success | Happy path |
| `4000 0000 0000 0002` | Declined | Card declined |
| `4000 0000 0000 9995` | Insufficient funds | Wallet insufficient |
| `4000 0000 0000 0069` | Expired card | Expired card |
| `4000 0000 0000 0127` | Incorrect CVC | CVC mismatch |
| `4000 0025 0000 3155` | Requires 3DS | Authentication required |

### 5.4 Webhook Testing

```php
// Stripe webhook test with signature verification
public function test_stripe_webhook_processes_payment_intent_succeeded()
{
    $payload = json_encode([
        'type' => 'payment_intent.succeeded',
        'data' => [
            'object' => [
                'id' => 'pi_test_123',
                'amount' => 15000, // R150.00 in cents
                'currency' => 'zar',
                'metadata' => ['ride_id' => $ride->id],
            ],
        ],
    ]);

    $timestamp = time();
    $signedPayload = "$timestamp.$payload";
    $signature = hash_hmac('sha256', $signedPayload, config('services.stripe.webhook_secret'));

    $response = $this->postJson('/api/v1/webhooks/stripe', json_decode($payload), [
        'HTTP_STRIPE_SIGNATURE' => "t=$timestamp,v1=$signature",
    ]);

    $response->assertOk();
    $this->assertDatabaseHas('payments', [
        'ride_id' => $ride->id,
        'status' => 'completed',
    ]);
}
```

### 5.5 Payment Reconciliation Tests

```php
test_daily_reconciliation_detects_mismatch()
test_reconciliation_handles_pending_webhooks()
test_reconciliation_flags_duplicate_payments()
test_reconciliation_generates_csv_report()
```

---

## 6. Location Testing

### 6.1 GPS/Geolocation Test Strategy

**Problem:** GPS is hardware-dependent and non-deterministic.

**Solution:** Mock at service layer + test with known coordinates.

#### Unit Tests (Backend)

```php
// tests/Unit/Services/GeoServiceTest.php
test_find_nearby_drivers_within_radius()
test_find_nearby_drivers_excludes_offline_drivers()
test_find_nearby_drivers_returns_sorted_by_distance()
test_find_nearby_drivers_with_zero_results()
test_calculate_distance_haversine()
test_calculate_distance_same_point()
test_geofence_contains_point_inside()
test_geofence_contains_point_outside()
test_geofence_boundary精确到米()
```

#### Unit Tests (Mobile)

```typescript
// __tests__/utils/geoCalculator.test.ts
test('calculateDistance returns meters between two coordinates')
test('calculateDistance returns 0 for same point')
test('isWithinGeofence returns true for inside point')
test('isWithinGeofence returns false for outside point')
test('isWithinGeofence handles boundary precision')
test('interpolatePosition returns midpoint')
test('interpolatePosition handles anti-meridian')
```

### 6.2 Geofencing Tests

```php
// Feature: Geofencing
test_ride_request_inside_service_area_accepted()
test_ride_request_outside_service_area_rejected()
test_driver_location_updates_respect_geofence()
test_airport_surcharge_applied_inside_airport_geofence()
test_airport_surcharge_not_applied_outside()
test_surge_pricing_zone_boundary()
```

### 6.3 Route Tracking Tests

```typescript
// Mobile: Route accuracy
test('route polyline renders correctly')
test('driver marker follows route')
test('eta updates as driver moves')
test('off-route detection triggers reroute')
test('location update every 50m threshold')
test('location update every 5s time threshold')
test('batch location updates when offline')
```

### 6.4 Location Accuracy Test Scenarios

| Scenario | Method | Expected |
|----------|--------|----------|
| Driver at exact pickup | Mock coords | Status → "arrived" within 50m |
| Driver 100m from pickup | Mock coords | Status remains "en_route" |
| GPS jump (teleport) | Send coords 5km apart | Reject or smooth transition |
| Zero coordinates (0,0) | Send lat=0, lng=0 | Reject with error |
| Null coordinates | Send null lat/lng | Reject with validation error |
| Very high speed (teleport) | Two updates 50km apart in 1s | Flag as impossible movement |
| Static driver (no movement) | Same coords for 10 min | No crash, keep last known |

### 6.5 Location Test Infrastructure

```bash
# Backend: Seed test locations in Phalaborwa
php artisan db:seed --class=PhalaborwaTestLocationsSeeder

# Mobile: Mock location on emulator
adb emu geo fix -23.9468 29.4726  # Phalaborwa CBD
adb emu geo fix -23.9500 29.4800  # Phalaborwa Airport

# Test service area boundary
adb emu geo fix -24.0000 29.5000  # Outside service area
```

---

## 7. Offline Testing

### 7.1 Test Scenarios

| ID | Scenario | Steps | Expected | Priority |
|----|----------|-------|----------|----------|
| OFF-001 | Launch offline | Airplane mode → open app | Login screen, no crash | P0 |
| OFF-002 | Action offline | Login → Airplane mode → request ride | Error alert, no crash | P0 |
| OFF-003 | Offline banner | Login → Airplane mode | Banner visible | P1 |
| OFF-004 | Offline → online | Airplane mode off → wait | Socket reconnects, banner gone, queue flushes | P0 |
| OFF-005 | Queue persistence | Offline action → force close → online | Queued request sent on reopen | P1 |
| OFF-006 | Socket reconnection | Disconnect network → reconnect | Auto-reconnect within 10 attempts | P0 |
| OFF-007 | Stale data display | Offline → view ride history | Shows cached data with "offline" indicator | P1 |
| OFF-008 | Background kill recovery | Active ride → force stop → reopen | Ride state restored from server | P0 |
| OFF-009 | Partial connectivity | Slow network (3G throttle) → ride request | Request completes with delay, no crash | P1 |
| OFF-010 | Intermittent connectivity | Toggle network every 5s for 1min | App handles gracefully, no data loss | P1 |

### 7.2 Offline Test Automation

```bash
# Toggle airplane mode
adb shell settings put global airplane_mode_on 1
adb shell am broadcast -a android.intent.action.AIRPLANE_MODE

# Throttle network (Android)
adb shell su -c "tc qdisc add dev wlan0 root netem delay 2000ms 500ms"

# Simulate poor signal
adb shell settings put global captive_portal_mode 0

# Kill app background
adb shell am force-stop com.easyryde.rider

# Clear app data
adb shell pm clear com.easyryde.rider
```

### 7.3 Offline Queue Implementation Tests

```typescript
// __tests__/services/offlineQueue.test.ts
test('enqueue stores request in AsyncStorage')
test('enqueue with duplicate key overwrites')
test('flush sends all queued requests in order')
test('flush handles individual request failure')
test('flush clears successful requests')
test('flush retries failed requests up to 3 times')
test('flush respects request dependencies')
test('queue persists across app restarts')
test('queue size limit prevents memory overflow')
```

---

## 8. Performance Testing

### 8.1 Mobile Performance Metrics

| Metric | Target | Tool | How to Measure |
|--------|--------|------|----------------|
| **App launch time (cold)** | <2s | `adb shell am start -W` | Time from intent to first frame |
| **App launch time (warm)** | <1s | `adb shell am start -W` | Resume from background |
| **Screen render time** | <300ms | React DevTools Profiler | Time to interactive |
| **FPS during map scroll** | >55fps | `adb shell dumpsys gfxinfo` | Frame render times |
| **Memory usage** | <150MB | `adb shell dumpsys meminfo` | PSS memory |
| **Battery drain (1hr active)** | <5% | Battery historian | Active ride tracking |
| **Battery drain (1hr background)** | <1% | Battery historian | Background location |
| **Bundle size (rider)** | <5MB | `npx react-native-bundle-visualizer` | JS bundle |
| **Bundle size (driver)** | <5MB | Same | JS bundle |
| **API response time (p95)** | <500ms | k6 load tests | End-to-end |
| **Socket event latency** | <100ms | Custom instrumentation | Emit to receive |

### 8.2 Load Test Scenarios (k6)

**Existing scenarios to enhance:**

```javascript
// scenarios/full-ride-flow.js — End-to-end ride lifecycle
export const options = {
  scenarios: {
    // Normal load: 50 concurrent rides
    normal_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },
        { duration: '10m', target: 50 },
        { duration: '2m', target: 0 },
      ],
    },
    // Peak load: Friday evening rush (Phalaborwa)
    peak_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 200 },
        { duration: '15m', target: 200 },
        { duration: '5m', target: 0 },
      ],
    },
    // Spike: Event at Phalaborwa Stadium
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 500 },
        { duration: '2m', target: 500 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    ride_creation_duration: ['p(95)<800'],
    ride_matching_duration: ['p(95)<5000'], // 5s max for driver matching
  },
};
```

### 8.3 Map Rendering Performance

```typescript
// Test: Map performance with many markers
test('map renders 50 driver markers without lag', async () => {
  const startTime = Date.now();
  await renderMapWithDrivers(50);
  const renderTime = Date.now() - startTime;
  expect(renderTime).toBeLessThan(1000);
});

// Test: Marker animation smoothness
test('driver marker animates smoothly across 100 position updates', async () => {
  const frameDrops = await measureFrameDrops(100LocationUpdates);
  expect(frameDrops).toBeLessThan(5); // Max 5 dropped frames
});
```

### 8.4 Database Performance

```php
// Load test: 1000 concurrent ride creations
test_ride_creation_under_load()
test_driver_matching_performance_with_1000_drivers()
test_payment_processing_under_load()
test_location_update_bulk_insert_performance()
```

---

## 9. Security Testing

### 9.1 API Security Checklist

| Check | Method | Tool |
|-------|--------|------|
| **Authentication bypass** | Access protected routes without token | curl + k6 |
| **Authorization bypass** | Access admin routes with rider token | Feature tests |
| **SQL injection** | Inject SQL in search/input fields | sqlmap + manual |
| **XSS injection** | Inject `<script>` in all input fields | Manual + automated |
| **CSRF protection** | Submit forms without CSRF token | Feature tests |
| **Rate limiting** | Send 100 requests in 1s | k6 |
| **Token expiry** | Use expired JWT | Feature tests |
| **Token revocation** | Use revoked token after logout | Feature tests |
| **IDOR** | Access other user's rides/payments | Feature tests |
| **Mass assignment** | Send extra fields in update requests | Feature tests |
| **File upload** | Upload malicious files (KYC docs) | Manual |
| **API versioning** | Access deprecated API versions | curl |
| **CORS** | Cross-origin requests from unknown origin | curl |
| **Content-Type** | Send wrong content-type | curl |
| **Response size** | Request unbounded lists | k6 |

### 9.2 Security Test Files

```
load-tests/security/
├── auth-bypass.js              # EXISTS — enhance with token tests
├── csrf-tests.js               # EXISTS — enhance
├── rate-limit-bypass.js        # EXISTS — enhance
├── sql-injection.js            # EXISTS — enhance with union-based
├── webhook-forgery.js          # EXISTS — enhance with signature tests
├── xss-injection.js            # EXISTS — enhance with stored XSS
├── idor-tests.js               # NEW — access other user's resources
├── mass-assignment.js          # NEW — extra fields in update
├── jwt-attacks.js              # NEW — token manipulation
├── cors-bypass.js              # NEW — cross-origin attacks
└── api-abuse.js                # NEW — abuse prevention
```

### 9.3 JWT Security Tests

```php
// Feature: JWT Security
test_expired_token_rejected()
test_revoked_token_rejected()
test_tampered_token_rejected()
test_token_with_wrong_role_rejected()
test_token_from_different_issuer_rejected()
test_refresh_token_cannot_be_used_as_access_token()
test_concurrent_token_use_across_devices()
```

### 9.4 Webhook Security Tests

```php
// Feature: Webhook Security
test_stripe_webhook_rejects_invalid_signature()
test_payfast_webhook_rejects_invalid_signature()
test_ozow_webhook_rejects_invalid_signature()
test_webhook_rejects_replay_attack_old_timestamp()
test_webhook_rejects_tampered_payload()
test_webhook_handles_large_payload_gracefully()
```

### 9.5 South Africa Specific Security

```php
// POPIA compliance
test_user_data_export_includes_all_pii()
test_user_data_erasure_removes_pii()
test_user_data_erasure_preserves_financial_records()
test_consent_grant_recorded_with_timestamp()
test_consent_revocation_prevents_data_processing()
test_data_breach_notification_within_72_hours()
```

---

## 10. User Acceptance Testing

### 10.1 Test Environment

- **Location:** Phalaborwa, Limpopo, South Africa
- **Network:** Vodacom/MCella 4G, WiFi at venues
- **Devices:** Samsung Galaxy A12 (budget), Samsung Galaxy S21 (mid), iPhone 12 (iOS)
- **Payment methods:** Cash, Capitec bank, FNB, Standard Bank
- **Time of day:** Morning rush (7-9am), evening rush (5-7pm), weekend

### 10.2 Rider UAT Scenarios

| ID | Scenario | Steps | Success Criteria | Priority |
|----|----------|-------|-----------------|----------|
| UAT-R01 | First-time registration | Download app → register → verify → first ride | Account created, ride booked, payment processed | P0 |
| UAT-R02 | Book ride to airport | Enter pickup (CBD) → destination (airport) → request → pay with cash | Driver arrives <10min, fare matches estimate ±10% | P0 |
| UAT-R03 | Book ride with wallet | Load wallet → request ride → pay with wallet | Balance deducted correctly | P0 |
| UAT-R04 | Cancel ride | Request → cancel before driver arrives | No charge, ride cancelled | P0 |
| UAT-R05 | Rate driver | Complete ride → rate 5 stars → add comment | Rating saved, driver sees it | P1 |
| UAT-R06 | Report issue | During ride → tap SOS → select issue | SOS logged, admin notified | P0 |
| UAT-R07 | Chat with driver | During ride → send message → driver replies | Messages delivered in real-time | P1 |
| UAT-R08 | Ride history | View past rides → tap detail → see receipt | All rides listed, receipt correct | P1 |
| UAT-R09 | Apply promo code | Request ride → enter promo → verify discount | Discount applied, fare reduced | P1 |
| UAT-R10 | Referral | Share code → friend registers → both get bonus | Referral tracked, bonus credited | P2 |

### 10.3 Driver UAT Scenarios

| ID | Scenario | Steps | Success Criteria | Priority |
|----|----------|-------|-----------------|----------|
| UAT-D01 | First drive | Register → KYC → admin approve → go online → first ride | Full onboarding works | P0 |
| UAT-D02 | Accept ride request | Go online → receive request → accept → navigate | Ride accepted, navigation works | P0 |
| UAT-D03 | Complete ride flow | Arrive → start → complete → receive payment | Payment reflected in earnings | P0 |
| UAT-D04 | Background location | Go online → press home → wait 5min → return | Location still tracked | P0 |
| UAT-D05 | Decline ride | Receive request → decline → receive next | Declined, next request comes | P1 |
| UAT-D06 | Cash collection | Complete ride → rider pays cash → confirm | Cash marked as collected | P0 |
| UAT-D07 | Earnings tracking | Complete 5 rides → view earnings | All rides reflected in earnings | P1 |
| UAT-D08 | Low battery | Battery at 5% → continue ride → complete | App handles gracefully | P1 |
| UAT-D09 | Poor signal | Ride in area with poor 3G → location updates | Location queued, sent when connected | P1 |
| UAT-D10 | Multi-day tracking | Online for 8 hours → check battery drain | Battery drain <40% for 8hr shift | P1 |

### 10.4 Admin UAT Scenarios

| ID | Scenario | Steps | Success Criteria | Priority |
|----|----------|-------|-----------------|----------|
| UAT-A01 | Dashboard review | Login → view metrics → compare with manual count | Metrics match manual count ±5% | P0 |
| UAT-A02 | Approve driver | View pending → approve → driver goes online | Driver appears in active list | P0 |
| UAT-A03 | Handle SOS | Receive SOS → view details → acknowledge → resolve | Full SOS lifecycle works | P0 |
| UAT-A04 | Process payout | View pending payouts → process → verify bank deposit | Money received in bank account | P0 |
| UAT-A05 | View reports | Navigate to reports → export revenue → verify CSV | CSV opens in Excel, data correct | P1 |
| UAT-A06 | Manage food delivery | Add restaurant → add menu items → view orders | Restaurant visible to riders | P1 |
| UAT-A07 | Handle dispute | View disputed payment → review → resolve | Resolution applied correctly | P1 |
| UAT-A08 | Audit trail | View audit logs → verify actions logged | All admin actions logged | P1 |

### 10.5 UAT Data Collection

For each UAT session, collect:
- Device model + OS version
- Network type (4G/WiFi) + signal strength
- Time taken for each task
- Number of errors encountered
- User satisfaction score (1-5)
- Open-ended feedback

---

## 11. CI/CD Test Integration

### 11.1 GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  # ─── Backend Tests ──────────────────────────────────────
  backend-unit:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_DATABASE: easyryde_test
          MYSQL_ROOT_PASSWORD: password
        ports: ['3306:3306']
      redis:
        image: redis:7
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          extensions: mbstring, xml, ctype, json, bcmath, pdo_mysql
          coverage: xdebug
      - run: composer install --no-progress
      - run: cp .env.example .env
      - run: php artisan key:generate
      - run: php artisan migrate --force
      - run: php artisan test --testsuite=Unit --coverage-text
      - run: php artisan test --testsuite=Feature --coverage-text
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-report
          path: coverage/

  # ─── Socket Server Tests ────────────────────────────────
  socket-server:
    runs-on: ubuntu-latest
    services:
      redis:
        image: redis:7
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd socket-server && npm ci
      - run: cd socket-server && npm test
      - run: cd socket-server && npm run test:load  # k6 load tests

  # ─── Web Admin E2E ──────────────────────────────────────
  web-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd web && npm ci
      - run: cd web && npx playwright install --with-deps
      - run: cd web && npm run build
      - run: cd web && npx serve dist -p 3000 &
      - run: cd web && npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: web/playwright-report/

  # ─── Mobile Unit Tests ──────────────────────────────────
  mobile-unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd mobile && npm ci
      - run: cd mobile && npx jest --coverage --forceExit
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: mobile-coverage
          path: mobile/coverage/

  # ─── Security Scan ──────────────────────────────────────
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run SQL injection tests
        run: k6 run load-tests/security/sql-injection.js
      - name: Run XSS tests
        run: k6 run load-tests/security/xss-injection.js
      - name: Run auth bypass tests
        run: k6 run load-tests/security/auth-bypass.js
      - name: Run CSRF tests
        run: k6 run load-tests/security/csrf-tests.js

  # ─── Mobile E2E (on PR merge only) ──────────────────────
  mobile-e2e:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Setup Android SDK
        uses: android-actions/setup-android@v3
      - name: Start Android Emulator
        run: |
          sdkmanager "system-images;android-33;google_apis;x86_64"
          avdmanager create avd -n test -k "system-images;android-33;google_apis;x86_64"
          emulator -avd test -no-window -no-audio &
          adb wait-for-device
      - run: cd mobile && npm ci
      - run: cd mobile && npx detox build --configuration android.emu.debug
      - run: cd mobile && npx detox test --configuration android.emu.debug
```

### 11.2 Test Execution Matrix

| Trigger | Backend Unit | Backend Feature | Socket | Web E2E | Mobile Unit | Mobile E2E | Security | Load |
|---------|-------------|----------------|--------|---------|-------------|------------|----------|------|
| **PR to main/develop** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Merge to main** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Nightly (cron)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Pre-release** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Manual dispatch** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### 11.3 Test Gate Requirements

| Gate | Requirement | Blocking |
|------|-------------|----------|
| **PR merge** | All unit + feature tests pass, coverage >70% | Yes |
| **PR merge** | No P0/P1 security findings | Yes |
| **Deploy to staging** | All tests pass, no regression in coverage | Yes |
| **Deploy to production** | All tests pass, load test thresholds met | Yes |
| **Release** | UAT sign-off, performance benchmarks met | Yes |

---

## 12. Bug Severity Classification

### 12.1 Severity Levels

| Level | Name | Definition | Response Time | Fix Timeline |
|-------|------|------------|---------------|-------------|
| **S1** | Critical | System down, data loss, security breach, payment failure | 1 hour | 4 hours |
| **S2** | High | Major feature broken, no workaround, affects all users | 4 hours | 24 hours |
| **S3** | Medium | Feature partially broken, workaround exists, affects some users | 24 hours | 1 week |
| **S4** | Low | Cosmetic issue, minor inconvenience, edge case | 1 week | Next sprint |
| **S5** | Trivial | Typo, alignment, minor visual inconsistency | 2 weeks | Backlog |

### 12.2 Priority Matrix

| Severity \ Frequency | Always | Often | Sometimes | Rarely |
|---------------------|--------|-------|-----------|--------|
| **S1 Critical** | P0 | P0 | P0 | P0 |
| **S2 High** | P0 | P1 | P1 | P2 |
| **S3 Medium** | P1 | P1 | P2 | P3 |
| **S4 Low** | P2 | P2 | P3 | P3 |
| **S5 Trivial** | P3 | P3 | P3 | P4 |

### 12.3 Bug Classification Examples (EasyRyde)

| Bug | Severity | Priority | Justification |
|-----|----------|----------|---------------|
| Ride payment charged twice | S1 | P0 | Financial impact, affects trust |
| SOS alert not delivered | S1 | P0 | Safety critical |
| Driver cannot go online | S2 | P0 | Core feature broken, no revenue |
| App crashes on ride request | S2 | P0 | Complete feature failure |
| Push notification delayed | S3 | P1 | Feature degraded, workaround (pull refresh) |
| Map marker jumps occasionally | S3 | P2 | Visual glitch, doesn't block functionality |
| Incorrect fare estimate (±5%) | S3 | P1 | Financial impact but small |
| Chat messages out of order | S3 | P1 | Feature degraded |
| Profile photo not loading | S4 | P2 | Cosmetic, doesn't block |
| Typo in error message | S5 | P3 | Trivial |
| Button alignment off by 2px | S5 | P3 | Trivial |

### 12.4 Bug Report Template

```markdown
## Bug Report

**Title:** [Brief description]
**Severity:** S1/S2/S3/S4/S5
**Priority:** P0/P1/P2/P3/P4
**Environment:** [OS version, app version, network type]
**Device:** [Model, emulator/physical]

### Steps to Reproduce
1. ...
2. ...
3. ...

### Expected Result
What should happen

### Actual Result
What actually happens

### Evidence
- Screenshots/screen recording
- Logcat output (`adb logcat | grep EasyRyde`)
- Docker API logs
- Socket server logs

### Frequency
[ ] Always  [ ] Often  [ ] Sometimes  [ ] Rarely

### Workaround
Is there a way to work around this bug?

### Impact
How many users affected? What feature is broken?
```

### 12.5 Regression Bug Policy

- Any bug that was previously fixed and reappears is automatically **S2/P0**
- If the regression reaches production: **S1/P0** with post-mortem required
- Regression tests must be added to prevent recurrence

---

## Appendix A: Test Framework Versions

| Tool | Version | Purpose |
|------|---------|---------|
| PHPUnit | 11.x | Backend unit + feature tests |
| Jest | 29.x | Mobile unit tests |
| Detox | 20.x | Mobile E2E tests |
| Playwright | 1.45+ | Web admin E2E tests |
| k6 | 0.50+ | Load + security tests |
| Mocha + Chai | 11.x / 5.x | Socket server tests |
| MSW | 2.x | Mobile API mocking |

## Appendix B: Test Data Management

```bash
# Reset test database
php artisan migrate:fresh --seed

# Seed Phalaborwa-specific test data
php artisan db:seed --class=PhalaborwaSeeder

# Create test users
php artisan tinker --execute="
User::create(['name'=>'Test Rider','email'=>'rider@test.com','password'=>Hash::make('Password1!'),'role'=>'user']);
User::create(['name'=>'Test Driver','email'=>'driver@test.com','password'=>Hash::make('Password1!'),'role'=>'driver']);
User::create(['name'=>'Test Admin','email'=>'admin@test.com','password'=>Hash::make('Password1!'),'role'=>'admin']);
"

# Reset mobile app state
adb shell pm clear com.easyryde.rider
adb shell pm clear com.easyryde.driver
adb shell pm clear com.easyryde.admin
```

## Appendix C: Monitoring Dashboards

Set up Grafana dashboards for:
1. **Test Results** — Pass/fail rates over time, flaky test detection
2. **Coverage Trends** — Line/branch coverage per module, coverage deltas per PR
3. **Load Test Results** — Response times, throughput, error rates over time
4. **Security Scan Results** — Findings by severity, remediation status
5. **Bug Metrics** — Open bugs by severity, mean time to fix, regression rate
