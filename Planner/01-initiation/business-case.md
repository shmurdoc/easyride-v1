# Business Case

**Phase:** 01 — Initiation  
**Document:** Business Case  
**Version:** 1.0.0  
**Date:** 2026-06-17  
**Status:** Draft

---

## Executive Summary

EasyRyde proposes to launch the first organised ride-hailing and food delivery platform for Phalaborwa, Limpopo — a mining town of ~150,000 people with no Uber, Bolt, or any formal ride-hailing service. By combining a central-admin dispatch model with cash + digital payments, EasyRyde addresses the daily transport needs of Phalaborwa's working-class population while creating flexible earning opportunities for local drivers. The platform targets 500 rides/day by month 3, with a projected break-even at month 9 and a 3-year IRR of 34%.

---

## 1. Market Context

### 1.1 Demographics

| Metric | Value |
|--------|-------|
| Population (Phalaborwa) | ~150,000 |
| Mining sector employment | ~12,000 (Palabora Mining Company + contractors) |
| Average monthly wage (town) | R6,000–R12,000 |
| Smartphone penetration | ~65% |
| Mobile money/cash usage | >80% of transactions cash-based |
| Current transport spend | ~R800–R1,500/month per worker |

### 1.2 Competitive Landscape

| Service | Available in Phalaborwa? | Notes |
|---------|--------------------------|-------|
| Uber | No | Not operational outside major metros |
| Bolt | No | Not operational outside major metros |
| InDriver | No | Limited to Gauteng/Western Cape |
| Local taxis (minibus) | Yes | Informal, cash-only, unreliable, no safety |
| Private hire (phone booking) | Yes | Several small operators, no app |
| **EasyRyde** | **Coming** | **First organised platform** |

**Key insight:** Phalaborwa is a classic "Uber gap" market — sufficient density and demand, but overlooked by major players who prioritise metros.

### 1.3 Transport Pain Points (Community Survey Data)

- **82%** of residents report waiting >30 minutes for a taxi during peak hours
- **67%** report safety concerns when walking to/from taxi ranks after dark
- **54%** have no way to book transport in advance — must go to the rank and wait
- **41%** report fare disputes with informal drivers (no standard pricing)
- **91%** would use a mobile app if it offered reliable, predictable pricing

---

## 2. Problem Statement

### Core Problem

Phalaborwa lacks any organised, on-demand transport service. Residents rely on informal minibus taxis and private phone-booked drivers, both of which suffer from:

1. **No reliability** — wait times are unpredictable, drivers may not show, no tracking
2. **No safety** — no driver verification, no SOS, no ride sharing/tracking with family
3. **No standard pricing** — fares are negotiated, leading to disputes
4. **Cash-only** — no digital payment option creates friction for the unbanked
5. **No food delivery** — no platform connects restaurants to customers for delivery

### Why Now

- Smartphone penetration has reached critical mass (65%+)
- COVID-19 accelerated digital payment adoption even in townships
- Palabora Mining Company has expressed interest in subsidised employee transport
- Local restaurants lack delivery infrastructure — EasyRyde fills this gap
- No competitor is actively planning to enter Phalaborwa (high barrier: ROI perception)

---

## 3. Solution

### 3.1 EasyRyde Platform Overview

EasyRyde is a **central-admin ride-hailing and food delivery platform** built on:

| Component | Tech | Purpose |
|-----------|------|---------|
| Rider App (iOS/Android) | React Native (Expo) | Ride booking, tracking, payment, safety |
| Driver App (iOS/Android) | React Native (Expo) | Accept rides, GPS tracking, earnings |
| Admin Dashboard (Web) | React + TailwindCSS | User mgmt, pricing, monitoring, compliance |
| API Backend | Laravel 13 (PHP 8.4) | Business logic, auth, payments, data |
| Real-Time Server | Node.js + Socket.io | GPS tracking, ride state, chat |
| Database | PostgreSQL 16 + PostGIS | Ride data, spatial queries |
| Cache | Redis 7 | Sessions, rate limiting, queue |
| Payments | Stripe + PayFast + Ozow | Card, EFT, instant EFT, cash |

### 3.2 Key Differentiators

| Feature | EasyRyde | Local Taxis | Phone Booking |
|---------|----------|-------------|---------------|
| Fixed pricing | Yes | No (negotiation) | Varies |
| GPS tracking | Yes (live) | No | No |
| Cash payments | Yes | Yes | Sometimes |
| Digital payments | Yes | No | No |
| Driver verification | Yes (FICA) | Minimal | Minimal |
| SOS / safety | Yes | No | No |
| Ratings & reviews | Yes | No | No |
| Food delivery | Yes | No | No |
| Scheduled rides | Yes | No | Sometimes |
| Admin oversight | Yes (central) | None | None |

---

## 4. Revenue Model

### 4.1 Revenue Streams

| Stream | Model | Est. Contribution |
|--------|-------|-------------------|
| Ride-hailing commission | 20% of fare | 65% |
| Food delivery commission | 25% of order (restaurant) + R10 delivery fee | 20% |
| Premium ride categories | 25% commission on XL/Premium | 10% |
| Promoted driver placements | R50/week for priority dispatch | 3% |
| Wallet float interest | Float deposits earning interest | 2% |

### 4.2 Pricing Model

| Ride Type | Base Fare | Per-km | Per-min | Min Fare |
|-----------|-----------|--------|---------|----------|
| Economy | R8.00 | R6.50 | R1.00 | R18.00 |
| Standard | R12.00 | R8.50 | R1.50 | R25.00 |
| Premium | R20.00 | R12.00 | R2.00 | R40.00 |
| XL (5+ pax) | R18.00 | R10.00 | R1.50 | R35.00 |

### 4.3 Financial Projections (Month 12)

| Metric | Conservative | Expected | Optimistic |
|--------|-------------|----------|------------|
| Daily rides | 400 | 500 | 700 |
| Avg fare | R42 | R48 | R55 |
| Gross platform rev/day | R3,360 | R4,800 | R7,700 |
| Gross platform rev/month | R100,800 | R144,000 | R231,000 |
| Active drivers | 40 | 50 | 70 |
| Food orders/day | 60 | 90 | 130 |
| Food rev/month | R27,000 | R40,500 | R58,500 |
| **Total monthly rev** | **R127,800** | **R184,500** | **R289,500** |

---

## 5. Success Metrics

### 5.1 Launch Phase (Month 1)

| Metric | Target |
|--------|--------|
| Rides/day | 50 |
| Active drivers | 15 |
| Rider app downloads | 1,000 |
| Rating (rider app) | 4.2+ |
| Average driver response time | <30 seconds |
| Ride cancellation rate | <10% |

### 5.2 Growth Phase (Month 2–3)

| Metric | Target |
|--------|--------|
| Rides/day | 500 |
| Active drivers | 50 |
| Rider app downloads | 5,000 |
| Rating (rider app) | 4.5+ |
| Ride cancellation rate | <5% |
| Food delivery partners | 15 restaurants |
| Driver weekly earnings (avg) | R2,500+ |

### 5.3 Steady State (Month 6+)

| Metric | Target |
|--------|--------|
| Rides/day | 800 |
| Active drivers | 80 |
| Weekly active riders | 3,000 |
| Repeat ride rate (30-day) | >60% |
| Net Promoter Score | >45 |
| Platform fee revenue/month | R200,000+ |

---

## 6. Cost Analysis

### 6.1 Build Costs (One-Time)

| Item | Cost (ZAR) |
|------|-----------|
| Development (16 team members × 410 hours) | R1,476,000 |
| Infrastructure setup (cloud, CI/CD, monitoring) | R85,000 |
| Legal & compliance (POPIA, FICA, PCI-DSS advisory) | R120,000 |
| Office setup & hardware | R60,000 |
| **Total build** | **R1,741,000** |

### 6.2 Monthly Operating Costs (Month 6)

| Item | Cost (ZAR/month) |
|------|-----------------|
| Cloud infrastructure | R35,000 |
| Payment gateway fees | R8,500 |
| SMS / notification costs | R4,500 |
| Support staff (2 FTEs) | R28,000 |
| Marketing & promotions | R25,000 |
| Insurance & compliance | R6,000 |
| Miscellaneous | R5,000 |
| **Total monthly** | **R112,000** |

### 6.3 Break-Even Analysis

| Scenario | Break-Even Month | Cumulative Investment |
|----------|------------------|---------------------|
| Conservative | Month 11 | R2,861,000 |
| Expected | Month 9 | R2,401,000 |
| Optimistic | Month 7 | R1,981,000 |

---

## 7. Risk-Adjusted ROI Analysis

### 7.1 Risk Factors & Probability

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Low adoption (riders) | 25% | High | Community launch events, referral bonuses |
| Low driver supply | 30% | High | Guaranteed minimum earnings for first 100 rides |
| Competitor enters market | 15% | Medium | Build switching costs (wallet, ratings, history) |
| Regulatory change | 10% | High | Legal advisor on retainer, engage local govt |
| Payment fraud | 20% | Medium | 24h escrow, fraud detection ML model, limits |
| Currency / economic downturn | 30% | Medium | Lean ops, variable cost structure |
| Tech failure / downtime | 15% | High | Redundant infrastructure, runbooks, drills |

### 7.2 ROI Calculations

**Expected scenario (3-year horizon):**

| Year | Revenue | Costs | Net Cash Flow | Cumulative |
|------|---------|-------|---------------|------------|
| Year 1 (build + launch) | R1,380,000 | R2,957,000 | -R1,577,000 | -R1,577,000 |
| Year 2 | R3,420,000 | R1,904,000 | R1,516,000 | -R61,000 |
| Year 3 | R5,760,000 | R2,208,000 | R3,552,000 | R3,491,000 |

**3-Year Metrics:**

| Metric | Value |
|--------|-------|
| Net Present Value (10% discount) | R2,180,000 |
| IRR | 34% |
| Payback period | 25 months |
| ROI (3-year) | 200% |

**Conservative scenario (3-year):**

| Metric | Value |
|--------|-------|
| NPV | R970,000 |
| IRR | 22% |
| Payback period | 31 months |
| ROI (3-year) | 112% |

---

## 8. Strategic Alignment

### 8.1 Market Timing

Phalaborwa represents a **first-mover opportunity** in an underserved market. The window is 12–18 months before either a major player (Uber/Bolt) expands to secondary cities or a local competitor emerges. Every month of delay reduces TAM capture.

### 8.2 Adjacent Opportunities

Once operational, EasyRyde can expand to:

- **Nearby towns**: Hoedspruit (30km), Tzaneen (100km), Bushbuckridge (90km)
- **Logistics**: Parcel delivery, bulk goods transport
- **Medical transport**: Scheduled hospital trips for dialysis, checkups
- **Tourism**: Airport transfers (Phalaborwa Airport serves Kruger Park)

### 8.3 Social Impact

- **Employment**: 50+ direct driver jobs by month 3, growing to 200+ by year 2
- **Safety**: GPS-tracked, verified drivers with SOS button
- **Accessibility**: Affordable transport enabling access to jobs, healthcare, education
- **Financial inclusion**: Digital wallet and payment history for unbanked drivers

---

## 9. Recommendation

**Proceed** with the EasyRyde production readiness programme. The business case demonstrates:

1. Clear, unserved demand in a defined geographic market
2. First-mover advantage with defensible switching costs
3. Achievable break-even within 9 months (expected case)
4. Attractive 34% IRR with manageable downside risk
5. Strong social impact aligned with RSA digital inclusion goals

The total required investment of **R1.74M** is justified by the projected R3.49M net return over 3 years and the strategic value of owning the ride-hailing market in Phalaborwa and surrounding towns.
