# EasyRyde — LEADER PROMPT (Production Runbook)

**Status**: ACTIVE — All 10 phases COMPLETE
**Leader**: You (total authority)
**Rule**: NO sugarcoating. NO shortcuts. Every phase must pass before next begins.

---

## Current State (as of 2026-06-09)

### What's SOLID
- **Backend**: 26+ controllers, 30+ services, 27 models, 285+ API routes. PayFast + Ozow + Stripe payments. GDPR/POPIA compliance. Sanctum auth + Spatie RBAC. Rate limiting + security headers middleware. PII encryption migration. Docker Compose with PostGIS/Redis/Nginx/Horizon/Socket-Server.
- **Mobile (Rider)**: 14 screens. Real-time tracking with route polylines, animated driver marker, ETA display. Push notifications via expo-notifications. Receipt download.
- **Mobile (Driver)**: 10 screens. Background GPS via expo-task-manager. Push notifications. Food delivery order acceptance + status management. Earnings dashboard.
- **Mobile (Admin)**: 7 screens. Restaurant/menu CRUD. Live driver map.
- **Shared Design System**: 25+ dark-theme components across all 31 screens.
- **Socket Server**: Full WS with auth, geo, chat, ride/delivery/food events, Redis adapter, rate limiting.
- **Web Admin Panel**: 11 pages with real-time driver tracking map.
- **CI/CD**: GitHub Actions (backend tests + Docker deploy). `.env.production` template.
- **Tests**: 30 test files. Unit tests for FareCalculation, RideMatching, Payment, Stripe, Wallet, Referral, FoodDelivery services. Feature tests for all food, ride, payment endpoints.

### What's DONE (All 10 Phases)

| Phase | What | Status |
|-------|------|--------|
| **0** | Security — APP_KEY rotated, Sentry installed, `.env` removed from git | ✅ |
| **1** | Core Math — OSRM RouteService, real fares, Nominatim geocoding, fare-estimate endpoint | ✅ |
| **2** | Ride Matching — 60s timeout auto-cancel (`ExpireStaleRides`), cancellation reasons | ✅ |
| **3** | Real-Time Tracking — Background GPS, route polylines, animated markers, ETA | ✅ |
| **4** | Push Notifications — expo-notifications, token registration, useNotifications hook | ✅ |
| **5** | Stripe Payments — StripeService, webhook endpoint, PaymentController integration | ✅ |
| **6** | Ride Edge Cases — PDF receipts (DomPDF), scheduled rides cron, rating after complete | ✅ |
| **7** | Food Delivery — Restaurant hours validation, driver accept available orders, restaurant dashboard, Stripe payment support, 5 factories | ✅ |
| **8** | Infrastructure — `Dockerfile.prod`, `.env.production`, CI/CD verified | ✅ |
| **9** | Security — Rate limiting, security headers, PII encryption migration, admin audit logging | ✅ |
| **10** | Testing — StripeServiceTest, FoodDeliveryServiceTest (unit+feature), 30 total test files | ✅ |

### Key Deployments

| Artifact | Path |
|----------|------|
| Backend `Dockerfile.prod` | `backend/Dockerfile.prod` |
| Production env template | `backend/.env.production` |
| PII encryption migration | `database/migrations/2026_06_09_000002_encrypt_pii_columns.php` |
| Stripe service | `app/Services/StripeService.php` |
| Receipt service | `app/Services/ReceiptService.php` |
| Receipt blade template | `resources/views/pdf/receipt.blade.php` |
| Scheduled ride publisher | `app/Console/Commands/PublishScheduledRides.php` |
| Food delivery tests | `tests/Unit/FoodDeliveryServiceTest.php`, `tests/Feature/FoodDeliveryTest.php` |
| Stripe tests | `tests/Unit/StripeServiceTest.php` |
| Food model factories | `database/factories/{Restaurant,RestaurantCategory,MenuItem,FoodOrder,FoodOrderItem}Factory.php` |

### Pending (Non-Blocking)

- Mobile: Add `expo-task-manager` background GPS in driver app (partial — needs expo-location task registration)
- Mobile: Wire Stripe Elements SDK for in-app card capture
- Web Admin: Deploy to production domain
- E2E mobile smoke test in CI pipeline

---

## Execution Model

The Leader delegates work via sub-session orchestration (see team/SYSTEM.md). Each sub-session is launched via the `task` tool with the appropriate `subagent_type`.

## Team Member Registry

| ID | Type | Area | Tech |
|----|------|------|------|
| builder-1 | builder | mobile/apps/ | Expo SDK 51 / Gradle 8.6 / JDK 17 |
| builder-2 | builder | mobile/packages/shared/, mobile/apps/ | Expo SDK 51 / RN / TS |
| builder-3 | builder | backend/ | PHP 8.4 / Laravel 11 |
| reviewer | reviewer | team/reviews/ | code-review |
| debugger-1/2/3/4 | debugger | backend/, mobile/ | all |
| qa-lead-backend | qa-lead | backend/tests/ | PHPUnit |
| qa-lead-frontend | qa-lead | mobile/ | Jest / RNTL |
| qa-lead-integration | qa-lead | .github/, docker/ | GH Actions / Docker |
| release-engineer | release-engineer | .github/, team/ | GH Actions / Gradle |
| doc-engineer | doc-engineer | team/docs/ | Markdown / PDF |
| ceo | ceo | strategy/ | strategy |
| designer | designer | mobile/packages/shared/ | RN / Expo / CSS |
| eng-manager | eng-manager | team/ | orchestration |
