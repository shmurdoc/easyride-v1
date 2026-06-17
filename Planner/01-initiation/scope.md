# Scope Document

**Phase:** 01 — Initiation  
**Document:** Scope Document  
**Version:** 1.0.0  
**Date:** 2026-06-17  
**Status:** Draft

---

## 1. Purpose

This document defines the boundaries of the EasyRyde v1.0 platform — what is included, what is explicitly excluded, and what is deferred to future phases. It serves as the single source of truth for scope decisions throughout the production readiness programme.

---

## 2. In Scope — v1.0

### 2.1 Ride-Hailing Core

| Feature | Description | Priority |
|---------|-------------|----------|
| Rider registration & login | Phone number-based OTP, email registration, Google/Apple SSO | P0 |
| Driver registration & login | Phone + email with KYC document upload | P0 |
| Fare estimation | Real-time price calculation with distance + time + surge | P0 |
| Ride request | Set pickup/drop-off via map or text input | P0 |
| Ride types | Economy, Standard, Premium, XL | P0 |
| Driver matching | Nearest driver algorithm with proximity + rating factor | P0 |
| Ride lifecycle | Searching → Accepted → Arrived → In Progress → Completed / Cancelled | P0 |
| GPS tracking | Real-time driver-to-rider location sharing | P0 |
| ETA display | Live driver arrival time with route | P0 |
| Cancellation | Rider and driver cancellation with reason + fee logic | P0 |
| Rating & review | 1–5 star rating, optional comment for both parties | P0 |
| Ride receipt | Digital receipt with fare breakdown | P0 |
| Scheduled rides | Book rides 1–72 hours in advance | P1 |
| Favourites & recent places | Quick-select from saved addresses | P1 |
| Ride history | Past rides with details, receipts, rebook option | P1 |

### 2.2 Driver Management

| Feature | Description | Priority |
|---------|-------------|----------|
| Online/offline toggle | Driver sets availability status | P0 |
| Ride acceptance/rejection | Notification with 30-second countdown | P0 |
| In-app navigation | Deep-link to Google Maps / Waze | P0 |
| Earnings dashboard | Daily/weekly/monthly earnings with breakdown | P0 |
| Trip history | Completed rides with details, earnings, ratings | P0 |
| Vehicle management | Add/update vehicle details, documents, photos | P0 |
| Driver earnings withdrawal | Request payout to bank or mobile money | P0 |
| Driver rating view | See own rating and rider feedback | P1 |
| Driver referral | Refer new drivers, earn bonus | P2 |

### 2.3 Payment & Wallet

| Feature | Description | Priority |
|---------|-------------|----------|
| Stripe integration | Credit/debit card payments | P0 |
| PayFast integration | EFT/direct deposit payments | P0 |
| Ozow integration | Instant EFT with automatic reconciliation | P0 |
| Cash payments | Pay driver in cash at drop-off | P0 |
| Digital wallet | Top-up, balance, transaction history | P0 |
| Escrow hold | 24-hour hold before driver receives payment | P0 |
| Ride fare payment | Automatic charge on completion | P0 |
| Refund processing | Admin-initiated partial/full refunds | P0 |
| Driver payouts | Weekly batch payouts with statement | P0 |
| Promo codes | Fixed discount, percentage, free ride codes | P1 |
| Referral bonuses | Automatic credit for referred rider rides | P2 |

### 2.4 Food Delivery

| Feature | Description | Priority |
|---------|-------------|----------|
| Restaurant onboarding | Registration, menu management, hours | P0 |
| Menu browsing | Categories, search, photos, modifiers | P0 |
| Order creation | Cart, item customisation, special instructions | P0 |
| Order lifecycle | Pending → Confirmed → Preparing → Ready → Picked Up → Delivered | P0 |
| Driver assignment | Nearest available driver to restaurant | P0 |
| Live tracking | Restaurant → driver → customer tracking | P0 |
| Delivery fee calculation | Distance-based automated fee | P0 |
| Restaurant dashboard | Order management, earnings, analytics | P1 |
| Customer rating (food) | Rate food + delivery separately | P1 |

### 2.5 Admin Dashboard

| Feature | Description | Priority |
|---------|-------------|----------|
| Dashboard KPIs | Rides today, revenue, active drivers, cancellations | P0 |
| User management | View, search, filter, suspend riders and drivers | P0 |
| Driver approval workflow | Review documents, approve/reject with notes | P0 |
| Ride monitoring | Live ride dashboard, filter by status | P0 |
| Pricing editor | Base fares, per-km, per-min rates by ride type | P0 |
| Surge pricing | Time-of-day + demand-based multipliers | P1 |
| Promo code management | Create, activate, deactivate, report | P0 |
| Audit log | All admin actions recorded with timestamp + admin ID | P0 |
| Payout management | View, approve, process driver payouts | P0 |
| Incident management | View reported incidents, resolution workflow | P0 |
| Restaurant management | Onboard, approve, suspend restaurants | P1 |
| Compliance reports | KYC status, data retention, export | P1 |

### 2.6 Safety

| Feature | Description | Priority |
|---------|-------------|----------|
| SOS button | Emergency alert to admin with GPS coordinates | P0 |
| Ride sharing | Share ride link/status with trusted contacts | P0 |
| In-app chat | Rider ↔ Driver messaging during active ride | P0 |
| Driver verification | ID document, driver's license, vehicle papers | P0 |
| Incident reporting | Report safety issue post-ride with evidence upload | P0 |
| Trusted contacts | Add emergency contacts who receive ride status | P1 |
| Night mode | Only verified drivers active after 10PM | P1 |

### 2.7 Notifications

| Feature | Description | Priority |
|---------|-------------|----------|
| Push notifications (FCM) | Ride status, promo, payment, SOS alerts | P0 |
| Email notifications | Receipts, weekly summaries, verification | P1 |
| SMS notifications | OTP, critical alerts (for users without data) | P1 |
| In-app notification center | Notification history, preferences | P1 |

### 2.8 Infrastructure & Operations

| Feature | Description | Priority |
|---------|-------------|----------|
| Docker compose (dev + prod) | Containerised application with env-specific config | P0 |
| CI/CD pipeline | GitHub Actions — lint, test, build, deploy | P0 |
| Monitoring | Sentry error tracking, uptime monitoring | P0 |
| Structured logging | JSON logs with correlation IDs | P0 |
| Health checks | Public /health endpoint, load balancer checks | P0 |
| Database backup | Automated daily snapshots, point-in-time recovery | P0 |
| SSL/TLS | TLS 1.3 on all endpoints | P0 |
| Rate limiting | 60/min general, 10/min auth (Redis-backed) | P0 |

---

## 3. Out of Scope — v1.0

The following features and capabilities are **explicitly excluded** from the v1.0 release:

| Feature | Rationale |
|---------|-----------|
| Multi-language support (i18n) | English-only for v1.0. Afrikaans, Tsonga, Pedi planned for v1.1 |
| In-app voice calls | Rider ↔ Driver calls handled via masked phone numbers fallback |
| Enterprise B2B billing | Company account with invoicing planned for v2.0 |
| API marketplace / third-party developer API | No public API in v1.0 |
| Insurance claim automation | Manual claims process in v1.0; automation in v1.5 |
| Ride pooling (multiple riders) | Technical complexity; deferred to v2.0 |
| AI-based demand prediction | Basic time-of-day surge only; ML prediction in v2.0 |
| Driver-facing web portal | Driver app covers all needs; web portal deferred |
| QR code payments | Cash + digital is sufficient for launch |
| Wearable app (Apple Watch, etc.) | Mobile-first; wearables not a priority |
| Offline maps | GPS requires data for real-time tracking |
| Cross-platform admin mobile app | Web dashboard adequate for launch |
| Customer support chatbot | Human support via phone/WhatsApp in v1.0 |
| Automated driver onboarding | KYC documents reviewed manually by admin in v1.0 |
| Cryptocurrency payments | Not relevant for target market |

---

## 4. Future Phases

### 4.1 Phase v1.1 (Months 4–6)

| Feature | Description |
|---------|-------------|
| Multi-language | Afrikaans, Xitsonga, Sepedi UI translations |
| SMS notification upgrade | Two-way SMS for feature phone users |
| Improved driver onboarding | Semi-automated document verification |
| Restaurant self-service | Restaurant can update menu, photos, hours |
| Driver tipping | Post-ride tip in-app |

### 4.2 Phase v2.0 (Months 7–12)

| Feature | Description |
|---------|-------------|
| Ride pooling | Share ride with passengers going same direction |
| Enterprise billing | Corporate accounts with invoicing, monthly billing |
| Twinning expansion | Launch in Hoedspruit, Tzaneen |
| Parcel delivery | Send packages via driver network |
| AI demand prediction | Predictive driver dispatching |
| Public API | Third-party integration endpoints |

### 4.3 Phase v2.0+ (Year 2+)

| Feature | Description |
|---------|-------------|
| Subscription plans | Monthly ride packages for commuters |
| Insurance product | In-app trip insurance |
| Electric vehicle pilot | EV fleet integration |
| Driver benefits | Health insurance, fuel discounts for top drivers |
| Cross-town bus routes | Fixed-route minibus with app booking |

---

## 5. Scope Governance

### 5.1 Scope Change Process

1. **Request**: Any stakeholder submits a scope change request via GitHub issue
2. **Review**: PM + Tech Lead assess impact (effort, cost, timeline, risk)
3. **Decision**: Steering committee approves/rejects/defers weekly
4. **Documentation**: Approved changes update this document + project plan
5. **Communication**: All stakeholders notified of decision

### 5.2 Scope Prioritisation Framework

All scope items classified using:

- **P0**: Must have — platform fails to launch without it
- **P1**: Should have — important but workaround exists
- **P2**: Nice to have — deferred if timeline pressure

### 5.3 Out-of-Scope Boundary

Any feature not explicitly listed in the "In Scope" section is considered **out of scope** by default. Teams must NOT implement out-of-scope features without formal scope change approval.

---

## 6. Constraints

| Constraint | Description |
|------------|-------------|
| Timeline | Production launch by 2026-09-15 (90 days from start) |
| Budget | R1.74M total build cost (excluding monthly ops) |
| Team | 16 team members across 4 squads |
| Geography | Phalaborwa only — no expansion until stability proven |
| Regulation | Must comply with POPIA, FICA, PCI-DSS from day one |
| Platform | iOS + Android (React Native/Expo), no web PWA for riders/drivers |
