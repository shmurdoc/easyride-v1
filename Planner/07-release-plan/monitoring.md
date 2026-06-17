# Monitoring

**Phase:** 07 — Release Plan  
**Document:** Monitoring  
**Version:** 1.0.0  
**Date:** 2026-06-17  
**Status:** Draft

---

## 1. Monitoring Stack

| Tool | Purpose | Hosting |
|------|---------|---------|
| Sentry | Error tracking + performance tracing | Cloud (Sentry SaaS) |
| Grafana | Metrics visualization + dashboards | Self-hosted or Grafana Cloud |
| Prometheus | Metrics collection + alerting rules | Self-hosted on VPS |
| Loki | Log aggregation | Self-hosted with Grafana |
| Promtail | Log shipping from containers | Sidecar per container |
| Node Exporter | OS-level metrics (CPU, RAM, disk) | Per host |
| cAdvisor | Container-level metrics | Per host |
| pg_stat_monitor | PostgreSQL query performance | PostgreSQL extension |
| Redis Exporter | Redis metrics | Sidecar on Redis container |
| Blackbox Exporter | External endpoint health checks | VPS or external |

---

## 2. Sentry Configuration

### 2.1 Projects

| Project | Platform | SDK |
|---------|----------|-----|
| easyryde-api | Laravel | `sentry/sentry-laravel` |
| easyryde-rider-app | React Native (Expo) | `@sentry/react-native` |
| easyryde-driver-app | React Native (Expo) | `@sentry/react-native` |
| easyryde-admin-web | React | `@sentry/react` |
| easyryde-socketio | Node.js | `@sentry/node` |

### 2.2 Performance Tracing

| Setting | Value |
|---------|-------|
| Traces sample rate | 0.25 (25%) — increase to 1.0 during debugging |
| Profiles sample rate | 0.1 (10%) |
| Transaction grouping | By route name (Laravel), by screen (React Native) |
| APM breakdowns | DB queries, HTTP calls, view rendering, queue jobs |

### 2.3 Error Grouping Rules

- Group by exception class + stack trace fingerprint
- Ignore: 401/403 on unauthenticated routes (expected)
- Ignore: 422 validation errors (client errors)
- Alert on: 500 errors, unhandled exceptions, queue job failures

### 2.4 Release Tracking

- Tag releases with git commit SHA
- Sentry release tracking enabled: `sentry:release --commit`
- Associate errors with releases for regression detection

---

## 3. Health Check Endpoint

**URL:** `GET /api/v1/health`

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-06-17T12:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": { "status": "ok", "latency_ms": 2 },
    "redis": { "status": "ok", "latency_ms": 1 },
    "socketio": { "status": "ok", "latency_ms": 3 }
  },
  "uptime_seconds": 86400,
  "queue_depth": 5
}
```

**Failure response (503):**
```json
{
  "status": "degraded",
  "services": {
    "database": { "status": "ok" },
    "redis": { "status": "failed", "error": "connection refused" }
  }
}
```

**Health check interval:** 30 seconds from external monitor (UptimeRobot or similar).

---

## 4. Grafana Dashboards

### 4.1 Operations Dashboard

| Panel | Metric | Source |
|-------|--------|--------|
| CPU usage | `node_cpu_seconds_total` | Node Exporter |
| RAM usage | `node_memory_MemAvailable_bytes` | Node Exporter |
| Disk usage | `node_filesystem_avail_bytes` | Node Exporter |
| Network I/O | `node_network_transmit_bytes_total` | Node Exporter |
| Container status | `container_last_seen` | cAdvisor |
| PostgreSQL connections | `pg_stat_database_numbackends` | PostgreSQL exporter |
| Redis memory | `redis_memory_used_bytes` | Redis exporter |

### 4.2 Application Dashboard

| Panel | Metric | Source |
|-------|--------|--------|
| Request rate | `laravel_http_requests_total` | Laravel Prometheus metrics |
| Error rate | `laravel_http_errors_total` | Laravel Prometheus metrics |
| p50/p95/p99 response time | `laravel_http_request_duration_seconds` | Laravel Prometheus metrics |
| Queue depth | `laravel_horizon_queue_size` | Horizon metrics |
| Queue throughput | Jobs processed per minute | Horizon metrics |
| Failed jobs | `laravel_horizon_failed_jobs_total` | Horizon metrics |
| WebSocket connections | `socketio_connected_clients` | Socket.io metrics |
| WebSocket events/sec | `socketio_events_total` | Socket.io metrics |

### 4.3 Business Dashboard

| Panel | Metric | Source |
|-------|--------|--------|
| Rides per hour | Count of rides created | Application log → Prometheus |
| Active rides | Rides with status `accepted` or `started` | Application metric |
| Active drivers | Drivers with status `online` | Application metric |
| Revenue (today) | Sum of completed ride fares | Application metric |
| Driver utilization | Active drivers / total drivers × 100 | Application metric |
| Cancellation rate | Cancelled rides / total rides × 100 | Application metric |
| Average wait time | Time from ride request to driver accept | Application metric |
| Payment success rate | Successful payments / total attempts | Application metric |

### 4.4 Business Dashboard Queries

```sql
-- Rides per hour (last 24h)
SELECT date_trunc('hour', created_at) AS hour, COUNT(*) AS rides
FROM rides
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour;

-- Average wait time (last hour)
SELECT AVG(EXTRACT(EPOCH FROM (accepted_at - created_at))) AS avg_wait_seconds
FROM rides
WHERE accepted_at IS NOT NULL
  AND created_at > NOW() - INTERVAL '1 hour';

-- Cancellation rate (today)
SELECT
  COUNT(*) FILTER (WHERE status = 'cancelled') * 100.0 / COUNT(*) AS cancellation_rate
FROM rides
WHERE created_at::date = CURRENT_DATE;
```

---

## 5. Alerts

### 5.1 Critical Alerts (PagerDuty or Slack urgent webhook)

| Alert | Condition | Response Time | Action |
|-------|-----------|---------------|--------|
| API down | Health check fails 3 consecutive times | 5min | Investigate + rollback if needed |
| Error rate > 1% | `laravel_http_errors_total` rate > 1% for 5min | 5min | Check Sentry for new errors |
| p95 latency > 1s | `laravel_http_request_duration_seconds` p95 > 1s | 10min | Profile slow endpoints |
| Queue backlog > 100 | `laravel_horizon_queue_size` > 100 for 2min | 10min | Scale horizon workers |
| Payment gateway timeout | Payment webhook not received in 30s | 2min | Alert on-call engineer |
| SOS triggered | SOS event received | Immediate | Notify safety team |
| Database down | Health check fails | 2min | Failover or restore |

### 5.2 Warning Alerts (Slack channel)

| Alert | Condition | Response Time | Action |
|-------|-----------|---------------|--------|
| Disk > 80% | `node_filesystem_avail_bytes < 20%` | 1 hour | Clean old logs or resize volume |
| Memory > 80% | `node_memory_MemAvailable_bytes < 20%` | 1 hour | Check for memory leak |
| Database connections > 80% | `pg_stat_database_numbackends > 80% of max` | 30min | Check connection pool |
| Certificate expires < 14 days | Certbot check | 1 day | Renew certificate |
| PHP error rate increase | Sentry error count > 2× daily average | 30min | Check for new exceptions |
| WebSocket connections drop | `socketio_connected_clients` drops by > 50% | 15min | Check Socket.io server |

### 5.3 Alert Routing

| Time | Channel | Responder |
|------|---------|-----------|
| Business hours (8am-6pm) | Slack #ops | Lead engineer |
| After hours | PagerDuty | On-call engineer |
| SOS trigger | PagerDuty + SMS | On-call + CEO |
| Payment failure | Slack #finance + PagerDuty | Lead engineer + finance |

---

## 6. Logging Strategy

### 6.1 Log Sources

| Source | Log Type | Format | Destination |
|--------|----------|--------|-------------|
| Laravel app | Application logs | JSON (structured) | Loki |
| Laravel queue | Job logs | JSON | Loki |
| Nginx | Access + error | JSON (custom format) | Loki |
| PostgreSQL | Slow queries + errors | CSV (parsed by Promtail) | Loki |
| Socket.io | Connection + events | JSON | Loki |
| Redis | Slow log | Redis format | Loki (via log redirect) |

### 6.2 Log Retention

| Environment | Retention | Storage |
|-------------|-----------|---------|
| Production | 90 days (hot), 1 year (cold archive to S3) | Loki |
| Staging | 14 days | Loki |
| Development | 7 days | Local files |

### 6.3 Structured Logging Format (Laravel)

```json
{
  "timestamp": "2026-06-17T12:00:00.000000Z",
  "level": "error",
  "message": "Payment webhook signature verification failed",
  "context": {
    "payment_id": "pi_123456",
    "gateway": "stripe",
    "ip_address": "185.123.45.67",
    "user_id": 42
  },
  "extra": {
    "request_id": "req_abc123",
    "trace_id": "trace_def456",
    "tags": ["payment", "webhook"]
  }
}
```

---

## 7. Runbook Quick Reference

| Scenario | Action |
|----------|--------|
| CPU spike | `docker stats` → identify container → `top` inside → check Sentry traces |
| High error rate | Check Sentry → identify new error → check deploy timeline → rollback if needed |
| Queue backlog | `php artisan horizon:clear` only if stuck jobs → restart horizon → scale workers |
| Database slow | `pg_stat_activity` → kill long-running queries → add index → notify users |
| Memory leak | `docker stats` → restart container → analyze heap dump |
| Certificate expiry | `certbot renew --force-renewal` → `nginx -s reload` |
| Disk full | `du -sh /var/log/*` → rotate logs → clean old backups |
| Webhook spike | Check Stripe/PayFast dashboards → verify idempotency → scale webhook handler |
