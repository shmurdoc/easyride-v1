# EasyRyde — Detailed Task Breakdown

**Phase:** 05 — Implementation Plan
**Version:** 1.0.0
**Updated:** 2026-06-17

---

## E1: Production Hardening (40h) — 6 tasks

### E1-T1: Create FormRequest Validation Classes (16h)

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

**Implementation steps:**
1. Create base `ApiFormRequest` that extends `FormRequest` with standardized `failedValidation()` response
2. For each request file: define `rules()` with Laravel validation rules (required, string, numeric, in, exists, unique, etc.)
3. Add `messages()` with user-friendly ZAR error messages in English
4. Add `authorize()` that checks user role via Spatie `$user->hasAnyRole(['admin', 'driver', 'rider'])`
5. Update all controller methods to type-hint the specific FormRequest instead of `Illuminate\Http\Request`
6. Run `php artisan test` to verify no breakage
7. Run `php artisan route:list` to confirm all routes still registered

### E1-T2: Harden .gitignore and Remove Secrets (4h)

**Files to modify:**
- `backend/.gitignore`
- `backend/config/services.php` (remove hardcoded credentials)
- `backend/storage/` (check for JSON files with secrets)

**Implementation steps:**
1. Add to `.gitignore`: `storage/*.json`, `storage/firebase-service-account.json`, `.env.production`, `*.log`
2. Search entire repo for hardcoded API keys: `grep -r "sk_live\|pk_live\|sandbox\|api_key" --include="*.php" --include="*.js" --include="*.json" --include="*.env"`
3. Remove any hardcoded PayFast merchant credentials from `config/services.php`
4. Remove any hardcoded Stripe test keys
5. Remove any Firebase service account JSON if present in repo
6. Add `git-secrets` pre-commit hook: `git secrets --install && git secrets --register-aws && git secrets --add 'sk_live_[0-9a-zA-Z]+'`
7. Rotate Firebase service account key in Firebase Console
8. Rotate any other exposed keys
9. Verify: `git log -p --diff-filter=M -- "*.php" "*.js" "*.json" "*.env"` — no credentials in history

### E1-T3: Complete .env.example and Add Missing Keys (4h)

**Files to create/modify:**
- `backend/.env.example` (rewrite)
- `backend/.env.production` (new)

**Implementation steps:**
1. Read every file in `backend/config/` to extract all env key references
2. Group keys into sections: APP, DB, REDIS, SENTRY, STRIPE, PAYFAST, OZOW, FCM, TWILIO, SENDGRID, GOOGLE_MAPS, MAIL, QUEUE, FILESYSTEM, SCOUT
3. Write each key with a comment describing its purpose, format, and example value
4. Create `.env.production` with all keys set to `CHANGEME` placeholders
5. Verify: `php artisan config:cache` succeeds without missing-key warnings
6. Verify: all keys used in `config/*.php` are present in `.env.example`

### E1-T4: Wire Auth Rate Limiting (4h)

**Files to modify:**
- `backend/app/Http/Kernel.php`
- `backend/app/Http/Controllers/Api/V1/AuthController.php`
- `backend/routes/api.php`

**Implementation steps:**
1. Define throttle groups in `Http/Kernel.php`:
   - `'auth-login' => '10,1'` (10 requests per minute)
   - `'auth-register' => '5,1'`
   - `'auth-password' => '3,1'`
   - `'api' => '60,1'`
   - `'api-guest' => '30,1'`
2. Apply `throttle:auth-login` to `POST /api/v1/auth/login`
3. Apply `throttle:auth-register` to `POST /api/v1/auth/register`
4. Apply `throttle:auth-password` to forgot/reset password routes
5. Apply `throttle:api` to authenticated route group
6. Apply `throttle:api-guest` to guest route group
7. Test: fire 11 login requests in 1 second → 11th returns 429
8. Verify `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers present

### E1-T5: Encrypt PII Columns (6h)

**Files to modify:**
- `backend/app/Models/User.php`
- `backend/app/Models/Driver.php`
- `backend/database/migrations/xxxx_add_encrypted_pii_columns.php`

**Implementation steps:**
1. Create migration to add encrypted columns: `phone_number_encrypted`, `email_encrypted`, `id_number_encrypted`, `license_number_encrypted`, `vehicle_registration_encrypted`, `emergency_contact_name_encrypted`, `emergency_contact_phone_encrypted`
2. Create command `php artisan pii:encrypt-existing` that reads plaintext columns, encrypts via `Crypt::encryptString()`, writes to encrypted columns
3. Update model `$casts`: `'phone_number' => 'encrypted'`, etc.
4. Remove old plaintext columns in separate migration after verifying data integrity
5. Test: `User::find(1)->phone_number` returns plaintext; `DB::table('users')->first()->phone_number` shows ciphertext
6. Verify all queries that WHERE on phone/email still work (Laravel encrypted cast supports exact match)

### E1-T6: Configure Sentry (6h)

**Files to modify:**
- `backend/composer.json`
- `backend/config/sentry.php` (publish)
- `backend/.env.example`
- `backend/app/Exceptions/Handler.php`

**Implementation steps:**
1. `composer require sentry/sentry-laravel`
2. `php artisan vendor:publish --provider="Sentry\Laravel\ServiceProvider"`
3. Configure `.env`: `SENTRY_DSN`, `SENTRY_ENVIRONMENT=production`, `SENTRY_TRACES_SAMPLE_RATE=0.25`
4. Add `SENTRY_*` keys to `.env.example`
5. In `app/Exceptions/Handler.php`: add `$this->reportable(function (Throwable $e) { if ($this->shouldReport($e)) { \Sentry\captureException($e); } });`
6. Enable breadcrumbs in `config/sentry.php`: `'breadcrumbs' => ['sql_queries' => true, 'sql_bindings' => true, 'redis' => true, 'http_client' => true]`
7. Enable performance monitoring: `'tracing' => ['enabled' => true, 'routes' => true, 'queues' => true]`
8. Test: trigger test exception, verify it appears in Sentry dashboard

---

## E2: Payment Integration (60h) — 7 tasks

### E2-T1: Wire Stripe Integration (12h)

**Files to create/modify:**
- `backend/app/Services/Payment/StripeService.php`
- `backend/app/Http/Controllers/Api/V1/PaymentController.php`
- `backend/app/Http/Controllers/Api/V1/WebhookController.php`
- `backend/routes/api.php`
- `backend/config/services.php`

**Implementation steps:**
1. `composer require stripe/stripe-php`
2. Create `StripeService` with methods: `createPaymentIntent($amount, $currency, $metadata)`, `confirmPayment($paymentIntentId)`, `retrievePayment($paymentIntentId)`, `refundPayment($paymentIntentId, $amount)`
3. Add routes: `POST /api/v1/payments/stripe/create-intent`, `POST /api/v1/payments/stripe/confirm`, `POST /api/v1/payments/stripe/webhook`
4. Webhook handler: verify signature via `\Stripe\Webhook::constructEvent()`, handle `payment_intent.succeeded`, `.payment_failed`, `charge.refunded`
5. On `payment_intent.succeeded`: create Payment record, dispatch `PaymentSucceeded` event
6. On `payment_intent.payment_failed`: create Payment with failed status, dispatch `PaymentFailed` event
7. Add Stripe config to `config/services.php`: `'stripe' => ['key' => env('STRIPE_KEY'), 'secret' => env('STRIPE_SECRET'), 'webhook_secret' => env('STRIPE_WEBHOOK_SECRET')]`
8. Test with Stripe test card `4242 4242 4242 4242` on staging

### E2-T2: Wire PayFast ITN (10h)

**Files to create/modify:**
- `backend/app/Services/Payment/PayFastService.php`
- `backend/app/Http/Controllers/Api/V1/PaymentController.php`
- `backend/routes/api.php`
- `backend/config/services.php`

**Implementation steps:**
1. Create `PayFastService` with methods: `generatePaymentUrl($amount, $itemName, $merchantData)`, `verifyItn($requestData)`, `processItn($requestData)`
2. Implement signature calculation: `md5($merchantId . '|' . $passphrase . '|' . $amount)`
3. ITN handler flow: validate source IP → check signature → check amount matches → check payment status = COMPLETE → create Payment → dispatch event
4. IP allowlist: PayFast production IPs hardcoded, verify on each ITN request
5. Idempotency: key on `pf_payment_id`, skip duplicate ITNs
6. Return URL: redirect to `easyryde://payment/{paymentId}/success`
7. Cancel URL: redirect to `easyryde://payment/{paymentId}/cancelled`
8. Add to `config/services.php`: payfast merchant_id, merchant_key, passphrase, mode, return_url, cancel_url, notify_url
9. Test with PayFast sandbox mode and test cards

### E2-T3: Wire Ozow Integration (10h)

**Files to create/modify:**
- `backend/app/Services/Payment/OzowService.php`
- `backend/app/Http/Controllers/Api/V1/PaymentController.php`
- `backend/routes/api.php`
- `backend/config/services.php`

**Implementation steps:**
1. Create `OzowService` with: `createPaymentRequest($amount, $transactionReference, $customer)`, `verifyWebhook($payload, $signature)`, `processWebhook($payload)`
2. Implement HMAC-SHA256 signature: `hash_hmac('sha256', $siteCode . $amount . $currency . $countryCode . $transactionReference, $apiKey)`
3. Webhook handler: extract signature from header → verify → extract `TransactionId`, `TransactionReference`, `Amount`, `Status`
4. Status handling: `Complete` → payment success, `Cancelled` → payment cancelled, `Error` → payment failed, `Pending` → mark pending
5. Idempotency: key on `TransactionReference`, skip duplicate webhooks
6. Return URL: redirect to `easyryde://payment/{reference}/status`
7. Add to `config/services.php`: ozow api_key, site_code, country_code (ZA), currency_code (ZAR), webhook_secret, mode
8. Test with Ozow sandbox mode and test cards

### E2-T4: Implement Escrow System (8h)

**Files to create/modify:**
- `backend/app/Services/Payment/EscrowService.php`
- `backend/app/Console/Commands/ReleaseEscrowPayments.php`
- `backend/app/Jobs/ReleaseEscrowJob.php`
- `backend/app/Models/Payment.php`

**Implementation steps:**
1. Add `held_until` column to payments table (migration)
2. `EscrowService::holdPayment($payment)`: set status=held, held_until=now+24h
3. `EscrowService::releasePayment($payment)`: credit driver wallet, set status=released
4. `EscrowService::disputePayment($payment)`: set status=disputed, create support ticket
5. `EscrowService::resolveDispute($payment, $adminDecision)`: release or refund based on decision
6. Create command `php artisan escrow:release`: queries `WHERE status=held AND held_until <= NOW()`
7. Schedule command every 5 minutes in `Kernel.php`
8. Each escrow release is a queued job with `ReleaseEscrowJob` (max 3 attempts)
9. Failed release after 3 attempts: set status=release_failed, notify admin

### E2-T5: Implement Cash Reconciliation (6h)

**Files to create/modify:**
- `backend/app/Services/Payment/CashReconciliationService.php`
- `backend/app/Models/CashReconciliation.php`
- `backend/app/Http/Controllers/Api/V1/PaymentController.php`
- `backend/database/migrations/xxxx_create_cash_reconciliations_table.php`

**Implementation steps:**
1. Create migration: `cash_reconciliations` table with ride_id, driver_id, rider_id, fare_amount, platform_fee, driver_earns, driver_marked_at, admin_reconciled_at, status, notes
2. `CashReconciliationService::markCashPaid($ride)`: validate not already paid, calculate platform fee, create record
3. `POST /api/v1/payments/rides/{ride}/mark-cash-paid` endpoint
4. Platform fee calculation: `$fare * config('services.platform.fee_percentage')` (default 15%)
5. Create daily reconciliation command: `php artisan cash:reconcile` — groups by driver, shows totals, flags discrepancies
6. Schedule at 02:00 daily
7. Admin dashboard shows pending/unreconciled/discrepancy counts

### E2-T6: Implement Refund Workflow (6h)

**Files to create/modify:**
- `backend/app/Services/Payment/RefundService.php`
- `backend/app/Models/RefundRequest.php`
- `backend/app/Http/Controllers/Api/V1/AdminController.php`
- `backend/app/Http/Controllers/Api/V1/PaymentController.php`
- `backend/database/migrations/xxxx_create_refund_requests_table.php`

**Implementation steps:**
1. Create migration: `refund_requests` with payment_id, rider_id, amount, reason, status, admin_id, admin_notes, processed_at
2. `RefundService::requestRefund($payment, $reason)`: create refund request, notify admin
3. `RefundService::approveRefund($refundRequest, $admin, $amount, $notes)`: process via original gateway
4. `RefundService::rejectRefund($refundRequest, $admin, $reason)`: set status=rejected, notify rider
5. Stripe refund: `$stripe->refunds->create(['payment_intent' => $piId, 'amount' => $amountCents])`
6. PayFast refund: send ITN-style refund request
7. Wallet refund: `WalletService::credit($rider->wallet, $amount)`
8. Refund request shown in admin dashboard for review

### E2-T7: Implement Driver Payout Engine (8h)

**Files to create/modify:**
- `backend/app/Services/Payment/PayoutService.php`
- `backend/app/Models/DriverPayout.php`
- `backend/app/Console/Commands/ProcessDriverPayouts.php`
- `backend/app/Jobs/ProcessPayoutJob.php`
- `backend/database/migrations/xxxx_create_driver_payouts_table.php`

**Implementation steps:**
1. Create migration: `driver_payouts` with driver_id, amount, method (bank/wallet), status, reference, notes, processed_at, period_start, period_end
2. `PayoutService::calculateEligibleDrivers()`: drivers with wallet balance > R0
3. `PayoutService::processPayouts()`: daily for > R200, weekly (Monday) for < R200
4. `ProcessDriverPayouts` command: runs at 06:00 daily
5. Each payout is a `ProcessPayoutJob`: debit wallet → transfer via bank API or record wallet credit → mark completed
6. Failed payout: retry 3x with 1-hour delay → flag manual_review
7. Admin manual payout trigger: `POST /api/v1/admin/payouts/manual`
8. Payout history API: `GET /api/v1/admin/payouts` with driver filter

---

## E3: Real-Time & Notifications (50h) — 7 tasks

### E3-T1: Wire FCM Push Notifications (12h)

**Files to create/modify:**
- `backend/app/Services/Notification/PushNotificationService.php`
- `backend/app/Models/PushToken.php`
- `backend/app/Http/Controllers/Api/V1/NotificationController.php`
- `backend/database/migrations/xxxx_create_push_tokens_table.php`
- `mobile/packages/api-client/src/notifications.ts`
- `mobile/apps/rider/app.tsx`
- `mobile/apps/driver/app.tsx`

**Implementation steps:**
1. `composer require kreait/laravel-firebase` or use native FCM via HTTP v1
2. Create migration: `push_tokens` with user_id, token, device_type, last_used_at, is_active
3. `POST /api/v1/notifications/register-token`: save/update token
4. `POST /api/v1/notifications/deactivate-token`: set is_active=false
5. `PushNotificationService::send($user, $title, $body, $data)`: query user's active tokens, send via FCM
6. `PushNotificationService::sendToRole($role, $title, $body, $data)`: broadcast to all users with role
7. Ride events wired: `RideAccepted`, `DriverArrived`, `RideStarted`, `RideCompleted`, `RideCancelled`, `PaymentReceived` → trigger push
8. FCM HTTP v1 API: use Google auth token, send to device
9. Mobile: register push token on login, deactivate on logout
10. Handle push receipt: update `last_used_at`, deactivate invalid tokens

### E3-T2: Implement Background GPS Tracking (12h)

**Files to create/modify:**
- `mobile/apps/driver/src/hooks/useLocationTracking.ts`
- `mobile/apps/driver/src/services/locationService.ts`
- `mobile/apps/driver/app.config.ts`
- `socket-server/src/handlers/driverHandler.js`
- `mobile/packages/api-client/src/socket.ts`

**Implementation steps:**
1. Configure `app.config.ts`: `expo-location` plugin, foreground service permissions, background mode
2. Create `useLocationTracking` hook: starts when driver online, stops when offline
3. Location config: `LocationAccuracy.Balanced` when idle, `LocationAccuracy.High` during ride
4. WebSocket emits `driver:location-update` every 5s (ride) / 10s (idle)
5. Socket.io server receives location → updates Redis geo-index → broadcasts to rider room
6. Handle permission denied: show alert, mark driver offline
7. Stale driver cleanup: server-side timer, 10min no update = mark offline
8. Location queue: if WebSocket disconnected, queue updates, batch on reconnect

### E3-T3: Wire SMS Notifications (6h)

**Files to create/modify:**
- `backend/app/Services/Notification/SmsService.php`
- `backend/app/Notifications/RideConfirmedSms.php`
- `backend/app/Notifications/SosAlertSms.php`
- `backend/app/Notifications/PaymentReceiptSms.php`
- `backend/config/services.php`

**Implementation steps:**
1. `composer require twilio/sdk`
2. `SmsService::send($to, $message)`: wrap `$twilio->messages->create($to, ['from' => $from, 'body' => $message])`
3. Create notification classes for each SMS template
4. Wire ride_confirmation SMS to ride booked event
5. Wire SOS alert SMS to SosTriggered event (send to emergency contact + admin)
6. Wire payment_receipt SMS (optional, can be email primary)
7. Handle Twilio errors: log, don't block main flow
8. Rate limiting: check `sms_sent` cache key per user, max 5/hour

### E3-T4: Wire Email Notifications (6h)

**Files to create/modify:**
- `backend/app/Services/Notification/EmailService.php`
- `backend/app/Mail/PaymentReceipt.php`
- `backend/app/Mail/DriverApproved.php`
- `backend/app/Mail/DriverRejected.php`
- `backend/app/Mail/WeeklyDriverEarnings.php`
- `backend/app/Mail/SosAdminAlert.php`
- `backend/resources/views/emails/*.blade.php`

**Implementation steps:**
1. Configure `config/mail.php`: default driver configurable (sendgrid/mailgun/smtp/log)
2. Create Blade email templates with responsive HTML design
3. PaymentReceipt mailable: ride details, fare breakdown, receipt number
4. DriverApproved/DriverRejected: status, instructions/reason
5. WeeklyDriverEarnings: total rides, hours, earnings, fees
6. All mailables implement `ShouldQueue` with `$tries = 3`
7. Unsubscribe link in footer (required for SA law)
8. Queue connection: `MAIL_QUEUE=default` (uses Redis queue)

### E3-T5: In-App Notification Center (6h)

**Files to create:**
- `backend/app/Http/Controllers/Api/V1/NotificationController.php`
- `backend/app/Http/Resources/NotificationResource.php`
- `backend/app/Models/UserNotification.php`
- `backend/database/migrations/xxxx_create_user_notifications_table.php`
- `mobile/packages/ui-kit/src/components/NotificationCenter.tsx`
- `mobile/packages/ui-kit/src/hooks/useNotifications.ts`

**Implementation steps:**
1. Create migration: `user_notifications` with user_id, type, title, body, data (JSON), deep_link, read_at, created_at
2. `GET /api/v1/notifications`: paginated, ordered by created_at DESC
3. `PATCH /api/v1/notifications/{id}/read`: set read_at
4. `PATCH /api/v1/notifications/read-all`: bulk update
5. `GET /api/v1/notifications/unread-count`: return count
6. When push notification or event fires, create UserNotification record
7. Mobile NotificationCenter component: FlatList with read/unread styling, tap to deep link
8. Badge on bell icon showing unread count

### E3-T6: SOS Alert System (8h)

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

**Implementation steps:**
1. Create migration: `sos_alerts` with user_id, ride_id, lat, lng, alert_type, status, resolved_by, resolved_at, notes
2. `POST /api/v1/sos/trigger`: create alert, start 10s cancel window
3. `POST /api/v1/sos/cancel/{alert}`: cancel within 10s, mark cancelled
4. On no-cancel: dispatch `SosTriggered` event → `EscalationService::escalate()`
5. Escalation: push to admin → SMS to emergency contact → email to admin team → WebSocket to admin dashboard
6. Mobile SOS screen: prominent red button, 10s countdown, cancel button
7. Admin WebSocket handler: `admin:sos` event with map pin data
8. Admin can resolve: `POST /api/v1/admin/sos/{alert}/resolve`

---

## E4: Mobile UX & Edge Cases (80h) — 10 tasks

### E4-T1: Offline Mode (12h)

**Files to create/modify:**
- `mobile/packages/api-client/src/offlineQueue.ts`
- `mobile/packages/api-client/src/storageCache.ts`
- `mobile/packages/ui-kit/src/components/OfflineBanner.tsx`
- `mobile/apps/rider/src/hooks/useOfflineRideRequest.ts`
- `mobile/apps/driver/src/hooks/useOfflineLocationSync.ts`
- `mobile/apps/rider/App.tsx`
- `mobile/apps/driver/App.tsx`

**Implementation steps:**
1. Install `@react-native-community/netinfo`
2. Create `offlineQueue.ts`: singleton queue of pending API calls, persist to AsyncStorage
3. `storageCache.ts`: generic `get/set` with TTL, cache API responses
4. `OfflineBanner.tsx`: yellow banner with wifi-off icon, shows on offline detection
5. `useOfflineRideRequest`: queues ride request when offline, auto-submits on reconnect
6. `useOfflineLocationSync`: queues GPS coords, batch-sends on reconnect
7. Wrap API client: if offline and request is cacheable, return cached; if mutation, queue
8. Wire NetInfo listener in App.tsx, show/hide banner

### E4-T2: Route Polyline Rendering (8h)

**Files to modify:**
- `mobile/packages/maps/src/RoutePolyline.tsx`
- `mobile/packages/maps/src/hooks/useRouteDirections.ts`
- `mobile/apps/rider/src/screens/ActiveRideScreen.tsx`
- `mobile/apps/driver/src/screens/ActiveRideScreen.tsx`

**Implementation steps:**
1. Install `@mapbox/polyline` for decoding polyline
2. `useRouteDirections`: fetches route from backend (which calls OSRM or Google Directions)
3. `RoutePolyline`: `Polyline` component with brand color (#1E3A5F), 4dp width, white stroke
4. Animate polyline drawing: use Animated API to stroke from 0 to 1 over 2 seconds
5. Route deviation detection: if driver >100m from route, re-fetch directions
6. Traffic coloring: if OSRM provides traffic data, color segments green/yellow/red
7. Multi-leg support for food delivery (rider → restaurant → destination)

### E4-T3: Animated Driver Marker (6h)

**Files to modify:**
- `mobile/packages/maps/src/AnimatedDriverMarker.tsx`
- `mobile/packages/maps/src/hooks/useDriverAnimation.ts`
- `mobile/apps/rider/src/screens/ActiveRideScreen.tsx`

**Implementation steps:**
1. `useDriverAnimation`: receives lat/lng updates, interpolates with `Animated.ValueXY`
2. Interpolation duration: 2000ms (matching 5s update interval)
3. Marker rotation: animate `heading` value smoothly
4. Car icon per vehicle type: sedan, SUV, bakkie (use SVGs or map markers)
5. Pulse animation on ride accept: scale 1.0 → 1.2 → 1.0 over 1s, repeat 3x
6. Idle bounce: subtle y-axis animation every 3 seconds (2dp up/down)
7. Performance: use `Animated.timing` with `useNativeDriver: true`

### E4-T4: Deep Linking (6h)

**Files to create/modify:**
- `mobile/packages/deeplink/src/deeplinkHandler.ts`
- `mobile/apps/rider/app.config.ts`
- `mobile/apps/driver/app.config.ts`
- `mobile/apps/admin/app.config.ts`
- `mobile/apps/rider/src/navigation/LinkingConfiguration.ts`

**Implementation steps:**
1. Define linking config per app: scheme `easyryde://`, host/prefix paths
2. Supported routes: `ride/{id}`, `payment/{id}`, `promo/{code}`, `profile`, `wallet`, `support`, `earnings`, `restaurant/{id}`, `order/{id}`
3. `LinkingConfiguration.ts`: map URL patterns to navigation screens
4. Cold start handling: check `linking.getInitialURL()` on app boot
5. Push notification deep link: extract `deep_link` from push data, navigate
6. iOS: configure Universal Links (apple-app-site-association)
7. Android: configure App Links (assetlinks.json)

### E4-T5: Pull-to-Refresh on Lists (4h)

**Files to modify:**
- `mobile/apps/rider/src/screens/RideHistoryScreen.tsx`
- `mobile/apps/rider/src/screens/WalletScreen.tsx`
- `mobile/apps/rider/src/screens/NotificationScreen.tsx`
- `mobile/apps/driver/src/screens/EarningsScreen.tsx`
- `mobile/apps/driver/src/screens/TripHistoryScreen.tsx`
- `mobile/apps/admin/src/screens/RidesScreen.tsx`
- `mobile/apps/admin/src/screens/DriversScreen.tsx`
- `mobile/apps/admin/src/screens/UsersScreen.tsx`

**Implementation steps:**
1. Add `RefreshControl` to every `FlatList`/`ScrollView`
2. Refresh handler: re-fetch data from API, update state
3. Spinner color: `#1E3A5F` (brand)
4. `last_updated` timestamp shown below list title
5. Offline behavior: show toast "No connection" instead of crashing

### E4-T6: Form Validation Feedback (4h)

**Files to modify:**
- `mobile/packages/auth/src/LoginForm.tsx`
- `mobile/packages/auth/src/RegisterForm.tsx`
- `mobile/apps/rider/src/screens/ProfileScreen.tsx`
- `mobile/apps/driver/src/screens/ProfileScreen.tsx`
- `mobile/apps/driver/src/screens/DocumentsScreen.tsx`

**Implementation steps:**
1. Create `useFormValidation` hook: validates on blur, returns errors object
2. Validation rules: email regex, phone regex (+27...), password min 8 chars + 1 number + 1 special
3. Inline error display: `<Text style={styles.error}>{errors.email}</Text>` below field
4. Error styling: 1px red border on field, 12px red text
5. Submit disabled until `Object.keys(errors).length === 0`

### E4-T7: Loading/Error/Empty States (10h)

**Files to create:**
- `mobile/packages/ui-kit/src/components/LoadingState.tsx`
- `mobile/packages/ui-kit/src/components/ErrorState.tsx`
- `mobile/packages/ui-kit/src/components/EmptyState.tsx`

**Implementation steps:**
1. `LoadingState`: skeleton shimmer (animated gradient), branded spinner
2. `ErrorState`: illustration SVG, error message, "Try Again" button, optional "Contact Support"
3. `EmptyState`: illustration, "No rides yet" text, "Book a Ride" CTA button
4. Apply to all 30+ screens: each screen has `if (loading) return <LoadingState />` pattern
5. Network error vs server error: check error.status, show appropriate message
6. Fade transition: `Animated.View` opacity 0→1 when state changes

### E4-T8: Scheduled Rides UI (8h)

**Files to create/modify:**
- `mobile/apps/rider/src/screens/ScheduleRideScreen.tsx`
- `mobile/apps/rider/src/components/DateTimePicker.tsx`
- `mobile/apps/rider/src/components/RecurringOptions.tsx`
- `mobile/apps/rider/src/hooks/useScheduledRide.ts`

**Implementation steps:**
1. Date picker: scrollable horizontal calendar showing next 7 days
2. Time picker: 15-minute interval scroll wheel (08:00, 08:15, 08:30...)
3. Recurring options: daily, weekly (day selector), monthly, ends after N rides
4. `useScheduledRide`: POST to `/api/v1/rides/schedule` with pickup, destination, datetime, recurrence
5. Display scheduled rides with countdown badge in ride history

### E4-T9: Driver Earnings Charts (8h)

**Files to create:**
- `mobile/apps/driver/src/screens/EarningsScreen.tsx`
- `mobile/apps/driver/src/components/EarningsChart.tsx`
- `mobile/apps/driver/src/components/EarningsSummaryCard.tsx`
- `mobile/packages/ui-kit/src/components/BarChart.tsx`

**Implementation steps:**
1. Three tabs using `react-native-tab-view`: Daily | Weekly | Monthly
2. Bar chart using `victory-native` or `react-native-svg-charts`
3. `GET /api/v1/drivers/earnings?period=daily|weekly|monthly` API
4. Summary cards: total, rides, hours, avg/ride
5. Trend: green up-arrow or red down-arrow vs previous period
6. Bar tap → tooltip with exact values
7. Pull-to-refresh, date range selector

### E4-T10: Biometric Authentication (6h)

**Files to modify:**
- `mobile/packages/auth/src/biometrics.ts`
- `mobile/packages/auth/src/AuthContext.tsx`
- `mobile/apps/rider/src/screens/SettingsScreen.tsx`
- `mobile/apps/rider/app.config.ts`
- `mobile/apps/driver/app.config.ts`

**Implementation steps:**
1. Install `expo-local-authentication`
2. `biometrics.ts`: `authenticate()`, `isAvailable()`, `enrollIfNeeded()`
3. Settings toggle: "Enable Fingerprint / Face ID"
4. On login: if enabled, call `authenticate()`, if success → login, if fail → password fallback
5. Secure storage: store auth token in expo-secure-store
6. Auto-lock: optional, require biometric after 5min background

---

## E5: Admin Dashboard & Food (60h) — 7 tasks

### E5-T1: Live Real-Time Dashboard (12h)

**Files to create/modify:**
- `web/src/pages/DashboardPage.tsx`
- `web/src/components/MetricCard.tsx`
- `web/src/components/ActivityChart.tsx`
- `web/src/hooks/useRealtimeMetrics.ts`
- `web/src/components/LiveDriverMap.tsx`

**Implementation steps:**
1. Create React page with grid layout: 6 metric cards top row, charts bottom
2. `useRealtimeMetrics`: Socket.io client connects to admin namespace, receives `admin:metrics` events
3. Metric cards: Active Rides, Online Drivers, Revenue Today (ZAR), Pending Approvals, Avg Wait Time, Cancellation Rate
4. Sparkline using `recharts` mini line chart per card
5. Revenue chart: 24-hour bar chart, stacked by payment method
6. Live driver map: Google Maps with driver markers, color-coded by status
7. Time range selector: Today/Week/Month
8. WebSocket reconnection: auto-reconnect with backoff

### E5-T2: Driver Document Review (10h)

**Files to create/modify:**
- `web/src/pages/DriversPage.tsx`
- `web/src/pages/DriverDetailPage.tsx`
- `web/src/components/DocumentViewer.tsx`
- `web/src/components/ApprovalWorkflow.tsx`

**Implementation steps:**
1. Driver list: table with columns (name, phone, status, documents, registered_at)
2. Status badges: Pending (yellow), Approved (green), Rejected (red), Expired (gray)
3. Filter bar: status dropdown, search input, date range
4. Driver detail: tabs for Info, Documents, Ride History, Earnings
5. Document viewer: modal showing image/PDF with zoom controls
6. Approve: POST `/api/v1/admin/drivers/{id}/approve`, trigger push notification
7. Reject: POST with reason, trigger push notification
8. Batch approve/reject: checkboxes + action bar

### E5-T3: Pricing Editor (8h)

**Files to create/modify:**
- `web/src/pages/PricingPage.tsx`
- `web/src/components/FareCategoryEditor.tsx`
- `web/src/components/SurgePricingConfig.tsx`
- `web/src/hooks/usePricingAudit.ts`

**Implementation steps:**
1. Tab per category: Standard, Premium, Luxury, Delivery, Food
2. Fields: base_fare, per_km_rate, per_minute_rate, min_fare, cancellation_fee
3. Draft mode: edits don't apply until "Publish" clicked
4. Publish: saves to DB with audit log entry (admin_id, old_values, new_values)
5. Surge section: enable toggle, multiplier slider (1.0–3.0), time windows, auto/manual mode
6. Platform fee: percentage input
7. Audit log viewer: table with admin, field changed, old/new, timestamp, IP
8. "Apply to existing rides" checkbox (base fare only)

### E5-T4: Restaurant Management CRUD (8h)

**Files to create/modify:**
- `web/src/pages/RestaurantsPage.tsx`
- `web/src/pages/RestaurantDetailPage.tsx`
- `web/src/components/MenuEditor.tsx`
- `web/src/components/MenuCategoryEditor.tsx`

**Implementation steps:**
1. Restaurant list: name, address, status, cuisine, phone, actions
2. Add/edit modal: name, address (Google Places autocomplete), phone, cuisine dropdown, logo upload (S3)
3. Operating hours: per-day time pickers (open/close)
4. Menu editor: drag-and-drop categories, inline item editing
5. Menu item: name, description, price (ZAR), photo, dietary flags (checkboxes)
6. Delivery radius: km input with map visualization
7. Commission override: percentage per restaurant

### E5-T5: Food Order Management (10h)

**Files to create/modify:**
- `web/src/pages/FoodOrdersPage.tsx`
- `web/src/pages/FoodOrderDetailPage.tsx`
- `web/src/components/OrderTimeline.tsx`
- `backend/app/Services/Food/FoodOrderService.php`
- `backend/app/Models/FoodOrder.php`

**Implementation steps:**
1. Food order list: order_id, restaurant, rider, driver, amount, status, time
2. Real-time updates via WebSocket (new order appears without refresh)
3. Order detail: items list with quantities, amounts, rider info, driver info, restaurant info
4. Timeline: ordered → confirmed → preparing → ready → picked up → delivered (with timestamps)
5. Admin actions: reassign driver, cancel (with reason), mark status manually
6. SLA: orders >60min = yellow badge, >90min = red badge
7. Auto-dispatch: assign nearest available food delivery driver

### E5-T6: Audit Log Viewer (6h)

**Files to create/modify:**
- `web/src/pages/AuditLogPage.tsx`
- `web/src/components/AuditLogTable.tsx`

**Implementation steps:**
1. Paginated table: timestamp, admin, action type, resource, ID, summary
2. Filters: date range picker, admin dropdown, action type (create/update/delete/approve/reject), resource type (ride/payment/user/driver/setting)
3. Color coding: create=green, update=blue, delete=red, approve=gold
4. Expandable row: click to show old value, new value, IP, user agent
5. CSV export of filtered view
6. Auto-refresh: new logs appear every 30 seconds

### E5-T7: Driver Payout Panel (6h)

**Files to create:**
- `web/src/pages/PayoutsPage.tsx`
- `web/src/pages/PayoutDetailPage.tsx`
- `web/src/components/PayoutSummaryTable.tsx`

**Implementation steps:**
1. Payout list: driver, amount, method, status, period, processed_at
2. Filters: status dropdown, date range, driver search
3. Summary cards: total pending, total paid this week, total paid this month, avg payout
4. Click to detail: ride breakdown for period, fees deducted, net amount
5. Manual payout: button triggers `POST /api/v1/admin/payouts/manual` with driver_id
6. Retry failed: button on failed payout row
7. Export CSV/PDF for accounting

---

## E6: Testing & QA (70h) — 6 tasks

### E6-T1: Unit Tests (20h)

**Files to create:**
- 16 test files (see epic-and-stories.md E6.1)

**Implementation steps:**
1. For each service: create test class extending `Tests\TestCase`
2. Mock all external dependencies via Mockery or Laravel's `$this->mock()`
3. Test all public methods: happy path, error path, edge cases
4. Use data providers for multiple input combinations
5. Run `php artisan test --testsuite=Unit` and achieve 85% coverage
6. Generate coverage report: `php artisan test --coverage-html=coverage`

### E6-T2: Integration Tests (16h)

**Files to create:**
- 16 test files (see epic-and-stories.md E6.2)

**Implementation steps:**
1. For each endpoint group: create Pest/PHPUnit test class
2. Use `RefreshDatabase` trait to isolate tests
3. Factories for test data: User, Driver, Ride, Payment, etc.
4. Each endpoint tested: 200/201 success, 422 validation error, 401 no auth, 403 wrong role
5. Full lifecycle tests: ride lifecycle, payment flow, admin flow
6. Run `php artisan test --testsuite=Feature` — all green

### E6-T3: Admin E2E Tests (12h)

**Files to create:**
- 10 Playwright spec files

**Implementation steps:**
1. Install Playwright: `npm init playwright@latest`
2. Create test user with admin role in test DB
3. Login spec: valid/invalid credentials, session expiry
4. Dashboard spec: metrics render, chart loads, map renders
5. Drivers spec: list loads, approve, reject, filter
6. Pricing spec: load settings, edit, save, verify audit
7. Restaurants spec: CRUD operations
8. Run `npx playwright test` — all pass

### E6-T4: Mobile E2E Tests (8h)

**Files to create:**
- 3 Detox/Maestro test files

**Implementation steps:**
1. Install Detox: `detox init`
2. Rider smoke test: login → request ride → cancel → view history
3. Driver smoke test: login → go online → accept ride → complete
4. Admin smoke test: login → view dashboard → approve driver
5. Run on iOS simulator and Android emulator

### E6-T5: Load Tests (8h)

**Files to create:**
- 6 k6 scenario files

**Implementation steps:**
1. Install k6 locally and in CI
2. Ride booking scenario: `http.post('/api/v1/rides')` with 100 VUs
3. Driver location scenario: WebSocket connections sending location
4. Payment processing: `POST /webhook` with 50 VUs
5. WebSocket connections: 10K concurrent connections
6. Mixed workload: all above simultaneously for 10 minutes
7. Thresholds: p95 < 500ms, error rate < 0.1%

### E6-T6: Security Tests (6h)

**Files to create:**
- 6 security test scripts

**Implementation steps:**
1. SQLi: inject `' OR 1=1--` in all text fields, verify no SQL errors
2. XSS: inject `<script>alert(1)</script>` in name fields, verify escaped
3. CSRF: submit state-changing request without CSRF token → 419
4. Rate limit bypass: rotate IPs via X-Forwarded-For → still blocked
5. Auth bypass: access protected routes without token, with expired token, with wrong role
6. Webhook forgery: send webhook with invalid signature, from wrong IP, replay

---

## E7: Deploy & Operations (50h) — 5 tasks

### E7-T1: Docker Production Config (12h)

**Files to modify:**
- `docker-compose.prod.yml`
- `.docker/php/Dockerfile`
- `.docker/nginx/nginx.conf`
- `.docker/socket/Dockerfile`

**Implementation steps:**
1. Add health checks to all services: `curl --fail http://localhost/health` or `pg_isready`
2. Set memory limits: `deploy.resources.limits.memory: 512M` per container
3. PHP-FPM: `pm.max_children = 50`, `pm.start_servers = 5`
4. Nginx: rate limiting zone, security headers (add_header), SSL config
5. Socket.io: `NODE_ENV=production`, `--max-old-space-size=512`
6. Redis: `maxmemory 1gb`, `maxmemory-policy allkeys-lru`
7. PostgreSQL: `shared_buffers = 256MB`, `effective_cache_size = 768MB`
8. Validation: `docker-compose -f docker-compose.prod.yml config`

### E7-T2: Monitoring Stack (12h)

**Files to create/modify:**
- `docker-compose.monitoring.yml`
- `prometheus/prometheus.yml`
- `grafana/dashboards/`
- `grafana/datasources/`

**Implementation steps:**
1. Create monitoring compose file with Prometheus + Grafana + exporters
2. Prometheus config: scrape targets for Laravel, Node.js, PostgreSQL, Redis
3. Install PHP Prometheus exporter: `composer require promphp/prometheus_client_php`
4. Configure Redis exporter container
5. Configure PostgreSQL exporter container
6. Grafana: datasource configs, import dashboards
7. Create 3 dashboards: Platform Overview, Infrastructure, Business
8. Configure alert rules in Prometheus/Grafana
9. Set up Slack webhook for alert notifications

### E7-T3: Database Backup Automation (8h)

**Files to create:**
- `scripts/backup/backup.ps1`
- `scripts/backup/restore.ps1`
- `scripts/backup/verify-backup.ps1`

**Implementation steps:**
1. Write backup script: `pg_dump --format=custom --compress=9 --file=easyryde-$(date).dump`
2. Upload to S3: `aws s3 cp $BACKUP_FILE s3://easyryde-backups/daily/`
3. WAL archiving: `archive_mode = on`, `archive_command = 'aws s3 cp %p s3://easyryde-wal/%f'`
4. Retention: local 7 days, daily 30 days, weekly 6 months, monthly 1 year
5. Restore script: `pg_restore --dbname=easyryde $BACKUP_FILE`
6. Verify script: restore to staging, run `SELECT count(*)` on key tables
7. Schedule via cron or Windows Task Scheduler

### E7-T4: CI/CD Pipeline (12h)

**Files to create/modify:**
- `.github/workflows/ci.yml`
- `.github/workflows/cd.yml`

**Implementation steps:**
1. CI workflow: trigger on push to any branch
   - PHP: `composer install`, `php artisan test`, `./vendor/bin/phpstan analyse`, `./vendor/bin/pint --test`
   - Node (socket-server): `npm ci`, `npm test`
   - Node (web): `npm ci`, `npm run build`
   - Expo (mobile): `npm ci`, `npx tsc --noEmit`
2. CD workflow: trigger on push to main
   - Build Docker images: `docker build -t easyryde-api:${{ github.sha }} .`
   - Push to GHCR or Docker Hub
   - Deploy to staging via SSH or k8s
   - Run smoke tests against staging:
     - `curl --fail https://staging.easyryde.com/api/health`
     - `npx playwright test --config=e2e/playwright.config.ts`
   - If smoke tests pass: deploy to production (blue/green)
   - If fail: rollback, notify Slack
3. Slack notifications on each stage

### E7-T5: Zero-Downtime Deployment (6h)

**Files to create/modify:**
- `scripts/deploy/blue-green-deploy.sh`
- `scripts/deploy/health-check.sh`
- `scripts/deploy/rollback.sh`
- `nginx/blue-green.conf`

**Implementation steps:**
1. Blue/green nginx config: `upstream backend { server blue:80 weight=1; server green:80 weight=0; }`
2. Deploy script:
   - Build new containers (green)
   - Run database migrations (`php artisan migrate --force`)
   - Wait for green health check
   - Switch nginx: `weight=0` for blue, `weight=1` for green
   - Keep blue running for 60s (draining)
   - Stop blue
3. Rollback: switch nginx back to blue, revert DB if needed
4. Health check: `curl --fail http://localhost/api/health`
5. Session sharing: same Redis instance for both blue and green
6. Database migration backward-compatibility: no column drops in same deploy

---

*End of detailed-tasks.md — 48 tasks total across 7 epics.*
