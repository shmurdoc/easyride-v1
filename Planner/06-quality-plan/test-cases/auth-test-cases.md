# Auth Module — Test Cases

**Phase:** 06 — Quality Plan  
**Document:** Auth Test Cases  
**Version:** 1.0.0  
**Date:** 2026-06-17  
**Status:** Draft

---

## Coverage

| Test Case | Module | Priority | Automated | Type |
|-----------|--------|----------|-----------|------|
| TC-AUTH-001 | Registration | P0 | PHPUnit | Integration |
| TC-AUTH-002 | Registration | P0 | PHPUnit | Integration |
| TC-AUTH-003 | Registration | P1 | PHPUnit | Integration |
| TC-AUTH-004 | Login | P0 | PHPUnit | Integration |
| TC-AUTH-005 | Login | P0 | PHPUnit | Integration |
| TC-AUTH-006 | Login | P1 | PHPUnit | Integration |
| TC-AUTH-007 | Admin | P1 | PHPUnit | Integration |
| TC-AUTH-008 | Auth guard | P0 | PHPUnit | Integration |
| TC-AUTH-009 | Authorization | P0 | PHPUnit | Integration |
| TC-AUTH-010 | Token expiry | P1 | PHPUnit | Integration |
| TC-AUTH-011 | Refresh token | P1 | PHPUnit | Integration |
| TC-AUTH-012 | Password reset | P1 | PHPUnit | Integration |
| TC-AUTH-013 | Email verification | P2 | PHPUnit | Integration |
| TC-AUTH-014 | Logout | P1 | PHPUnit | Integration |
| TC-AUTH-015 | Social login | P2 | PHPUnit | Integration |

---

### TC-AUTH-001: Rider registers with valid data

| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-001 |
| **Title** | Rider registers with valid data |
| **Priority** | P0 |
| **Type** | Integration |
| **Module** | Auth / Registration |
| **Preconditions** | No existing user with this email |
| **Test data** | `email`: `rider@test.com`, `password`: `Password1!`, `name`: `Test Rider`, `phone`: `+27821234567`, `role`: `rider` |

**Steps:**
1. Send POST `/api/v1/auth/register` with valid rider payload
2. Assert HTTP 201 status
3. Assert response contains `token` field
4. Assert response contains `user` object with `role` = `rider`
5. Assert `user.email` matches input
6. Assert user exists in database with `email_verified_at` = null

**Expected result:** 201 Created. Sanctum token returned. User record created.

**Edge cases:** None (happy path)

---

### TC-AUTH-002: Rider registers with duplicate email

| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-002 |
| **Title** | Rider registers with duplicate email |
| **Priority** | P0 |
| **Type** | Integration |
| **Module** | Auth / Registration |
| **Preconditions** | User with email `rider@test.com` already exists |

**Steps:**
1. Send POST `/api/v1/auth/register` with the same email as existing user
2. Assert HTTP 422 status
3. Assert response contains validation error for `email`
4. Assert `errors.email` contains "already been taken"
5. Assert database still has exactly 1 record with this email

**Expected result:** 422 Unprocessable Entity. Duplicate email rejected. No new user created.

**Edge cases:** Email comparison should be case-insensitive (`User@Test.com` vs `user@test.com`)

---

### TC-AUTH-003: Rider registers with weak password

| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-003 |
| **Title** | Rider registers with weak password |
| **Priority** | P1 |
| **Type** | Integration |
| **Module** | Auth / Registration |
| **Preconditions** | None |

**Test data variations:**

| Variation | Password | Expected Error |
|-----------|----------|----------------|
| Too short | `Ab1!` | At least 8 characters |
| No uppercase | `password1!` | Must contain uppercase letter |
| No lowercase | `PASSWORD1!` | Must contain lowercase letter |
| No number | `Password!` | Must contain a number |
| No special char | `Password1` | Must contain special character |
| Common password | `Password1!` | Too common / compromised |

**Steps:**
1. Send POST `/api/v1/auth/register` with each weak password variation
2. Assert HTTP 422 status for each
3. Assert password validation error message is specific

**Expected result:** 422 with descriptive validation error. No user created.

**Edge cases:** Password exactly 8 chars with minimum requirements should pass.

---

### TC-AUTH-004: User logs in with valid credentials

| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-004 |
| **Title** | User logs in with valid credentials |
| **Priority** | P0 |
| **Type** | Integration |
| **Module** | Auth / Login |
| **Preconditions** | User exists with email `rider@test.com`, password `Password1!` |

**Steps:**
1. Send POST `/api/v1/auth/login` with `email`: `rider@test.com`, `password`: `Password1!`
2. Assert HTTP 200 status
3. Assert response contains `token` field (string, non-empty)
4. Assert response contains `user` object
5. Assert `token` is a valid Sanctum token in the database
6. Assert `token` has correct ability for the user's role

**Expected result:** 200 OK. Sanctum token returned. Token stored in `personal_access_tokens` table.

**Edge cases:** Login with email that has leading/trailing whitespace (server should trim).

---

### TC-AUTH-005: User logs in with wrong password

| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-005 |
| **Title** | User logs in with wrong password |
| **Priority** | P0 |
| **Type** | Integration |
| **Module** | Auth / Login |
| **Preconditions** | User exists with email `rider@test.com` |

**Steps:**
1. Send POST `/api/v1/auth/login` with correct email, wrong password `WrongPass1!`
2. Assert HTTP 401 status
3. Assert response contains `message` indicating invalid credentials
4. Assert no new Sanctum token is created

**Expected result:** 401 Unauthorized. No token returned.

**Edge cases:** Wrong password for existing email, non-existent email (should return same 401 to avoid user enumeration).

---

### TC-AUTH-006: Lockout after 5 failed attempts

| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-006 |
| **Title** | Lockout after 5 failed login attempts |
| **Priority** | P1 |
| **Type** | Integration |
| **Module** | Auth / Login |
| **Preconditions** | User exists with email `rider@test.com` |

**Steps:**
1. Send POST `/api/v1/auth/login` with wrong password 5 times
2. Assert each returns 401
3. Send 6th login attempt with correct password
4. Assert HTTP 429 status (Too Many Requests)
5. Assert response contains `retry_after` or `seconds` field
6. Assert message indicates account temporarily locked
7. Wait for lockout period to expire (if test environment allows)
8. Send correct credentials again
9. Assert 200 OK

**Expected result:** 429 after 5 failures. Lockout message with retry time. Login succeeds after cooldown.

**Edge cases:** Lockout counter resets after successful login. Lockout applies per-email, not per-IP.

---

### TC-AUTH-007: Admin creates driver account

| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-007 |
| **Title** | Admin creates a driver account |
| **Priority** | P1 |
| **Type** | Integration |
| **Module** | Auth / Admin |
| **Preconditions** | Admin user exists and is authenticated |

**Steps:**
1. Sanctum acting as admin
2. Send POST `/api/v1/admin/users` with driver payload
3. Assert HTTP 201 status
4. Assert response contains `user` with `role` = `driver`
5. Assert user record exists in database with role `driver`

**Expected result:** 201 Created. Driver account created with role 'driver'.

**Edge cases:** Non-admin user sending this request should get 403. Duplicate email/phone should get 422.

---

### TC-AUTH-008: Unauthenticated access to protected endpoint

| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-008 |
| **Title** | Unauthenticated access returns 401 |
| **Priority** | P0 |
| **Type** | Integration |
| **Module** | Auth / Guard |
| **Preconditions** | No auth token provided |

**Endpoints to verify (sample):**
- GET `/api/v1/rides`
- POST `/api/v1/rides`
- GET `/api/v1/wallet`
- GET `/api/v1/profile`
- POST `/api/v1/payments`

**Steps:**
1. Send request to each protected endpoint without Authorization header
2. Assert HTTP 401 for each
3. Assert response contains `message` indicating unauthenticated

**Expected result:** 401 Unauthorized for all protected endpoints.

**Edge cases:** Public endpoints (login, register, forgot-password) should return their normal responses, not 401.

---

### TC-AUTH-009: Access ride resource with wrong role

| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-009 |
| **Title** | Access ride resource as wrong role |
| **Priority** | P0 |
| **Type** | Integration |
| **Module** | Auth / Authorization |
| **Preconditions** | Rider user A and driver user B exist. Rider A has ride R1. |

**Steps:**
1. Sanctum acting as driver B
2. Send GET `/api/v1/rides/R1` (ride belonging to rider A)
3. Assert HTTP 403 status
4. Assert message indicates forbidden access

**Scenarios:**

| Scenario | Actor | Action | Expected |
|----------|-------|--------|----------|
| Driver accesses another driver's earnings | Driver A | GET `/api/v1/driver/earnings/B` | 403 |
| Rider accesses admin dashboard | Rider | GET `/api/v1/admin/dashboard` | 403 |
| Driver accesses rider's payment methods | Driver | GET `/api/v1/wallet/cards` | 403 |
| Unverified driver accepts rides | Unverified driver | POST `/api/v1/rides/accept` | 403 |

**Expected result:** 403 Forbidden. Role-based access control enforced.

---

### TC-AUTH-010: Token expires after 7 days

| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-010 |
| **Title** | Token expires after configured expiry period |
| **Priority** | P1 |
| **Type** | Integration |
| **Module** | Auth / Token |
| **Preconditions** | User has valid Sanctum token |

**Steps:**
1. Mock `now()` to return a date 8 days in the future
2. Use the existing token to call GET `/api/v1/rides`
3. Assert HTTP 401 status
4. Assert message indicates token expired

**Expected result:** 401 Unauthorized on expired token.

**Edge cases:** Token should still work on day 6. Refresh token flow should issue a new valid token. Revoked tokens return 401 regardless of expiry.

---

### TC-AUTH-011: Refresh token issues new token

| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-011 |
| **Title** | Refresh token endpoint issues new valid token |
| **Priority** | P1 |
| **Type** | Integration |
| **Module** | Auth / Token refresh |

**Steps:**
1. Login to get initial token
2. Call POST `/api/v1/auth/refresh` with the token
3. Assert HTTP 200
4. Assert new token returned
5. Use old token → 401
6. Use new token → 200

**Expected result:** New token issued, old token revoked.

---

### TC-AUTH-012: Password reset flow

| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-012 |
| **Title** | Password reset via email |
| **Priority** | P1 |
| **Type** | Integration |
| **Module** | Auth / Password reset |

**Steps:**
1. Send POST `/api/v1/auth/forgot-password` with valid email
2. Assert HTTP 200 with success message
3. Extract reset token from database (or mock mail)
4. Send POST `/api/v1/auth/reset-password` with email, token, new password
5. Assert HTTP 200
6. Login with new password → 200
7. Login with old password → 401

**Expected result:** Password successfully reset. New password works, old password rejected.

---

### TC-AUTH-013: Email verification

| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-013 |
| **Title** | Email verification flow |
| **Priority** | P2 |
| **Type** | Integration |
| **Module** | Auth / Email verification |

**Steps:**
1. Register new user (email unverified)
2. Access protected resource requiring verified email → 403
3. Call POST `/api/v1/auth/email/verify` with valid verification URL
4. Assert HTTP 200
5. Access protected resource → 200
6. `email_verified_at` should be set in database

**Expected result:** Verified user can access protected resources.

---

### TC-AUTH-014: Logout invalidates token

| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-014 |
| **Title** | Logout invalidates current token |
| **Priority** | P1 |
| **Type** | Integration |
| **Module** | Auth / Logout |

**Steps:**
1. Login to get token
2. Send POST `/api/v1/auth/logout` with Bearer token
3. Assert HTTP 200
4. Use same token to access protected endpoint → 401
5. Token should be revoked/removed from `personal_access_tokens`

**Expected result:** Token invalidated after logout.

---

### TC-AUTH-015: Social login

| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-015 |
| **Title** | Social login with Google |
| **Priority** | P2 |
| **Type** | Integration |
| **Module** | Auth / Social login |

**Steps:**
1. Send POST `/api/v1/auth/social/google` with valid provider token
2. Assert HTTP 200
3. Assert response contains Sanctum token
4. Assert user created or matched by social ID
5. Login again with same social account → 200 (same user, new token)

**Expected result:** Social login creates/authenticates user and returns Sanctum token.
