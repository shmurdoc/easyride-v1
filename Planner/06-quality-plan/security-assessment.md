# Security Assessment

**Phase:** 06 — Quality Plan  
**Document:** Security Assessment  
**Version:** 1.0.0  
**Date:** 2026-06-17  
**Status:** Draft

---

## 1. Executive Summary

This security assessment covers the EasyRyde platform across four dimensions: secrets management, dependency vulnerability, static/dynamic analysis, and manual review. The most critical finding is an unignored Firebase service account key in version control. Remediation is required before any production deployment.

---

## 2. Secrets Leak Assessment

### 2.1 CRITICAL: Firebase Service Account Key

| Finding | Severity | Status |
|---------|----------|--------|
| Firebase SA private key JSON not in `.gitignore` | **CRITICAL** | Open |

**Risk:** The Firebase service account JSON file (containing `private_key_id`, `private_key`, `client_email`, etc.) was found tracked in the repository. This key grants programmatic access to Firebase services including Firestore, FCM, and Authentication. Any attacker with this file can send push notifications, read/write Firestore, and impersonate Firebase service accounts.

**Remediation (immediate):**
1. Immediately rotate the Firebase service account key in Google Cloud Console
2. Add `*.firebase-service-account.json` and/or `*.json` patterns to `.gitignore` for all credential files
3. Remove the file from git history using `git filter-branch` or `git filter-repo` to purge it from all commits
4. Audit git history for any other committed secrets (API keys, DB passwords, JWT secrets)

**Remediation (permanent):**
- Store all credentials in environment variables (`.env`), never in committed files
- Use `APP_FIREBASE_CREDENTIALS` env var pointing to a path outside the repo
- For CI: inject credentials via GitHub Actions secrets, not repo files

### 2.2 HIGH: .env.example May Leak Configuration Patterns

| Finding | Severity | Status |
|---------|----------|--------|
| `.env.example` may contain placeholder secrets | **HIGH** | Verify |

**Checklist:**
- [ ] `.env.example` uses placeholder values (`DB_PASSWORD=changeme`), NOT real values
- [ ] `.env` is in `.gitignore`
- [ ] No API keys, tokens, or secrets in `.env.example`

### 2.3 Secrets Audit Checklist

| Item | Status | Action |
|------|--------|--------|
| Firebase SA key removed from history | Open | Run `git filter-repo` |
| `*.json` in `.gitignore` for credential files | Open | Add pattern |
| `.env` in `.gitignore` | Verify | Confirm |
| APP_KEY rotation | Open | Generate new key after cleanup |
| Stripe secret keys in `.env` only | Verify | Confirm |
| PayFast passphrase in `.env` only | Verify | Confirm |
| JWT secret in `.env` only | Verify | Confirm |
| Pusher/WebSocket app keys in `.env` only | Verify | Confirm |

---

## 3. Dependency Audit

### 3.1 Composer Audit

Run before every release:

```bash
composer audit --no-dev --format=json
```

**Expected:** 0 known vulnerabilities in production dependencies.

**Key packages to monitor:**

| Package | Risk | Monitoring |
|---------|------|------------|
| `laravel/framework` | High | Dependabot alerts |
| `spatie/laravel-permission` | Medium | Dependabot |
| `barryvdh/laravel-debugbar` | High | Must NOT be installed in production (`--no-dev`) |
| `laravel/sanctum` | High | Auth bypass CVEs |
| `pusher/pusher-php-server` | Medium | WebSocket auth bypass |
| `stripe/stripe-php` | Medium | Payment data exposure |

### 3.2 npm Audit

Run for both web admin and mobile apps:

```bash
npm audit --audit-level=high
```

**Expected:** 0 HIGH or CRITICAL vulnerabilities.

### 3.3 Lock File Integrity

- [ ] `composer.lock` committed (ensures reproducible builds)
- [ ] `package-lock.json` or `yarn.lock` committed
- [ ] Dependabot enabled for all package ecosystems
- [ ] Weekly automated dependency update PRs

---

## 4. SAST — Static Analysis

### 4.1 Semgrep

Run semgrep in CI on every PR. Block on HIGH or CRITICAL findings.

**Rule sets:**

| Rule Set | Languages | What It Catches |
|----------|-----------|-----------------|
| `p/php` | PHP | SQL injection, XXE, command injection, file inclusion, SSRF |
| `p/typescript` | TypeScript | XSS, prototype pollution, path traversal, hardcoded secrets |
| `p/owasp-top-ten` | PHP, TS | A1-A10 coverage |
| `p/laravel` | PHP | Mass assignment, unsafe routes, debug mode enabled |
| Custom rules | PHP | Raw `DB::statement()`, `request()->input()` without validation |

**Custom semgrep rule — SQL injection in raw queries:**

```yaml
rules:
  - id: laravel-raw-db-statement
    patterns:
      - pattern: DB::statement($SQL)
      - pattern-not: DB::statement("...")  # string literal ok
    message: "Potential SQL injection in raw DB::statement call"
    languages: [php]
    severity: ERROR
```

### 4.2 PHPStan

| Configuration | Value |
|---------------|-------|
| Level | 5 (target: 6 by Month 2) |
| Mode | `maximum` (check generic classes, unreachable code) |
| Paths | `app/`, `config/`, `routes/`, `tests/` |
| BLOCKING | Yes — zero errors allowed at G1 gate |

**Exclusions (documented):**
- `app/Providers/*` — Laravel service providers have intentional dynamic calls
- `tests/*` — Test files exempt from level 5 (level 1 minimum)

---

## 5. DAST — OWASP ZAP

### 5.1 Scan Configuration

| Setting | Value |
|---------|-------|
| Tool | OWASP ZAP 2.15+ |
| Mode | Passive scan (no active attacks on staging) |
| Target API | `https://staging.easyryde.co.za/api/v1/` |
| Target Admin | `https://admin-staging.easyryde.co.za/` |
| Auth | Import staging admin cookie for authenticated scan |
| Schedule | Every staging deploy + before release |
| Fail threshold | Any HIGH or CRITICAL alert |

### 5.2 ZAP Rules to Monitor

| Rule | Risk | Why |
|------|------|-----|
| X-DNS-Prefetch-Control header missing | Low | Information disclosure |
| X-Content-Type-Options header missing | Medium | MIME sniffing |
| Content-Security-Policy not set | Medium | XSS mitigation |
| Strict-Transport-Security missing | Medium | MITM |
| Cookie without Secure flag | High | Session hijacking |
| Cookie without HttpOnly flag | Medium | XSS token theft |
| SQL Injection (passive) | Critical | Data exfiltration |

### 5.3 ZAP Baseline Report

Run and commit the baseline ZAP HTML report before release. The report must show zero HIGH/CRITICAL alerts.

---

## 6. Manual Review Areas

### 6.1 SQL Injection in Session Fallback

**Location:** Session driver fallback code that uses `DB::statement()` with string concatenation.

**Risk:** If the session table name or session ID is interpolated without parameter binding, an attacker can inject SQL via manipulated session IDs.

**Review:**
- [ ] Locate all `DB::statement()`, `DB::raw()`, and `DB::select()` calls in `app/`
- [ ] Verify parameter binding for all dynamic values
- [ ] Verify session driver does not use raw SQL for session management

### 6.2 XSS in Admin Settings

**Location:** Admin dashboard settings pages (email templates, SMS text, notification copy, promo descriptions).

**Risk:** Admin-entered content may contain malicious scripts that execute in other admin browsers.

**Review:**
- [ ] All admin text inputs sanitized via Blade `{{ }}` or `e()` helper
- [ ] Rich text fields (if any) use HTML-purifier
- [ ] No `{!! $var !!}` (unescaped) output on user/admin-controlled content
- [ ] Content-Security-Policy restricts inline script execution

### 6.3 CSRF

**Risk:** All state-changing endpoints require CSRF token validation. Sanctum SPA auth may configure SPA-based routes without CSRF protection if not using cookie-based sessions.

**Review:**
- [ ] All API routes in `routes/api.php` use Sanctum token auth (no CSRF needed for token auth)
- [ ] Web routes in `routes/web.php` (admin dashboard) include `web` middleware with CSRF
- [ ] Verify `VerifyCsrfToken` middleware is active for web routes
- [ ] Verify API token auth doesn't accidentally accept cookies

### 6.4 IDOR — Insecure Direct Object Reference

**Risk:** Users may access resources belonging to other users by manipulating IDs.

| Resource | Endpoint Pattern | Verification |
|----------|-----------------|--------------|
| Rides | `GET /api/v1/rides/{ride}` | Rider can only see own rides |
| Payments | `GET /api/v1/payments/{payment}` | Rider can only see own payments |
| Driver docs | `GET /api/v1/driver/documents/{doc}` | Driver can only see own docs |
| Wallet | `GET /api/v1/wallet/{wallet}` | Rider can only see own wallet |

**Review:**
- [ ] All resource controllers use `->where('user_id', auth()->id())` or policy gates
- [ ] No endpoint returns resources without ownership check
- [ ] Admin endpoints have separate controllers with `admin` middleware

### 6.5 Payment Webhook Signature Verification

**Risk:** Unverified webhooks can be spoofed to trigger false payment confirmations.

**Review:**
- [ ] Stripe webhook signature verified using `\Stripe\Webhook::constructEvent()`
- [ ] PayFast webhook uses `md5` signature verification with passphrase
- [ ] Ozow webhook uses HMAC-SHA256 signature verification
- [ ] Webhook handler is idempotent (replay-safe)
- [ ] Webhook handler logs all headers and payload for audit

### 6.6 Rate Limiting

**Risk:** Unauthenticated endpoints can be abused for brute force, DoS, or enumeration.

| Endpoint | Rate Limit | Applied? |
|----------|------------|----------|
| `POST /auth/login` | 100/min per IP | Verify in `RouteServiceProvider` |
| `POST /auth/register` | 10/min per IP | Verify |
| `POST /auth/forgot-password` | 5/min per IP | Verify |
| `POST /rides` | 30/min per user | Verify |
| `POST /rides/{id}/location` | 20/min per driver | Verify |
| `POST /payments` | 10/min per user | Verify |
| General API | 100/min per user | Verify |

---

## 7. Authentication Review

| Control | Status | Notes |
|---------|--------|-------|
| Token expiration | 7 days | Sanctum default, appropriate for mobile |
| Token refresh | Available | POST /api/v1/auth/refresh |
| Token revocation on logout | Implemented | Current token deleted |
| Password hashing | Bcrypt | Laravel default, verify cost factor (12+) |
| Email verification | Required for driver accounts | Verify |
| Password reset | Token-based, 60min expiry | Verify |
| Rate limiting on login | 5 attempts → 1min lockout | Verify |
| Role middleware enforcement | `role:rider`, `role:driver`, `role:admin` | Verify all routes |
| Failed login logging | `login_failed` audit event | Verify |

---

## 8. Infrastructure Security

| Control | Implementation | Status |
|---------|---------------|--------|
| TLS 1.3 | Nginx config, Let's Encrypt | Verify |
| HSTS | `Strict-Transport-Security: max-age=31536000` | Verify |
| CSP | `default-src 'self'; script-src 'self'; ...` | Configure |
| X-Frame-Options | `DENY` | Verify |
| X-Content-Type-Options | `nosniff` | Verify |
| CORS origin lock | `config/cors.php` restricts to specific origins | Verify |
| API rate limiting | `throttle:api` middleware | Verify |
| Database firewall | PostgreSQL allowed hosts restricted to app servers | Configure |
| Redis password | `REQUIREPASS` set in config | Verify |
| Horizon auth | Horizon dashboard behind admin auth | Verify |

---

## 9. Compliance

### 9.1 POPIA (South Africa)

| Requirement | Status | Notes |
|-------------|--------|-------|
| PII inventory | Open | Document all PII fields collected |
| Consent mechanism | Open | Add consent checkbox on registration |
| Data retention policy | Open | Define retention periods for each data type |
| Deletion request flow | Open | Allow users to request data deletion |
| Breach notification process | Open | Document 72-hour notification process |
| Privacy policy | Open | Draft and display in-app |

**PII Inventory (partial):**

| Field | Collection Point | Sensitivity | Retention |
|-------|-----------------|-------------|-----------|
| Full name | Registration | Medium | Account lifetime + 90 days |
| Email address | Registration | Medium | Account lifetime + 90 days |
| Phone number | Registration | High | Account lifetime + 90 days |
| ID/passport | Driver verification | High | Driver lifetime + 5 years |
| Driver's license | Driver verification | High | Driver lifetime + 5 years |
| Vehicle registration | Driver verification | Medium | Driver lifetime + 5 years |
| Home address | Driver verification | Medium | Driver lifetime + 90 days |
| Payment card data | Payment | **Offloaded to Stripe** | Not stored locally |
| GPS location | Ride in progress | High | Ride + 90 days (anonymized after) |
| Photos (profile, vehicle) | Profile setup | Medium | Account lifetime |

### 9.2 PCI-DSS

EasyRyde **offloads** all PCI-DSS scope to Stripe:

- Card numbers are NEVER stored in EasyRyde database
- All card entry happens via Stripe Elements (iframe) or Stripe Checkout
- Stripe returns a `card_id` token — we store only the token and last 4 digits
- PayFast handles redirect-based payment, not card data
- Ozow handles instant EFT, not card data

**PCI-DSS compliance = Stripe compliance.** As long as we don't handle raw card data, PCI scope is minimal. Verify:

- [ ] No raw PAN stored in any database table
- [ ] No raw PAN logged in any log file
- [ ] No raw PAN transmitted through our servers
- [ ] Card data always handled by Stripe.js / Stripe Checkout / PayFast / Ozow
