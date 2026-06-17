# Non-Functional Requirements

**Phase:** 02 — Requirements  
**Document:** Non-Functional Specification  
**Version:** 1.0.0  
**Date:** 2026-06-17  
**Status:** Draft

---

## 1. Performance

### 1.1 API Response Times

| Endpoint Category | p50 | p95 | p99 | Measurement Tool |
|-------------------|-----|-----|-----|-----------------|
| Read endpoints (GET) | <100ms | <300ms | <600ms | Laravel Telescope + Sentry |
| Write endpoints (POST/PUT) | <200ms | <500ms | <1,000ms | Laravel Telescope + Sentry |
| Auth endpoints (OTP, login) | <500ms | <1,500ms | <3,000ms | Laravel Telescope + Sentry |
| Fare estimation | <200ms | <400ms | <800ms | Custom middleware |
| Payment processing | <1,000ms | <3,000ms | <5,000ms | Payment gateway + Sentry |

### 1.2 Real-Time Performance (Socket.io)

| Metric | Target | Measurement |
|--------|--------|-------------|
| GPS location delivery (driver → server → rider) | <200ms p95 | Socket.io event timing |
| Ride state change broadcast | <100ms p95 | Socket.io event timing |
| Chat message delivery | <200ms p95 | Socket.io event timing |
| Maximum reconnect time | <3s | Client reconnection timer |
| Concurrent WebSocket connections | 10,000 | Load test |
| Message throughput | 5,000 messages/second | Load test |

### 1.3 Mobile App Performance

| Metric | Target | Device Tier | Measurement |
|--------|--------|-------------|-------------|
| Cold start time | <1.5s | Mid-range | React Native profiler |
| Warm start time | <0.5s | Mid-range | React Native profiler |
| Ride screen render | <500ms | Mid-range | React Native profiler |
| Map render (pickup → driver movement) | <1s | Mid-range | Custom timing |
| App bundle size | <50MB | All | Expo build output |
| Memory usage (typical session) | <150MB | All | Xcode/Android profiler |
| Battery drain (1 hour GPS tracking) | <10% | All | Battery profiler |

### 1.4 Database Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| Query response (reads) | <50ms p95 | PostgreSQL slow query log |
| Query response (writes) | <100ms p95 | PostgreSQL slow query log |
| PostGIS spatial query (nearby drivers) | <50ms | Query timing |
| Connection pool size | 50 (max 100) | PgBouncer metrics |
| Index coverage | >95% of queries use index | `pg_stat_user_tables` |

---

## 2. Scalability

### 2.1 Load Targets

| Aspect | Current Target | Growth Target (6 months) | Notes |
|--------|---------------|--------------------------|-------|
| Concurrent rides | 100 | 500 | Each ride = 1 rider + 1 driver |
| Active daily users | 5,000 | 20,000 | Unique riders per day |
| Driver peak concurrency | 80 | 300 | Online during peak hours |
| WebSocket connections | 10,000 | 30,000 | All riders tracking + drivers |
| API requests/minute | 5,000 | 20,000 | Average across all endpoints |
| Scheduled jobs | 50/day | 200/day | Payouts, cleanups, reports |
| Push notifications/day | 20,000 | 100,000 | FCM throughput |

### 2.2 Scaling Strategy

| Component | Strategy | Trigger | Action |
|-----------|----------|---------|--------|
| API (Laravel) | Horizontal (multiple app containers) | CPU >70% or request queue >100 | Auto-scale via Docker Swarm/K8s |
| WebSocket server | Horizontal (sticky sessions + Redis adapter) | Connections >5,000 per instance | Add Socket.io node |
| PostgreSQL | Vertical first → Read replicas | Connection pool >80% or query queue | Add read replica |
| Redis | Vertical first → Cluster | Memory >70% or CPU >60% | Enable Redis Cluster |
| Queue worker | Horizontal | Queue depth >1,000 | Auto-scale workers |
| File storage | Object storage (S3-compatible) | Storage >80% | Auto-expand or lifecycle policy |

### 2.3 Auto-Scaling Configuration

| Service | Min Instances | Max Instances | Scale Up | Scale Down |
|---------|--------------|---------------|----------|------------|
| PHP-FPM (Laravel) | 2 | 10 | CPU >70% for 2min | CPU <30% for 5min |
| Node.js (Socket.io) | 1 | 5 | Connections >3,000 per instance | Connections <1,000 for 5min |
| Queue workers | 1 | 8 | Queue depth >500 | Queue depth <50 for 5min |
| PostgreSQL | 1 | 1 (vertical) | N/A (manual vertical scaling) | N/A |

---

## 3. Availability

### 3.1 Uptime Targets

| Tier | Uptime % | Max Monthly Downtime | Scope |
|------|----------|---------------------|-------|
| Core platform | 99.9% | 43 minutes | API, ride dispatch, payments, auth |
| Admin dashboard | 99.5% | 3.6 hours | Web admin panel |
| Food delivery | 99.5% | 3.6 hours | Restaurant ordering + dispatch |
| Real-time tracking | 99.0% | 7.2 hours | GPS location streaming |

### 3.2 Planned Maintenance

| Aspect | Policy |
|--------|--------|
| Window | 2:00 AM – 4:00 AM SAST (Sunday) |
| Notification | 7 days advance notice via email + in-app |
| Max duration | 60 minutes |
| Frequency | Max 1 per week |
| Downtime during window | Counts against uptime SLA |

### 3.3 Redundancy

| Component | Redundancy Strategy | Failover Time |
|-----------|--------------------|---------------|
| Web server (Laravel) | Multiple containers behind load balancer | <10s |
| WebSocket server | Multiple nodes with Redis pub/sub | <5s |
| PostgreSQL | WAL streaming to standby. PgBouncer for connection pooling. | <60s (manual failover) |
| Redis | Sentinel (3 nodes) | <10s |
| Queue (Redis) | Persistent job table in PostgreSQL as fallback | <30s |
| File storage | S3-compatible with cross-region replication | N/A (eventual consistency) |

### 3.4 Disaster Recovery

| Aspect | Requirement |
|--------|-------------|
| RPO (Recovery Point Objective) | 5 minutes (WAL streaming) + 24h snapshot |
| RTO (Recovery Time Objective) | 2 hours for full recovery |
| Backup frequency | PostgreSQL: continuous WAL + daily snapshot. Files: daily. |
| Backup retention | Snapshots: 30 days. WAL: 7 days. Monthly: 12 months. |
| DR test frequency | Quarterly (full restore + smoke test) |
| DR location | Same region, different availability zone |

---

## 4. Security

### 4.1 Authentication & Authorization

| Requirement | Standard |
|-------------|----------|
| Password hashing | bcrypt, cost factor 12 |
| JWT signing | RS256 (2048-bit key) |
| Access token lifetime | 15 minutes |
| Refresh token lifetime | 30 days (rotate on use) |
| Session invalidation | On password change, account suspension, admin force-logout |
| 2FA (admin only) | TOTP (time-based one-time password, 30s window) |
| API key rotation | Every 90 days for service accounts |

### 4.2 Rate Limiting

| Scope | Limit | Burst | Backend |
|-------|-------|-------|---------|
| Auth endpoints (/api/auth/*) | 10 requests/min | 15 | Redis |
| General API (/api/*) | 60 requests/min | 80 | Redis |
| Fare estimation | 30 requests/min | 40 | Redis |
| SOS endpoint | 5 requests/min | 10 | Redis |
| File upload | 10 requests/min | 15 | Redis |
| OTP request | 3 requests/10min per phone | 5 | Redis |

### 4.3 Data Protection

| Data Type | Encryption at Rest | Encryption in Transit | Notes |
|-----------|-------------------|----------------------|-------|
| PII (name, email, phone) | AES-256 | TLS 1.3 | Column-level encryption |
| Payment tokens | N/A (tokenised by Stripe) | TLS 1.3 | Never stored raw |
| Driver documents | AES-256 (S3 SSE) | TLS 1.3 | Server-side encryption |
| GPS locations | AES-256 | TLS 1.3 | Anonymised after 90 days |
| Chat messages | AES-256 | TLS 1.3 + WebSocket WSS | Deleted after 1 year |
| Passwords | bcrypt (not reversible) | N/A | Never logged |
| API keys | AES-256 (env vars) | TLS 1.3 | Rotated every 90 days |

### 4.4 Network Security

| Layer | Protection |
|-------|------------|
| WAF | Cloudflare or AWS WAF — SQL injection, XSS, DDoS protection |
| TLS | TLS 1.3 minimum. HSTS enabled. |
| CORS | Whitelist of allowed origins. No wildcard. |
| Headers | X-Content-Type-Options, X-Frame-Options, CSP, Referrer-Policy |
| API gateway | Request validation, IP whitelist for admin routes |

---

## 5. Reliability

### 5.1 Error Handling

| Requirement | Standard |
|-------------|----------|
| API error response format | `{ success: false, error: { code, message, details? } }` |
| HTTP status codes | Consistent REST semantics (200, 201, 400, 401, 403, 404, 409, 422, 429, 500) |
| Idempotency | POST /rides, POST /payments support idempotency keys |
| Graceful degradation | Downstream failure → cached response or meaningful error message |

### 5.2 Circuit Breaker

| Service | Timeout | Failure Threshold | Half-Open After |
|---------|---------|-------------------|-----------------|
| Stripe API | 5s | 3 failures in 60s | 30s |
| PayFast API | 10s | 3 failures in 60s | 30s |
| Ozow API | 10s | 3 failures in 60s | 30s |
| FCM (push) | 3s | 5 failures in 60s | 15s |
| SMS gateway | 5s | 3 failures in 60s | 30s |

### 5.3 Retry Policy

| Operation | Max Retries | Backoff | Exponential |
|-----------|-------------|---------|-------------|
| Payment charge | 3 | Linear (5s) | No |
| Payment webhook | 5 | Exponential (2^n * 60s) | Yes |
| Push notification | 3 | Linear (10s) | No |
| SMS delivery | 3 | Linear (30s) | No |
| Failed job (queue) | 3 | Exponential (2^n * 60s) | Yes |

### 5.4 Data Integrity

| Requirement | Implementation |
|-------------|---------------|
| Ride state machine | Enforced at DB level (ENUM or check constraint). No invalid transitions. |
| Payment escrow | Double-entry ledger. Every credit has a matching debit. |
| Fare consistency | Final fare must be within ±20% of estimate. Automated audit check. |
| Race condition prevention | Database locks / optimistic locking on ride acceptance, payout processing. |

---

## 6. Mobile Requirements

### 6.1 Platform Support

| Platform | Min Version | Target Devices |
|----------|-------------|----------------|
| iOS | 15.0 | iPhone SE (2020) and newer |
| Android | 8.0 (API 26) | Samsung A-series, Tecno, Huawei mid-range |

### 6.2 Offline Behavior

| Screen | Online | Offline |
|--------|--------|---------|
| Home (map) | Show map, allow search | Show cached map (tiles), "No connection" banner |
| Ride booking | Full flow | "Connect to internet to book" message |
| Ride tracking | Live tracking | Show last known position + "Live updates paused" |
| Profile | Edit profile | View cached profile |
| Ride history | Full list with details | Cached last 20 rides |
| Wallet / earnings | Live balance | Cached balance (stale indicator) |

### 6.3 Connectivity

| Condition | Behavior |
|-----------|----------|
| Intermittent connection | Queue API calls, retry on reconnect |
| Data saver mode | Disable auto-play animations, compress images |
| 2G/3G fallback | Reduce map detail level, batch location updates |
| Connection restored | Sync queued actions, refresh stale data |
| No GPS signal | Show "GPS weak" indicator, use last known + network location |

---

## 7. Monitoring & Observability

### 7.1 Logging

| Requirement | Standard |
|-------------|----------|
| Log format | Structured JSON with correlation ID per request |
| Log levels | debug, info, warning, error, critical (RFC 5424) |
| Log retention | 30 days hot (searchable), 12 months cold (archived) |
| Sensitive data | Never log: passwords, tokens, PAN, PII. Masked by middleware. |
| Correlation ID | `X-Request-ID` header — propagated across all services |

### 7.2 Health Checks

| Endpoint | Interval | Checks |
|----------|----------|--------|
| /health (public) | 30s | App server up/responding, DB connection |
| /health/readiness (internal) | 15s | DB, Redis, queue, payment gateway connectivity |
| /health/liveness (internal) | 10s | App process alive, no deadlock |

### 7.3 Alerting

| Condition | Alert | Channel | Response SLA |
|-----------|-------|---------|--------------|
| API p95 > 1s for 5 min | Warning | Email + Slack | 30 min |
| API p95 > 2s for 2 min | Critical | Slack + SMS | 10 min |
| Error rate > 5% for 2 min | Critical | Slack + SMS | 10 min |
| Payment failure rate > 3% | Critical | Slack + SMS | 5 min |
| Uptime check failure | Critical | SMS + phone call | 5 min |
| Disk > 85% | Warning | Slack | 2 hours |
| Disk > 95% | Critical | Slack + SMS | 30 min |
| SSL cert expiring < 14 days | Warning | Monthly report | 7 days |
| SSL cert expiring < 3 days | Critical | Slack + SMS | 24 hours |

### 7.4 Observability Stack

| Tool | Purpose |
|------|---------|
| Sentry | Error tracking + performance monitoring |
| Laravel Telescope | Local dev debugging + queue monitoring |
| Custom JSON logger | Structured logging to stdout (Docker) |
| AWS CloudWatch / Grafana | Metrics dashboard + alerting |
| PostgreSQL `pg_stat_statements` | Query performance analysis |
| Redis `INFO` + `SLOWLOG` | Cache performance monitoring |

---

## 8. Development & Deployment

### 8.1 CI/CD Pipeline

| Stage | Tools | Time Budget |
|-------|-------|-------------|
| Lint | PHP CS Fixer, ESLint, Prettier | <2 min |
| Type check | TypeScript (strict mode) | <3 min |
| Unit tests | PHPUnit, Jest | <5 min |
| Feature tests | PHPUnit | <10 min |
| Build | Docker build, Expo build check | <10 min |
| Security scan | Snyk, OWASP dependency check | <5 min |
| Deploy staging | docker-compose up | <3 min |
| E2E tests | Detox (mobile), Cypress (web) | <15 min |
| Deploy production | Blue/green deployment | <10 min |
| **Total** | | **<63 min** |

### 8.2 Environment Strategy

| Environment | Purpose | Refresh | Access |
|-------------|---------|---------|--------|
| Local | Developer machines | N/A | Individual |
| Dev | Integration testing | Every push | Team + CI |
| Staging | Pre-production validation | Mirrors production | QA + PM |
| Production | Live users | N/A | Ops only |

---

## 9. Compliance Integration

NFRs related to compliance are detailed in the separate [Compliance Specification](compliance-spec.md).

Key NFR overlaps:

| Compliance Requirement | NFR Mapping |
|------------------------|-------------|
| Data retention automation | Scheduled jobs with configurable retention |
| PII encryption | AES-256 column-level encryption |
| Audit trail | All admin actions logged (non-repudiation) |
| Breach notification | Alerting system + automated notification pipeline |
| Document storage | S3 with encryption + access logging |
