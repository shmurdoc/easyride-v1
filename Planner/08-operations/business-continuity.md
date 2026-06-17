# Business Continuity Plan

## 1. Backup Strategy

### Database Backups (PostgreSQL 16)

| Backup Type | Schedule | Retention | Storage | Notes |
|-------------|----------|-----------|---------|-------|
| Daily full dump | 03:00 SAST daily | 7 days | Local + Offsite | `pg_dump -Fc` format, compressed |
| Weekly full dump | Sunday 03:00 SAST | 4 weeks | Offsite only | Full schema + data |
| Monthly full dump | 1st of month 03:00 SAST | 12 months | Offsite only | Compliance archive |
| WAL archives | Continuous | 24 hours rolling | Local + Offsite | Enables point-in-time recovery |

### Backup Commands

```bash
# Daily dump
pg_dump -Fc -h localhost -U $DB_USER -d $DB_NAME \
  --file=/backups/daily/easyryde_$(date +%Y%m%d).dump

# Upload to offsite
s3cmd put /backups/daily/easyryde_$(date +%Y%m%d).dump \
  s3://easyryde-backups/daily/

# WAL archiving (postgresql.conf)
archive_mode = on
archive_command = 'cp %p /backups/wal/%f && s3cmd put /backups/wal/%f s3://easyryde-backups/wal/%f'
```

### Offsite Backup Storage

- **Provider**: S3-compatible (MinIO self-hosted OR AWS S3 in af-south-1 Cape Town region).
- **Bucket structure**:
  ```
  easyryde-backups/
    daily/    (retain 7 days)
    weekly/   (retain 4 weeks)
    monthly/  (retain 12 months)
    wal/      (retain 24 hours)
  ```
- **Encryption**: Server-side encryption with AWS KMS or MinIO SSE.
- **Access**: IAM user with read/write-only to backup bucket. Separate from production credentials.

### Application File Backups

- **Uploaded files** (driver documents, rider avatars): Stored on S3-compatible storage natively. No additional backup needed — S3 replication handles durability.
- **Configuration**: All env vars and config backed up in a versioned `.env.vault` or 1Password. Not in git.

---

## 2. Point-in-Time Recovery (PITR)

### Prerequisites

- PostgreSQL WAL archiving enabled.
- Base backup taken after WAL archiving was enabled.
- `recovery.conf` configuration (PostgreSQL 12+) or `pg_rewind` for newer.

### Recovery Procedure

```bash
# 1. Restore latest base backup
pg_restore -Fc --clean --create -h localhost -U $DB_USER \
  --dbname=$DB_NAME /backups/daily/easyryde_20260101.dump

# 2. Restore WAL to target time
# Place recovery.signal file and configure recovery_target_time
# in postgresql.conf:
# recovery_target_time = '2026-01-01 14:30:00 SAST'

# 3. Start PostgreSQL in recovery mode
pg_ctl start

# 4. Verify data integrity
# Run integrity checks, verify row counts, test app behavior

# 5. Promote to primary if recovery is successful
pg_ctl promote
```

### RPO and RTO

| Metric | Target | Notes |
|--------|--------|-------|
| RPO (Recovery Point Objective) | 1 hour | Maximum acceptable data loss |
| RTO (Recovery Time Objective) | 4 hours | Maximum acceptable downtime |
| RPO with PITR | < 5 minutes | WAL allows near-instant recovery |
| Full restore (no PITR) | < 2 hours | Daily dump restore time estimated |

---

## 3. Disaster Recovery

### Disaster Scenarios

| Scenario | Impact | Recovery Strategy |
|----------|--------|-------------------|
| Single server failure | App unavailable | Auto-scale replacement (stateless app) |
| Database crash | Data unavailable | Promote replica to primary |
| Region outage (cloud) | Full system down | Restore from offsite backup to new region |
| Data corruption | Corrupted tables | PITR to pre-corruption timestamp |
| Ransomware / crypto-lock | Encrypted storage | Wipe and restore from offsite backup |
| Human error (bad migration) | Schema/data broken | PITR or restore from dump |

### Full DR Procedure

1. **Declare disaster** — Lead engineer confirms outage, notifies founder.
2. **Provision new infrastructure** — Spin up new server(s) from IaC scripts (Terraform / manual).
3. **Restore database** — Download latest daily dump from offsite. Restore to new PostgreSQL instance.
4. **Replay WAL** — If available and needed for lower RPO, replay WAL from offsite.
5. **Verify data integrity**:
   - Row counts match expected (daily dump verification).
   - All required tables present (`users`, `rides`, `drivers`, etc.).
   - Test login with a test account.
   - Create a test ride request and verify full lifecycle.
6. **Point DNS** — Update DNS A record or load balancer target to new server.
7. **Restart services** — Start application workers, queue workers, WebSocket server.
8. **Monitor** — Watch error rates, response times, and active user count for 30 minutes.
9. **Post-mortem** — Root cause analysis within 48 hours.

### DR Runbook

```yaml
steps:
  - name: Notify founder
    action: Phone call + Slack alert
    owner: Lead engineer
    timeout: 5 minutes

  - name: Identify scope
    action: Check PostgreSQL, Redis, app server, WebSocket server status
    owner: Lead engineer
    timeout: 10 minutes

  - name: Execute recovery
    action: Follow full DR procedure above
    owner: Lead engineer
    timeout: 3 hours

  - name: Verify recovery
    action: Run automated smoke tests + manual sanity checks
    owner: Lead engineer + founder
    timeout: 30 minutes

  - name: Declare resolved
    action: Update status page, notify users via push notification
    owner: Founder
    timeout: 15 minutes
```

---

## 4. Redundancy Architecture

### Database

- **Primary + Replica**: Streaming replication from primary to one replica.
- **Failover**: Manual promote replica to primary. (Automated failover future enhancement.)
- **Replication status**: Monitored via `pg_stat_replication`. Alert if replication lag exceeds 30 seconds.

### Redis

- **Sentinel mode**: 3 Redis Sentinel nodes for high availability.
- **Automatic failover**: If primary Redis node fails, Sentinel promotes replica.
- **Data persistence**: RDB snapshots every 5 minutes + AOF (append-only file) for durability.
- **Cache**: Session data and ride state cached. Full recovery from database on restart.

### Application Servers

- **Stateless design**: No application state stored locally. All state is in PostgreSQL or Redis.
- **Horizontal scaling**: Multiple app server instances behind a load balancer. Scale up/down based on CPU/memory.
- **Health checks**: `/health` endpoint returns 200 if app and DB/Redis connections are alive.
- **Zero-downtime deploys**: Rolling updates — one server at a time.

### WebSocket Server

- **Socket.io with Redis adapter**: WebSocket state shared across instances via Redis.
- **Sticky sessions**: Load balancer configured for sticky sessions to minimize reconnection overhead.
- **Reconnection**: Client-side exponential backoff reconnection built into the mobile app.

### Network

- **DDoS protection**: Cloudflare or similar CDN/WAF fronting all HTTP/WebSocket traffic.
- **SSL termination**: At load balancer level. Internal traffic over private network.

---

## 5. DR Testing

### Schedule

| Test Type | Frequency | Scope |
|-----------|-----------|-------|
| Daily dump validation | Daily (automated) | Verify daily backup file is not corrupted |
| Full restore test | Monthly (manual) | Restore latest backup to staging environment |
| PITR test | Quarterly | Test point-in-time recovery in staging |
| Failover test | Quarterly | Promote replica, verify app works |
| Full DR exercise | Bi-annually | Simulate total region failure, recover in new region |

### Monthly Restore Test Procedure

1. Download latest daily dump from offsite to staging server.
2. Restore to staging PostgreSQL instance.
3. Run automated smoke tests (test ride lifecycle, payment flow, admin login).
4. Verify all tables have expected row counts.
5. Test user login with a known test account from backup.
6. Document results in `dr-test-log.md`:
   - Test date
   - Restore start/end timestamps
   - Total restore time
   - Any errors encountered
   - Verdict (PASS / FAIL)
7. If FAIL: Determine root cause, fix, re-test.

### DR Test Log Template

```markdown
# DR Test Log

## Test Date: YYYY-MM-DD
## Type: [Full Restore / PITR / Failover / Full DR Exercise]

### Timeline
- Start: HH:MM
- Restore complete: HH:MM
- Verification complete: HH:MM
- Total duration: HH:MM

### Results
- Backup size: XX GB
- Restore time: XX minutes
- WAL replayed: Yes / No
- Data integrity check: PASS / FAIL
- Smoke tests: PASS / FAIL
- Staging URL: https://staging-v2.easyryde.co.za

### Issues Found
1. [Issue description] — [Fix applied] — [Status]

### Verdict: PASS / FAIL
### Tester: [Name]
```
