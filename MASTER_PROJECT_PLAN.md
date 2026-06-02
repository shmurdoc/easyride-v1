# EasyRyde — Master Project Plan

> Enterprise Production-Ready Ride-Hailing Platform for Phalaborwa, Limpopo
> Converting from ASP.NET (RideAway) → Laravel + Node.js + React Native

---

## EXECUTIVE SUMMARY

**What this is:** A Uber/Bolt-style ride-hailing platform built specifically for Phalaborwa, Limpopo. Unlike Uber/Bolt, this system uses a **central admin model** — admin creates driver accounts, sets all pricing rules, and manages the entire platform. Includes ride-hailing, local item transport, and food delivery integration with "Phalaborwa in my hand" app.

**Current state:** ~40% complete. Foundation (models, services, migrations, Docker) exists. Critical gaps: NO API controllers, NO React Native apps, NO real payment integration, NO tests beyond auth.

**Target:** Enterprise production-ready system — not a demo.

---

## TECHNOLOGY DECISION

| Layer | Technology | Why |
|-------|-----------|-----|
| **API Backend** | Laravel 13 + PHP 8.4 | Best ecosystem for SA payment gateways (PayFast, Ozwo), rapid CRUD, admin dashboard, queue system |
| **Real-time Server** | Node.js + Socket.io | Sub-200ms WebSocket latency for GPS tracking, driver matching |
| **Mobile Apps** | React Native (Expo) | Single codebase for iOS + Android, OTA updates |
| **Admin Dashboard** | React + TailwindCSS | Web-based admin panel for the central admin |
| **Database** | PostgreSQL 16 + PostGIS | Geospatial queries for nearby driver matching |
| **Cache/Queue** | Redis 7 | Session, queue, Socket.io adapter, surge pricing cache |
| **Payments** | PayFast + Ozwo + Cash | SA-focused payment gateways + cash reconciliation |

**Why NOT full Node.js backend:** Laravel provides better ecosystem for:
- Payment gateway integrations (PayFast/Ozwo are SA-specific, better PHP SDKs)
- Admin dashboard (Blade + Filament or React)
- Queue system (Horizon is battle-tested)
- Role-based auth (Spatie Permissions)
- Background jobs (driver payouts, settlement, reporting)
- The ASP.NET backend already has similar patterns (CQRS → can map to Laravel Services)

**Why NOT full Laravel backend:** Real-time GPS tracking at scale requires Node.js WebSocket handling. Laravel Broadcasting + Soketi works but Socket.io with Redis adapter is more reliable for 10K+ concurrent connections.

---

## WHAT EXISTS vs WHAT'S NEEDED

### EXISTS (RideAway ASP.NET — to be converted)
- ✅ JWT authentication (login, register, admin create driver)
- ✅ Ride lifecycle (request → accept → collect → complete → cancel)
- ✅ Fare calculation (base + per-km + surge pricing)
- ✅ Payment processing (Stripe, Ozow, PayFast, cash)
- ✅ Wallet system (deposit, spend, refund, transaction history)
- ✅ Driver management (online/offline, location updates, ride history)
- ✅ Admin dashboard (settings, audit logs, reports, user/driver CRUD)
- ✅ Google Maps integration (geocoding, directions, distance)
- ✅ Email/SMS notifications (SendGrid, Twilio)
- ✅ WebSocket real-time hub
- ✅ Feature flags
- ✅ Reporting (revenue, cancellation rate, user retention, platform metrics)
- ✅ Rate limiting
- ✅ Global exception handler
- ✅ Unit tests + integration tests (20 test files)

### EXISTS (EasyRyde Laravel — partially built)
- ✅ 14 Eloquent models with relationships
- ✅ 13 database migrations with PostGIS
- ✅ 8 service classes (fare, matching, payment, wallet, rating, promo, delivery, driver matching)
- ✅ 3 queued jobs
- ✅ 5 notification classes
- ✅ 7 event classes
- ✅ Docker infrastructure (PostgreSQL + Redis + Laravel + Nginx)
- ✅ Socket.io server with Redis adapter
- ✅ Blade admin views (22 templates)
- ✅ CI pipeline (GitHub Actions)
- ✅ Seeder with demo data

### MISSING (Must build)
- ❌ **ALL API controllers** (routes defined, controllers empty)
- ❌ **Form request validation** (only 2 of 10+ needed)
- ❌ **API response resources/transformers**
- ❌ **React Native mobile apps** (rider, driver, admin)
- ❌ **React admin web dashboard**
- ❌ **Real payment gateway integration** (only abstractions exist)
- ❌ **Push notification service** (FCM/APNs)
- ❌ **SMS notification service** (Twilio integration)
- ❌ **Email notification service** (SendGrid integration)
- ❌ **Comprehensive test suite** (only 8 tests exist)
- ❌ **Surge pricing algorithm**
- ❌ **Driver document verification workflow**
- ❌ **Cash payment reconciliation**
- ❌ **Driver payout/settlement engine**
- ❌ **Escrow system**
- ❌ **Refund workflow**
- ❌ **Support ticket system**
- ❌ **SOS/emergency system**
- ❌ **Referral system**
- ❌ **Scheduled rides**
- ❌ **In-app chat (rider↔driver)**
- ❌ **Offline mode handling**
- ❌ **Deep linking**
- ❌ **Multi-language support**
- ❌ **Delivery integration** (Phalaborwa in my hand)
- ❌ **POPIA compliance**
- ❌ **Load testing**
- ❌ **API documentation** (Swagger/OpenAPI)
- ❌ **Monitoring/alerting** (Sentry, Grafana)
- ❌ **Backup/disaster recovery**

---

## MASTER IMPLEMENTATION PLAN

### PHASE 0: Foundation Fix (Days 1-3)
> Get the existing Laravel app to a clean, working state

**Task 0.1: Fix CI & Code Quality**
- [x] Fix APP_KEY generation (base64: prefix) — DONE
- [x] Fix NewRideRequest Dispatchable trait — DONE
- [x] Fix RideMatchingService dispatch call — DONE
- [ ] Fix PHPStan level to 5+ (currently level 0)
- [ ] Fix all PHP_CodeSniffer violations
- [ ] Remove unused imports and dead code
- [ ] Add missing config/permission.php (publish Spatie config)

**Task 0.2: Complete Missing Model Relationships**
- [ ] Verify ALL model relationships are defined (belongsTo, hasMany, etc.)
- [ ] Add missing model casts (decimal fields, enums, dates)
- [ ] Add model scopes (e.g., Ride::scopeActive, User::scopeOnlineDrivers)
- [ ] Add model observers for auto-creating wallets on user registration

**Task 0.3: Database Schema Alignment**
- [ ] Compare RideAway schema vs EasyRyde schema — identify missing columns
- [ ] Add missing columns from RideAway (e.g., `current_ride_id` on users)
- [ ] Add missing indexes from RideAway (performance indexes)
- [ ] Create missing migrations for new tables:
  - `push_tokens` (device tokens for FCM/APNs)
  - `consent_records` (POPIA)
  - `support_tickets` + `ticket_messages`
  - `sos_alerts`
  - `referral_codes` + `referral_redemptions`
  - `scheduled_rides`
  - `ride_chat_messages`
  - `driver_payouts`
  - `cash_reconciliation`
  - `webhook_events` (dead letter queue)
  - `api_keys`
  - `insurance_policies`
  - `incident_reports`
  - `identity_verifications`
  - `user_documents`
  - `notification_templates`

**Deliverable:** Clean, passing CI with all models properly defined.

---

### PHASE 1: API Layer (Days 4-14)
> Build ALL controllers, validation, and response resources

**Task 1.1: Auth System**
- [ ] `POST /api/v1/auth/register` — User registration with role assignment
- [ ] `POST /api/v1/auth/login` — Login with Sanctum token
- [ ] `POST /api/v1/auth/logout` — Revoke current token
- [ ] `GET /api/v1/auth/me` — Get authenticated user profile
- [ ] `POST /api/v1/auth/forgot-password` — Send reset link (email)
- [ ] `POST /api/v1/auth/reset-password` — Reset password with token
- [ ] `POST /api/v1/auth/admin/create-driver` — Admin creates driver account
- [ ] Rate limiting: 5 attempts/min on login/register, 3/min on password reset
- [ ] Form requests: RegisterRequest, LoginRequest, ForgotPasswordRequest

**Task 1.2: Ride Controller**
- [ ] `POST /api/v1/rides` — Request ride (with fare estimate)
- [ ] `GET /api/v1/rides` — List rides (rider's own, driver's own, admin: all)
- [ ] `GET /api/v1/rides/current` — Get active ride
- [ ] `GET /api/v1/rides/{ride}` — Ride detail
- [ ] `POST /api/v1/rides/{ride}/cancel` — Cancel ride (with refund logic)
- [ ] `POST /api/v1/rides/{ride}/rate` — Rate ride (1-5 stars + comment)
- [ ] `POST /api/v1/rides/{ride}/apply-promo` — Apply promo code
- [ ] `POST /api/v1/rides/{ride}/driver-accept` — Driver accepts
- [ ] `POST /api/v1/rides/{ride}/driver-arrived` — Driver arrived at pickup
- [ ] `POST /api/v1/rides/{ride}/start` — Start ride (InTransit status)
- [ ] `POST /api/v1/rides/{ride}/complete` — Complete ride (trigger payment)
- [ ] `POST /api/v1/rides/{ride}/location` — Driver updates location during ride
- [ ] State machine: searching → accepted → arrived → in_progress → completed/cancelled
- [ ] Business rules: driver must be within 10km, ride expires after 5min, cancellation window 2min

**Task 1.3: Driver Controller**
- [ ] `GET /api/v1/drivers` — List drivers (admin)
- [ ] `GET /api/v1/drivers/nearby-rides` — Get pending rides for driver
- [ ] `GET /api/v1/drivers/{driver}` — Driver profile
- [ ] `PUT /api/v1/drivers/profile` — Update driver profile
- [ ] `POST /api/v1/drivers/vehicle` — Register/update vehicle
- [ ] `POST /api/v1/drivers/toggle-online` — Go online/offline
- [ ] `GET /api/v1/drivers/earnings` — Driver earnings (daily/weekly)
- [ ] `GET /api/v1/drivers/trips` — Driver ride history (paginated)
- [ ] `POST /api/v1/drivers/{driverId}/online` — Set online status
- [ ] `POST /api/v1/drivers/{driverId}/offline` — Set offline status

**Task 1.4: Payment Controller**
- [ ] `GET /api/v1/payments` — Payment history
- [ ] `GET /api/v1/payments/methods` — Available payment methods
- [ ] `GET /api/v1/payments/{payment}` — Payment detail
- [ ] `POST /api/v1/payments/rides/{ride}/pay` — Process ride payment
- [ ] `POST /api/v1/payments/payfast/webhook` — PayFast ITN verification
- [ ] `GET /api/v1/payments/payfast/return` — PayFast return redirect
- [ ] `POST /api/v1/payments/ozow/webhook` — Ozow webhook verification
- [ ] `GET /api/v1/payments/ozow/return` — Ozow return redirect
- [ ] Cash payment: driver marks "paid_in_cash", system records, deducts platform fee

**Task 1.5: Wallet Controller**
- [ ] `GET /api/v1/wallet` — Wallet balance and info
- [ ] `GET /api/v1/wallet/transactions` — Transaction history (paginated)
- [ ] `POST /api/v1/wallet/deposit` — Top up wallet (via PayFast/Ozwo)
- [ ] `POST /api/v1/wallet/withdraw` — Withdraw funds (admin approval)

**Task 1.6: Rating Controller**
- [ ] `GET /api/v1/ratings` — List ratings
- [ ] `GET /api/v1/ratings/given` — Ratings given by current user
- [ ] `POST /api/v1/ratings` — Submit rating (1-5 stars + optional comment)
- [ ] `GET /api/v1/ratings/{rating}` — Rating detail

**Task 1.7: Promo Code Controller**
- [ ] `GET /api/v1/promo-codes` — List promo codes (admin)
- [ ] `POST /api/v1/promo-codes` — Create promo code (admin)
- [ ] `GET /api/v1/promo-codes/{promoCode}` — Promo code detail
- [ ] `PUT /api/v1/promo-codes/{promoCode}` — Update promo code (admin)
- [ ] `DELETE /api/v1/promo-codes/{promoCode}` — Delete promo code (admin)
- [ ] `POST /api/v1/promo-codes/validate` — Validate promo code (public)

**Task 1.8: Delivery Controller** (Phalaborwa in my hand integration)
- [ ] `GET /api/v1/deliveries` — List deliveries
- [ ] `POST /api/v1/deliveries` — Create delivery order
- [ ] `GET /api/v1/deliveries/active` — Get active delivery
- [ ] `GET /api/v1/deliveries/{delivery}` — Delivery detail
- [ ] `PUT /api/v1/deliveries/{delivery}/status` — Update delivery status

**Task 1.9: Admin Controller**
- [ ] `GET /api/v1/admin/dashboard` — Dashboard metrics (total rides, revenue, active drivers)
- [ ] `GET /api/v1/admin/users` — List users (paginated, filterable)
- [ ] `GET /api/v1/admin/rides` — List all rides (paginated, filterable by status/date)
- [ ] `GET /api/v1/admin/drivers` — List all drivers (paginated)
- [ ] `POST /api/v1/admin/drivers/{driver}/approve` — Approve driver
- [ ] `POST /api/v1/admin/drivers/{driver}/reject` — Reject driver
- [ ] `GET /api/v1/admin/settings` — Get system settings
- [ ] `POST /api/v1/admin/settings` — Update system settings (with audit log)
- [ ] `GET /api/v1/admin/audit-logs` — View audit logs (paginated)
- [ ] `DELETE /api/v1/admin/users/{id}` — Delete user
- [ ] `DELETE /api/v1/admin/drivers/{id}` — Delete driver

**Task 1.10: Reporting Controller**
- [ ] `GET /api/v1/reporting/drivers/{driverId}/earnings` — Driver earnings report
- [ ] `GET /api/v1/reporting/cancellation-rate` — Cancellation rate over time
- [ ] `GET /api/v1/reporting/user-retention` — Cohort retention analysis
- [ ] `GET /api/v1/reporting/platform-metrics` — Platform-wide metrics
- [ ] `GET /api/v1/reporting/location-volume` — Ride volume by location
- [ ] `GET /api/v1/reporting/revenue` — Revenue reports (hourly/daily/weekly/monthly)
- [ ] Export to CSV/PDF

**Task 1.11: Config Controller**
- [ ] `GET /api/v1/config/locations` — Phalaborwa locations
- [ ] `GET /api/v1/config/vehicle-types` — Vehicle types with fare info
- [ ] `GET /api/v1/config/app-info` — App metadata
- [ ] `GET /api/v1/config/settings` — Public fare/platform settings

**Task 1.12: API Response Resources**
- [ ] UserResource, RiderResource, DriverResource
- [ ] RideResource (with nested rider, driver, payment)
- [ ] PaymentResource
- [ ] WalletResource, WalletTransactionResource
- [ ] RatingResource
- [ ] PromoCodeResource
- [ ] DeliveryResource
- [ ] AdminDashboardResource
- [ ] ReportingResource

**Task 1.13: Form Request Validation**
- [ ] RegisterRequest, LoginRequest, ForgotPasswordRequest
- [ ] RideRequest, CancelRideRequest, RateRideRequest
- [ ] DriverProfileRequest, VehicleRequest, ToggleOnlineRequest
- [ ] PaymentRequest, WalletDepositRequest, WalletWithdrawRequest
- [ ] RatingRequest, PromoCodeRequest
- [ ] DeliveryRequest
- [ ] AdminSettingsRequest, AdminUserFilterRequest

**Deliverable:** Complete REST API with 80+ endpoints, all validated, all returning consistent JSON responses.

---

### PHASE 2: Real-Time Server (Days 14-18)
> Node.js Socket.io for GPS tracking, ride updates, driver matching

**Task 2.1: Socket.io Server Enhancement**
- [ ] JWT authentication middleware (verify Sanctum token)
- [ ] Redis adapter for horizontal scaling
- [ ] Room management: `ride_{rideId}`, `driver_{driverId}`, `rider_{riderId}`
- [ ] Connection lifecycle: connect → authenticate → join rooms → handle events

**Task 2.2: Event Handlers**
- [ ] `driver:location-update` — Driver sends GPS → broadcast to rider room
- [ ] `ride:request` — New ride → broadcast to nearby drivers
- [ ] `ride:accept` — Driver accepts → notify rider
- [ ] `ride:status` — Status change → broadcast to ride room
- [ ] `ride:chat:message` — In-app chat between rider and driver
- [ ] `driver:online` — Driver goes online → add to geo-index
- [ ] `driver:offline` — Driver goes offline → remove from geo-index
- [ ] `admin:alert` — SOS/emergency → notify admin

**Task 2.3: Laravel ↔ Node.js Bridge**
- [ ] Redis pub/sub: Laravel publishes events → Node.js subscribes and broadcasts
- [ ] Event channels: `ride-events`, `driver-events`, `admin-events`
- [ ] Shared secret for inter-service communication

**Task 2.4: Driver Location Tracking**
- [ ] Geo-index (Redis Sorted Sets) for nearby driver queries
- [ ] Location update rate limiting (max 1 per 5 seconds per driver)
- [ ] Stale location cleanup (mark offline after 10min no update)
- [ ] Haversine formula for distance calculation in Redis

**Deliverable:** Real-time WebSocket server handling 10K+ connections with sub-200ms latency.

---

### PHASE 3: React Native Mobile Apps (Days 18-38)
> Rider App + Driver App + Admin App

**Task 3.1: Shared Infrastructure**
- [ ] Expo monorepo with shared packages
- [ ] Shared API client (Axios with interceptors, token refresh)
- [ ] Shared UI kit (Button, Input, Card, Map, theme)
- [ ] Shared auth package (login, register, token storage, biometrics)
- [ ] Shared maps package (Google Maps SDK, markers, polylines)
- [ ] Environment configuration (dev/staging/prod)
- [ ] Deep linking configuration (easyryde:// scheme)

**Task 3.2: Rider App Screens**
- [ ] HomeScreen: Map + service cards + "Where to?" search bar
- [ ] SearchScreen: Google Places autocomplete for pickup/destination
- [ ] RideOptionsScreen: Category selection (Standard/Premium/Luxury) + fare estimate
- [ ] SearchingDriverScreen: Pulsing animation + wait time + estimated arrival
- [ ] ActiveRideScreen: Real-time driver tracking on map + ETA + driver info card
- [ ] RideCompleteScreen: Rating (1-5 stars) + fare breakdown + receipt
- [ ] PaymentScreen: Payment method selection (PayFast/Ozwo/Wallet/Cash)
- [ ] WalletScreen: Balance + top-up + transaction history
- [ ] RideHistoryScreen: Past rides with details
- [ ] ProfileScreen: User profile + settings
- [ ] PromoCodeScreen: Enter/apply promo code
- [ ] SupportScreen: FAQ + contact support
- [ ] NotificationScreen: Push notification history

**Task 3.3: Driver App Screens**
- [ ] DriverHomeScreen: Map + online/offline toggle + today's earnings card
- [ ] RideRequestsScreen: Incoming ride requests with accept/reject buttons
- [ ] ActiveRideScreen: Navigation to pickup + rider info + chat button
- [ ] RideInProgressScreen: Navigation to destination + fare meter
- [ ] EarningsScreen: Daily/weekly/monthly breakdown with charts
- [ ] TripHistoryScreen: Past trips with details
- [ ] ProfileScreen: Vehicle info, documents, settings
- [ ] DocumentsScreen: Upload/renew driver license, vehicle registration
- [ ] SupportScreen: FAQ + contact support

**Task 3.4: Admin Mobile App Screens**
- [ ] DashboardScreen: KPI cards + activity chart + live map with driver positions
- [ ] RidesScreen: Ride list with filters (status, date, driver)
- [ ] DriversScreen: Driver list with approval status + one-tap approve/reject
- [ ] UsersScreen: User list with search
- [ ] SettingsScreen: Pricing editor + system config
- [ ] ReportsScreen: Revenue charts + driver performance
- [ ] AuditLogScreen: Admin action history

**Task 3.5: Critical Mobile Features**
- [ ] Offline mode (cache last-known state, queue requests)
- [ ] Background location updates (driver app)
- [ ] Push notification handling (FCM/APNs)
- [ ] Biometric authentication (fingerprint/face)
- [ ] Call rider/driver (phone number masking)
- [ ] Share ride status (deep link)
- [ ] SOS/emergency button (during active ride)

**Deliverable:** Three polished React Native apps published to App Store + Google Play.

---

### PHASE 4: Payment Integration (Days 38-45)
> Real payment gateway integration with South African providers

**Task 4.1: PayFast Integration**
- [ ] PayFastService: Generate payment URL with signature
- [ ] ITN (Instant Transaction Notification) verification
- [ ] Return URL handling (redirect back to app)
- [ ] Cancel URL handling
- [ ] Test mode + production mode toggle

**Task 4.2: Ozwo Integration**
- [ ] OzowPaymentService: Create payment request
- [ ] Webhook verification (signature check)
- [ ] Return URL handling
- [ ] Test mode + production mode

**Task 4.3: Cash Payment**
- [ ] Driver marks ride as "paid_in_cash"
- [ ] Platform fee deducted from driver wallet
- [ ] Cash reconciliation (daily settlement tracking)
- [ ] Discrepancy reporting

**Task 4.4: Wallet System**
- [ ] Top up via PayFast/Ozwo
- [ ] Pay for rides from wallet
- [ ] Refund to wallet on cancellation
- [ ] Withdraw funds (admin approval required)
- [ ] Transaction history with filters

**Task 4.5: Escrow & Settlement**
- [ ] Payment held in escrow for 24h after ride completion
- [ ] Dispute window (rider can dispute within 24h)
- [ ] After 24h: release to driver wallet
- [ ] Driver payout: daily automatic for amounts > R200
- [ ] Weekly settlement for smaller amounts

**Task 4.6: Refund Workflow**
- [ ] Rider requests refund → admin reviews
- [ ] Refund rules: within 2min = full, after 2min = partial, driver no-show = full
- [ ] Process refund through original payment gateway
- [ ] R25 apology credit for technical issues

**Deliverable:** Fully functional payment system with PayFast, Ozwo, cash, wallet, escrow, and refunds.

---

### PHASE 5: Admin Dashboard (Days 45-52)
> Web-based admin panel for the central admin

**Task 5.1: React Admin Dashboard**
- [ ] LoginScreen: Admin authentication
- [ ] DashboardScreen: Real-time KPIs (rides, revenue, active drivers, pending approvals)
- [ ] RidesScreen: All rides with filters, status management, details modal
- [ ] DriversScreen: Driver list, approval workflow, document review
- [ ] UsersScreen: User list, search, account management
- [ ] PaymentsScreen: Payment history, reconciliation, refund management
- [ ] WalletScreen: Driver wallet overview, payouts, settlements
- [ ] PricingScreen: Fare settings editor (base fare, per-km, surge config)
- [ ] PromoCodeScreen: Promo code CRUD
- [ ] ReportsScreen: Revenue charts, driver performance, location analytics
- [ ] AuditLogScreen: Admin action history
- [ ] SettingsScreen: System configuration
- [ ] LiveMapScreen: Real-time driver positions on map

**Task 5.2: Pricing Control**
- [ ] Per-category fare settings (Standard/Premium/Luxury)
- [ ] Surge pricing config (multiplier, time windows, auto/manual)
- [ ] Platform fee percentage
- [ ] Cancellation fee settings
- [ ] Promo code management (create, set rules, activate/deactivate)
- [ ] All changes logged to audit trail

**Task 5.3: Driver Approval Workflow**
- [ ] Admin sees pending driver applications
- [ ] Review uploaded documents (license, ID, vehicle registration)
- [ ] Approve/reject with reason
- [ ] Driver notified via push + email
- [ ] Approved driver can go online

**Deliverable:** Full admin dashboard for managing the entire platform.

---

### PHASE 6: Notifications (Days 52-55)
> Email, SMS, and push notification infrastructure

**Task 6.1: Push Notifications (FCM/APNs)**
- [ ] FCM setup for Android
- [ ] APNs setup for iOS
- [ ] Push token management (register, update, deactivate)
- [ ] Notification templates (9+ types: ride status, payment, promo, etc.)
- [ ] Targeted notifications (rider only, driver only, all users)

**Task 6.2: Email Notifications (SendGrid)**
- [ ] Ride confirmation email
- [ ] Payment receipt
- [ ] Password reset email
- [ ] Driver approval/rejection email
- [ ] Weekly driver earnings report
- [ ] Admin alerts (SOS, system errors)

**Task 6.3: SMS Notifications (Twilio)**
- [ ] Ride status updates (SMS backup)
- [ ] Payment confirmations
- [ ] OTP verification (if implemented)
- [ ] Emergency alerts (SOS)

**Task 6.4: In-App Notifications**
- [ ] Notification center (list of past notifications)
- [ ] Read/unread status
- [ ] Deep link from notification to relevant screen

**Deliverable:** Complete notification system covering push, email, SMS, and in-app.

---

### PHASE 7: Delivery Integration (Days 55-60)
> "Phalaborwa in my hand" integration

**Task 7.1: Delivery System**
- [ ] Delivery order creation (sender → receiver)
- [ ] Package details (weight, dimensions, value, fragile flag)
- [ ] Pickup and dropoff addresses with GPS
- [ ] Fare calculation based on distance + weight tier
- [ ] Driver assignment (nearest available driver)
- [ ] Real-time tracking (pickup → in-transit → delivered)
- [ ] Proof of delivery (photo + signature)
- [ ] Delivery confirmation + payment

**Task 7.2: Food Delivery Integration**
- [ ] API integration with "Phalaborwa in my hand" app
- [ ] Receive delivery orders from partner app
- [ ] Dispatch to nearest available driver
- [ ] Real-time status updates to partner app
- [ ] Payment settlement between platforms

**Deliverable:** Functional delivery system integrated with local partner app.

---

### PHASE 8: Advanced Features (Days 60-65)
> Features that differentiate from competitors

**Task 8.1: Surge Pricing Engine**
- [ ] Real-time demand/supply ratio calculation
- [ ] Configurable surge zones (Phalaborwa CBD, airport, townships)
- [ ] Time-based surge (peak hours: 7-9am, 5-8pm)
- [ ] Event-based surge (local events, holidays)
- [ ] Maximum surge cap (admin configurable)
- [ ] Surge history for analytics

**Task 8.2: Scheduled Rides**
- [ ] Book ride for future time
- [ ] Recurring rides (daily commute, weekly)
- [ ] 30min before: system checks for drivers
- [ ] 15min before: dispatch to nearby drivers
- [ ] If no driver: notify rider, offer fare increase
- [ ] If 15min no driver: auto-cancel + R15 credit

**Task 8.3: Referral System**
- [ ] Unique referral code per user
- [ ] Referred user must complete first ride
- [ ] Both parties get R25 wallet credit
- [ ] Referral leaderboard
- [ ] Max 50 referrals/month (anti-abuse)

**Task 8.4: SOS/Emergency System**
- [ ] SOS button visible during active ride
- [ ] Records location, ride ID, user info
- [ ] Push notification to admin
- [ ] Email alert to emergency contacts
- [ ] SMS to tenant emergency number
- [ ] Admin dashboard shows SOS with map pin
- [ ] 10-second cancel window (false alarm)
- [ ] Escalation after 3+ SOS in 30min

**Task 8.5: In-App Chat**
- [ ] Rider↔Driver chat during active ride
- [ ] Messages via Socket.io (real-time)
- [ ] Message storage in database
- [ ] Auto-delete after 30 days
- [ ] Profanity filter
- [ ] SOS button in chat

**Deliverable:** Advanced features that make EasyRyde competitive with Uber/Bolt.

---

### PHASE 9: Testing & Quality (Days 65-72)
> Comprehensive test suite for bulletproof reliability

**Task 9.1: Unit Tests (85% coverage target)**
- [ ] FareCalculationService tests (all scenarios: base, surge, promo, edge cases)
- [ ] RideMatchingService tests (nearby drivers, radius, category filtering)
- [ ] PaymentService tests (PayFast, Ozwo, cash, wallet, refund)
- [ ] WalletService tests (deposit, spend, refund, insufficient balance)
- [ ] RatingService tests (create, average calculation, limits)
- [ ] PromoCodeService tests (validation, application, expiry, usage limits)
- [ ] DeliveryService tests (create, status updates, fare calculation)
- [ ] SurgePricingService tests (demand/supply, time windows, caps)
- [ ] Model tests (relationships, scopes, casts, accessors)

**Task 9.2: Integration Tests (70% coverage target)**
- [ ] All API endpoints (happy path + error path)
- [ ] Auth flow (register → login → access protected → logout)
- [ ] Ride lifecycle (request → accept → arrive → start → complete → rate)
- [ ] Payment flow (initiate → webhook → confirm → wallet credit)
- [ ] Admin flow (login → view dashboard → approve driver → update settings)
- [ ] Middleware tests (auth, rate limiting, tenant, role)

**Task 9.3: Socket.io Tests**
- [ ] Connection with valid/invalid JWT
- [ ] Event routing (correct rooms, correct broadcasts)
- [ ] Redis pub/sub bridge (Laravel event → Socket.io broadcast)
- [ ] Location update rate limiting
- [ ] Reconnection handling

**Task 9.4: E2E Tests**
- [ ] Detox: Rider books ride (full flow)
- [ ] Detox: Driver accepts ride (full flow)
- [ ] Detox: Payment flow (wallet top-up + ride payment)
- [ ] Playwright: Admin dashboard CRUD operations
- [ ] Playwright: Pricing settings update

**Task 9.5: Load Tests**
- [ ] K6: 100 concurrent ride requests
- [ ] K6: 10K concurrent WebSocket connections
- [ ] K6: Payment webhook processing under load
- [ ] Targets: p95 < 500ms API, p95 < 200ms WebSocket

**Task 9.6: Security Tests**
- [ ] SQL injection attempts
- [ ] XSS injection attempts
- [ ] CSRF validation
- [ ] Rate limit bypass attempts
- [ ] Unauthorized access attempts
- [ ] Webhook signature verification

**Deliverable:** 85%+ test coverage, all critical paths tested, load targets met.

---

### PHASE 10: Production Hardening (Days 72-80)
> Security, monitoring, deployment, disaster recovery

**Task 10.1: Security Hardening**
- [ ] Rate limiting (tiered per endpoint group)
- [ ] CORS configuration (strict origin allowlist)
- [ ] Security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options)
- [ ] Webhook IP allowlisting (PayFast, Ozwo)
- [ ] Input sanitization (XSS prevention)
- [ ] Password hashing (bcrypt, cost 12)
- [ ] JWT token rotation
- [ ] Account lockout after failed attempts
- [ ] API key management for third-party integrations

**Task 10.2: Monitoring & Observability**
- [ ] Sentry error tracking (critical alerts)
- [ ] Structured logging with trace_id/span_id
- [ ] Health check endpoints (liveness + readiness)
- [ ] Uptime monitoring
- [ ] Performance monitoring (response times, error rates)
- [ ] Business metrics (rides/hour, revenue, driver utilization)

**Task 10.3: Scheduled Tasks**
- [ ] ExpireStaleRideRequests (every 1min)
- [ ] ProcessPendingDriverPayouts (every 1min)
- [ ] UpdateSurgePricing (every 5min)
- [ ] CleanupExpiredDriverLocations (every 5min)
- [ ] GenerateHourlyAnalytics (hourly)
- [ ] GenerateDailyReports (daily at 00:30)
- [ ] ExpirePromoCodes (daily at 01:00)
- [ ] ProcessDriverSettlements (daily at 03:00)
- [ ] CheckDocumentExpirations (hourly)
- [ ] RetryFailedWebhooks (hourly)

**Task 10.4: Database Backup & Recovery**
- [ ] Daily backups (pg_dump, compressed)
- [ ] Weekly backups (retained for 30 days)
- [ ] Monthly backups (retained for 1 year)
- [ ] WAL archiving for point-in-time recovery
- [ ] Offsite backup to S3
- [ ] Backup verification (weekly restore test)

**Task 10.5: Deployment**
- [ ] Docker Compose production config
- [ ] Nginx reverse proxy with SSL
- [ ] Laravel Horizon for queue processing
- [ ] Redis for cache + queue + Socket.io adapter
- [ ] Database connection pooling
- [ ] Zero-downtime deployments
- [ ] Rollback procedure

**Deliverable:** Production-ready deployment with monitoring, backups, and security.

---

### PHASE 11: Compliance & Legal (Days 80-85)
> South African regulatory compliance

**Task 11.1: POPIA Compliance**
- [ ] Consent management (record, withdraw, version tracking)
- [ ] Data export (all user data in JSON)
- [ ] Right to erasure (anonymize, not delete — financial records)
- [ ] Data retention policies (configurable per entity)
- [ ] Privacy policy versioning

**Task 11.2: FICA/KYC**
- [ ] Driver identity verification (ID document, license)
- [ ] Document upload + storage (S3)
- [ ] Admin review/approve/reject workflow
- [ ] Document expiry tracking + renewal reminders
- [ ] Insurance policy tracking

**Task 11.3: Incident Reporting**
- [ ] Accident/dispute reporting
- [ ] Insurance claim tracking
- [ ] Police case number recording
- [ ] Severity classification
- [ ] Resolution workflow

**Deliverable:** Legally compliant system for South African market.

---

## FILE STRUCTURE

```
G:\EasyRyde\
├── backend/
│   ├── app/
│   │   ├── Console/
│   │   │   └── Kernel.php              # Scheduled tasks
│   │   ├── Events/                      # ✅ EXISTS (7 events)
│   │   ├── Exceptions/
│   │   │   └── Handler.php              # Global exception handler
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── Api/V1/
│   │   │   │       ├── AuthController.php
│   │   │   │       ├── RideController.php
│   │   │   │       ├── DriverController.php
│   │   │   │       ├── PaymentController.php
│   │   │   │       ├── WalletController.php
│   │   │   │       ├── RatingController.php
│   │   │   │       ├── PromoCodeController.php
│   │   │   │       ├── DeliveryController.php
│   │   │   │       ├── AdminController.php
│   │   │   │       ├── ReportingController.php
│   │   │   │       └── ConfigController.php
│   │   │   ├── Middleware/
│   │   │   │   ├── VerifyWebhookOrigin.php
│   │   │   │   └── TenantMiddleware.php  # ✅ EXISTS
│   │   │   ├── Requests/                # Form request validation
│   │   │   └── Resources/               # API response transformers
│   │   ├── Jobs/                         # ✅ EXISTS (3 jobs)
│   │   ├── Models/                       # ✅ EXISTS (14 models)
│   │   ├── Notifications/               # ✅ EXISTS (5 notifications)
│   │   ├── Observers/                   # Model observers
│   │   ├── Policies/                    # Authorization policies
│   │   ├── Services/                     # ✅ EXISTS (8 services)
│   │   └── Enums/                        # Status enums
│   ├── config/
│   │   ├── cors.php                     # CORS configuration
│   │   ├── permission.php               # Spatie permissions
│   │   └── services.php                 # External service config
│   ├── database/
│   │   ├── migrations/                  # ✅ EXISTS (13 migrations)
│   │   ├── seeders/                     # ✅ EXISTS
│   │   └── factories/                   # ✅ EXISTS
│   ├── routes/
│   │   ├── api.php                      # ✅ EXISTS (routes defined)
│   │   ├── web.php
│   │   ├── channels.php
│   │   └── console.php
│   ├── storage/
│   └── tests/
│       ├── Feature/
│       │   ├── AuthTest.php             # ✅ EXISTS (7 tests)
│       │   ├── RideLifecycleTest.php
│       │   ├── PaymentTest.php
│       │   ├── DriverTest.php
│       │   ├── WalletTest.php
│       │   ├── AdminTest.php
│       │   ├── DeliveryTest.php
│       │   └── HealthTest.php           # ✅ EXISTS (1 test)
│       └── Unit/
│           ├── FareCalculationTest.php
│           ├── RideMatchingTest.php
│           ├── WalletServiceTest.php
│           └── ExampleTest.php          # ✅ EXISTS
│
├── socket-server/                        # ✅ EXISTS (basic Socket.io)
│   ├── src/
│   │   ├── index.js
│   │   ├── handlers/
│   │   │   ├── rideHandler.js
│   │   │   ├── driverHandler.js
│   │   │   ├── chatHandler.js
│   │   │   └── adminHandler.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   └── services/
│   │       ├── redisService.js
│   │       └── geoService.js
│   ├── package.json
│   └── Dockerfile
│
├── mobile/                               # React Native (Expo)
│   ├── apps/
│   │   ├── rider/                        # Rider app
│   │   ├── driver/                       # Driver app
│   │   └── admin/                        # Admin mobile app
│   ├── packages/
│   │   ├── api-client/                   # Shared API client
│   │   ├── ui-kit/                       # Shared UI components
│   │   ├── maps/                         # Shared map utilities
│   │   ├── auth/                         # Shared auth logic
│   │   └── i18n/                         # Multi-language support
│   └── package.json
│
├── web/                                  # React Admin Dashboard
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── hooks/
│   └── package.json
│
├── docker-compose.prod.yml              # ✅ EXISTS
├── .docker/                              # ✅ EXISTS
├── plan/                                 # ✅ EXISTS (13 docs)
└── MASTER_PROJECT_PLAN.md               # This file
```

---

## TIMELINE SUMMARY

| Phase | Duration | Key Deliverable |
|-------|----------|----------------|
| P0: Foundation Fix | 3 days | Clean CI, complete models |
| P1: API Layer | 11 days | 80+ REST endpoints |
| P2: Real-Time Server | 4 days | Socket.io with 10K connections |
| P3: React Native Apps | 20 days | 3 mobile apps (rider, driver, admin) |
| P4: Payment Integration | 7 days | PayFast, Ozwo, cash, wallet |
| P5: Admin Dashboard | 7 days | Web admin panel |
| P6: Notifications | 3 days | Push, email, SMS |
| P7: Delivery Integration | 5 days | Phalaborwa in my hand |
| P8: Advanced Features | 5 days | Surge, scheduled rides, referral, SOS, chat |
| P9: Testing & Quality | 7 days | 85% test coverage, load tests |
| P10: Production Hardening | 8 days | Security, monitoring, deployment |
| P11: Compliance & Legal | 5 days | POPIA, FICA/KYC |
| **TOTAL** | **~85 days (17 weeks)** | **Enterprise production-ready platform** |

---

## PRIORITY ORDER (What to build first)

### CRITICAL PATH (Cannot launch without)
1. **API Controllers** — Everything depends on this
2. **React Native Rider App** — Core user experience
3. **React Native Driver App** — Core service provider experience
4. **Payment Integration** — Cannot run without payments
5. **Real-Time Server** — GPS tracking is essential
6. **Push Notifications** — Users/drivers must be notified
7. **Admin Dashboard** — Central admin model requires it
8. **Basic Security** — Rate limiting, auth, validation
9. **Basic Testing** — At least happy-path integration tests
10. **Docker Deployment** — Must be deployable

### HIGH PRIORITY (Should have at launch)
11. Surge pricing
12. Cash payment reconciliation
13. Driver approval workflow
14. Rating system
15. Promo codes
16. Health checks
17. Structured logging
18. Backup strategy

### MEDIUM PRIORITY (Can launch without, add in v1.1)
19. Scheduled rides
20. Referral system
21. In-app chat
22. Delivery integration
23. Multi-language
24. SOS/emergency
25. Offline mode

### LOW PRIORITY (Future versions)
26. POPIA compliance (can be manual initially)
27. FICA/KYC (can be manual initially)
28. Advanced analytics
29. Load testing
30. API documentation

---

## ARCHITECTURAL DECISIONS

1. **Laravel for API** — Best fit for SA payment gateways, admin dashboard, queue system
2. **Node.js for WebSocket** — Sub-200ms real-time for GPS tracking
3. **React Native (Expo)** — Single codebase for iOS + Android, OTA updates
4. **PostgreSQL + PostGIS** — Geospatial queries for driver matching
5. **Redis for everything** — Cache, queue, Socket.io adapter, geo-index
6. **Sanctum for auth** — SPA + mobile token auth
7. **Spatie Permissions** — Role-based access (admin, driver, rider)
8. **Service layer pattern** — Same as ASP.NET, easy migration of business logic
9. **UUID primary keys** — Better for distributed systems, no sequential leaks
10. **Multi-tenant ready** — Tenant model exists, can expand beyond Phalaborwa

---

## RISK REGISTER

| Risk | Impact | Mitigation |
|------|--------|------------|
| Google Maps API costs | High | Cache aggressively, fallback to haversine |
| PayFast/Ozow downtime | High | Circuit breaker, force wallet payments |
| Database corruption | Critical | Daily backups, WAL archiving, PITR |
| WebSocket server crash | High | Redis adapter, auto-reconnect, polling fallback |
| App Store rejection | Medium | Follow Apple/Google guidelines strictly |
| Driver shortage at launch | High | Pre-recruit 50+ drivers, offer launch bonuses |
| Low initial adoption | Medium | Referral bonuses, marketing campaign |
| Security breach | Critical | Penetration testing, bug bounty, SOC 2 |
| POPIA non-compliance | High | Legal review, implement before launch |
| Scope creep | High | Strict MVP definition, phased delivery |

---

## SUCCESS METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| API response time (p95) | < 500ms | APM monitoring |
| WebSocket latency (p95) | < 200ms | Socket.io metrics |
| Uptime | 99.9% | Uptime monitor |
| Test coverage | > 85% | PHPUnit + Pest |
| Crash rate (mobile) | < 0.1% | Sentry/Crashlytics |
| Ride request → acceptance | < 60s | Business metrics |
| Payment success rate | > 99% | Payment gateway logs |
| Driver satisfaction | > 4.5/5 | In-app rating |
| Rider satisfaction | > 4.5/5 | In-app rating |

---

*This document is the single source of truth for EasyRyde development. Update it as decisions change and features ship.*
