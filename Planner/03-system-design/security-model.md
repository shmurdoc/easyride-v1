# EasyRyde — Security Model

**Version:** 1.0.0  
**Updated:** 2026-06-17  
**Status:** Final  
**Classification:** Confidential — Internal Use Only

---

## 1. Authentication & Authorization

### 1.1 Token-Based Auth (Sanctum)

EasyRyde uses Laravel Sanctum for API authentication. Two token types:

| Type | Usage | Expiry | Storage |
|------|-------|--------|---------|
| SPA Session | Admin web dashboard (same-domain) | Browser session | Cookie |
| Mobile Token | Rider/Driver mobile apps | 7 days | Secure device storage (Keychain/Keystore) |

**Token lifecycle:**
1. User authenticates via `POST /api/v1/auth/login` with email/phone + password
2. Sanctum issues a plaintext token returned in response (shown once)
3. Client stores token and sends as `Authorization: Bearer {token}` header
4. Token validated on each request via Sanctum middleware
5. Token can be revoked via `POST /api/v1/auth/logout`
6. Admin can revoke any user's tokens via admin panel

**Current configuration (`config/sanctum.php`):**
- Token expiration: Not set by default (expiration must be added)
- Stateful domains: Configured via `SANCTUM_STATEFUL_DOMAINS` env var

**Refinements needed:**
- Add token expiration via Sanctum's `expires_at` column (7-day default)
- Implement token refresh endpoint (extend by another 7 days)
- Add rate limiting on login (10/min) to prevent brute force
- Add account lockout after 5 failed attempts (15 min lock)
- Add device fingerprinting to token metadata

### 1.2 Role-Based Access Control

Using `spatie/laravel-permission` package.

| Role | Permissions | Access Scope |
|------|-------------|-------------|
| `super-admin` | All permissions, system settings, audit logs | Full system |
| `admin` | User management, ride management, KYC approval, reports | Same tenant |
| `driver` | Accept rides, update location, view earnings, chat | Self + assigned rides |
| `rider` | Request rides, view history, rate, payment, chat | Self |

**Permission gates (applied via middleware):**

```php
// Route-level middleware
Route::middleware(['auth:sanctum', 'role:admin|super-admin'])->group(...);

// Controller-level
$this->authorize('view', $ride); // RidePolicy
$this->authorize('approve', $driver); // DriverPolicy
```

**Current policies:**
- RidePolicy: Participants (rider/driver) + admins can view; only rider can cancel pending
- PaymentPolicy: Payer + admins can view; only admins can refund
- UserPolicy: Self + admins can view; only admins can update roles

**Missing policies:**
- DriverProfile policy (approve/reject)
- KycVerification policy (admin approval)
- IncidentReport policy (reporter + assigned admin)
- ReferralCode policy (owner + admin)
- Delivery policy (sender/driver/admin)
- FoodOrder policy (customer/driver/restaurant/admin)

### 1.3 Multi-Tenant Isolation

- `tenant_id` column on all major tables
- Middleware extracts tenant from authenticated user context
- Global query scope applies `WHERE tenant_id = ?` automatically
- Super-admin can see across tenants via explicit scope override
- Tenant settings stored in `tenants.settings` JSON column

**Implementation notes:**
- Tenant ID set on user record at creation (admin determines tenant)
- Current middleware approach: `app/Http/Middleware/TenantScope.php`
- Missing: formal tenant-scoped middleware class (should be extracted)

---

## 2. Current Security Issues Identified

### 2.1 CRITICAL: Firebase Service Account

**Issue:** Firebase service account JSON file was found commited to the repository.

**Remediation steps:**
1. Remove file from git history using `git filter-branch` or `BFG Repo-Cleaner`
2. Add `storage/*.json` and `*.json` (in sensitive paths) to `.gitignore`
3. Rotate the Firebase service account key in Google Cloud Console
4. Load service account from environment variable (`FIREBASE_CREDENTIALS`) instead of file
5. Verify no secrets remain in git history with `git log --all --diff-filter=A -- '*.json'`

### 2.2 HIGH: PayFast Sandbox Defaults

**Issue:** `config/services.php` contains sandbox/test credentials as defaults.

**Remediation:**
```php
// REMOVE from config/services.php:
'payfast' => [
    'merchant_id' => '10000100',        // ← TEST value
    'merchant_key' => '46f0cd694581a',  // ← TEST value
    'passphrase' => 'testpassphrase',    // ← TEST value
    'sandbox' => env('PAYFAST_SANDBOX', true),
],

// REPLACE with:
'payfast' => [
    'merchant_id' => env('PAYFAST_MERCHANT_ID'),
    'merchant_key' => env('PAYFAST_MERCHANT_KEY'),
    'passphrase' => env('PAYFAST_PASSPHRASE'),
    'sandbox' => env('PAYFAST_SANDBOX', true),
],
```

### 2.3 MEDIUM: Encryption at Rest

**Sensitive fields requiring encryption:**

| Field | Table | Encryption Method |
|-------|-------|-------------------|
| `email` | users | Laravel `encrypt()` / Eloquent cast |
| `phone_number` | users | Laravel `encrypt()` / Eloquent cast |
| `id_number` | driver_profiles | Laravel `encrypt()` / Eloquent cast |
| `license_number` | driver_profiles | Laravel `encrypt()` / Eloquent cast |
| `document_number` | kyc_verifications | Laravel `encrypt()` / Eloquent cast |
| `last_four` | payment_methods | Partial: store only last 4 digits |

**Implementation:**
```php
// In User model:
protected function casts(): array
{
    return [
        'email' => 'encrypted',
        'phone_number' => 'encrypted',
        // ...
    ];
}
```

**Note:** Laravel's `encrypted` cast uses AES-256-CBC with APP_KEY. Encrypted fields cannot be used in `WHERE` clauses or unique indexes. Alternative: use separate hashed column for lookup (e.g., `email_hash`, `phone_hash`).

### 2.4 MEDIUM: Secrets Management

**Current state:** All secrets in `.env` file.

**Production recommendation:**
- Store secrets in environment variables (Docker/infra level)
- Use HashiCorp Vault or AWS Secrets Manager for secrets rotation
- Never commit `.env` files to repository (already in `.gitignore`)
- Use `.env.example` as template without real values
- Implement `config:secure` Artisan command to validate required secrets on deploy

**Required env vars:**
```
APP_KEY=<32-char-random>
DB_PASSWORD=<strong-password>
JWT_SECRET=<32-char-random>
STRIPE_KEY=<stripe-publishable-key>
STRIPE_SECRET=<stripe-secret-key>
PAYFAST_MERCHANT_ID=<payfast-id>
PAYFAST_MERCHANT_KEY=<payfast-key>
PAYFAST_PASSPHRASE=<payfast-passphrase>
OZOW_API_KEY=<ozow-key>
OZOW_SITE_CODE=<ozow-code>
SENTRY_DSN=<sentry-dsn>
FIREBASE_CREDENTIALS=<json-string>
REDIS_PASSWORD=<redis-password>
```

### 2.5 LOW: SQL Injection Prevention

**Current state:** Eloquent ORM provides parameterized queries by default.

**Risky patterns to audit:**
- Raw `DB::statement()` calls
- `DB::raw()` in queries with user input
- `whereRaw()` with string concatenation
- Direct SQL in migrations (use Schema builder)

**Remediation:**
```php
// UNSAFE:
DB::statement("SELECT * FROM rides WHERE id = '{$request->id}'");

// SAFE:
DB::statement("SELECT * FROM rides WHERE id = ?", [$request->id]);
```

---

## 3. Network Security

### 3.1 TLS/SSL

| Layer | Protocol | Config |
|-------|----------|--------|
| External traffic | TLS 1.3 only | Nginx `ssl_protocols TLSv1.3;` |
| Certificates | Let's Encrypt (Auto-renewal) | Certbot in cron |
| Internal traffic | HTTP (Docker network) | Internal network is trusted |
| WebSocket (WSS) | TLS 1.3 via Nginx proxy | Same as HTTPS |

**Nginx configuration highlights:**
```nginx
ssl_protocols TLSv1.3;
ssl_ciphers TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256;
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

### 3.2 CORS Configuration

**Current state** (`config/cors.php`):
```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [env('APP_URL', 'http://localhost:8000')],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
```

**Refinements needed:**
- Restrict `allowed_origins` to explicit known domains in production
- Set `supports_credentials` to `true` for Sanctum SPA auth
- Reduce `max_age` to 3600 for caching
- Only allow necessary `allowed_methods` (GET, POST, PUT, DELETE, OPTIONS)

### 3.3 Security Headers

**Nginx configuration:**
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "0" always;  # Deprecated but harmless
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.easyryde.co.za wss://api.easyryde.co.za;" always;
add_header Permissions-Policy "geolocation=(self), microphone=(), camera=(), payment=(self)" always;
```

### 3.4 Rate Limiting

| Endpoint Group | Limit | Window | Applied By |
|----------------|-------|--------|------------|
| General API | 60 requests | 1 minute | Laravel throttle middleware |
| Auth (login/register) | 10 requests | 1 minute | Laravel throttle:10,1 |
| Password reset | 5 requests | 1 minute | Laravel throttle:5,1 |
| Socket events | 60 events | 1 minute | Socket.io middleware |
| Webhook endpoints | 120 requests | 1 minute | IP-based throttling |
| Config/Health | 60 requests | 1 minute | No auth required |

**Implementation:**
```php
// In routes/api.php
Route::middleware('throttle:10,1')->group(function () {
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::post('auth/register', [AuthController::class, 'register']);
});
```

---

## 4. Application Security

### 4.1 Input Validation

- All inputs validated via Laravel Form Requests
- Strict type casting on all Eloquent models
- UUID validation on all resource IDs
- Coordinate range validation (-90/90, -180/180)
- String length limits on all text fields
- File upload validation (type, size) on KYC documents

### 4.2 CSRF Protection

- Sanctum SPA authentication uses CSRF token via `sanctum/csrf-cookie`
- API token authentication is stateless — no CSRF needed
- Webhooks validated via signature verification (Stripe HMAC, PayFast IP check)

### 4.3 Webhook Security

| Provider | Verification Method | Implementation |
|----------|-------------------|----------------|
| Stripe | Webhook signing secret | `\Stripe\Webhook::constructEvent()` |
| PayFast | IP check + signature validation | Check source IP + POST signature |
| Ozow | Callback data validation | Site code + API key validation |

**Implementation pattern:**
```php
// Stripe webhook verification
$payload = $request->getContent();
$sigHeader = $request->header('Stripe-Signature');
$event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $secret);
```

### 4.4 File Upload Security

- KYC documents: max 10MB, allowed types: jpg, jpeg, png, pdf
- Incident evidence: max 20MB per file, max 5 files, allowed types: jpg, jpeg, png, pdf, mp4
- Store outside public webroot (`storage/app/`)
- Access controlled via signed URLs or authenticated download endpoints
- Virus scanning recommended before storage (ClamAV integration)

---

## 5. Data Privacy (POPIA Compliance)

South Africa's Protection of Personal Information Act (POPIA) requirements:

| Requirement | Implementation |
|-------------|---------------|
| Consent | `consent_records` table with type, version, timestamp, IP |
| Access | `GET /v1/data/export` — full data export in JSON |
| Rectification | User profile update endpoints |
| Erasure | `POST /v1/data/erasure` — scheduled anonymization |
| Objection | Consent revocation per type |
| Data breach notification | Sentry alert + SOS alert → admin notification |

**Data retention policy:**
- Active accounts: Indefinite (with annual consent renewal)
- Deleted accounts: 30 days soft delete, then anonymization
- Audit logs: 5 years (regulatory requirement)
- Payment records: 5 years (tax/accounting requirement)
- Location data: 30 days
- Chat messages: 90 days
- SOS alerts: 2 years

---

## 6. Infrastructure Security

### 6.1 Docker Security

- Images pulled from official registries with digest pinning recommended
- Containers run as non-root user (`appuser` in PHP container)
- Read-only root filesystem where possible
- No privileged containers
- Internal network (bridge) — no external access to databases
- Health checks prevent routing to unhealthy containers
- Resource limits (memory, CPU) on all containers

### 6.2 Database Security

- PostgreSQL: password authentication, no trust mode
- `pg_hba.conf`: local TCP only from app containers
- Network-level: Redis/PostgreSQL ports not exposed externally in production
- Connection pooling via PgBouncer in production
- Encrypted connections between app and database (TLS) for cross-host deployments

### 6.3 Redis Security

- Redis password configured via `REDIS_PASSWORD` env var
- `rename-command FLUSHALL ""` and `rename-command FLUSHDB ""` in production
- No external Redis port exposure
- Separate DB for cache (db:1), queue (db:2), session (db:3) recommended

---

## 7. Monitoring & Incident Response

### 7.1 Security Monitoring

| Tool | What It Monitors |
|------|-----------------|
| Sentry | Application errors, exceptions |
| Horizon | Queue job failures |
| Socket.io /metrics | Connection anomalies |
| Nginx access logs | Suspicious request patterns |
| Audit logs | Admin action tracking |

### 7.2 Incident Response Flow

```
Security Event Detected
    ↓
Sentry Alert / Log Anomaly
    ↓
Admin notified (push + email)
    ↓
Admin investigates via audit logs
    ↓
If confirmed:
    → Revoke compromised tokens
    → Suspend affected user accounts
    → Rotate compromised secrets
    → File incident report
    → Notify affected users (if data involved)
```

---

## 8. Recommended Security Hardening (Phase 0)

| Priority | Item | Effort |
|----------|------|--------|
| P0 | Rotate Firebase service account key | 1h |
| P0 | Remove sandbox defaults from PayFast config | 0.5h |
| P0 | Add login rate limiting (10/min) | 1h |
| P0 | Add account lockout after failed attempts | 2h |
| P1 | Encrypt email and phone_number at rest | 3h |
| P1 | Add security headers to Nginx | 1h |
| P1 | Restrict CORS to known domains | 0.5h |
| P1 | Add token expiration (7-day) | 2h |
| P1 | Audit all DB::raw/DB::statement calls | 2h |
| P1 | Add IP-based rate limiting to auth | 1h |
| P2 | Implement token refresh endpoint | 2h |
| P2 | Add device fingerprinting to tokens | 3h |
| P2 | Set up Vault or Secrets Manager | 8h |
| P2 | Implement PgBouncer with TLS | 4h |
| P2 | Add file upload virus scanning | 4h |
| P3 | Implement annual consent renewal flow | 4h |
| P3 | Add security audit log retention policy | 2h |
