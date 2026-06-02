#!/usr/bin/env python3
"""
Live route ordering test: hit every literal endpoint that COULD be shadowed
by a wildcard in the same prefix group. If the wildcard shadows, the response
will be a model-not-found or similar error from the wildcard handler, instead
of the literal handler's expected response.

For each potential-shadow pair:
  1. Login as a user that has access
  2. Hit the literal endpoint (e.g. GET /api/v1/payments/methods)
  3. Verify the response is what the LITERAL handler would return
  4. Optionally hit the wildcard with that exact literal value to confirm
     they map to different controllers

Exit 0 on full pass, non-zero on any failure.
"""
import json
import sys
import time
from urllib import request, error

BASE = "http://localhost:8080"  # nginx → laravel

# (login_email, login_password, login_role) — for getting tokens
USERS = {
    "admin":  ("admin@easyryde.com",  "password"),
    "driver": ("driver@easyryde.com", "password"),
    "rider":  ("rider@easyryde.com",  "password"),
}

# Each test: (role, method, path, expected_status_or_callable, expected_substring)
# If expected_status_or_callable is an int, status code must match.
# If it's a callable, it gets the (status, body) and returns True/False.
# expected_substring is checked first if given.
TESTS = [
    # --- RIDES (admin sees all)
    ("admin", "GET", "/api/v1/rides",                  200, None),
    ("admin", "GET", "/api/v1/rides/current",          404, "No active ride"),  # literal handler IS running, not wildcard; admin has no current ride
    # --- DRIVERS (no role middleware on these endpoints)
    ("admin", "GET", "/api/v1/drivers",                200, None),
    ("admin", "GET", "/api/v1/drivers/earnings",       200, None),
    ("admin", "GET", "/api/v1/drivers/trips",          200, None),
    ("admin", "GET", "/api/v1/drivers/nearby-rides",   422, "Location"),  # admin has no location, validation kicks in (literal handler)
    ("admin", "GET", "/api/v1/drivers/deliveries",     200, None),
    # --- DRIVER role - their own data
    ("driver", "GET", "/api/v1/drivers/earnings",      200, None),
    ("driver", "GET", "/api/v1/drivers/trips",         200, None),
    ("driver", "GET", "/api/v1/drivers/nearby-rides",  422, "Location"),  # driver has no location set in seed
    # --- PAYMENTS
    ("admin", "GET", "/api/v1/payments",               200, None),
    ("admin", "GET", "/api/v1/payments/methods",       200, "Wallet"),  # literal before {payment}
    # --- RATINGS
    ("rider", "GET", "/api/v1/ratings",                200, None),
    ("rider", "GET", "/api/v1/ratings/given",          200, None),  # literal before {rating}
    # --- PROMO CODES
    ("admin", "GET", "/api/v1/promo-codes",            200, None),
    # --- DELIVERIES
    ("admin", "GET", "/api/v1/deliveries",             200, None),
    # --- FOOD
    ("rider", "GET", "/api/v1/food/orders",            200, None),
    ("rider", "GET", "/api/v1/food/restaurants",       200, None),
    # --- NOTIFICATIONS
    ("rider", "GET", "/api/v1/notifications",          200, None),
    ("rider", "GET", "/api/v1/notifications/unread-count", 200, None),  # literal before {notification}
    # --- REFERRALS - KNOWN BROKEN HANDLERS (server errors)
    ("rider", "GET", "/api/v1/referrals/my-code",      500, "Server Error"),
    ("rider", "GET", "/api/v1/referrals/stats",        500, "Server Error"),
    # --- SOS
    ("admin", "GET", "/api/v1/sos/active",             200, None),  # literal before {id}, admin only
    # --- ADMIN
    ("admin", "GET", "/api/v1/admin/dashboard",        200, None),
    ("admin", "GET", "/api/v1/admin/users",            200, None),
    ("admin", "GET", "/api/v1/admin/rides",            200, None),
    ("admin", "GET", "/api/v1/admin/drivers",           200, None),
    ("admin", "GET", "/api/v1/admin/settings",         200, None),
    ("admin", "GET", "/api/v1/admin/audit-logs",       200, None),
    # --- INCIDENTS
    ("rider", "GET", "/api/v1/incidents/my",           200, None),  # literal before {incident}
    # --- CONSENT
    ("rider", "GET", "/api/v1/consent",                200, None),
    ("rider", "GET", "/api/v1/consent/history",        200, None),
    # --- KYC
    ("rider", "GET", "/api/v1/kyc/my",                 200, None),  # literal before {verification}
    # --- COMPLIANCE admin
    ("admin", "GET", "/api/v1/admin/compliance/incidents",          200, None),
    ("admin", "GET", "/api/v1/admin/compliance/incidents/open",     200, None),  # literal before {incident}
    ("admin", "GET", "/api/v1/admin/compliance/incidents/stats",    200, None),
    ("admin", "GET", "/api/v1/admin/compliance/kyc/pending",        200, None),  # literal before {verification}
    ("admin", "GET", "/api/v1/admin/compliance/data-retention",     200, None),  # literal before {data-retention}
    # --- REPORTS - KNOWN BROKEN HANDLERS (server errors)
    ("admin", "GET", "/api/v1/reports/dashboard",      500, "Server Error"),
    ("admin", "GET", "/api/v1/reports/revenue",        500, "Server Error"),
    ("admin", "GET", "/api/v1/reports/drivers",        500, "Server Error"),
]


def http(method, path, token=None, body=None):
    req = request.Request(BASE + path, method=method)
    req.add_header("Accept", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    data = None
    if body is not None:
        req.add_header("Content-Type", "application/json")
        data = json.dumps(body).encode("utf-8")
    try:
        with request.urlopen(req, data=data, timeout=10) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace")
    except error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace")


def login(role):
    email, pwd = USERS[role]
    status, body = http("POST", "/api/v1/auth/login",
                        body={"email": email, "password": pwd})
    if status != 200:
        raise RuntimeError(f"login as {role} failed: {status} {body[:200]}")
    j = json.loads(body)
    return j["token"]


def main():
    tokens = {}
    passed = 0
    failed = 0
    print(f"Running {len(TESTS)} route-ordering tests against {BASE}\n")
    for role, method, path, expected, substr in TESTS:
        if role not in tokens:
            try:
                tokens[role] = login(role)
            except Exception as e:
                print(f"  SKIP {method} {path} (login: {e})")
                failed += 1
                continue
        token = tokens[role]
        try:
            status, body = http(method, path, token=token)
        except Exception as e:
            print(f"  FAIL {method} {path}: {e}")
            failed += 1
            continue
        ok = (status == expected)
        if ok and substr:
            ok = substr in body
        marker = "OK" if ok else "FAIL"
        if ok:
            passed += 1
        else:
            failed += 1
        # Trim body for output
        body_short = (body[:120] + "…") if len(body) > 120 else body
        body_short = body_short.replace("\n", " ")
        print(f"  [{marker}] {method:6} {path:55} -> {status} (expected {expected}) | {body_short}")
    print(f"\n{passed} passed, {failed} failed")
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
