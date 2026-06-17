# EasyRyde — Risk Register

**Phase:** 05 — Implementation Plan
**Version:** 1.0.0
**Updated:** 2026-06-17

---

## Risk Scoring

| Score | Likelihood | Impact |
|-------|-----------|--------|
| 1 | Very Unlikely | Negligible |
| 2 | Unlikely | Minor |
| 3 | Possible | Moderate |
| 4 | Likely | Severe |
| 5 | Almost Certain | Critical |

**Risk Score = Likelihood × Impact** (max 25)

### Acceptability Thresholds

| Score | Rating | Action |
|-------|--------|--------|
| 1–4 | Low | Accept, monitor quarterly |
| 5–10 | Medium | Active monitoring, contingency plan |
| 11–16 | High | Mitigation plan required, track weekly |
| 17–25 | Critical | Immediate mitigation, block release if not resolved |

---

## Risk Register

### R01: Payment Gateway Downtime (PayFast/Ozow)

| Field | Value |
|-------|-------|
| **Description** | PayFast and Ozow have historically unreliable uptime in South Africa. A gateway outage blocks all payment processing. |
| **Category** | Infrastructure / Third-Party |
| **Likelihood** | 4 (Likely — SA gateways have known stability issues) |
| **Impact** | 5 (Critical — platform cannot process payments) |
| **Risk Score** | **20 — CRITICAL** |
| **Detection** | Uptime monitoring (Pingdom), webhook timeout alerts |
| **Mitigation** | Implement circuit breaker pattern: if gateway returns 5xx > 5 in 1 minute, fall back to alternative gateway. If all gateways down, force cash-only mode. Wallet pre-funding for regular riders. |
| **Contingency** | Cache payment attempts, process in batch when gateway recovers. Notify admin immediately. |
| **Owner** | builder-3 |
| **Status** | 🔴 Active — requires mitigation before launch |

---

### R02: App Store Rejection (Apple / Google Play)

| Field | Value |
|-------|-------|
| **Description** | Apple or Google Play reject the app for guideline violations: location permissions justification, cash payment handling, SOS button functionality, or data privacy issues. |
| **Category** | Legal / Compliance |
| **Likelihood** | 3 (Possible — ride-hailing apps face scrutiny) |
| **Impact** | 5 (Critical — blocks public launch on iOS or Android) |
| **Risk Score** | **15 — HIGH** |
| **Detection** | App store rejection notice |
| **Mitigation** | Pre-submit to Apple Review (expedited) 2 weeks before launch. Follow Apple's "Ride-Hailing" category guidelines. Justify location background usage explicitly. Ensure cash payment flow does not expose sensitive data. Privacy policy links in app. TestFlight beta 1 month before submission. |
| **Contingency** | Address rejection reasons immediately. Have legal review all wording. |
| **Owner** | builder-1, reviewer |
| **Status** | 🟡 Active — mitigation in progress during E4 |

---

### R03: Driver Shortage at Launch

| Field | Value |
|-------|-------|
| **Description** | Insufficient drivers registered and online at launch results in long wait times, ride failures, and poor first impressions. Phalaborwa has ~50,000 population — driver pool is limited. |
| **Category** | Business / Operations |
| **Likelihood** | 4 (Likely — common problem for ride-hailing in small cities) |
| **Impact** | 4 (Severe — riders churn after long wait times or no-driver responses) |
| **Risk Score** | **16 — HIGH** |
| **Detection** | Admin dashboard shows <10 online drivers during peak hours |
| **Mitigation** | Pre-recruit 50+ drivers before launch with sign-up bonus (R500). Partner with local taxi associations. Offer referral bonuses for existing drivers. Launch in phases (pilot week with 10 drivers → ramp up). |
| **Contingency** | Extend pilot phase, increase driver incentives, reduce service area to only high-density zones (CBD, mall, hospital). |
| **Owner** | Project lead |
| **Status** | 🟡 Active — business-side recruitment ongoing |

---

### R04: Google Maps API Costs Exceeding Budget

| Field | Value |
|-------|-------|
| **Description** | Google Maps Platform (Directions, Places, Maps SDK, Routes API) costs scale with usage. SA data is expensive. A single ride can cost R0.10–R0.30 in API calls. At 500 rides/day, monthly cost could exceed R5,000–R10,000. |
| **Category** | Financial |
| **Likelihood** | 4 (Likely — costs are easy to underestimate) |
| **Impact** | 3 (Moderate — budget overrun but not business-ending) |
| **Risk Score** | **12 — HIGH** |
| **Detection** | Google Cloud billing alerts at 50%/75%/90% of monthly budget |
| **Mitigation** | Cache geocoding results aggressively (Redis, 24h TTL). Use OSRM for routing (free, self-hosted) instead of Google Directions. Implement Haversine distance calculation for nearby driver queries (no API call needed). Use Places API only for autocomplete, not geocoding. Tiered pricing based on ride category (premium rides absorb higher API costs). |
| **Contingency** | Switch to Mapbox (lower SA pricing) or OpenStreetMap tiles. Reduce Places autocomplete to only Phalaborwa locations (pre-loaded). |
| **Owner** | builder-3, release-engineer |
| **Status** | 🟡 Active — OSRM PoC needed |

---

### R05: Mining Town Cellular Data Reliability

| Field | Value |
|-------|-------|
| **Description** | Phalaborwa is a mining town. Cellular data coverage can be unreliable, especially in mine-adjacent areas and townships. High latency, packet loss, and intermittent connectivity will affect app performance. |
| **Category** | Infrastructure / Network |
| **Likelihood** | 4 (Likely — known issue in SA mining towns) |
| **Impact** | 4 (Severe — app becomes unusable without connectivity) |
| **Risk Score** | **16 — HIGH** |
| **Detection** | App diagnostic logs showing high network failure rates, WebSocket disconnections |
| **Mitigation** | Offline-first architecture (E4-T1): cache map tiles, ride history, fare estimates. Queue ride requests and send on reconnect. Reduce WebSocket ping interval to detect disconnection faster. Use smaller data payloads (compress GPS coordinates, batch updates). Graceful degradation: show cached data with "last updated" timestamp. |
| **Contingency** | SMS-based ride booking fallback (Twilio number). USSD interface for basic ride requests. |
| **Owner** | builder-2, builder-1 |
| **Status** | 🔴 Active — offline mode is E4-T1, critical path |

---

### R06: Cash Payment Reconciliation Fraud

| Field | Value |
|-------|-------|
| **Description** | Drivers mark rides as "paid in cash" but collect more from the rider than the system fare, or drivers fraudulently mark as cash-paid when rider already paid via gateway. Collusion between driver and rider to avoid platform fees. |
| **Category** | Fraud / Financial |
| **Likelihood** | 4 (Likely — cash payments are inherently fraud-prone) |
| **Impact** | 3 (Moderate — revenue loss, but detectable) |
| **Risk Score** | **12 — HIGH** |
| **Detection** | Cash reconciliation system (E2-T5) flags discrepancies between driver-reported cash and expected fare. Anomaly detection: driver with >80% cash payments triggers review. |
| **Mitigation** | Platform fee deducted from driver wallet immediately on cash-marked ride. Random audit: 5% of cash rides get rider call-back to verify amount paid. Escrow balance requirement: driver must maintain positive wallet balance. Progressive fee structure: drivers with high cash ratios pay higher platform fees. |
| **Contingency** | Manual review of flagged drivers. Suspend drivers with verified fraud. |
| **Owner** | builder-3, admin team |
| **Status** | 🟡 Active — reconciliation system being built in E2-T5 |

---

### R07: POPIA Compliance Gap During MVP

| Field | Value |
|-------|-------|
| **Description** | South Africa's Protection of Personal Information Act (POPIA) requires explicit consent for data collection, purpose limitation, data subject access, and breach notification. Rushing to launch without POPIA compliance could result in fines up to R10M or imprisonment. |
| **Category** | Legal / Compliance |
| **Likelihood** | 3 (Possible — compliance is easy to deprioritize) |
| **Impact** | 5 (Critical — regulatory fines, reputational damage, business closure risk) |
| **Risk Score** | **15 — HIGH** |
| **Detection** | Legal audit, user complaint to Information Regulator |
| **Mitigation** | Implement consent checkboxes on registration (separate for: location tracking, marketing, data sharing). Consent records stored with versioning. Privacy policy linked from app and web. Data export API (`GET /api/v1/user/export-data`) and delete/anonymize endpoint. Breach notification procedure documented. PII encryption already in E1-T5. |
| **Contingency** | Engage SA privacy lawyer for pre-launch audit. Register with Information Regulator before launch. |
| **Owner** | reviewer, project lead |
| **Status** | 🟡 Active — consent management in scope |

---

### R08: Scope Creep on Food Delivery Integration

| Field | Value |
|-------|-------|
| **Description** | The food delivery integration ("Phalaborwa in my hand") expands scope significantly: restaurant management, menu systems, food order lifecycle, preparation times, multi-stop routing, partner app API. This could balloon from 60h to 120h+ if not tightly scoped. |
| **Category** | Project Management |
| **Likelihood** | 5 (Almost Certain — food delivery is complex) |
| **Impact** | 3 (Moderate — delays other milestones, but can be deferred) |
| **Risk Score** | **15 — HIGH** |
| **Detection** | Weekly sprint review showing food tasks expanding beyond estimated hours |
| **Mitigation** | Strictly scope MVP food: "order → dispatch → deliver" only. No restaurant-facing app (use admin panel). No complex menu management (simple item list). No real-time preparation tracking (manual status updates). Defer: multi-restaurant orders, scheduled food delivery, loyalty programs. |
| **Contingency** | Cut food delivery from MVP, launch with ride-hailing only. Add food in v1.1. |
| **Owner** | project lead |
| **Status** | 🟡 Active — scope tightly defined in E5-T4/T5 |

---

### R09: Single Developer Bottleneck (builder-3)

| Field | Value |
|-------|-------|
| **Description** | builder-3 is assigned to ALL backend tasks (E1, E2, E5 backend, E7 backend). If builder-3 is unavailable (sick, leaves, blocked), the entire backend workstream stalls. |
| **Category** | Resource / Personnel |
| **Likelihood** | 3 (Possible — single point of failure) |
| **Impact** | 5 (Critical — 154+ hours of backend work has no backup) |
| **Risk Score** | **15 — HIGH** |
| **Detection** | Builder-3 misses more than 2 consecutive standups or is blocked > 24h |
| **Mitigation** | Knowledge transfer sessions weekly (builder-3 presents architecture decisions to team). Document all payment gateway integration details in code comments + runbook. Pair programming on critical paths (E2-T1, E2-T2, E2-T3). Cross-train builder-2 on basic Laravel tasks. Ensure builder-3 takes days off only during QA-heavy weeks. |
| **Contingency** | Hire/second a PHP developer. Extend timeline by 2 weeks. Reduce E5 scope (cut food backend). |
| **Owner** | project lead |
| **Status** | 🟡 Active — knowledge transfer scheduled |

---

### R10: Database Performance with Spatial Queries Under Load

| Field | Value |
|-------|-------|
| **Description** | PostGIS spatial queries (nearby driver search, ride within area, route intersection) are computationally expensive. Under load (100+ concurrent ride requests), these queries could become slow, causing ride request timeouts. |
| **Category** | Performance |
| **Likelihood** | 3 (Possible — depends on actual load) |
| **Impact** | 4 (Severe — ride requests fail or time out) |
| **Risk Score** | **12 — HIGH** |
| **Detection** | PostgreSQL slow query log showing queries > 500ms. P95 ride request time > 5s. |
| **Mitigation** | Use Redis geo-index (GEOADD, GEORADIUS) for nearby driver queries — sub-millisecond vs PostGIS milliseconds. Spatial indexes on PostGIS columns. Query optimization: limit search radius, use indexed bounding box pre-filter before exact distance. Connection pooling (PgBouncer) to handle concurrent connections. |
| **Contingency** | Move all spatial queries to Redis. Cache popular location lookups. Reduce nearby driver search radius during peak (e.g., 5km instead of 10km). |
| **Owner** | builder-3, release-engineer |
| **Status** | 🟢 Planned — load test (E6-T5) will validate |

---

### R11: Firebase Push Notification Delivery Delays on Chinese Devices

| Field | Value |
|-------|-------|
| **Description** | Xiaomi, Huawei, and other Chinese-branded phones (popular in SA due to affordability) have aggressive battery optimization that blocks FCM push notifications. Notifications arrive late or not at all. |
| **Category** | Technical / Mobile |
| **Likelihood** | 5 (Almost Certain — these devices are widespread in SA) |
| **Impact** | 3 (Moderate — core app still works, but real-time notifications fail) |
| **Risk Score** | **15 — HIGH** |
| **Detection** | Push notification delivery rate analytics showing <80% for specific device models |
| **Mitigation** | Guide users to disable battery optimization for EasyRyde (in-app prompt). Use foreground service for driver app (keeps process alive). Implement polling fallback: rider app polls `GET /api/v1/rides/current` every 30s as backup. Use WebSocket for real-time updates when app is foreground. For Huawei (no Google services): use HMS Push Kit as alternative. |
| **Contingency** | SMS fallback for critical notifications (ride accepted, driver arrived). Increase polling frequency for devices with known notification issues. |
| **Owner** | builder-2 |
| **Status** | 🟡 Active — polling fallback in scope |

---

### R12: Currency Conversion Errors (ZAR Transactions)

| Field | Value |
|-------|-------|
| **Description** | All transactions are in South African Rand (ZAR). Stripe and PayFast expect amounts in cents (integers), while the system stores amounts in ZAR (decimals). A conversion mismatch could result in charging R100 instead of 100 cents (R1) or vice versa. |
| **Category** | Technical / Financial |
| **Likelihood** | 3 (Possible — currency handling is error-prone) |
| **Impact** | 5 (Critical — wrong charges could be illegal under SA consumer law) |
| **Risk Score** | **15 — HIGH** |
| **Detection** | Staging test with test cards reveals incorrect amounts. Code review of all amount-to-cents conversions. |
| **Mitigation** | Single `CentsConverter` helper class: `toCents(float $zar): int` and `toZar(int $cents): float`. All payment gateways use the same converter. Integration tests verify: R150.50 → 15050 cents. No manual multiplication/division by 100 anywhere — always use the converter. Code review check: "Every amount sent to a gateway goes through CentsConverter." |
| **Contingency** | Refund incorrect charges immediately. Manual reconciliation of first 100 payments before automatic release. |
| **Owner** | builder-3, reviewer |
| **Status** | 🟡 Active — converter class in scope |

---

### R13: WebSocket Server Crash During Peak

| Field | Value |
|-------|-------|
| **Description** | Socket.io server handling 10K+ concurrent connections crashes due to memory exhaustion, event loop blocking, or unhandled error. All real-time features stop: GPS tracking, ride matching, chat, SOS alerts. |
| **Category** | Technical / Infrastructure |
| **Likelihood** | 3 (Possible — WebSocket servers are harder to scale than HTTP) |
| **Impact** | 5 (Critical — core real-time features stop; drivers/riders can't communicate) |
| **Risk Score** | **15 — HIGH** |
| **Detection** | Uptime monitoring on Socket.io health endpoint. Redis pub/sub error logs. Grafana alert on connection count drop > 10%. |
| **Mitigation** | Auto-scaling: Socket.io with Redis adapter for horizontal scaling (multiple server instances). Cluster mode: use all CPU cores (Node.js cluster). Connection limits per server (max 5000 connections per instance). Graceful degradation: if WebSocket disconnects, mobile app falls back to HTTP polling. Circuit breaker: if all WebSocket servers down, ride requests go via HTTP REST. |
| **Contingency** | Auto-restart via supervisor/Docker restart policy. Scale up server count via Docker Compose scale. Use a WebSocket-specific health check for load balancer routing. |
| **Owner** | builder-2, release-engineer |
| **Status** | 🟡 Active — Redis adapter configured, load testing planned (E6-T5) |

---

### R14: Driver Falsifying Location Data

| Field | Value |
|-------|-------|
| **Description** | Drivers spoof their GPS location to appear closer to ride requests than they actually are. Rider waits for a driver who is actually 15 minutes away, not 3 minutes. |
| **Category** | Fraud / Technical |
| **Likelihood** | 3 (Possible — GPS spoofing apps are common on Android) |
| **Impact** | 3 (Moderate — poor rider experience, driver gaming the system) |
| **Risk Score** | **9 — MEDIUM** |
| **Detection** | Server-side route check: compare straight-line distance from driver to pickup vs. time-based ETA. Deviation > 50% triggers flag. Multiple complaints from riders that driver ETA was wrong. |
| **Mitigation** | Server-side validation: check if new location is physically possible (max 200km/h movement between updates). If impossible, reject update and mark driver suspect. Use Google Maps Routes API to verify ETA from driver → pickup periodically. Driver trust score: drivers with frequent location discrepancies get lower match priority. Manual review of flagged drivers. |
| **Contingency** | Force location verification via photo of odometer or landmark (extreme cases). Temporary suspension during investigation. |
| **Owner** | builder-3, admin team |
| **Status** | 🟢 Planned — server-side validation in E3-T2 |

---

### R15: Admin Pricing Mistakes (No Undo on Fare Changes)

| Field | Value |
|-------|-------|
| **Description** | Admin accidentally sets base fare to R0.00 or surge multiplier to 3.0 during peak. All rides get extreme pricing or free rides. No immediate undo mechanism — riders/drivers see wrong prices and react. |
| **Category** | Operational / Financial |
| **Likelihood** | 3 (Possible — admin error is common with complex pricing) |
| **Impact** | 4 (Severe — financial loss or rider/driver anger) |
| **Risk Score** | **12 — HIGH** |
| **Detection** | Audit log shows rapid price change. Driver/rider complaints flood support. Anomaly detection: revenue suddenly drops to 0 or surges 3x. |
| **Mitigation** | Pricing editor (E5-T3) uses draft → preview → publish workflow. Preview shows estimated impact: "Base fare change from R15 to R0 will result in estimated revenue loss of Rxxx/day." High-impact changes (>20% change) require second admin approval. Max surge cap enforced in backend (cannot exceed 3.0 even if admin sets higher). Audit trail records all changes with admin identity. |
| **Contingency** | One-click "Revert to Previous" button in pricing editor. Kill switch: admin can force-default all pricing to "Standard" config. Notify all online drivers of pricing change with grace period (30min before new rates apply to new rides). |
| **Owner** | builder-3, admin team |
| **Status** | 🟡 Active — pricing editor in E5-T3 |

---

### R16: PostGIS Extension Not Available on Production DB

| Field | Value |
|-------|-------|
| **Description** | The production PostgreSQL instance may not have the PostGIS extension installed or enabled. Managed DB providers (RDS, DigitalOcean) sometimes require extra steps to enable PostGIS. |
| **Category** | Technical / Infrastructure |
| **Likelihood** | 3 (Possible — depends on DB provider) |
| **Impact** | 4 (Severe — all migrations fail, app cannot start) |
| **Risk Score** | **12 — HIGH** |
| **Detection** | `php artisan migrate` fails with "extension not found" |
| **Mitigation** | Document PostGIS setup for all supported providers. Add `php artisan db:require-postgis` check command. Migration checks for PostGIS extension before running spatial migrations: `if (!DB::select("SELECT PostGIS_Version()")) throw new Exception("PostGIS required")`. |
| **Contingency** | Switch to Redis geo-index for all spatial queries (no PostGIS dependency). Use Laravel's raw geometry or math-based Haversine queries as last resort. |
| **Owner** | release-engineer |
| **Status** | 🟢 Planned — provider selection pending |

---

### R17: Transactional Integrity Failure (Payment + Ride State)

| Field | Value |
|-------|-------|
| **Description** | The payment flow spans multiple systems (Laravel DB, Stripe/PayFast/Ozow, Redis queue, wallet). A failure halfway through could leave a ride marked "completed" but payment not collected, or payment collected but ride still "in_progress." |
| **Category** | Technical / Data Integrity |
| **Likelihood** | 3 (Possible — distributed transactions are hard) |
| **Impact** | 5 (Critical — financial loss and data inconsistency) |
| **Risk Score** | **15 — HIGH** |
| **Detection** | Reconciliation report shows payments without rides or rides without payments. Failed queue job alerts. |
| **Mitigation** | Use database transactions for all multi-step operations. Create `payment_attempts` dead letter queue for failed payments. Implement Saga pattern for ride → payment flow: compensating transactions for each step. Queue jobs have `$tries = 3` and `backoff = [10, 60, 300]` seconds. Failed jobs go to `failed_jobs` table with admin notification. Hourly reconciliation command checks for orphaned records. |
| **Contingency** | Manual correction via admin panel. Refund + retry for payment failures. |
| **Owner** | builder-3 |
| **Status** | 🟡 Active — compensating transactions in E2-T4 |

---

## Risk Summary

### Critical (17-25)

| ID | Risk | Score | Owner | Status |
|----|------|-------|-------|--------|
| R01 | Payment gateway downtime | 20 | builder-3 | 🔴 Circuit breaker needed |
| R05 | Mining town data reliability | 16 | builder-1, builder-2 | 🔴 Offline mode critical |
| R03 | Driver shortage at launch | 16 | Project lead | 🟡 Recruitment ongoing |

### High (11-16)

| ID | Risk | Score | Owner | Status |
|----|------|-------|-------|--------|
| R07 | POPIA compliance gap | 15 | reviewer, project lead | 🟡 Consent management in scope |
| R08 | Food delivery scope creep | 15 | Project lead | 🟡 Strictly MVP-scoped |
| R09 | Single developer bottleneck | 15 | Project lead | 🟡 KT sessions scheduled |
| R11 | Chinese device push delays | 15 | builder-2 | 🟡 Polling fallback planned |
| R12 | Currency conversion errors | 15 | builder-3, reviewer | 🟡 CentsConverter in scope |
| R13 | WebSocket crash during peak | 15 | builder-2, release-engineer | 🟡 Redis adapter configured |
| R17 | Transactional integrity failure | 15 | builder-3 | 🟡 Saga pattern planned |
| R02 | App Store rejection | 15 | builder-1, reviewer | 🟡 Pre-submit plan |
| R04 | Google Maps API costs | 12 | builder-3, release-engineer | 🟡 OSRM fallback ready |
| R06 | Cash reconciliation fraud | 12 | builder-3 | 🟡 System in E2-T5 |
| R10 | Spatial query performance | 12 | builder-3, release-engineer | 🟢 Load test in E6-T5 |
| R15 | Admin pricing mistakes | 12 | builder-3 | 🟡 Approval workflow in E5-T3 |
| R16 | PostGIS missing on prod | 12 | release-engineer | 🟢 Provider selection pending |

### Medium (5-10)

| ID | Risk | Score | Owner | Status |
|----|------|-------|-------|--------|
| R14 | Driver GPS spoofing | 9 | builder-3, admin | 🟢 Planned validation |

---

## Risk Mitigation Cost Estimate

| Risk | Mitigation Cost (hours) | Contingency Cost (hours) |
|------|------------------------|--------------------------|
| R01 Payment gateway downtime | 8h (circuit breaker) | 4h (manual batch processing) |
| R02 App Store rejection | 6h (pre-submit prep) | 12h (rejection remediation) |
| R03 Driver shortage | 0h (business concern) | 0h (business concern) |
| R04 Google Maps costs | 6h (OSRM + caching) | 20h (full Mapbox migration) |
| R05 Data reliability | 12h (offline mode E4-T1) | 8h (SMS fallback) |
| R06 Cash fraud | 8h (reconciliation E2-T5) | 4h (manual audit process) |
| R07 POPIA | 6h (consent management) | 20h (legal remediation) |
| R08 Scope creep | 2h (strict scope doc) | 40h (def erred feature cost) |
| R09 Bottleneck | 4h (KT sessions) | 80h (hire/train replacement) |
| R10 Spatial perf | 4h (Redis geo-index) | 4h (query tuning) |
| R11 Chinese devices | 6h (polling fallback) | 8h (HMS integration) |
| R12 Currency errors | 2h (CentsConverter) | 4h (refund processing) |
| R13 WebSocket crash | 6h (Redis adapter + cluster) | 4h (HTTP polling fallback) |
| R14 GPS spoofing | 4h (server-side validation) | 2h (manual review process) |
| R15 Pricing mistakes | 6h (approval workflow) | 2h (revert button) |
| R16 PostGIS | 1h (check command) | 4h (Redis-only fallback) |
| R17 Tx integrity | 8h (Saga pattern) | 4h (reconciliation cron) |
| **Total** | **89h** | **220h (max contingency)** |

---

## Risk Review Schedule

| Review | Frequency | Participants |
|--------|-----------|--------------|
| **Weekly Sprint Review** | Weekly | All team — review top 5 risks by score |
| **Monthly Deep Dive** | Monthly | Project lead + builder-3 — assess all risks, update scores |
| **Pre-Launch Gate** | Before E7 | Full team — block launch if any CRITICAL risks are unresolved |
| **Post-Launch (Week 1)** | Daily ops | release-engineer + admin — monitor R01, R04, R13, R17 |
| **Post-Launch (Month 1)** | Weekly | Project lead — review new risks |

---

*End of risk-register.md*
