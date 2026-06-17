# EasyRyde — Epics & User Stories

**Phase:** 04 — Work Breakdown
**Version:** 1.0.0
**Updated:** 2026-06-17

---

## Epic E1: Production Hardening (40h) — P0 Critical

> Secure the foundation: validation, secrets management, configuration, rate limiting, PII encryption, monitoring.

### Story E1.1: FormRequest Validation for All Endpoints

**Description:** Create 20+ FormRequest classes to replace inline validation across all POST/PUT/PATCH API endpoints. Every request must have typed rules, custom error messages, and an authorize() check.

**Files to create:**
- `backend/app/Http/Requests/Api/V1/Auth/RegisterRequest.php`
- `backend/app/Http/Requests/Api/V1/Auth/LoginRequest.php`
- `backend/app/Http/Requests/Api/V1/Auth/ForgotPasswordRequest.php`
- `backend/app/Http/Requests/Api/V1/Auth/ResetPasswordRequest.php`
- `backend/app/Http/Requests/Api/V1/Ride/RideCreateRequest.php`
- `backend/app/Http/Requests/Api/V1/Ride/RideCancelRequest.php`
- `backend/app/Http/Requests/Api/V1/Ride/RideRateRequest.php`
- `backend/app/Http/Requests/Api/V1/Ride/RideApplyPromoRequest.php`
- `backend/app/Http/Requests/Api/V1/Driver/DriverProfileUpdateRequest.php`
- `backend/app/Http/Requests/Api/V1/Driver/VehicleRegisterRequest.php`
- `backend/app/Http/Requests/Api/V1/Driver/ToggleOnlineRequest.php`
- `backend/app/Http/Requests/Api/V1/Payment/PaymentRequest.php`
- `backend/app/Http/Requests/Api/V1/Payment/PayFastWebhookRequest.php`
- `backend/app/Http/Requests/Api/V1/Payment/OzowWebhookRequest.php`
- `backend/app/Http/Requests/Api/V1/Wallet/WalletDepositRequest.php`
- `backend/app/Http/Requests/Api/V1/Wallet/WalletWithdrawRequest.php`
- `backend/app/Http/Requests/Api/V1/Delivery/DeliveryCreateRequest.php`
- `backend/app/Http/Requests/Api/V1/Admin/AdminSettingsRequest.php`
- `backend/app/Http/Requests/Api/V1/Admin/PricingUpdateRequest.php`
- `backend/app/Http/Requests/Api/V1/Admin/DriverApproveRequest.php`
- `backend/app/Http/Requests/Api/V1/Promo/PromoCodeCreateRequest.php`
- `backend/app/Http/Requests/Api/V1/Rating/RatingCreateRequest.php`
- `backend/app/Http/Requests/Api/V1/Food/FoodMenuCreateRequest.php`
- `backend/app/Http/Requests/Api/V1/Food/FoodOrderCreateRequest.php`
- `backend/app/Http/Requests/Api/V1/Sos/SosTriggerRequest.php`
- `backend/app/Http/Requests/Api/V1/Chat/ChatSendRequest.php`

**Acceptance Criteria:**
- Every POST/PUT/PATCH endpoint has a corresponding FormRequest
- Each FormRequest contains `rules()`, `messages()`, and `authorize()`
- `authorize()` checks for the correct role (rider, driver, admin) using Spatie permissions
- Validation error responses follow the standard JSON: `{ "message": "...", "errors": { "field": ["..."] } }`
- All existing controllers are updated to type-hint the FormRequest instead of `Request`

### Story E1.2: Harden .gitignore and Remove Secrets

**Description:** Audit the repository for hardcoded secrets, API keys, and credentials. Patch .gitignore to prevent future leaks. Rotate compromised keys.

**Files to modify:**
- `backend/.gitignore`
- `backend/config/services.php`
- `backend/config/app.php`

**Acceptance Criteria:**
- `storage/*.json` and `storage/firebase-service-account.json` added to .gitignore
- Firebase service account key removed from repo and rotated
- PayFast sandbox credentials (`PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY`) removed from `config/services.php` defaults
- Stripe test keys removed from config defaults
- Any `.env` files in repo history checked with `git log -p` for accidental commits
- `.env` listed in `.gitignore` (confirm it already is)
- `git-secrets` or equivalent pre-commit hook configured to block future credential commits

### Story E1.3: Complete .env.example and Env Configuration

**Description:** Create comprehensive .env.example with ALL required environment variables, grouped and documented. Add missing keys for Sentry, Stripe, PayFast, Ozow, FCM, Twilio, SendGrid, and other integrations.

**Files to create/modify:**
- `backend/.env.example` (rewrite)
- `backend/.env.production` (new — template for production deploys)

**Acceptance Criteria:**
- Every config key referenced in `config/*.php` has an entry in `.env.example`
- Keys are grouped by service (APP, DB, REDIS, SENTRY, STRIPE, PAYFAST, OZOW, FCM, TWILIO, SENDGRID, GOOGLE_MAPS, etc.)
- Each key has a clear comment describing its purpose and expected format
- `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_TRACES_SAMPLE_RATE` present
- `STRIPE_KEY`, `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET` present
- `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY`, `PAYFAST_PASSPHRASE`, `PAYFAST_MODE`, `PAYFAST_RETURN_URL`, `PAYFAST_CANCEL_URL`, `PAYFAST_NOTIFY_URL` present
- `OZOW_API_KEY`, `OZOW_SITE_CODE`, `OZOW_COUNTRY_CODE`, `OZOW_CURRENCY_CODE`, `OZOW_WEBHOOK_SECRET`, `OZOW_MODE` present
- `FCM_SERVER_KEY`, `FCM_SENDER_ID` present
- `TWILIO_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` present
- `SENDGRID_API_KEY`, `SENDGRID_FROM_ADDRESS`, `SENDGRID_FROM_NAME` present
- `GOOGLE_MAPS_API_KEY` present
- `.env.production` has placeholder values marked with CHANGEME

### Story E1.4: Auth Rate Limiting

**Description:** Wire tiered rate limiting on authentication endpoints to prevent brute-force and abuse.

**Files to modify:**
- `backend/app/Http/Kernel.php`
- `backend/app/Http/Controllers/Api/V1/AuthController.php`
- `backend/routes/api.php`

**Acceptance Criteria:**
- Login endpoint: 10 requests per minute per IP
- Register endpoint: 5 requests per minute per IP
- Forgot password endpoint: 3 requests per minute per IP
- Reset password endpoint: 5 requests per minute per IP
- General API: 60 requests per minute per authenticated user, 30 per minute per guest
- Rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`) present in all responses
- `429 Too Many Requests` response returns standard JSON error format
- Custom rate limit key includes IP + user_agent to prevent IP-based bypass
- Throttle middleware group applied via route group, not individual routes

### Story E1.5: Encrypt PII Columns

**Description:** Apply Laravel's encryption casts to all personally identifiable information (PII) columns across the database to ensure data is encrypted at rest.

**Files to modify:**
- `backend/app/Models/User.php`
- `backend/app/Models/Driver.php`
- `backend/app/Models/Rider.php`
- (any other model with PII)

**Acceptance Criteria:**
- `phone_number` column on `users` table uses `$casts = ['phone_number' => 'encrypted']`
- `email` column on `users` table uses `$casts = ['email' => 'encrypted']`
- Driver's `id_number`, `license_number`, `vehicle_registration` columns encrypted
- Rider's `emergency_contact_name`, `emergency_contact_phone` encrypted
- All existing queries that filter/where on encrypted columns are reviewed — Laravel encrypted casts are searchable via exact match only
- A migration `add_encrypted_columns_to_users_table.php` handles the transition: add encrypted columns → backfill data → drop plaintext columns
- Decryption happens automatically on read (Laravel handles this)

### Story E1.6: Sentry Error + Performance Monitoring

**Description:** Install and configure Sentry for PHP error tracking and performance monitoring with alerts.

**Files to modify:**
- `backend/composer.json`
- `backend/config/sentry.php` (publish config)
- `backend/.env.example`
- `backend/app/Exceptions/Handler.php`

**Acceptance Criteria:**
- `sentry/sdk` or `sentry/sentry-laravel` installed via Composer
- Sentry config published: `php artisan vendor:publish --provider="Sentry\Laravel\ServiceProvider"`
- `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_TRACES_SAMPLE_RATE` read from .env
- Traces sample rate at 0.25 (sampling 25% of transactions in production)
- Performance monitoring enabled with `SENTRY_TRACES_SAMPLE_RATE`
- Custom error handler in `App\Exceptions\Handler` reports all non-404 exceptions to Sentry
- Sentry breadcrumbs enabled for database queries, HTTP client calls, queue jobs
- Release tracking set via `SENTRY_RELEASE` env var or git commit hash
- Alert rules configured in Sentry dashboard (error rate > 5% in 5min → email + Slack)

---

## Epic E2: Payment Integration (60h) — P0 Critical

> Real payment gateway integration with South African providers: Stripe, PayFast, Ozow, plus cash, wallet, escrow, and refunds.

### Story E2.1: Stripe Payment Integration

**Description:** Wire live Stripe integration: payment intent creation, confirmation, webhook handling, and reconciliation.

**Files to create/modify:**
- `backend/app/Services/Payment/StripeService.php`
- `backend/app/Http/Controllers/Api/V1/PaymentController.php`
- `backend/app/Http/Controllers/Api/V1/WebhookController.php`
- `backend/routes/api.php`
- `backend/config/services.php`

**Acceptance Criteria:**
- `StripeService` creates a PaymentIntent for ride fare
- PaymentIntent metadata includes `ride_id`, `rider_id`, `driver_id`
- `POST /api/v1/payments/stripe/create-intent` returns client_secret for the mobile app
- `POST /api/v1/payments/stripe/confirm` confirms payment on the server
- Stripe webhook endpoint handles `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
- Webhook signature verified via `stripe-webhook-signature` header
- Successful payment triggers `PaymentSucceeded` event
- Failed payment triggers `PaymentFailed` event and notifies rider
- Test mode toggle via `STRIPE_MODE=test|live`

### Story E2.2: PayFast ITN Verification

**Description:** Implement PayFast's Instant Transaction Notification (ITN) system for payment confirmation.

**Files to create/modify:**
- `backend/app/Services/Payment/PayFastService.php`
- `backend/app/Http/Controllers/Api/V1/PaymentController.php`
- `backend/routes/api.php`
- `backend/config/services.php`

**Acceptance Criteria:**
- `PayFastService::generatePaymentUrl($amount, $itemName, $merchantData)` generates signed PayFast redirect URL
- Signature calculation matches PayFast spec: `md5(merchant_id + "|" + passphrase + "|" + amount)`
- ITN handler validates: source IP is PayFast (check allowlist), signature matches, payment status is COMPLETE
- `POST /api/v1/payments/payfast/itn` accepts application/x-www-form-urlencoded form POST
- Successful ITN creates Payment record and triggers `PaymentSucceeded` event
- Failed/cancelled ITN creates Payment record with failed status
- ITN idempotency: duplicate ITN with same `pf_payment_id` is ignored
- Return URL (`GET /api/v1/payments/payfast/return`) redirects to mobile app via deep link
- Cancel URL redirects to app payment screen with cancelled status

### Story E2.3: Ozow Signature Verification

**Description:** Implement Ozow webhook integration with HMAC-SHA256 signature verification.

**Files to create/modify:**
- `backend/app/Services/Payment/OzowService.php`
- `backend/app/Http/Controllers/Api/V1/PaymentController.php`
- `backend/routes/api.php`
- `backend/config/services.php`

**Acceptance Criteria:**
- `OzowService::createPaymentRequest($amount, $transactionReference, $customer)` generates Ozow redirect payload
- Signature computed: `HMAC-SHA256(siteCode + amount + currency + countryCode + transactionReference, apiKey)`
- `POST /api/v1/payments/ozow/webhook` verifies webhook signature via Ozow's hash check
- Webhook payload matched against: `TransactionId`, `TransactionReference`, `Amount`, `CurrencyCode`, `Status`
- Status `Complete` triggers payment success flow
- Status `Cancelled`, `Error`, `Pending` handled appropriately
- Return URL redirects to app via deep link with transaction reference
- Ozow test card transactions succeed in sandbox mode before production switch
- idempotency key handling prevents duplicate webhook processing

### Story E2.4: Escrow System

**Description:** Implement 24-hour payment escrow with dispute window and auto-release to driver wallet.

**Files to create/modify:**
- `backend/app/Services/Payment/EscrowService.php`
- `backend/app/Console/Commands/ReleaseEscrowPayments.php`
- `backend/app/Jobs/ReleaseEscrowJob.php`
- `backend/app/Models/Payment.php`

**Acceptance Criteria:**
- On ride completion, payment status set to `held` with `held_until` = now + 24 hours
- Rider sees payment as "pending release" in their ride history
- 24-hour countdown timer displayed in rider app
- Rider can dispute within the 24-hour window (opens support ticket)
- Disputed escrow: payment remains held until admin resolves
- Cron job runs every 5 minutes: queries `payments WHERE status=held AND held_until <= NOW()`
- Escrow release: payment status → `released`, driver wallet credited with fare minus platform fee
- `ReleaseEscrowJob` handles each payment individually with retry logic (max 3 attempts)
- Failed release after 3 attempts: payment flagged manual_review, admin notified

### Story E2.5: Cash Payment Reconciliation

**Description:** Implement driver-initiated cash payment marking with automatic platform fee deduction and reconciliation tracking.

**Files to create/modify:**
- `backend/app/Services/Payment/CashReconciliationService.php`
- `backend/app/Models/CashReconciliation.php`
- `backend/app/Http/Controllers/Api/V1/PaymentController.php`
- `backend/database/migrations/xxxx_create_cash_reconciliations_table.php`

**Acceptance Criteria:**
- Driver marks ride as `paid_in_cash` via `POST /api/v1/payments/rides/{ride}/mark-cash-paid`
- System records: ride_id, driver_id, rider_id, fare_amount, platform_fee, driver_earns, timestamp
- Platform fee calculated as `fare * config('services.platform.fee_percentage')` (default 15%)
- Platform fee logged as a negative driver wallet transaction
- Daily cash reconciliation report generated at 02:00 (total cash collected, total fees due, discrepancies)
- Admin dashboard shows cash reconciliation status (reconciled, pending, discrepancy)
- Discrepancy flagged if driver-reported cash ≠ system-calculated fare
- Driver cannot mark cash paid if ride was already paid via card/gateway

### Story E2.6: Refund Workflow

**Description:** Admin-initiated refund workflow supporting full and partial refunds through the original payment gateway.

**Files to create/modify:**
- `backend/app/Services/Payment/RefundService.php`
- `backend/app/Models/RefundRequest.php`
- `backend/app/Http/Controllers/Api/V1/AdminController.php`
- `backend/app/Http/Controllers/Api/V1/PaymentController.php`
- `backend/database/migrations/xxxx_create_refund_requests_table.php`

**Acceptance Criteria:**
- Rider can request refund via app (opens refund ticket)
- Admin reviews refund request in dashboard with ride details, payment info
- Admin can approve full refund, partial refund, or reject with reason
- Refund processed through original gateway: Stripe → Stripe refund API, PayFast → PayFast refund, Ozow → Ozow refund
- Wallet payments: refund directly to wallet
- Cash payments: marked as refund_pending, admin handles manually
- Refund status tracked: pending → processing → completed → failed
- Failed refund: retried 2x, then flagged manual_review
- Refund notification sent to rider (push + email)
- Refund records include: original payment_id, amount, reason, admin_id, processed_at

### Story E2.7: Driver Payout/Settlement Engine

**Description:** Automated driver payout processing with daily (amounts > R200) and weekly (amounts < R200) settlement schedules.

**Files to create/modify:**
- `backend/app/Services/Payment/PayoutService.php`
- `backend/app/Models/DriverPayout.php`
- `backend/app/Console/Commands/ProcessDriverPayouts.php`
- `backend/app/Jobs/ProcessPayoutJob.php`
- `backend/database/migrations/xxxx_create_driver_payouts_table.php`

**Acceptance Criteria:**
- Payout eligibility: driver's available wallet balance > R0
- Daily payout (runs at 06:00): drivers with balance > R200 receive full balance
- Weekly payout (runs Monday 06:00): drivers with balance > R0 and <= R200 receive balance
- Payout methods: bank transfer (EFT), wallet credit
- Bank details stored encrypted in driver profile
- Each payout recorded in `driver_payouts` with: driver_id, amount, method, status, reference, processed_at
- Payout status: pending → processing → completed / failed
- Failed payout: retry 3x with 1-hour delay, then flag manual_review
- Admin can trigger manual payout for any driver
- Payout history viewable by driver in earnings screen
- Monthly payout summary emailed to driver

---

## Epic E3: Real-Time & Notifications (50h) — P0 Critical

> Real-time communication layer: push notifications, GPS tracking, SMS, email, in-app alerts, and SOS.

### Story E3.1: FCM Push Notifications

**Description:** Wire Firebase Cloud Messaging push notifications for iOS and Android via expo-notifications, with push token registration and event-driven sending.

**Files to create/modify:**
- `backend/app/Services/Notification/PushNotificationService.php`
- `backend/app/Models/PushToken.php`
- `backend/app/Http/Controllers/Api/V1/NotificationController.php`
- `backend/database/migrations/xxxx_create_push_tokens_table.php`
- `mobile/packages/api-client/src/notifications.ts`
- `mobile/apps/rider/app.tsx` (register push token on app start)
- `mobile/apps/driver/app.tsx` (register push token on app start)

**Acceptance Criteria:**
- Push token registration endpoint: `POST /api/v1/notifications/register-token`
- Tokens stored with: token, device_type (ios/android), user_id, last_used_at
- Token deactivation on logout: `POST /api/v1/notifications/deactivate-token`
- Ride events trigger push: ride_accepted, driver_arrived, ride_started, ride_completed, ride_cancelled, payment_received
- Push notification payload includes: title, body, data (deep_link, ride_id)
- FCM sends via HTTP v1 API (not legacy FCM)
- Failed sends: queue retry with max 3 attempts, then log and continue
- Retry logic with exponential backoff (5s, 15s, 60s)

### Story E3.2: Background Driver GPS Tracking

**Description:** Implement continuous background location tracking in the driver app using expo-task-manager with foreground service on Android.

**Files to create/modify:**
- `mobile/apps/driver/src/hooks/useLocationTracking.ts`
- `mobile/apps/driver/src/services/locationService.ts`
- `mobile/apps/driver/app.config.ts` (foreground service, location permissions)
- `socket-server/src/handlers/driverHandler.js` (location update handler)
- `mobile/packages/api-client/src/socket.ts` (WebSocket client)

**Acceptance Criteria:**
- Location tracking starts when driver goes online and stops when offline
- Updates sent via WebSocket every 5 seconds while ride is active, every 10 seconds when idle
- Android foreground service shows notification: "EasyRyde is using your location"
- Location updates continue when app is in background
- Battery optimization: location updates coalesced via `LocationAccuracy.Balanced` when idle
- Stale driver cleanup: drivers with no location update in 10min marked offline
- Permission handling: if location permission revoked, driver marked offline with notification
- iOS: request `whenInUse` permission with background mode capability

### Story E3.3: SMS Notifications

**Description:** Wire SMS notifications via Twilio for critical events: ride confirmations, payment receipts, SOS alerts.

**Files to create/modify:**
- `backend/app/Services/Notification/SmsService.php`
- `backend/app/Notifications/RideConfirmedSms.php`
- `backend/app/Notifications/SosAlertSms.php`
- `backend/app/Notifications/PaymentReceiptSms.php`
- `backend/config/services.php`

**Acceptance Criteria:**
- `SmsService::send($to, $message)` wraps Twilio API call
- SMS templates defined in code: ride_confirmation, payment_receipt, sos_alert, otp_verification
- SMS sent on: ride booked (to rider), ride accepted (to rider as backup), SOS triggered (to emergency contact + admin)
- Error handling: if Twilio fails, log error and continue (non-blocking)
- Rate limiting: max 5 SMS per user per hour (anti-abuse)
- `twilio_from_number` configurable per country code
- SMS opt-out honored (standard STOP keyword response)

### Story E3.4: Email Notifications

**Description:** Wire email notifications via SendGrid/Mailgun for transactional emails: payment receipts, driver approvals, weekly summaries.

**Files to create/modify:**
- `backend/app/Services/Notification/EmailService.php`
- `backend/app/Mail/PaymentReceipt.php`
- `backend/app/Mail/DriverApproved.php`
- `backend/app/Mail/DriverRejected.php`
- `backend/app/Mail/WeeklyDriverEarnings.php`
- `backend/app/Mail/SosAdminAlert.php`
- `backend/config/mail.php`

**Acceptance Criteria:**
- All mailables use Blade templates with responsive HTML email design
- Email sent via default Laravel mail driver (configurable SendGrid/Mailgun/Log)
- Payment receipt includes: ride details, fare breakdown, payment method, receipt number
- Driver approval email includes: activation instructions, app download links
- Rejection email includes: reason for rejection, resubmission instructions
- Weekly earnings email: total rides, hours online, earnings, platform fees
- All emails include unsubscribe link (required for SA law)
- Queue emails via `shouldQueue` interface for non-blocking send
- Failed send: retry 3x with 5min delay, then log

### Story E3.5: In-App Notification Center

**Description:** Build an in-app notification center where users can view, filter, and manage notifications with read/unread status and deep linking.

**Files to create:**
- `backend/app/Http/Controllers/Api/V1/NotificationController.php`
- `backend/app/Http/Resources/NotificationResource.php`
- `backend/app/Models/UserNotification.php`
- `backend/database/migrations/xxxx_create_user_notifications_table.php`
- `mobile/packages/ui-kit/src/components/NotificationCenter.tsx`
- `mobile/packages/ui-kit/src/hooks/useNotifications.ts`

**Acceptance Criteria:**
- `GET /api/v1/notifications` returns paginated list with read/unread status
- `PATCH /api/v1/notifications/{id}/read` marks single notification as read
- `PATCH /api/v1/notifications/read-all` marks all as read
- `GET /api/v1/notifications/unread-count` returns badge count
- Notification types: ride_status, payment, promo, system, sos
- Each notification has: title, body, type, deep_link, read_at, created_at
- Deep link from notification navigates to relevant app screen
- Push notification tapped → opens to deep_link if provided
- Notifications auto-deleted after 90 days
- UI: notification bell icon with badge on all main screens

### Story E3.6: SOS Alert System

**Description:** Build the SOS/emergency alert system with 10-second cancellation window, multi-channel escalation, and admin dashboard integration.

**Files to create/modify:**
- `backend/app/Http/Controllers/Api/V1/SosController.php`
- `backend/app/Models/SosAlert.php`
- `backend/app/Events/SosTriggered.php`
- `backend/app/Services/Notification/EscalationService.php`
- `backend/database/migrations/xxxx_create_sos_alerts_table.php`
- `mobile/apps/rider/src/screens/SosScreen.tsx`
- `mobile/apps/driver/src/screens/SosScreen.tsx`
- `web/src/pages/SosAlertsPage.tsx`
- `socket-server/src/handlers/adminHandler.js`

**Acceptance Criteria:**
- SOS button prominently displayed during active ride and on home screen
- Triggering SOS: `POST /api/v1/sos/trigger` with ride_id, alert_type (emergency/medical/accident/harassment)
- 10-second countdown before alert is sent (cancel window)
- If cancelled: alert recorded but not dispatched
- If not cancelled: multi-channel escalation fires:
  1. **Push** to platform admin
  2. **SMS** to emergency contact
  3. **Email** to admin team
  4. **WebSocket** event to admin dashboard (map pin + alert card)
- SOS alert stored with: user_id, ride_id, lat/lng, alert_type, status (pending/active/resolved), resolved_by, resolved_at
- Admin dashboard shows SOS panel with live map pins
- Admin can mark alert as resolved with notes
- Multiple SOS from same user in <30min triggers escalation (phone call to admin)

---

## Epic E4: Mobile UX & Edge Cases (80h) — P1 High

> Polish the mobile experience for ride-hailing, food delivery, and driver operations.

### Story E4.1: Offline Mode

**Description:** Implement offline-first architecture: cache last known state locally, queue ride requests when offline, display offline banner.

**Files to create/modify:**
- `mobile/packages/api-client/src/offlineQueue.ts`
- `mobile/packages/api-client/src/storageCache.ts`
- `mobile/packages/ui-kit/src/components/OfflineBanner.tsx`
- `mobile/apps/rider/src/hooks/useOfflineRideRequest.ts`
- `mobile/apps/driver/src/hooks/useOfflineLocationSync.ts`
- `mobile/apps/rider/App.tsx`
- `mobile/apps/driver/App.tsx`

**Acceptance Criteria:**
- Network state monitored via `NetInfo` — online/offline transitions detected
- When offline: banner displays "You're offline. Some features may be limited."
- Offline banner: yellow background with wifi-off icon, tappable to retry
- Ride request queued locally when offline (max 1 pending request)
- Queued request auto-submits when connection returns
- Cached data: ride history list, driver profile, wallet balance, notification history
- Cache uses AsyncStorage with 15-minute TTL
- Stale cache shows `last_updated` timestamp
- Driver GPS coordinates queued when offline, batch-sent on reconnect
- No crash or blank screen on network failure — graceful fallback to cached data

### Story E4.2: Route Polyline Rendering

**Description:** Decode OSRM polyline from API response and render the full route path on the map.

**Files to modify:**
- `mobile/packages/maps/src/RoutePolyline.tsx`
- `mobile/packages/maps/src/hooks/useRouteDirections.ts`
- `mobile/apps/rider/src/screens/ActiveRideScreen.tsx`
- `mobile/apps/driver/src/screens/ActiveRideScreen.tsx`

**Acceptance Criteria:**
- `useRouteDirections` hook fetches route from backend or directly from OSRM
- Polyline decoded using `@mapbox/polyline` library
- Route rendered as a styled polyline on map (EasyRyde brand color — deep blue #1E3A5F)
- Polyline width: 4dp, with semi-transparent white stroke underneath (iOS map-style effect)
- Animated polyline on initial render (draws in from start to end)
- Route updates when driver deviates >100m from original route
- Multiple legs rendered for multi-stop trips (e.g., rider → store → destination for food)
- ETA displayed on polyline midpoint or as floating label
- Traffic-aware route coloring: green (no traffic) → yellow → red (heavy traffic)

### Story E4.3: Animated Driver Marker

**Description:** Smooth, interpolated driver marker movement between location updates rather than jarring position jumps.

**Files to modify:**
- `mobile/packages/maps/src/AnimatedDriverMarker.tsx`
- `mobile/packages/maps/src/hooks/useDriverAnimation.ts`
- `mobile/apps/rider/src/screens/ActiveRideScreen.tsx`

**Acceptance Criteria:**
- Driver marker interpolates between lat/lng updates using Animated API
- Interpolation duration: 2 seconds (matching 5-second update interval)
- Bearing/rotation animated smoothly (driver car icon rotates to match heading)
- Marker shows car icon (differentiated by vehicle type: sedan/SUV/bakkie)
- Drop shadow on marker for depth
- Pulse animation on marker when ride is accepted (driver is coming)
- Idle animation: subtle bounce every 3 seconds
- Markers cleanly removed when driver goes offline or ride completes
- Performance: only active driver markers animated, limit to 50 concurrent markers

### Story E4.4: Deep Linking

**Description:** Implement universal deep linking with `easyryde://` scheme for both iOS and Android.

**Files to create/modify:**
- `mobile/packages/deeplink/src/deeplinkHandler.ts`
- `mobile/apps/rider/app.config.ts`
- `mobile/apps/driver/app.config.ts`
- `mobile/apps/admin/app.config.ts`
- `mobile/apps/rider/src/navigation/LinkingConfiguration.ts`

**Acceptance Criteria:**
- Custom URL scheme `easyryde://` configured for all 3 apps
- Supported routes:
  - `easyryde://ride/{rideId}` — Open ride detail
  - `easyryde://payment/{paymentId}` — Open payment detail
  - `easyryde://promo/{code}` — Auto-apply promo code
  - `easyryde://profile` — Open profile
  - `easyryde://wallet` — Open wallet
  - `easyryde://support` — Open support
  - `easyryde://earnings` — Open driver earnings
  - `easyryde://restaurant/{restaurantId}` — Open restaurant menu (food)
  - `easyryde://order/{orderId}` — Open food order
- Universal links (iOS) and App Links (Android) configured for production domain
- Deep link handled even if app is cold-started
- Invalid deep links show error screen with "Go Home" button
- Deep link from push notification opens correct screen

### Story E4.5: Pull-to-Refresh on All List Screens

**Description:** Add pull-to-refresh gesture on every scrollable list screen across all 3 apps.

**Files to modify:**
- `mobile/apps/rider/src/screens/RideHistoryScreen.tsx`
- `mobile/apps/rider/src/screens/WalletScreen.tsx`
- `mobile/apps/rider/src/screens/NotificationScreen.tsx`
- `mobile/apps/driver/src/screens/EarningsScreen.tsx`
- `mobile/apps/driver/src/screens/TripHistoryScreen.tsx`
- `mobile/apps/admin/src/screens/RidesScreen.tsx`
- `mobile/apps/admin/src/screens/DriversScreen.tsx`
- `mobile/apps/admin/src/screens/UsersScreen.tsx`

**Acceptance Criteria:**
- All list/tab screens support pull-to-refresh via `RefreshControl`
- Refresh triggers data re-fetch from API
- Loading spinner displayed during refresh (not full-screen loader)
- Pull-to-refresh works on both iOS and Android
- Refresh indicator color matches brand (#1E3A5F)
- Pull distance: standard 80px threshold
- Lists show `last_updated` timestamp in subtitle
- Offline: pull-to-refresh shows "No connection" toast
- Lists with stale data show "Pull to refresh" helper on first render

### Story E4.6: Form Validation Feedback

**Description:** Real-time inline form validation on login, register, and profile screens with clear error messaging.

**Files to modify:**
- `mobile/packages/auth/src/LoginForm.tsx`
- `mobile/packages/auth/src/RegisterForm.tsx`
- `mobile/apps/rider/src/screens/ProfileScreen.tsx`
- `mobile/apps/driver/src/screens/ProfileScreen.tsx`
- `mobile/apps/driver/src/screens/DocumentsScreen.tsx`

**Acceptance Criteria:**
- Real-time validation: email format, phone format, password strength (8+ chars, 1 number, 1 special)
- Errors appear inline below each field (not as alert dialogs)
- Error styling: red border on field, red error text in 12px font
- Validation runs on blur and on form submit
- Empty field errors don't show until field is touched
- Password strength indicator (weak/medium/strong) on register
- Phone number auto-formats with SA country code (+27)
- Submit button disabled until all fields valid
- Server-side validation errors (422) mapped to correct fields
- Keyboard dismisses on scroll or tap outside

### Story E4.7: Loading/Error/Empty States

**Description:** Implement proper loading, error, and empty states on every screen across all 3 mobile apps.

**Files to create/modify:**
- `mobile/packages/ui-kit/src/components/LoadingState.tsx`
- `mobile/packages/ui-kit/src/components/ErrorState.tsx`
- `mobile/packages/ui-kit/src/components/EmptyState.tsx`
- All 30+ screens across rider, driver, admin apps

**Acceptance Criteria:**
- **Loading state**: skeleton shimmer animation on list screens, branded spinner on action screens
- **Error state**: friendly illustration, error message, "Try Again" button, optional "Contact Support" link
- **Empty state**: illustration (no rides yet, no payments, no notifications), descriptive text, CTA button (e.g., "Book Your First Ride")
- Screen shows loading on initial load, then transitions to content/error/empty
- Error state has retry action that re-fetches data
- Network error vs server error distinguished in messaging
- All states animate smoothly (fade between loading → content)
- Offline error state: "Check your connection" instead of generic error
- Empty states are contextual (driver sees "No ride requests yet", rider sees "No rides yet")

### Story E4.8: Scheduled Rides UI

**Description:** Date picker and recurring ride options in the rider app for booking future rides.

**Files to create/modify:**
- `mobile/apps/rider/src/screens/ScheduleRideScreen.tsx`
- `mobile/apps/rider/src/components/DateTimePicker.tsx`
- `mobile/apps/rider/src/components/RecurringOptions.tsx`
- `mobile/apps/rider/src/hooks/useScheduledRide.ts`

**Acceptance Criteria:**
- Date picker shows next 7 days with time slots (15-min intervals)
- Recurring options: daily, weekly (select days), monthly
- Recurring end: after N rides, or on specific date
- Scheduled ride shows in ride history with "Scheduled" badge
- 30 minutes before: system checks for nearby drivers
- 15 minutes before: ride dispatched to drivers
- If no driver: rider notified with option to increase fare or cancel
- Rider can cancel scheduled ride up to 1 hour before pickup
- Max 5 scheduled rides per rider at any time
- Backend: `scheduled_rides` table with frequency, next_run_at, status

### Story E4.9: Driver Earnings Charts

**Description:** Interactive earnings charts for drivers showing daily, weekly, and monthly breakdown with trend indicators.

**Files to create:**
- `mobile/apps/driver/src/screens/EarningsScreen.tsx`
- `mobile/apps/driver/src/components/EarningsChart.tsx`
- `mobile/apps/driver/src/components/EarningsSummaryCard.tsx`
- `mobile/packages/ui-kit/src/components/BarChart.tsx`

**Acceptance Criteria:**
- Three tabs: Daily | Weekly | Monthly
- Bar chart for selected period (react-native-svg-charts or victoria-native)
- Aggregate values: total earnings, total rides, total hours, avg per ride
- Trend indicator: up (green) / down (red) arrow with percentage vs previous period
- Best day/week highlighted with different color (gold)
- Earnings breakdown: fare earnings, tips, bonuses, platform fees
- Tap on bar shows detail tooltip
- Pull-to-refresh updates data
- Date range selector for custom periods (admin: any range, driver: last 90 days)
- Export to CSV button (downloads from backend)

### Story E4.10: Biometric Authentication

**Description:** Allow users to enable fingerprint or face unlock as an alternative to password login.

**Files to modify:**
- `mobile/packages/auth/src/biometrics.ts`
- `mobile/packages/auth/src/AuthContext.tsx`
- `mobile/apps/rider/src/screens/SettingsScreen.tsx`
- `mobile/apps/rider/app.config.ts`
- `mobile/apps/driver/app.config.ts`

**Acceptance Criteria:**
- Biometric option in Settings: "Enable Fingerprint / Face ID"
- On next login: if biometrics enabled, prompt for biometric instead of password
- Biometric prompt shows system-native dialog (iOS Face ID / Android fingerprint)
- Fallback to password if biometric fails 3 times
- Biometric token stored securely in Keychain (iOS) / EncryptedSharedPreferences (Android)
- Token auto-refreshes on each successful biometric login (new expiry)
- Biometric option disabled if device has no biometric hardware
- Clear biometric data on logout
- App lock: biometric required after app is backgrounded for >5 minutes (optional, configurable)
- Navigation to Settings screen: easy access from profile

---

## Epic E5: Admin Dashboard & Food (60h) — P1 High

> Full admin web dashboard and food delivery integration.

### Story E5.1: Live Real-Time Metrics Dashboard

**Description:** Admin dashboard with live-updating metrics via Socket.io: active rides, online drivers, revenue today, pending approvals.

**Files to create/modify:**
- `web/src/pages/DashboardPage.tsx`
- `web/src/components/MetricCard.tsx`
- `web/src/components/ActivityChart.tsx`
- `web/src/hooks/useRealtimeMetrics.ts`
- `web/src/components/LiveDriverMap.tsx`

**Acceptance Criteria:**
- Dashboard loads with current-day metrics on page load
- Metrics update in real-time via WebSocket (no page refresh)
- Metric cards: Active Rides, Online Drivers, Revenue Today (ZAR), Pending Approvals, Avg Wait Time, Cancellation Rate
- Sparkline chart for each metric showing 24-hour trend
- Revenue chart: 24-hour bar chart, grouped by payment method
- Live driver positions on map with status indicators (online/idle/on-ride)
- KPI cards animate number changes (count-up effect)
- Time range selector: Today, This Week, This Month
- Manual refresh button if WebSocket disconnects
- Dark theme toggle for late-night admin monitoring

### Story E5.2: Driver Document Review Workflow

**Description:** Web-based document review workflow for FICA/KYC approval.

**Files to create/modify:**
- `web/src/pages/DriversPage.tsx`
- `web/src/pages/DriverDetailPage.tsx`
- `web/src/components/DocumentViewer.tsx`
- `web/src/components/ApprovalWorkflow.tsx`

**Acceptance Criteria:**
- Driver list page shows status badges: Pending Review, Approved, Rejected, Documents Expired
- Filter by status, search by name/phone/email
- Detail page shows: driver info, vehicle info, uploaded documents, ride history
- Document viewer: inline image/pdf preview with zoom
- Approve button: marks driver as approved, triggers notification
- Reject button: requires reason (dropdown: incomplete docs, expired, invalid), triggers notification
- Activity log on driver profile: all admin actions timestamped
- Batch approve/reject for multiple drivers
- Expired documents highlighted in red with days-since-expiry
- Email template for approval and rejection notifications

### Story E5.3: Pricing Editor with Audit Trail

**Description:** Admin pricing control panel with full audit trail of all changes.

**Files to create/modify:**
- `web/src/pages/PricingPage.tsx`
- `web/src/components/FareCategoryEditor.tsx`
- `web/src/components/SurgePricingConfig.tsx`
- `web/src/hooks/usePricingAudit.ts`

**Acceptance Criteria:**
- Pricing categories: Standard, Premium, Luxury, Delivery, Food
- Per-category settings: base_fare (ZAR), per_km_rate, per_minute_rate, min_fare, cancellation_fee
- Surge pricing section: enable/disable, multiplier (1.0–3.0), time windows, auto/manual, max_cap
- Platform fee: percentage field (default 15%)
- All changes are saved with audit trail: admin_id, field, old_value, new_value, timestamp
- Audit log viewer: filter by admin, date range, action type
- Publish workflow: edit in draft → preview impact → publish
- "Apply to existing rides" toggle (only for base fare changes, not surge)
- Validation: prevent surge multiplier > 3.0 (safety cap)
- Change approval: high-impact changes (>20% fare increase) require second admin approval

### Story E5.4: Restaurant Management CRUD

**Description:** Admin interface for managing restaurant partners: add, edit, menu management, availability.

**Files to create/modify:**
- `web/src/pages/RestaurantsPage.tsx`
- `web/src/pages/RestaurantDetailPage.tsx`
- `web/src/components/MenuEditor.tsx`
- `web/src/components/MenuCategoryEditor.tsx`

**Acceptance Criteria:**
- Restaurant list with search, filter by status (active/inactive/pending)
- Add restaurant: name, address (with map picker), phone, cuisine type, logo upload, operating hours
- Edit restaurant: all fields + status toggle (open/closed)
- Menu management: categories (starters, mains, desserts, drinks), items per category
- Menu item: name, description, price, photo, dietary flags (vegan, gluten-free), availability toggle
- Bulk menu import via CSV/Excel
- Restaurant operating hours with timezone support (SAST)
- Order cutoff time configuration (30min before closing)
- Delivery radius per restaurant (in km)
- Restaurant commission percentage override (per-restaurant)

### Story E5.5: Food Order Management and Dispatch

**Description:** End-to-end food order lifecycle: order received → accepted → prepared → picked up → delivered.

**Files to create/modify:**
- `web/src/pages/FoodOrdersPage.tsx`
- `web/src/pages/FoodOrderDetailPage.tsx`
- `web/src/components/OrderTimeline.tsx`
- `backend/app/Services/Food/FoodOrderService.php`
- `backend/app/Models/FoodOrder.php`

**Acceptance Criteria:**
- Order list: all orders with status, restaurant, rider, driver, amount, timestamp
- Real-time status updates via WebSocket
- Order detail: full order items, amounts, rider info, driver info, restaurant info
- Order timeline: ordered → confirmed → preparing → ready → picked up → delivered
- Admin can: update status, reassign driver, cancel order (with reason), issue refund
- Driver dispatch: auto-assign to nearest available driver, manaul override
- Estimated preparation time displayed per restaurant (configurable)
- SLA monitoring: orders exceed 60min flagged yellow, 90min flagged red
- Daily order volume report with peak hour analysis

### Story E5.6: Audit Log Viewer

**Description:** Comprehensive audit log viewer with filters: action type, user, date range, resource type.

**Files to create/modify:**
- `web/src/pages/AuditLogPage.tsx`
- `web/src/components/AuditLogTable.tsx`

**Acceptance Criteria:**
- Paginated table with: timestamp, admin name, action type, resource type, resource ID, summary
- Filters: date range (calendar picker), admin (dropdown), action type (create/update/delete/approve/reject), resource (ride/payment/user/driver/setting)
- Export to CSV filtered view
- Action types color-coded: create green, update blue, delete red, approve gold
- Click row → expand to show full detail (old value, new value, IP address, user agent)
- Retention: logs kept for 1 year, auto-archived to cold storage
- Search by resource ID or admin email
- Real-time: new audit logs appear without page refresh

### Story E5.7: Driver Payout/Settlement Admin Panel

**Description:** Admin interface for managing and monitoring driver payouts and settlements.

**Files to create:**
- `web/src/pages/PayoutsPage.tsx`
- `web/src/pages/PayoutDetailPage.tsx`
- `web/src/components/PayoutSummaryTable.tsx`

**Acceptance Criteria:**
- Payout list: driver name, amount, method, status, period, processed_at
- Filters: status (pending/processing/completed/failed), date range, driver
- Summary cards: total pending payouts, total paid this week/month, average payout amount
- Click to see payout detail: ride breakdown for the period, fees deducted
- Admin can: trigger manual payout, mark payout as complete (offline), retry failed payout
- Failed payout badge with retry button
- Payout report export (CSV/PDF) for accounting
- Settlement summary by driver: total earned, fees, tips, net payout
- Scheduled payout overview: next payout date, estimated amount

---

## Epic E6: Testing & QA (70h) — P1 High

> Comprehensive testing: unit, integration, E2E, load, and security.

### Story E6.1: Unit Tests for Service Classes

**Description:** Achieve 85% code coverage on all service classes with comprehensive unit tests.

**Files to create:**
- `backend/tests/Unit/FareCalculationServiceTest.php`
- `backend/tests/Unit/RideMatchingServiceTest.php`
- `backend/tests/Unit/PaymentServiceTest.php`
- `backend/tests/Unit/WalletServiceTest.php`
- `backend/tests/Unit/RatingServiceTest.php`
- `backend/tests/Unit/PromoCodeServiceTest.php`
- `backend/tests/Unit/DeliveryServiceTest.php`
- `backend/tests/Unit/SurgePricingServiceTest.php`
- `backend/tests/Unit/PushNotificationServiceTest.php`
- `backend/tests/Unit/SmsServiceTest.php`
- `backend/tests/Unit/EmailServiceTest.php`
- `backend/tests/Unit/EscrowServiceTest.php`
- `backend/tests/Unit/PayoutServiceTest.php`
- `backend/tests/Unit/RefundServiceTest.php`
- `backend/tests/Unit/CashReconciliationServiceTest.php`
- `backend/tests/Unit/FoodOrderServiceTest.php`

**Acceptance Criteria:**
- Each service class has a corresponding test file
- All public methods tested (happy path + error path + edge cases)
- External dependencies mocked (HTTP clients, gateways, queues)
- Coverage minimum 85% for service layer, 70% overall
- Tests run in < 30 seconds total
- No database dependency for unit tests (uses RefreshDatabase only for integration)

### Story E6.2: Integration Tests for All API Endpoints

**Description:** Test all API endpoints end-to-end with full HTTP request/response cycles.

**Files to create:**
- `backend/tests/Feature/AuthApiTest.php`
- `backend/tests/Feature/RideApiTest.php`
- `backend/tests/Feature/DriverApiTest.php`
- `backend/tests/Feature/PaymentApiTest.php`
- `backend/tests/Feature/WalletApiTest.php`
- `backend/tests/Feature/RatingApiTest.php`
- `backend/tests/Feature/PromoCodeApiTest.php`
- `backend/tests/Feature/DeliveryApiTest.php`
- `backend/tests/Feature/AdminApiTest.php`
- `backend/tests/Feature/ReportingApiTest.php`
- `backend/tests/Feature/ConfigApiTest.php`
- `backend/tests/Feature/NotificationApiTest.php`
- `backend/tests/Feature/SosApiTest.php`
- `backend/tests/Feature/ChatApiTest.php`
- `backend/tests/Feature/FoodApiTest.php`
- `backend/tests/Feature/WebhookApiTest.php`

**Acceptance Criteria:**
- Every endpoint tested with valid data → 200/201 response
- Every endpoint tested with invalid data → 422 response with validation errors
- Every endpoint tested without auth → 401 response
- Every endpoint tested with wrong role → 403 response
- Full ride lifecycle test: request → accept → arrive → start → complete → rate
- Full payment flow test: initiate → webhook → confirm → wallet credit
- Full admin flow test: login → dashboard → approve driver → update settings
- All middleware tested: auth, rate limit, role, tenant
- Tests use SQLite in-memory or PostgreSQL test database
- Tests clean up after themselves (RefreshDatabase trait)

### Story E6.3: E2E Tests for Admin Web Dashboard

**Description:** End-to-end tests via Playwright for all critical admin web dashboard flows.

**Files to create:**
- `web/e2e/login.spec.ts`
- `web/e2e/dashboard.spec.ts`
- `web/e2e/drivers.spec.ts`
- `web/e2e/rides.spec.ts`
- `web/e2e/pricing.spec.ts`
- `web/e2e/restaurants.spec.ts`
- `web/e2e/food-orders.spec.ts`
- `web/e2e/payouts.spec.ts`
- `web/e2e/audit-log.spec.ts`
- `web/e2e/sos-alerts.spec.ts`

**Acceptance Criteria:**
- Login flow: valid credentials → dashboard, invalid credentials → error, expired session → redirect
- Dashboard: metrics render, charts load, map shows driver positions
- Drivers page: list loads, filter works, approve driver flow, reject with reason
- Rides page: list loads, status filter, click to see detail
- Pricing page: load current settings, edit fare, save, verify audit log entry
- Restaurants page: CRUD operations, menu editing
- Food orders: list loads, status update, detail view
- Payouts: list loads, trigger manual payout, verify status change
- Audit log: entries load, filters work, expand detail
- SOS alerts: panel renders, alert card shows, resolve flow
- Tests run in headless Chrome
- All tests pass consistently (no flaky tests)

### Story E6.4: Mobile E2E Smoke Tests

**Description:** Critical path smoke tests for mobile apps via Detox or Maestro.

**Files to create:**
- `mobile/e2e/rider-smoke.test.ts`
- `mobile/e2e/driver-smoke.test.ts`
- `mobile/e2e/admin-smoke.test.ts`

**Acceptance Criteria:**
- Rider app: login, book ride, cancel ride, view history, top up wallet
- Driver app: login, go online, accept ride, complete ride, view earnings
- Admin app: login, view dashboard, approve driver, update settings
- Tests run on both iOS simulator and Android emulator
- Each test takes < 30 seconds
- Screenshots captured on failure for debugging
- Mock API responses for deterministic tests
- CI integration: tests run on every PR to main

### Story E6.5: Load Tests via k6

**Description:** Load testing with k6: 100 concurrent users, 10K WebSocket connections, realistic ride flow.

**Files to create:**
- `load-tests/scenarios/ride-booking.js`
- `load-tests/scenarios/driver-location-updates.js`
- `load-tests/scenarios/payment-processing.js`
- `load-tests/scenarios/websocket-connections.js`
- `load-tests/scenarios/admin-dashboard.js`
- `load-tests/scenarios/mixed-workload.js`

**Acceptance Criteria:**
- Ride booking: 100 concurrent users booking rides simultaneously
- Driver location: 500 drivers sending location updates every 5 seconds
- Payment processing: 50 concurrent payment webhook calls
- WebSocket: 10K concurrent WebSocket connections maintained for 5 minutes
- Admin dashboard: 50 concurrent admin users viewing dashboard + switching pages
- Mixed workload: all of the above running simultaneously for 10 minutes
- Targets: p95 API < 500ms, p95 WebSocket < 200ms, error rate < 0.1%, zero crashes
- k6 options file shared across scenarios (base URL, thresholds, stages)
- CI integration: load tests run nightly and on demand

### Story E6.6: Security Tests

**Description:** Security testing covering OWASP Top 10: SQLi, XSS, CSRF, rate limit bypass, auth bypass, webhook signature bypass.

**Files to create:**
- `load-tests/security/sql-injection.js`
- `load-tests/security/xss-injection.js`
- `load-tests/security/csrf-tests.js`
- `load-tests/security/rate-limit-bypass.js`
- `load-tests/security/auth-bypass.js`
- `load-tests/security/webhook-forgery.js`

**Acceptance Criteria:**
- SQL injection attempts on all text fields return 200 or 422 (not 500)
- XSS payloads in name/description fields are escaped (not rendered as HTML)
- CSRF protection active on all state-changing endpoints
- Rate limit bypass: rotating IPs, spoofed headers, concurrent requests — all blocked
- Auth bypass: accessing protected endpoints without token → 401, with expired token → 401
- Webhook forgery: invalid signature → 401, replay attack → 409 (idempotency), wrong IP → 403
- API key brute force: 10 failed attempts → lockout for 1 hour
- No sensitive data in error responses (stack traces, SQL queries, config values)
- Security headers (HSTS, CSP, X-Frame-Options) present on all responses

---

## Epic E7: Deploy & Operations (50h) — P2 Medium

> Production deployment infrastructure, monitoring, backup, CI/CD, and zero-downtime strategy.

### Story E7.1: Docker Production Configuration

**Description:** Production-ready Docker Compose with health checks, resource limits, and proper networking.

**Files to modify:**
- `docker-compose.prod.yml`
- `.docker/php/Dockerfile`
- `.docker/nginx/nginx.conf`
- `.docker/socket/Dockerfile`

**Acceptance Criteria:**
- All services: health checks defined with interval, timeout, retries
- Resource limits: memory and CPU constraints per container
- PHP-FPM: `pm.max_children` calculated for available RAM
- Nginx: rate limiting, security headers, SSL termination, static asset caching
- Socket.io: Node.js cluster mode (CPU count workers)
- Laravel Horizon: queue workers configured per queue priority
- PostgreSQL: connection pooling via PgBouncer
- Redis: `maxmemory` and `maxmemory-policy allkeys-lru`
- Networks: internal (backend) and external (web) separation
- Volumes: persistent data for DB, Redis, storage
- Logging: JSON driver with log rotation
- Restart policy: `unless-stopped` for all services

### Story E7.2: Monitoring Stack

**Description:** Deploy Sentry, Prometheus + Grafana monitoring stack with custom dashboards.

**Files to create/modify:**
- `docker-compose.monitoring.yml`
- `prometheus/prometheus.yml`
- `grafana/dashboards/easyryde-overview.json`
- `grafana/dashboards/laravel-performance.json`
- `grafana/datasources/prometheus.yml`
- `backend/config/sentry.php`

**Acceptance Criteria:**
- Sentry: error tracking, performance monitoring, release tracking, alert rules
- Prometheus: metrics from Laravel (via php-prometheus), Node.js (via prom-client), PostgreSQL (via postgres_exporter), Redis (via redis_exporter)
- Grafana: login with admin credentials, pre-configured data sources, 3+ dashboards
- Dashboard 1 — Platform Overview: request rate, error rate, p50/p95/p99 latency, active users, ride throughput
- Dashboard 2 — Infrastructure: CPU/memory per container, disk usage, network I/O, DB connections, Redis hit rate
- Dashboard 3 — Business: rides/hour, revenue/hour, new users, driver online rate, cancellation rate
- Alert rules: error rate > 5% in 5min, p95 > 1s, disk > 80%, CPU > 80%
- Alert channels: Slack, email
- Uptime monitoring via health check endpoint (every 60s)

### Story E7.3: Database Backup Automation

**Description:** Automated PostgreSQL backup with daily pg_dump, S3 offsite storage, and point-in-time recovery (PITR).

**Files to create:**
- `scripts/backup/backup.sh`
- `scripts/backup/restore.sh`
- `scripts/backup/verify-backup.sh`
- `cron/backup-crontab`

**Acceptance Criteria:**
- Daily full backup: `pg_dump --format=custom --compress=9` at 02:00 SAST
- Weekly backup: retained 30 days
- Monthly backup: retained 1 year
- WAL archiving enabled for PITR (recovery up to 1 minute before failure)
- Backups uploaded to S3-compatible storage (Wasabi or AWS S3)
- Backup filename format: `easyryde-{date}-{type}.dump`
- Backup verification: restore to staging environment weekly, run health check queries
- Restore procedure documented: step-by-step with expected time (RTO: 4 hours, RPO: 1 minute)
- Encryption: backups encrypted with GPG before upload
- Monitoring: backup success/failure alerts
- Cleanup: local backup retention 7 days, remote retention per policy

### Story E7.4: CI/CD Pipeline

**Description:** Full CI/CD pipeline: lint → test → build → stage → deploy → smoke test → promote.

**Files to create/modify:**
- `.github/workflows/ci.yml`
- `.github/workflows/cd.yml`
- `.github/actions/deploy/action.yml`

**Acceptance Criteria:**
- **CI** triggers on every push to any branch:
  - PHP lint (PHP_CodeSniffer, PHPStan level 5)
  - Unit tests (PHPUnit)
  - Integration tests
  - Node.js lint + test (socket-server, web)
  - Expo lint + type-check (mobile)
  - Build check (compile without errors)
- **CD** triggers on push to main:
  - Build Docker images
  - Push to container registry
  - Deploy to staging
  - Run smoke tests on staging
  - If smoke tests pass: deploy to production (blue/green)
  - If smoke tests fail: rollback, notify team
- Deployment lock: prevent concurrent deploys
- Environment promotion: dev → staging → production
- Slack notifications on each stage: started, succeeded, failed
- Rollback: one-click to previous version, automated on smoke test failure
- Zero-downtime: blue/green with nginx upstream swap

### Story E7.5: Zero-Downtime Deployment Strategy

**Description:** Blue/green deployment strategy with nginx upstream to ensure zero downtime during production releases.

**Files to create/modify:**
- `scripts/deploy/blue-green-deploy.sh`
- `scripts/deploy/health-check.sh`
- `scripts/deploy/rollback.sh`
- `nginx/blue-green.conf`

**Acceptance Criteria:**
- Two environments: blue (current live) and green (staging next)
- Deployment: build green → run smoke tests → switch nginx upstream → verify → decommission blue
- Rollback: switch nginx upstream back to blue
- Database migrations run during deployment (Laravel handles with --force flag)
- Migrations must be backward-compatible (no column drops in same deploy as code switch)
- Health check endpoint: `GET /api/health` returns 200 + status JSON
- Graceful draining: existing requests to blue complete before decommission (max 60s timeout)
- Session persistence: Redis sessions shared across blue/green
- WebSocket: Socket.io client auto-reconnects to new backend
- Deployment script is idempotent (safe to re-run on failure)
- Total downtime target: < 1 second per deployment

---

*End of epics-and-stories.md — 7 epics, 47 stories total.*
