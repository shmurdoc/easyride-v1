# Performance Baseline

**Phase:** 06 — Quality Plan  
**Document:** Performance Baseline  
**Version:** 1.0.0  
**Date:** 2026-06-17  
**Status:** Draft

---

## 1. Overview

This document defines the performance targets for EasyRyde at launch (expected 50 concurrent users, peak 100 ride requests). All metrics are measured against the staging environment before release. Any regression below these baselines is a blocking issue.

---

## 2. Performance Targets

### 2.1 API Response Times

| Endpoint Group | Target p95 | Target p99 | Measurement Tool |
|----------------|------------|------------|-----------------|
| Auth (login, register) | < 800ms | < 2s | Sentry traces |
| Ride CRUD | < 500ms | < 1.5s | Sentry traces |
| Payment initiation | < 1s | < 2s | Sentry traces |
| Wallet operations | < 500ms | < 1s | Sentry traces |
| Admin dashboard | < 2s | < 4s | Browser timing |
| Search / list endpoints | < 800ms | < 2s | Sentry traces |
| File upload (docs) | < 3s | < 5s | Client timing |

### 2.2 Real-Time Performance

| Metric | Target p95 | Measurement Tool |
|--------|------------|-----------------|
| WebSocket connection time | < 500ms | Socket.io metrics |
| Ride event propagation (request → driver notify) | < 1s | Application logging |
| Location update broadcast | < 200ms | Socket.io metrics |
| Chat message delivery | < 300ms | Socket.io metrics |
| Concurrent WebSocket connections | 10,000+ | k6 load test |

### 2.3 Business Process Timing

| Process | Target | Measurement |
|---------|--------|-------------|
| Ride request → first driver notified | < 1s | Server timing log |
| Ride request → driver accepts | < 60s (p95) | Business metrics |
| Payment processing (Stripe/PayFast) | < 5s | Webhook latency |
| Fare calculation | < 100ms | Sentry trace |
| Surge pricing calculation | < 200ms | Sentry trace |
| Driver matching algorithm | < 500ms | Sentry trace |

### 2.4 Mobile App Performance

| Metric | Target | Measurement Tool |
|--------|--------|-----------------|
| App cold start (iOS/Android) | < 2s | Sentry mobile traces |
| Map tile load time | < 2s | Client-side timing |
| Ride list render (20 items) | < 500ms | React DevTools |
| Push notification display | < 1s | Client timing |
| Image upload (profile) | < 3s | Client timing |

### 2.5 Database Performance

| Metric | Target p99 | Measurement Tool |
|--------|------------|-----------------|
| Query execution time | < 100ms | PostgreSQL slow query log |
| Write throughput | > 500 tps | pg_stat_activity |
| Connection pool utilization | < 80% | pgBouncer metrics |
| Replication lag | < 100ms | PostgreSQL streaming stats |
| Cache hit ratio (Redis) | > 90% | Redis INFO stats |

### 2.6 Infrastructure Capacity

| Metric | Target | Measurement |
|--------|--------|-------------|
| Concurrent ride capacity | 100+ active rides | Load test results |
| Concurrent WebSocket connections | 10,000+ | k6 test |
| API throughput | > 500 req/s | k6 test |
| Horizon queue throughput | > 100 jobs/s | Horizon metrics |
| File storage throughput | > 50 MB/s | MinIO/S3 metrics |

---

## 3. Uptime Targets

| Component | Target | Measurement |
|-----------|--------|-------------|
| API + Web app | 99.9% | Uptime check / Grafana |
| Database | 99.95% | PostgreSQL monitoring |
| Redis | 99.95% | Redis monitoring |
| Socket.io server | 99.9% | Socket.io metrics |
| Payment webhook handler | 99.99% | Stripe dashboard |

**99.9% uptime = max 43m 49s downtime per month.** This is our SLO. Service credits or incident reports apply below this threshold.

---

## 4. Measurement Tools

| Tool | What It Measures | Integration |
|------|-----------------|-------------|
| **Sentry** | Backend API trace times, mobile app start times, error rates | Laravel SDK, Sentry React Native SDK |
| **New Relic** (optional) | APM, transaction traces, DB query breakdown | New Relic PHP agent |
| **Grafana + Prometheus** | CPU, RAM, disk, network, request rate, error rate | Prometheus exporters on all containers |
| **k6** | Load test metrics (p95, p99, error rate, throughput) | CI pipeline |
| **PostgreSQL slow query log** | Queries exceeding 100ms | `log_min_duration_statement = 100` |
| **Redis INFO / MONITOR** | Cache hit ratio, command latency | Redis CLI + Prometheus |
| **Socket.io metrics** | Connection count, event latency, rooms | Prometheus metrics endpoint |
| **Lighthouse / Web Vitals** | Admin dashboard load performance | Chrome DevTools |

---

## 5. Load Test Profiles

### 5.1 Normal Load (Day 1 Expectation)

| Metric | Value |
|--------|-------|
| Concurrent users | 50 |
| Requests per second | ~100 |
| Active rides | ~10-20 |
| WebSocket connections | ~50-100 |

### 5.2 Peak Load (Launch Week Target)

| Metric | Value |
|--------|-------|
| Concurrent users | 100 |
| Requests per second | ~250 |
| Active rides | ~50 |
| WebSocket connections | ~200-500 |

### 5.3 Stress Test (Upper Bound)

| Metric | Value |
|--------|-------|
| Concurrent users | 500 |
| Requests per second | ~1000 |
| Active rides | ~200 |
| WebSocket connections | ~2000 |

---

## 6. Baseline Verification Checklist

- [ ] API p95 < 500ms under normal load (k6)
- [ ] API p95 < 800ms under peak load (k6)
- [ ] Ride request → first driver notified < 1s
- [ ] Payment webhook processed < 5s
- [ ] App cold start < 2s on mid-range device
- [ ] Database p99 query time < 100ms
- [ ] Cache hit ratio > 90%
- [ ] Rate limiting triggers at correct thresholds (100 req/min per user)
- [ ] Surge pricing calculation < 200ms
- [ ] Map tile load < 2s on 4G connection

---

## 7. Degradation Plan

If performance targets are not met:

| Gap | Action | Owner |
|-----|--------|-------|
| API p95 > 500ms | Profile with Sentry traces, add DB indexes, cache frequent queries | Backend lead |
| WebSocket latency > 200ms | Check Redis adapter, reduce event payload size, add Socket.io nodes | Realtime lead |
| Database p99 > 100ms | Identify slow queries, add composite indexes, implement query caching | Backend lead |
| Cold start > 2s | Profile bundle, lazy-load screens, enable Hermes | Mobile lead |
| Map tiles > 2s | Switch tile provider, preload tiles, reduce zoom levels | Mobile lead |
