# EasyRyde: Super MVP Transformation Prompt

You are building a production-ready ride-hailing + food delivery platform. This is NOT a prototype. Real people will use this every day. You have a Laravel backend (PHP) and a React Native (Expo) mobile app with rider/driver/admin apps, plus a React web admin panel.

Below is the complete transformation spec. Implement EVERY item. No shortcuts.

---

## 1. GEOCODING & PLACES (Replace Hardcoded Data)

**Current:** `PlaceController.php` has 10 hardcoded towns. `BookRideScreen.tsx` calls `/v1/places/search`.

**Must do:**
- Integrate a real geocoding provider. Use OpenStreetMap's Nominatim (free, no API key) as default. Add config to swap in Google Maps/Mapbox later.
- Replace `PlaceController.php`:
  - On `GET /v1/places/search?q=...` → proxy to Nominatim API (`https://nominatim.openstreetmap.org/search?q=...&format=json&limit=8`)
  - Set a polite User-Agent header (`EasyRyde/1.0`). Cache results in Redis for 1 hour.
  - Return `[{ id, name, lat, lng, address }]`
- Add reverse geocoding endpoint: `GET /v1/places/reverse?lat=...&lng=...` → return address string via Nominatim reverse.
- Remove the hardcoded `PLACES` constant.

---

## 2. FARE CALCULATION (Real Road Distance)

**Current:** `FareCalculationService.php` uses Haversine (straight-line) distance and `distanceKm * 3` for duration.

**Must do:**
- Integrate Open Source Routing Machine (OSRM) for real road distance and time:
  - Self-host OSRM or use a free OSRM instance (`https://router.project-osrm.org/route/v1/driving/`)
  - Create `RouteService.php` that calls OSRM and returns `{ distance_km, duration_minutes, polyline }`
- Refactor `FareCalculationService::calculate()`:
  - Call `RouteService` to get real driving distance and time
  - Fall back to Haversine only if OSRM is unreachable (with logging)
- Store `route_polyline` (encoded polyline) and `distance_km` on the `rides` table
- Render route polylines on the map using `Polyline` component (Mobile: `react-native-maps` `Polyline`, Web: Leaflet polyline)
- Fare rates are already in `SystemSetting` table — good. Keep those. Just use real distance/duration.
- Duration formula `distanceKm * 3` is a placeholder — remove it entirely. Use OSRM result.
- Add `GET /v1/rides/fare-estimate?pickup_lat=...&pickup_lng=...&dropoff_lat=...&dropoff_lng=...&category=...` public endpoint for pre-booking fare display.

---

## 3. RIDE MATCHING (Real-Time, Fair)

**Current:** `RideMatchingService.php` has basic proximity search. No queue, no broadcast, no expiration.

**Must do:**
- Implement ride request broadcast via WebSockets:
  - When ride is created in `searching` status, publish event to a Redis pub/sub channel
  - A Node.js WebSocket server (in `/socket-server/`) listens to Redis and pushes to relevant drivers
  - Drivers in range receive in-app notification + optional push via FCM
- Add ride request timeout (60 seconds). If no driver accepts, auto-cancel with `no_driver` status.
- Driver sees a countdown timer on `RideRequestsScreen.tsx`. Accept/reject buttons.
- First driver to accept wins (atomic DB update with status check).
- Implement simple surge pricing based on driver/rider ratio (already exists in `calculateSurge` — wire it up when creating a ride).

---

## 4. REAL-TIME DRIVER TRACKING

**Current:** Driver location via WebSocket works but no background tracking.

**Must do:**
- **Mobile (Driver app):** Use `expo-location` `startLocationUpdatesAsync` with `ActivityType.AutomotiveNavigation` for background GPS. Send location to backend every 5 seconds via API `POST /v1/driver/location`.
- **Backend:** `DriverController@updateLocation` — validate, store to `users.current_latitude/current_longitude`, broadcast via Redis pub/sub to the rider's WebSocket room.
- **Mobile (Rider app):** Receive `driver:location` events. Update driver marker with smooth animation (`animateToRegion` or `Animated` marker).
- Show ETA on rider screen (from OSRM or simple Haversine-based estimation if route data unavailable).
- **Web (admin):** Show all active drivers on live map with real-time markers.

---

## 5. PAYMENTS (Real Money)

**Current:** `payment_method: 'cash'` hardcoded. `PaymentService` exists but is stubbed.

**Must do:**
- Integrate a payment gateway. **Start with Stripe** (easiest for MVP, works globally).
- Add `stripe_secret_key` and `stripe_webhook_secret` to `.env`.
- Rider adds payment method (card) via Stripe Elements or Stripe Checkout.
- On ride complete:
  - Charge the rider's saved payment method via Stripe API
  - Handle platform fee split (rider pays, driver receives minus commission)
  - Store in `payments` table with `stripe_payment_intent_id`
- Add Stripe webhook endpoint `POST /v1/webhooks/stripe` for async payment confirmation/refund.
- Wallet system (migrations already exist for `wallets` and `wallet_transactions`). Wire up:
  - Driver earnings go to wallet
  - Driver can request payout (manual or auto via Stripe Connect)
- Support **cash** as fallback (no Stripe charge, driver collects).

---

## 6. PUSH NOTIFICATIONS (FCM)

**Current:** `PushNotificationService.php` has FCM code. Frontend has no push token registration.

**Must do:**
- On both rider and driver app launch, request notification permission and get Expo push token.
- Send token to `POST /v1/user/push-token` on login.
- Backend sends FCM push for:
  - Rider: driver accepted, driver arrived, ride started, ride completed
  - Driver: new ride request, ride cancelled
- Create a Laravel command `notifications:send-pending` that processes a `notifications` queue table.

---

## 7. RIDE MANAGEMENT (Edge Cases)

**Current:** Missing: scheduled rides, ride history pagination, receipts, cancellation reasons.

**Must do:**
- Add `scheduled_at` column to `rides` table. Allow booking rides for later. Create a scheduler command that publishes scheduled rides to matching queue 10 minutes before pickup.
- Add `cancellation_reason` column (enum: `driver_not_responding`, `long_wait`, `changed_mind`, `accidental_request`, `other`). Capture on cancel.
- Add `RideHistoryScreen.tsx` with paginated API (`GET /v1/rides/history?page=...`).
- Generate PDF receipts for completed rides (use a simple HTML-to-PDF library like DomPDF or TCPDF).
- Rating system already exists in migrations (`ratings` table). Wire up: after ride completes, show rating modal to rider. Driver sees their average rating on profile.

---

## 8. FOOD DELIVERY (Make It Real)

**Current:** Food screens exist (`RestaurantListScreen`, `FoodCheckoutScreen`, etc.) but backend food ordering is skeletal.

**Must do:**
- Implement `RestaurantController` with CRUD + menu items + categories + availability hours.
- Implement `FoodOrderController`: create order, assign delivery driver (same matching logic), track status (`pending → preparing → ready → picked_up → in_transit → delivered`).
- Implement `FoodDeliveryScreen.tsx` for driver: see active deliveries, mark status transitions.
- Implement real restaurant management in the admin web panel.

---

## 9. INFRASTRUCTURE & DEPLOYMENT

**Current:** No Dockerfile for backend, no CI/CD, no monitoring.

**Must do:**
- Create `Dockerfile` and `docker-compose.yml` with:
  - Laravel app (PHP-FPM + Nginx)
  - PostgreSQL
  - Redis
  - Node.js WebSocket server
- Create a proper `.env.production` template.
- Add GitHub Actions workflow: `test.yml` (PHPUnit + ESLint), `deploy.yml` (SSH deploy or Docker push).
- Add Sentry error tracking (backend: `sentry/sentry-laravel`, mobile: `@sentry/react-native`).
- Add basic health check endpoint `GET /v1/health` returning DB + Redis + OSRM status.

---

## 10. SECURITY & COMPLIANCE

**Current:** Basic Laravel auth via Sanctum. No rate limiting, no GDPR/privacy controls.

**Must do:**
- Add rate limiting on `api.php` routes (throttle: 60/120 per minute).
- Add request validation on ALL endpoints (use FormRequest classes, not inline).
- Implement GDPR data export/deletion endpoints (`GET /v1/user/export`, `DELETE /v1/user/anonymize`).
- Add admin audit logging middleware (migration already exists for `admin_audit_logs`).
- Encrypt PII columns (phone_number, email) at rest using Laravel's encryption.
- Role-based middleware: check `role` before allowing driver/rider/admin actions.

---

## 11. FRONTEND POLISH

**Current:** Skeleton screens exist. Map shows markers but no route, no live driver movement animation, no error recovery.

**Must do:**
- Add route polyline rendering on both Rider and Driver tracking screens.
- Add animated driver marker (smooth interpolation between location updates).
- Add comprehensive loading/error/empty states to every screen.
- Add pull-to-refresh on ride history, earnings, and restaurant lists.
- Add proper form validation feedback on login/register screens.
- Handle offline mode: detect network loss, show offline banner, queue actions.

---

## 12. TESTING

**Current:** Only `e2e-mobile-smoke.js` exists.

**Must do:**
- Backend: PHPUnit tests for all services (`FareCalculationServiceTest`, `RideMatchingServiceTest`, `PaymentServiceTest`). Minimum 80% coverage on services.
- Backend: Feature tests for all API endpoints (at least happy path + error path).
- Mobile: Add Jest/React Native Testing Library tests for critical screens.
- Add the existing `e2e-mobile-smoke.js` to CI pipeline.

---

## Implementation Order

| Phase | What | Why |
|-------|------|-----|
| **1** | Geocoding (Nominatim), Route service (OSRM), Real fares | Core math must be correct first |
| **2** | WebSocket ride matching + timeout | Without this, no rides happen |
| **3** | Background driver tracking + ETA | Core UX requirement |
| **4** | Stripe payments | Must handle money |
| **5** | Push notifications | Without this, drivers miss rides |
| **6** | All edge cases (history, cancellation, scheduling) | Production readiness |
| **7** | Food delivery full backend | Secondary feature |
| **8** | Docker + CI/CD + monitoring | Deployability |
| **9** | Security + compliance | Legal requirement |
| **10** | Frontend polish + testing | Quality |

Do not move to the next phase until the current one is fully working with real data and tested.
