# EasyRyde Production Plan — Master Document

**Date:** 2026-06-26
**Compiled by:** 10-agent swarm (CEO, eng-manager, doc-engineer, designer, debugger, explore, qa-lead, builder, release-engineer, general)
**Status:** Ready for execution

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Strategy](#2-product-vision--strategy)
3. [Current State Assessment](#3-current-state-assessment)
4. [Critical Bugs & Security Holes](#4-critical-bugs--security-holes)
5. [Architecture & Technical Plan](#5-architecture--technical-plan)
6. [Design System](#6-design-system)
7. [Implementation Roadmap](#7-implementation-roadmap)
8. [Testing Strategy](#8-testing-strategy)
9. [Deployment & Launch](#9-deployment--launch)
10. [Cost Analysis](#10-cost-analysis)
11. [Documentation Gap Analysis](#11-documentation-gap-analysis)
12. [Appendices](#12-appendices)

---

## 1. Executive Summary

### What We're Building
A ride-hailing platform for Phalaborwa, South Africa — rider app, driver app, admin web dashboard, Laravel API backend, and Node.js/Redis socket server.

### Target Market
- **Location:** Phalaborwa, Limpopo, South Africa
- **Users:** 87% Black population, 52% female, median income R24,700/year
- **Infrastructure:** R25-50/GB data, minibus taxis dominate, cash-heavy economy
- **Smartphones:** 76% use Android, 33% entry-level, 32% mid-range

### The Verdict
**Overall score: 72% complete.** The backend is the strongest component (85%). The rider app is the weakest (30%). Critical bugs exist that would lose money or compromise safety.

### What Ships in MVP (Phase 1)
- Core ride-hailing (rider → driver matching → ride → payment → rating)
- Cash payment support
- Wallet system
- Admin dashboard for operations
- Live driver tracking via Socket.IO

### What Does NOT Ship
- Food delivery (Phase 2)
- Scheduled rides (Phase 2)
- Referral system (Phase 2)
- In-app chat (Phase 2)
- SOS system (Phase 2)
- Multi-tenant support (Phase 2)

---

## 2. Product Vision & Strategy

### CEO Strategic Analysis

#### Market Fit
Phalaborwa's ride-hailing market is **ripe**. The existing competition is weak — minibus taxis are disorganized, Bolt/Uber don't cover the town well. EasyRyde's head start on the ground is a massive advantage if they execute fast.

#### Business Model Viability
| Metric | Value | Status |
|--------|-------|--------|
| Base fare | R30 | Valid for Phalaborwa |
| Per km | R10 | Competitive |
| Per minute | R2 | Standard |
| Platform fee | 15% | Industry standard |
| Cash payment | Yes | Critical for market |
| Wallet system | Yes | Enables future features |

#### Go-to-Market Strategy
1. **Pre-launch (2 weeks):** Recruit 50 drivers, train them, 100-rider beta
2. **Launch week:** R50k marketing spend (local radio, social media, taxi ranks)
3. **Month 1:** 200 riders, 50 drivers, R15k/week revenue
4. **Month 3:** 1,000 riders, 100 drivers, R60k/week revenue
5. **Month 6:** 5,000 riders, 200 drivers, R300k/week revenue

#### Key Success Metrics
- Driver acceptance rate > 80%
- Average wait time < 5 minutes
- Payment success rate > 99%
- Rider retention (30-day) > 60%
- Driver retention (30-day) > 70%

---

## 3. Current State Assessment

### Overall Scorecard

| Component | Score | Status |
|-----------|-------|--------|
| **Backend API** | 85% | Production-ready core, needs auth hardening |
| **Rider App** | 30% | Broken navigation, orphaned screens |
| **Driver App** | 75% | Functional, inline location tracking |
| **Admin Dashboard** | 50% | Missing 9 of 16 screens |
| **Socket Server** | 70% | Redis geospatial working, ride:complete not persisted |
| **Testing** | 60% | 63 test files, critical gaps in payment/ride flows |
| **Documentation** | 35% | Missing API docs, deployment guide |
| **Infrastructure** | 0% | Not yet deployed |

### What's Good
- Backend is well-architected (32 models, 28 controllers, 35 services)
- Socket server has elegant Redis GEO driver matching with Lua atomic scripts
- Shared package has 37 components ready to use
- 63 test files exist (need gap analysis)
- Payment providers integrated (PayFast, Ozow, Stripe)
- POPIA compliance infrastructure in place

### What's Bad
- Rider app `App.tsx` imports wrong screens (src/ instead of screens/)
- 14 production-ready screens exist but are orphaned
- `show()` endpoint has no ownership check — any user can view any ride
- Driver endpoints lack `role:driver` middleware
- Social auth creates users without `tenant_id`
- Stripe intent accepts arbitrary amounts (no server-side validation)
- Dual payment services registered (root-level AND Payment/ namespace)
- 23 backend routes have no mobile caller
- Socket server `ride:complete` handler never writes to database
- No ErrorBoundary wrapper
- No registration flow wired in AuthStack

---

## 4. Critical Bugs & Security Holes

### BUG-001: Rider App Shows Empty Screen
- **File:** `mobile/apps/rider/App.tsx:11-14`
- **Issue:** Imports from `./src/screens/` (4 basic screens) instead of `./screens/` (14 production-ready screens)
- **Impact:** App shows empty screen, users can't do anything
- **Fix:** Change imports to use `./screens/` directory

### BUG-002: Double-Debit Bug (Wallet Payment)
- **File:** `backend/app/Services/EscrowService.php:24-46`
- **Issue:** `holdPayment()` calls `processPayment()` (which debits wallet at line 37-43), then `holdPayment()` debits wallet AGAIN at lines 31-37
- **Impact:** Riders charged 2x for every wallet payment
- **Fix:** Remove the second debit from `holdPayment()`, or restructure so `processPayment()` doesn't debit and leave it to `holdPayment()`

### BUG-003: Ride Completion Not Persisted to Database
- **File:** `socket-server/src/handlers/ride.js:158-182`
- **Issue:** `ride:complete` handler only emits events to other users and admin, never calls any API or writes to database
- **Impact:** Rides stuck in `in_progress` forever, drivers never get paid, riders never charged
- **Fix:** Handler must call `POST /api/v1/rides/{rideId}/complete` or write directly to DB

### BUG-004: Socket `ride:cancel` Doesn't Update Database
- **File:** `socket-server/src/handlers/ride.js:184-211`
- **Issue:** Same as BUG-003 — only emits events, never updates ride status in DB
- **Impact:** Cancelled rides still show as active in database

### BUG-005: No Registration Flow
- **File:** `mobile/apps/rider/App.tsx:20-31`
- **Issue:** `AuthStack` only has `Login` screen, `RegisterScreen` exists at `screens/RegisterScreen.tsx` but is not wired
- **Impact:** New users can't sign up

### BUG-006: No ErrorBoundary
- **Impact:** Any render crash kills the entire app with no recovery

### BUG-007: Ride ID Type Mismatch (Driver)
- **File:** `mobile/apps/driver/screens/DashboardScreen.tsx:613`
- **Issue:** `rideId` compared as string but passed as number to `navigation.navigate('ActiveRide', { rideId: ride.id, riderId: ride.rider_id })`
- **Impact:** ActiveRide screen may not receive correct ride data

### BUG-008: Race Condition in Driver Acceptance
- **File:** `socket-server/src/handlers/ride.js:64-113`
- **Issue:** Lua script acquires Redis lock, then tries to delete `ride:pending:${rideId}` — if DB write fails, Redis is cleared but no ride exists
- **Impact:** Ride disappears from system

### SECURITY-001: Ride Controller `show()` Has No Ownership Check
- **File:** `backend/app/Http/Controllers/Api/V1/RideController.php:87-100`
- **Issue:** Any authenticated user can view any ride by ID
- **Impact:** Data breach — riders can see other riders' rides, drivers can see all rides
- **Fix:** Add ownership check like `cancel()` has

### SECURITY-002: Driver Endpoints Lack Role Middleware
- **File:** `backend/routes/api.php:97-107`
- **Issue:** Driver routes (nearby-rides, profile, vehicle, toggle-online, earnings, trips) have no `role:driver` middleware
- **Impact:** Any authenticated user (including riders) can access driver endpoints
- **Fix:** Add `->middleware('role:driver')` to driver route group

### SECURITY-003: Social Auth Creates Users Without tenant_id
- **File:** `backend/app/Http/Controllers/Api/V1/Auth/SocialAuthController.php`
- **Issue:** Social login creates users with null tenant_id
- **Impact:** Multi-tenant queries break, user appears in no tenant

### SECURITY-004: Stripe Intent Accepts Arbitrary Amounts
- **File:** `backend/app/Http/Controllers/Api/V1/PaymentController.php:349-359`
- **Issue:** `amount` taken directly from request, no server-side calculation
- **Impact:** Users can pay R1 for a R500 ride

### SECURITY-005: No Rate Limiting on Ride Creation
- **File:** `backend/routes/api.php:82`
- **Issue:** `POST /rides` has no throttle middleware
- **Impact:** Ride spam attacks possible

### SECURITY-006: Dual Payment Services
- **File:** `backend/app/Providers/PaymentServiceProvider.php`
- **Issue:** Both root-level `PaymentService` AND `Payment\PaymentService` registered
- **Impact:** Confusion about which to use, potential double-charging

---

## 5. Architecture & Technical Plan

### Backend Architecture (Laravel 11)

#### Database Schema (32 models confirmed)
- **Core:** User, Ride, Payment, DriverProfile, Vehicle, Wallet, WalletTransaction
- **Features:** PromoCode, Rating, Notification, ScheduledRide, Referral, Incident, SOS, Chat, Delivery, FoodDelivery
- **Compliance:** KycVerification, Consent, DataRetention, AuditLog, UserDevice, UserSession, LoginAttempt

#### Payment Flow (Current)
```
Rider requests ride
  → FareCalculationService calculates fare
  → Ride created (status: searching)
  → Socket server broadcasts to nearby drivers
  → Driver accepts (Lua atomic lock)
  → Driver arrives → starts ride → completes ride
  → completeRide() calls processRidePayment()
  → processRidePayment() calls processPayment()
  → processPayment() debits rider wallet AND creates Payment record
```

#### Payment Flow (Fixed)
```
Rider requests ride
  → FareCalculationService calculates fare
  → Ride created (status: searching)
  → Socket server broadcasts to nearby drivers
  → Driver accepts (Lua atomic lock)
  → holdPayment() called — holds funds in escrow (debit rider wallet ONCE)
  → Driver arrives → starts ride → completes ride
  → completeRide() calls releasePayment()
  → releasePayment() credits driver wallet
```

#### API Routes (320 lines confirmed)
- **Public:** health, config, auth (register/login/forgot-password), places/search, rides/fare-estimate, promo-codes/validate
- **Webhooks:** payfast, ozow, stripe, twilio, partner/order, partner/status
- **Authenticated:** 200+ endpoints across 15 resource groups
- **Admin:** dashboard, users, rides, drivers, settings, audit-logs, food, payouts, compliance

### Socket Server Architecture (Node.js + Redis)

#### Redis GEO Driver Matching
```javascript
// Lua atomic script for ride claiming
const CLAIM_RIDE_LUA = `
  if redis.call("SET", KEYS[1], ARGV[1], "NX", "EX", ARGV[2]) then
    return 1
  else
    return 0
  end
`;
```

#### Event Handlers
| Event | Status | Issue |
|-------|--------|-------|
| `rider:book-ride` | Working | Stores pending ride, broadcasts to drivers |
| `driver:accept-ride` | Working | Lua atomic lock, but ride:pending deleted before DB write |
| `driver:arrived` | Working | Emits events only |
| `ride:start` | Working | Emits events only |
| `ride:complete` | **BROKEN** | Never writes to DB |
| `ride:cancel` | **BROKEN** | Never writes to DB |
| `ride:send-location` | Working | Broadcasts location to ride room |

### Mobile Architecture (React Native 0.79)

#### Rider App
- **Current:** Imports 4 basic screens from `src/screens/`
- **Target:** Import 14 production screens from `screens/`
- **Navigation:** Types already defined in `shared/src/types/navigation.ts`

#### Driver App
- **Current:** 10 screens, mostly functional
- **Issue:** Inline location tracking in DashboardScreen (should use `useLocationTracking` hook)
- **Issue:** Ride ID type mismatch (string vs number)

#### Admin App
- **Current:** 7 screens (Login, Dashboard, UserList, UserDetail, DriverList, RideList, Settings)
- **Missing:** RideDetail, DriverDetail, FinancialDashboard, PromoCodeManager, NotificationManager, IncidentList, IncidentDetail, AuditLog, SystemSettings

### Shared Package
- **37 components** exported from `shared/src/index.ts`
- **Theme system** with dark mode support
- **Auth context** with token management
- **Socket context** for real-time updates
- **Location hook** (`useLocationTracking`)
- **Utility functions** for formatting, validation, API client

---

## 6. Design System

### Color Palette (Matching HTML Reference)
```typescript
const theme = {
  colors: {
    primary: '#FFAD7A',        // Orange — NOT Gold
    bg: '#1c1c1e',             // Dark background — NOT #0a0a0a
    surface: '#2c2c2e',        // Card backgrounds
    surfaceLight: '#3a3a3c',   // Elevated surfaces
    border: '#3a3a3c',         // Borders
    text: '#ffffff',           // Primary text
    textSecondary: '#8e8e93',  // Secondary text
    textMuted: '#636366',      // Muted text
    success: '#34c759',        // Green
    warning: '#ff9500',        // Orange
    error: '#ff3b30',          // Red
    info: '#007aff',           // Blue
  }
};
```

### Icons
- **Use:** Phosphor Icons (matching HTML reference)
- **Not:** Ionicons (current React Native default)
- **Package:** `react-native-phosphor-icons`

### Typography
- Font sizes: 12, 14, 16, 18, 20, 24, 32, 40, 48
- Font weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Line heights: 1.2 (tight), 1.4 (normal), 1.6 (relaxed)

### Spacing
- Base unit: 4px
- Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80

### Component Patterns
- Cards: `bg: surface`, `borderRadius: 16`, `padding: 16`
- Buttons: `bg: primary`, `borderRadius: 12`, `height: 52`
- Inputs: `bg: surface`, `borderRadius: 12`, `height: 52`, `border: border`
- Headers: `height: 56`, `paddingHorizontal: 16`

---

## 7. Implementation Roadmap

### Phase 0: Foundation (Week 1-2)
**Goal:** Fix critical bugs, secure the backend

| Task | Owner | Files | Priority |
|------|-------|-------|----------|
| Fix double-debit bug | @debugger | `EscrowService.php` | P0 |
| Fix ride:complete not persisted | @debugger | `socket-server/handlers/ride.js` | P0 |
| Add ErrorBoundary | @builder | `mobile/apps/rider/App.tsx` | P0 |
| Fix rider App.tsx imports | @builder | `mobile/apps/rider/App.tsx` | P0 |
| Add ownership check to show() | @builder | `RideController.php` | P0 |
| Add role:driver middleware | @builder | `routes/api.php` | P0 |
| Fix social auth tenant_id | @builder | `SocialAuthController.php` | P0 |
| Add Stripe amount validation | @builder | `PaymentController.php` | P0 |
| Remove dual payment service | @builder | `PaymentServiceProvider.php` | P1 |
| Add rate limiting to ride creation | @builder | `routes/api.php` | P1 |

### Phase 1: Rider App (Week 2-4)
**Goal:** Complete rider app with all 14 screens

| Task | Owner | Files | Priority |
|------|-------|-------|----------|
| Wire all screens in App.tsx | @builder | `mobile/apps/rider/App.tsx` | P0 |
| Register flow (OTP + details) | @builder | `screens/RegisterScreen.tsx` | P0 |
| Forgot password flow | @builder | `screens/ForgotPasswordScreen.tsx` | P0 |
| Home screen (map + search) | @builder | `screens/HomeScreen.tsx` | P0 |
| Book ride flow | @builder | `screens/BookRideScreen.tsx` | P0 |
| Ride tracking (live map) | @builder | `screens/RideTrackingScreen.tsx` | P0 |
| Payment screen (cash/wallet/card) | @builder | `screens/PaymentScreen.tsx` | P0 |
| Ride history | @builder | `screens/RideHistoryScreen.tsx` | P1 |
| Ride detail + receipt | @builder | `screens/RideDetailScreen.tsx` | P1 |
| Profile + settings | @builder | `screens/ProfileScreen.tsx` | P1 |
| Wallet screen | @builder | `screens/WalletScreen.tsx` | P1 |
| Where to? (destination search) | @builder | `screens/WhereToScreen.tsx` | P0 |
| Saved places | @builder | `screens/SavedPlacesScreen.tsx` | P2 |
| Notification preferences | @builder | `screens/NotificationPreferencesScreen.tsx` | P2 |

### Phase 2: Driver App (Week 3-5)
**Goal:** Polish driver app, fix inline location tracking

| Task | Owner | Files | Priority |
|------|-------|-------|----------|
| Fix ride ID type mismatch | @builder | `screens/DashboardScreen.tsx` | P0 |
| Extract useLocationTracking hook | @builder | `shared/hooks/useLocationTracking.ts` | P1 |
| Add ErrorBoundary | @builder | `mobile/apps/driver/App.tsx` | P0 |
| Polish ride request card | @designer | `screens/DashboardScreen.tsx` | P1 |
| Add earnings detail screen | @builder | `screens/EarningsScreen.tsx` | P1 |
| Add trip history detail | @builder | `screens/TripHistoryScreen.tsx` | P1 |

### Phase 3: Admin Dashboard (Week 4-6)
**Goal:** Complete admin dashboard for operations

| Task | Owner | Files | Priority |
|------|-------|-------|----------|
| Ride detail screen | @builder | `web/src/pages/RideDetail.tsx` | P0 |
| Driver detail screen | @builder | `web/src/pages/DriverDetail.tsx` | P0 |
| Financial dashboard | @builder | `web/src/pages/FinancialDashboard.tsx` | P1 |
| Promo code manager | @builder | `web/src/pages/PromoCodeManager.tsx` | P1 |
| Notification manager | @builder | `web/src/pages/NotificationManager.tsx` | P2 |
| Incident list/detail | @builder | `web/src/pages/IncidentList.tsx` | P2 |
| Audit log viewer | @builder | `web/src/pages/AuditLog.tsx` | P2 |
| System settings | @builder | `web/src/pages/SystemSettings.tsx` | P2 |

### Phase 4: Testing & QA (Week 5-7)
**Goal:** Comprehensive testing, fix all bugs

| Task | Owner | Files | Priority |
|------|-------|-------|----------|
| Unit tests for EscrowService | @qa-lead | `tests/Unit/EscrowServiceTest.php` | P0 |
| Unit tests for PaymentService | @qa-lead | `tests/Unit/PaymentServiceTest.php` | P0 |
| Integration tests for ride flow | @qa-lead | `tests/Feature/RideFlowTest.php` | P0 |
| Socket server tests | @qa-lead | `socket-server/tests/ride.test.js` | P0 |
| E2E tests (rider book ride) | @qa-lead | `mobile/e2e/` | P1 |
| E2E tests (driver accept) | @qa-lead | `mobile/e2e/` | P1 |
| Security audit | @qa-lead | All controllers | P0 |
| Performance testing | @qa-lead | k6/artillery scripts | P1 |

### Phase 5: Deployment & Launch (Week 7-9)
**Goal:** Deploy to production, launch in Phalaborwa

| Task | Owner | Files | Priority |
|------|-------|-------|----------|
| Set up Hetzner VPS | @release-engineer | Server config | P0 |
| Deploy Laravel backend | @release-engineer | cPanel/VPS | P0 |
| Deploy socket server | @release-engineer | PM2 config | P0 |
| Set up MySQL | @release-engineer | Database | P0 |
| Set up Redis | @release-engineer | Cache/sessions | P0 |
| Configure SSL | @release-engineer | Certificates | P0 |
| Set up CI/CD | @release-engineer | GitHub Actions | P1 |
| Build APKs (rider + driver) | @release-engineer | EAS Build | P0 |
| Submit to Play Store | @release-engineer | Play Console | P0 |
| Submit to App Store | @release-engineer | App Store Connect | P0 |
| Pre-launch testing | @qa-lead | Production environment | P0 |
| Launch! | @ceo | — | P0 |

---

## 8. Testing Strategy

### Testing Pyramid

```
        E2E Tests (5%)
       /            \
      /              \
   Integration (15%)
   /                  \
  /                    \
Unit Tests (80%)
```

### Unit Tests (80% of test effort)
- **Backend:** Laravel PHPUnit
  - EscrowService: holdPayment, releasePayment, double-debit prevention
  - PaymentService: processPayment, processRefund, platform fee calculation
  - WalletService: credit, debit, balance
  - RideMatchingService: accept, nearby drivers
  - FareCalculationService: calculate, calculateFinalFare
- **Mobile:** Jest + React Native Testing Library
  - Screen rendering
  - Navigation flows
  - API call mocking
  - State management

### Integration Tests (15% of test effort)
- **Backend:** Laravel Feature Tests
  - Full ride flow: create → accept → arrive → start → complete → pay
  - Payment flow: wallet, cash, card
  - Auth flow: register, login, forgot password
- **Socket:** Socket.IO client tests
  - Ride broadcasting
  - Driver acceptance
  - Location updates

### E2E Tests (5% of test effort)
- **Mobile:** Detox
  - Rider: open app → book ride → track ride → pay → rate
  - Driver: go online → accept ride → navigate → complete ride
- **Web:** Playwright
  - Admin: login → view dashboard → manage drivers → view rides

### Test Coverage Targets
| Component | Target | Current |
|-----------|--------|---------|
| Backend | 80% | ~60% |
| Rider App | 70% | ~30% |
| Driver App | 70% | ~50% |
| Admin Dashboard | 60% | ~20% |
| Socket Server | 80% | ~40% |

---

## 9. Deployment & Launch

### Infrastructure

#### Recommended: Hetzner South Africa CT1
| Spec | Value |
|------|-------|
| Location | Cape Town, South Africa |
| CPU | 2 vCPU |
| RAM | 4 GB |
| Storage | 40 GB SSD |
| Bandwidth | 20 TB |
| Cost | R2,100/month (~$115 USD) |

#### cPanel Deployment (Possible but Limited)
- **Pros:** Familiar interface, managed hosting
- **Cons:** No Node.js support, no WebSocket support, no SSH
- **Verdict:** Use cPanel for static assets, VPS for backend + socket server

### Deployment Architecture
```
                    ┌─────────────────┐
                    │   Cloudflare    │
                    │   (SSL + CDN)   │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │   Hetzner VPS   │
                    │   (CT1, ZA)     │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────┴────────┐ ┌──┴───┐ ┌───────┴───────┐
     │   Nginx Proxy   │ │ MySQL│ │     Redis     │
     │   (SSL + PM2)   │ │ 8.0  │ │     7.x      │
     └────────┬────────┘ └──────┘ └───────────────┘
              │
     ┌────────┴────────┐
     │   Laravel API   │
     │   (PHP 8.3)    │
     └────────┬────────┘
              │
     ┌────────┴────────┐
     │  Socket Server  │
     │   (Node.js)    │
     └─────────────────┘
```

### Build Process
```bash
# Backend
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Socket Server
npm install --production
pm2 start src/index.js --name easyryde-socket

# Rider APK
cd mobile/apps/rider
eas build --platform android --profile production

# Driver APK
cd mobile/apps/driver
eas build --platform android --profile production

# Admin Web
cd mobile/apps/admin
# Build for web deployment
```

### Launch Checklist
- [ ] All critical bugs fixed (P0)
- [ ] Security audit passed
- [ ] SSL certificates installed
- [ ] Database backed up
- [ ] Monitoring configured (Sentry)
- [ ] Logging configured (Laravel Telescope)
- [ ] Rate limiting enabled
- [ ] Payment gateways tested
- [ ] Driver training completed (50 drivers)
- [ ] Beta testing completed (100 riders)
- [ ] Play Store listing ready
- [ ] App Store listing ready
- [ ] Marketing materials ready
- [ ] Support system ready
- [ ] Legal terms reviewed

---

## 10. Cost Analysis

### Monthly Infrastructure Costs (ZAR)

| Item | Cost/month | Notes |
|------|------------|-------|
| Hetzner VPS (CT1) | R2,100 | 2 vCPU, 4GB RAM, 40GB SSD |
| Cloudflare | R0 | Free tier for SSL/CDN |
| MySQL (on VPS) | R0 | Included with VPS |
| Redis (on VPS) | R0 | Included with VPS |
| Domain | R100 | .co.za domain |
| **Total** | **R2,200** | |

### External Service Costs (ZAR)

| Service | Cost/month | Notes |
|---------|------------|-------|
| Twilio SMS | R500 | OTP verification |
| PayFast | R0 | Transaction fees only |
| Ozow | R0 | Transaction fees only |
| Stripe | R0 | Transaction fees only |
| Sentry | R0 | Free tier (5k errors/month) |
| **Total** | **R500** | |

### Development Costs (One-time)

| Item | Cost | Notes |
|------|------|-------|
| Play Store fee | R350 | One-time |
| App Store fee | R2,500 | One-time (annual) |
| SSL certificates | R0 | Cloudflare free |
| **Total** | **R2,850** | |

### Total Monthly Operating Cost
- **Infrastructure:** R2,200
- **Services:** R500
- **Total:** R2,700/month (~$148 USD)

### Revenue Projections

| Month | Riders | Drivers | Rides/day | Revenue/day | Revenue/month |
|-------|--------|---------|-----------|-------------|---------------|
| 1 | 200 | 50 | 100 | R4,000 | R120,000 |
| 3 | 1,000 | 100 | 500 | R20,000 | R600,000 |
| 6 | 5,000 | 200 | 2,000 | R80,000 | R2,400,000 |

**Break-even point:** ~50 rides/day (Month 1)

---

## 11. Documentation Gap Analysis

### Critical Gaps (Must Have for Production)

| Gap | Impact | Owner |
|-----|--------|-------|
| API documentation | Can't onboard new developers | @doc-engineer |
| Deployment guide | Can't deploy to production | @release-engineer |
| Environment variables list | Can't configure production | @release-engineer |
| Database schema documentation | Can't maintain database | @doc-engineer |
| Socket server events documentation | Can't debug real-time issues | @doc-engineer |

### Important Gaps (Should Have)

| Gap | Impact | Owner |
|-----|--------|-------|
| Architecture decision records | Can't understand why decisions were made | @doc-engineer |
| Component library documentation | Can't reuse components | @doc-engineer |
| Testing guide | Can't write tests | @qa-lead |
| Contributing guide | Can't onboard contributors | @doc-engineer |

### Nice-to-Have Gaps

| Gap | Impact | Owner |
|-----|--------|-------|
| User manual | End users need guidance | @doc-engineer |
| Driver training guide | Drivers need training | @doc-engineer |
| Admin operations manual | Admins need guidance | @doc-engineer |

---

## 12. Appendices

### A. File Inventory

#### Rider App (28 entries)
```
mobile/apps/rider/
├── App.tsx                          # Main entry — NEEDS FIX
├── app.json
├── babel.config.js
├── eas.json
├── metro.config.js
├── package.json
├── tsconfig.json
├── src/
│   └── screens/
│       ├── HomeScreen.tsx           # Basic — REPLACE
│       ├── RideHistoryScreen.tsx    # Basic — REPLACE
│       ├── ProfileScreen.tsx        # Basic — REPLACE
│       └── LoginScreen.tsx          # Basic — REPLACE
├── screens/
│   ├── HomeScreen.tsx               # Production-ready
│   ├── BookRideScreen.tsx           # Production-ready
│   ├── RideTrackingScreen.tsx       # Production-ready
│   ├── PaymentScreen.tsx            # Production-ready
│   ├── RideHistoryScreen.tsx        # Production-ready
│   ├── RideDetailScreen.tsx         # Production-ready
│   ├── ProfileScreen.tsx            # Production-ready
│   ├── WalletScreen.tsx             # Production-ready
│   ├── WhereToScreen.tsx            # Production-ready
│   ├── SavedPlacesScreen.tsx        # Production-ready
│   ├── NotificationPreferencesScreen.tsx # Production-ready
│   ├── LoginScreen.tsx              # Production-ready
│   ├── RegisterScreen.tsx           # Production-ready
│   └── ForgotPasswordScreen.tsx     # Production-ready
└── assets/
    ├── icon.png
    ├── splash.png
    └── adaptive-icon.png
```

#### Driver App (21 entries)
```
mobile/apps/driver/
├── App.tsx                          # Main entry
├── screens/
│   ├── DashboardScreen.tsx          # Main screen — inline location tracking
│   ├── ActiveRideScreen.tsx         # Active ride management
│   ├── RideRequestsScreen.tsx       # Ride request list
│   ├── TripHistoryScreen.tsx        # Trip history
│   ├── EarningsScreen.tsx           # Earnings display
│   ├── ProfileScreen.tsx            # Driver profile
│   ├── ChatScreen.tsx               # In-ride chat
│   ├── FoodDeliveryScreen.tsx       # Food delivery (Phase 2)
│   ├── FoodOrderDetailScreen.tsx    # Food order detail (Phase 2)
│   └── LoginScreen.tsx              # Driver login
└── assets/
    ├── icon.png
    └── splash.png
```

#### Admin Dashboard (21 entries)
```
mobile/apps/admin/
├── App.tsx                          # Main entry
├── screens/
│   ├── LoginScreen.tsx              # Admin login
│   ├── DashboardScreen.tsx          # Main dashboard
│   ├── UserListScreen.tsx           # User management
│   ├── UserDetailScreen.tsx         # User detail
│   ├── DriverListScreen.tsx         # Driver management
│   ├── RideListScreen.tsx           # Ride management
│   └── SettingsScreen.tsx           # Admin settings
└── (9 screens missing)
```

#### Backend (35 entries)
```
backend/
├── app/
│   ├── Http/
│   │   └── Controllers/Api/V1/
│   │       ├── AuthController.php
│   │       ├── RideController.php
│   │       ├── DriverController.php
│   │       ├── PaymentController.php
│   │       ├── WalletController.php
│   │       ├── UserController.php
│   │       ├── RatingController.php
│   │       ├── NotificationController.php
│   │       ├── PromoCodeController.php
│   │       ├── ScheduledRideController.php
│   │       ├── ReferralController.php
│   │       ├── SosController.php
│   │       ├── ChatController.php
│   │       ├── DeliveryController.php
│   │       ├── FoodDeliveryController.php
│   │       ├── FoodAdminController.php
│   │       ├── IncidentController.php
│   │       ├── KycController.php
│   │       ├── ConsentController.php
│   │       ├── DataRetentionController.php
│   │       ├── ReportingController.php
│   │       ├── AdminController.php
│   │       ├── HealthCheckController.php
│   │       ├── ConfigController.php
│   │       ├── PlaceController.php
│   │       ├── PartnerWebhookController.php
│   │       └── Auth/
│   │           ├── SocialAuthController.php
│   │           └── TotpController.php
│   ├── Models/ (32 models)
│   ├── Services/ (35 services)
│   └── Events/
├── routes/
│   └── api.php (320 lines)
├── database/
│   └── migrations/
└── tests/
    └── (63 test files)
```

#### Socket Server (10 entries)
```
socket-server/
├── src/
│   ├── index.js                     # Server entry
│   ├── handlers/
│   │   ├── ride.js                  # Ride event handlers
│   │   ├── chat.js                  # Chat event handlers
│   │   └── location.js              # Location event handlers
│   └── services/
│       ├── geo.js                   # Redis GEO operations
│       └── redis.js                 # Redis client
├── package.json
└── tests/
```

### B. Navigation Types (Confirmed)

```typescript
// Rider Navigation — 14 screens
RiderStackParamList = {
  Main, BookRide, RideTracking, Payment, RideHistory,
  Chat, RestaurantList, RestaurantMenu, FoodCheckout,
  FoodOrderTracking, Wallet
}

RiderMainTabParamList = {
  Home, Activity, Profile
}

RiderAuthStackParamList = {
  Login, Register
}

// Driver Navigation — 10 screens
DriverStackParamList = {
  Login, Main, RideRequests, ActiveRide, Chat,
  TripHistory, Earnings, Profile, FoodDelivery, FoodOrderDetail
}

// Admin Navigation — 2 screens (needs expansion)
AdminStackParamList = {
  Login, Main
}
```

### C. Shared Package Exports (37 components confirmed)

From `shared/src/index.ts`:
- Components: Button, Card, Input, Badge, Avatar, Header, EmptyState, LoadingSpinner, RideCard, DriverCard, RatingStars, PriceDisplay, LocationPin, PaymentMethodCard, PromoCodeInput, RideStatusBadge, DriverStatusBadge
- Contexts: AuthProvider, ThemeProvider, SocketProvider
- Hooks: useAuth, useTheme, useSocket, useLocationTracking
- Utils: formatCurrency, formatDate, formatDistance, formatDuration, validateEmail, validatePhone, generateId, apiClient
- Types: All navigation types, User, Ride, Payment, Driver, Vehicle, Wallet

---

## 13. Security Hardening Checklist (Enhanced)

### CRITICAL — Must Fix Before Any User Touches the App

| # | Controller | Method | Issue | File:Line | Fix |
|---|-----------|--------|-------|-----------|-----|
| S1 | `RideController` | `show()` | No ownership check — any user can view any ride | `RideController.php:87-100` | Add `$request->user()->id` check (rider_id or driver_id) |
| S2 | `DriverController` | `show()` | No ownership check — any user can view any driver's profile/vehicle | `DriverController.php` | Add `role:driver\|admin` or ownership check |
| S3 | `PaymentController` | `createStripeIntent()` | No amount cap — user can set arbitrary amount | `PaymentController.php:349-359` | Add max amount validation tied to ride |
| S4 | `PaymentController` | `confirmStripePayment()` | No ownership check — any user can confirm any payment | `PaymentController.php` | Verify user owns the payment |
| S5 | `IncidentController` | `show()` | No ownership check — any user can view any incident | `IncidentController.php` | Add ownership or admin check |
| S6 | `IncidentController` | `downloadEvidence()` | No ownership check — any user can download evidence | `IncidentController.php` | Add ownership/admin check |
| S7 | `KycController` | `download()` | No ownership check — any user can download KYC documents | `KycController.php` | Add ownership/admin check |
| S8 | `DataRetentionController` | `requestErasure()` | One-click permanent deletion — no confirmation | `DataRetentionController.php` | Add confirmation token or 30-day grace period |

### HIGH — Must Fix Before Launch

| # | Route | Current | Required | File:Line |
|---|-------|---------|----------|-----------|
| M1 | `GET /drivers/nearby-rides` | `auth:sanctum` | `role:driver` | `api.php:99` |
| M2 | `PUT /drivers/profile` | `auth:sanctum` | `role:driver` | `api.php:100` |
| M3 | `POST /drivers/vehicle` | `auth:sanctum` | `role:driver` | `api.php:101` |
| M4 | `POST /drivers/toggle-online` | `auth:sanctum` | `role:driver` | `api.php:102` |
| M5 | `GET /drivers/earnings` | `auth:sanctum` | `role:driver` | `api.php:103` |
| M6 | `GET /drivers/trips` | `auth:sanctum` | `role:driver` | `api.php:104` |
| M7 | `GET /drivers/deliveries` | `auth:sanctum` | `role:driver` | `api.php:105` |
| M8 | `POST /rides/{ride}/driver-accept` | `auth:sanctum` | `role:driver` | `api.php:88` |
| M9 | `POST /rides/{ride}/driver-arrived` | `auth:sanctum` | `role:driver` | `api.php:89` |
| M10 | `POST /rides/{ride}/start` | `auth:sanctum` | `role:driver` | `api.php:90` |
| M11 | `POST /rides/{ride}/complete` | `auth:sanctum` | `role:driver` | `api.php:91` |
| M12 | `POST /deliveries/{delivery}/assign` | `auth:sanctum` | `role:admin\|super-admin` | `api.php:155` |
| M13 | `POST /driver/food/orders/{order}/accept` | `auth:sanctum` | `role:driver` | `api.php:174` |
| M14 | `POST /driver/food/orders/{order}/status` | `auth:sanctum` | `role:driver` | `api.php:175` |
| M15 | `POST /payments/stripe/create-intent` | `auth:sanctum` | `throttle:payments` | `api.php:120` |
| M16 | `POST /payments/stripe/confirm` | `auth:sanctum` | `throttle:payments` | `api.php:121` |
| M17 | `POST /wallet/withdraw` | `throttle:wallet-deposit` | `throttle:wallet-withdraw` (wrong name) | `api.php:129` |
| M18 | `POST /rides` | none | `throttle:ride-create` | `api.php:82` |

---

## 14. Exact Code Fixes

### FIX-1: Double-Debit Bug (EscrowService.php)

**BEFORE** (lines 24-46):
```php
public function holdPayment(Ride $ride, string $method = 'wallet', array $gatewayData = []): Payment
{
    return DB::transaction(function () use ($ride, $method, $gatewayData) {
        $payment = $this->paymentService->processPayment($ride, $method, $gatewayData);

        if ($method === 'wallet') {
            $wallet = $this->walletService->getOrCreateWallet($ride->rider);
            $this->walletService->debit(
                $wallet,
                (float) $ride->total_fare,
                'escrow_hold',
                $ride->id,
                "Payment held in escrow for ride {$ride->id}",
            );

            $driverWallet = $this->walletService->getOrCreateWallet($ride->driver);
            $driverWallet->increment('pending_balance', (float) $payment->driver_payout);
        }

        return $payment;
    });
}
```

**AFTER** (remove duplicate debit — processPayment already debits):
```php
public function holdPayment(Ride $ride, string $method = 'wallet', array $gatewayData = []): Payment
{
    return DB::transaction(function () use ($ride, $method, $gatewayData) {
        $payment = $this->paymentService->processPayment($ride, $method, $gatewayData);

        if ($method === 'wallet') {
            $driverWallet = $this->walletService->getOrCreateWallet($ride->driver);
            $driverWallet->increment('pending_balance', (float) $payment->driver_payout);
        }

        return $payment;
    });
}
```

### FIX-2: Socket ride:complete Handler (ride.js)

**BEFORE** (lines 158-182):
```javascript
socket.on('ride:complete', async (data) => {
    try {
      const { rideId, otherUserId, fare } = data;
      io.to(`user:${otherUserId}`).emit('ride:completed', { ... });
      io.to('admin').emit('ride:status-change', { ... });
      socket.leave(`ride:${rideId}`);
      socket.data.currentRideId = null;
    } catch (err) { ... }
});
```

**AFTER** (add HTTP call to Laravel API):
```javascript
const axios = require('axios');
const config = require('../config');

// At top of file, add:
// laravelApiUrl: process.env.LARAVEL_API_URL || 'http://localhost:8000'

socket.on('ride:complete', async (data) => {
    try {
      const { rideId, otherUserId, fare } = data;

      // Persist to database via Laravel API
      try {
        await axios.post(
          `${config.laravelApiUrl}/api/v1/rides/${rideId}/complete`,
          {},
          {
            headers: {
              Authorization: `Bearer ${socket.data.token}`,
              Accept: 'application/json',
            },
            timeout: 10000,
          },
        );
      } catch (apiErr) {
        console.error(`[Ride:${userId}] complete API error:`, apiErr.response?.data || apiErr.message);
        socket.emit('error', { message: 'Failed to persist ride completion' });
        return;
      }

      io.to(`user:${otherUserId}`).emit('ride:completed', {
        rideId,
        [role === 'driver' ? 'driverId' : 'riderId']: userId,
        fare,
        timestamp: Date.now(),
      });

      io.to('admin').emit('ride:status-change', {
        rideId,
        status: 'completed',
        fare,
        timestamp: Date.now(),
      });

      socket.leave(`ride:${rideId}`);
      socket.data.currentRideId = null;
    } catch (err) {
      console.error(`[Ride:${userId}] complete error:`, err.message);
      socket.emit('error', { message: 'Failed to complete ride' });
    }
});
```

Also fix `ride:cancel` handler with the same pattern (call `POST /api/v1/rides/{rideId}/cancel`).

---

## 15. Rider App Screen Inventory (Enhanced)

### Critical Discovery: Two Parallel Screen Directories

| Location | Files | Used by App.tsx? | Quality |
|----------|-------|-------------------|---------|
| `screens/` (root) | 14 files | **NO** | Production-ready, uses shared components, i18n |
| `src/screens/` | 4 files | **YES** | Basic, hardcoded English, no shared components |

### Orphaned Screens (Exist but Not Wired)

| Screen | Lines | Features | Status |
|--------|-------|----------|--------|
| `screens/RegisterScreen.tsx` | 55 | i18n, shared components, validation | Complete — ready to wire |
| `screens/ForgotPasswordScreen.tsx` | — | Password reset flow | Complete — ready to wire |
| `screens/BookRideScreen.tsx` | 72 | Place autocomplete, destination search | Complete — ready to wire |
| `screens/RideTrackingScreen.tsx` | 282 | Live map, socket events, animated markers, rating | Complete — most complex screen |
| `screens/PaymentScreen.tsx` | 69 | Cash/wallet/card selection | Complete — ready to wire |
| `screens/ChatScreen.tsx` | 74 | Real-time chat via socket | Complete — ready to wire |
| `screens/WalletScreen.tsx` | 305 | Balance, transactions, payment methods | Complete — ready to wire |
| `screens/RestaurantListScreen.tsx` | 87 | Food delivery (Phase 2) | Complete |
| `screens/RestaurantMenuScreen.tsx` | 93 | Food delivery (Phase 2) | Complete |
| `screens/FoodCheckoutScreen.tsx` | 105 | Food delivery (Phase 2) | Complete |
| `screens/FoodOrderTrackingScreen.tsx` | 78 | Food delivery (Phase 2) | Complete |

### Missing from React Native (vs HTML Reference)

| Feature | HTML Reference | React Native | Priority |
|---------|---------------|--------------|----------|
| Vehicle selection with images/descriptions | Yes (4 types) | No (simple cards) | P1 |
| Fare breakdown (base, distance, promo) | Yes | No | P1 |
| Promo code application | Yes | No (API exists) | P1 |
| Trip sharing link | Yes | No | P2 |
| Call driver button | Yes | No (chat only) | P1 |
| Safety section | Yes | No | P2 |
| Tipping after ride | Yes | No | P2 |
| Saved places | Yes | No | P2 |
| Searching driver animation | Yes (radar) | Partial (LoadingOverlay) | P2 |
| Trip progress bar | Yes | No | P1 |

### Navigation Flow (Current vs Target)

**Current (broken):**
```
AuthStack: Login (only)
MainStack: Home | Activity | Profile (3 tabs)
```

**Target (fixed):**
```
AuthStack: Login → Register → ForgotPassword
MainStack:
  Tab: Home → BookRide → RideTracking → Payment → Rating
  Tab: Activity → RideDetail
  Tab: Profile → Wallet → Settings
Stack: Chat (from RideTracking)
```

---

## 16. Driver App Gaps (Enhanced)

### Location Tracking Duplication

| Aspect | DashboardScreen (Inline) | useLocationTracking (Hook) |
|--------|-------------------------|---------------------------|
| Socket integration | Uses shared `useSocket` | Creates its own socket |
| Background tracking | Yes (expo-task-manager) | No |
| App state handling | Yes | No |
| Queue/batch | No (sends each point) | Yes |
| Distance interval | 50m | 10m (ride) / 50m (idle) |
| Status | **Active, feature-complete** | **Orphaned, incomplete** |

**Decision:** Keep DashboardScreen inline code, delete orphaned hook.

### Missing Features (vs HTML Reference)

| Feature | HTML | RN App | Priority |
|---------|------|--------|----------|
| 15s countdown timer on ride requests | Yes | No | P1 |
| Passenger info (avatar, name, rating) on request | Yes | No | P1 |
| Fare breakdown on request | Yes | No (distance only) | P1 |
| Trip progress bar | Yes | No | P1 |
| "Can't Find Passenger" flow | Yes | No | P2 |
| Phone call button | Yes | No (chat only) | P1 |
| Navigation integration (external maps) | Yes | No | P1 |
| Performance stats (acceptance/cancellation rate) | Yes | No | P2 |
| Cash out / withdrawal | Yes | No | P2 |
| Vehicle info on home | Yes | No | P2 |

### Orphaned Files to Clean Up

| File | Status |
|------|--------|
| `src/hooks/useLocationTracking.ts` | Orphaned — delete |
| `src/hooks/useOfflineLocationSync.ts` | Orphaned — delete |
| `src/services/locationService.ts` | Orphaned — delete |
| `src/components/EarningsSummaryCard.tsx` | Orphaned — delete |
| `src/screens/EarningsScreen.tsx` | Orphaned — delete |

---

## 17. Admin App Gaps (Enhanced)

### Missing Screens (9 screens)

| Screen | Web Version | APIs Needed | Priority |
|--------|-------------|-------------|----------|
| PaymentsScreen | `web/src/pages/PaymentsScreen.tsx` | `GET /payments`, `POST /payments/{id}/refund` | P0 |
| PricingScreen | `web/src/pages/PricingScreen.tsx` | `GET /admin/settings`, `POST /admin/settings` | P1 |
| ReportsScreen | `web/src/pages/ReportsScreen.tsx` | `GET /reports/revenue`, `GET /reports/drivers` | P1 |
| LiveMapScreen | `web/src/pages/LiveMapScreen.tsx` | `GET /admin/drivers?is_online=true` | P1 |
| PromoScreen | `web/src/pages/PromoScreen.tsx` | `GET /promo-codes`, CRUD | P1 |
| ComplianceScreen | `web/src/pages/ComplianceScreen.tsx` | `GET /admin/compliance/*` | P2 |
| AuditLogScreen | `web/src/pages/AuditLogScreen.tsx` | `GET /admin/audit-logs` | P2 |
| PayoutsPage | `web/src/pages/PayoutsPage.tsx` | `GET /admin/payouts`, retry | P2 |
| FoodOrdersPage | `web/src/pages/FoodOrdersPage.tsx` | `GET /admin/food/orders` | P2 |

### Admin Navigation Expansion

**Current:** Flat 6-tab navigator (Dashboard, Users, Drivers, Rides, Food, Settings)

**Target:** Stack navigator with tabs + detail screens
```
AdminStack:
  Login
  Main (Tabs)
    Dashboard → LiveMap, Reports
    Users → UserDetail
    Drivers → DriverDetail
    Rides → RideDetail
    Payments (new tab)
    Food → FoodOrders
    Settings → Pricing, Promo, Compliance, AuditLog, Payouts
```

---

## 18. Backend Services Audit (Enhanced)

### Critical Missing Model

| Issue | Impact |
|-------|--------|
| `ScheduledRide` model **does not exist** | `ScheduledRideService` references `App\Models\ScheduledRide` — any scheduled ride operation will crash with class-not-found |

### Duplicate Service Layers

| Service | Legacy (root) | New (Payment/ namespace) | Impact |
|---------|--------------|-------------------------|--------|
| EscrowService | `app/Services/EscrowService.php` | `app/Services/Payment/EscrowService.php` | Confusion, double-debit |
| StripeService | `app/Services/StripeService.php` | `app/Services/Payment/StripeService.php` | Which to use? |
| PayFastService | `app/Services/PayFastService.php` | `app/Services/Payment/PayFastService.php` | Which to use? |
| SmsService | `app/Services/SmsService.php` | `app/Services/Notification/SmsService.php` | Which to use? |
| PushNotificationService | `app/Services/PushNotificationService.php` | `app/Services/Notification/PushNotificationService.php` | Which to use? |

**Decision:** Keep only the `Payment/` and `Notification/` sub-namespace versions. Delete legacy duplicates.

### Model Relationship Issues

| Model | Issue | Fix |
|-------|-------|-----|
| `Ride.rating()` | HasOne — but both rider and driver can rate | Change to HasMany, add `riderRating()` and `driverRating()` |
| `FoodOrder` | `customer_id` in fillable but migration may not have it | Verify migration, add column if missing |
| `User` | Missing relationships: `referralCode()`, `ratingsGiven()`, `ratingsReceived()`, `driverPayouts()`, `pushTokens()` | Add relationships |

### Missing Model Scopes

| Model | Missing Scopes |
|-------|---------------|
| `Ride` | `scopeSearching()`, `scopeActive()`, `scopeCompleted()`, `scopeForDriver($driverId)` |
| `Payment` | `scopePending()`, `scopeCompleted()`, `scopeHeld()` |
| `User` | `scopeOnline()`, `scopeDrivers()`, `scopeRiders()` |
| `WalletTransaction` | `scopeCredits()`, `scopeDebits()` |

### Missing Event Handlers

| Event | Listener | Impact |
|-------|----------|--------|
| `PaymentFailed` | None | Failed payments silently ignored |
| `NewRideRequest` | None | Only dispatched manually via SocketService |
| `DeliveryStatusUpdated` | None | Delivery status changes have no side effects |
| `FoodOrderStatusUpdated` | None | Food order changes have no side effects |

### Middleware Issues

| Issue | File | Fix |
|-------|------|-----|
| `InputSanitizationMiddleware` skips JSON requests (line 13) | `InputSanitizationMiddleware.php` | Remove the JSON skip — all API requests are JSON |
| `TenantMiddleware` registered but never applied | `bootstrap/app.php` | Apply to all authenticated routes |
| `AdminMiddleware` redundant with `role:admin` | `AdminMiddleware.php` | Remove, use `role:admin|super-admin` instead |

### Database Schema Issues

| Issue | Table | Impact |
|-------|-------|--------|
| `cash_reconciliations` missing `payment_id` column | `cash_reconciliations` | CashPaymentService will fail |
| `PartnerApiService` uses non-existent columns | `deliveries` | SQL errors on partner orders |
| `driver_payouts` missing `tenant_id` column | `driver_payouts` | Multi-tenant queries break |
| `FoodOrder` model has `customer_id` but migration may not | `food_orders` | Foreign key errors |

---

## 19. Risk Register

| # | Risk | Probability | Impact | Mitigation |
|---|------|-------------|--------|------------|
| R1 | Double-debit bug causes rider complaints | High | Critical | Fix in Phase 0 before any user testing |
| R2 | ride:complete not persisted — rides stuck | High | Critical | Fix in Phase 0 |
| R3 | Driver accepts ride before DB write — ride disappears | Medium | High | Add retry logic + rollback |
| R4 | No ErrorBoundary — single crash kills app | High | High | Add ErrorBoundary in Phase 0 |
| R5 | Missing ScheduledRide model — scheduled rides crash | High | High | Create model or disable feature |
| R6 | FoodOrder missing customer_id column | Medium | High | Verify migration, add column |
| R7 | CashPaymentService debits driver before they receive money | Medium | Medium | Fix cash payment flow |
| R8 | InputSanitizationMiddleware is no-op | Low | Medium | Remove JSON skip |
| R9 | PushNotificationService manual JWT — fragile | Medium | Medium | Switch to Firebase SDK |
| R10 | No webhook signature verification | Medium | High | Add signature checks |
| R11 | SurgePricingService hardcoded zones | Low | Low | Make configurable |
| R12 | Socket server has no HTTP client | High | Critical | Add axios dependency |

---

## 20. Monitoring & Alerting

### Sentry Configuration
```javascript
// rider App.tsx
import * as Sentry from 'sentry-expo';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: 1.0,
});
```

### Backend Monitoring
- **Laravel Telescope:** Local development debugging
- **Sentry:** Production error tracking
- **Custom metrics:** Ride completion rate, payment success rate, driver acceptance rate

### Alert Thresholds
| Metric | Warning | Critical |
|--------|---------|----------|
| Payment failure rate | > 5% | > 10% |
| Ride completion time | > 15 min avg | > 30 min avg |
| Driver acceptance rate | < 70% | < 50% |
| API response time | > 500ms | > 2000ms |
| Error rate | > 1% | > 5% |
| Memory usage | > 80% | > 95% |

---

## 21. Missing Flows (Must Implement)

### Rider Onboarding Flow
1. App opens → Splash screen (2s)
2. If no auth: Login → Register (name, email, phone, password)
3. If no phone verified: OTP verification screen
4. If first time: Onboarding slides (3 screens: Book, Track, Pay)
5. Home screen with map

### Driver Onboarding Flow
1. Driver downloads app → Login
2. If not approved: "Pending approval" screen with KYC upload
3. If approved but no vehicle: Vehicle registration screen
4. If approved + vehicle: Go online toggle
5. Dashboard with ride requests

### Promo Code Flow
1. Rider enters promo code on Home screen
2. `POST /promo-codes/validate` → returns discount info
3. Discount applied to fare estimate
4. Promo badge shown on Home screen

### Cash Payment Flow
1. Rider selects "Cash" payment method
2. Ride completes → fare displayed to both rider and driver
3. Rider pays driver cash
4. Driver confirms cash received (in app)
5. Platform fee deducted from driver's next wallet credit

### Driver Payout Flow
1. Driver requests payout from Earnings screen
2. `POST /wallet/withdraw` → creates withdrawal request
3. Admin reviews and approves
4. EFT processed via PayFast/Ozow
5. Driver notified of payout

---

## Execution Order

1. **Phase 0 (Week 1-2):** Fix critical bugs — double-debit, ride:complete, ErrorBoundary, security, missing model
2. **Phase 1 (Week 2-4):** Complete rider app — wire 14 screens, fix navigation, add registration flow
3. **Phase 2 (Week 3-5):** Polish driver app — fix location tracking, ride ID types, add missing features
4. **Phase 3 (Week 4-6):** Complete admin dashboard — add 9 missing screens, expand navigation
5. **Phase 4 (Week 5-7):** Testing & QA — unit, integration, E2E, security audit
6. **Phase 5 (Week 7-9):** Deployment & launch — infrastructure, builds, go-live

**Total timeline: 9 weeks (approximately 2 months)**

---

*This document is the single source of truth for EasyRyde production. All decisions, findings, and plans are captured here.*
*Last updated: 2026-06-26 with enhanced deep-dive findings from 4 parallel subagent analyses.*
