# Ride Module — Test Cases

**Phase:** 06 — Quality Plan  
**Document:** Ride Test Cases  
**Version:** 1.0.0  
**Date:** 2026-06-17  
**Status:** Draft

---

## Coverage

| Test Case | Module | Priority | Automated | Type |
|-----------|--------|----------|-----------|------|
| TC-RIDE-001 | Ride request | P0 | PHPUnit | Integration |
| TC-RIDE-002 | Ride request | P0 | PHPUnit | Integration |
| TC-RIDE-003 | Ride cancellation | P0 | PHPUnit | Integration |
| TC-RIDE-004 | Ride cancellation | P1 | PHPUnit | Integration |
| TC-RIDE-005 | Ride acceptance | P0 | PHPUnit | Integration |
| TC-RIDE-006 | Ride acceptance | P1 | PHPUnit | Integration |
| TC-RIDE-007 | Driver arrival | P0 | PHPUnit | Integration |
| TC-RIDE-008 | Ride expiry | P1 | PHPUnit | Integration |
| TC-RIDE-009 | Rating | P1 | PHPUnit | Integration |
| TC-RIDE-010 | Rating | P1 | PHPUnit | Integration |
| TC-RIDE-011 | Fare calculation | P0 | PHPUnit | Unit |
| TC-RIDE-012 | Surge pricing | P1 | PHPUnit | Unit |
| TC-RIDE-013 | Ride history | P1 | PHPUnit | Integration |
| TC-RIDE-014 | Driver location update | P2 | PHPUnit | Integration |
| TC-RIDE-015 | Concurrent ride requests | P1 | PHPUnit | Integration |

---

### TC-RIDE-001: Rider requests ride with valid data

| Field | Value |
|-------|-------|
| **ID** | TC-RIDE-001 |
| **Title** | Rider requests ride with valid data |
| **Priority** | P0 |
| **Type** | Integration |
| **Module** | Ride / Request |
| **Preconditions** | Rider is authenticated. No active ride exists for this rider. |

**Test data:**
```json
{
  "pickup_latitude": -23.9468,
  "pickup_longitude": 29.4726,
  "pickup_address": "Phalaborwa CBD",
  "dropoff_latitude": -23.9500,
  "dropoff_longitude": 29.4800,
  "dropoff_address": "Phalaborwa Airport",
  "category": "standard"
}
```

**Steps:**
1. Sanctum acting as rider
2. Send POST `/api/v1/rides` with valid payload
3. Assert HTTP 201 status
4. Assert response contains `ride` object with `id`, `status` = `searching`
5. Assert response contains `estimated_fare` (number > 0)
6. Assert `ride.rider_id` matches authenticated user
7. Assert ride record exists in database with status `searching`

**Expected result:** 201 Created. Ride created in `searching` status. Driver notification queued.

**Edge cases:** Coordinates outside service area should return 422. Category 'premium' should calculate higher fare.

---

### TC-RIDE-002: Rider requests ride with missing fields

| Field | Value |
|-------|-------|
| **ID** | TC-RIDE-002 |
| **Title** | Rider requests ride with missing required fields |
| **Priority** | P0 |
| **Type** | Integration |
| **Module** | Ride / Validation |
| **Preconditions** | Rider is authenticated. |

**Test variations:**

| Missing Field | Expected Error |
|---------------|----------------|
| `pickup_latitude` | The pickup location is required |
| `dropoff_latitude` | The dropoff location is required |
| `category` | The ride category is required |
| All fields | Multiple validation errors |

**Steps:**
1. Send POST `/api/v1/rides` with each missing field variation
2. Assert HTTP 422 for each
3. Assert error message indicates which field is missing

**Expected result:** 422 Unprocessable Entity. Descriptive validation error for each missing required field.

---

### TC-RIDE-003: Rider cancels own ride within 2 minutes

| Field | Value |
|-------|-------|
| **ID** | TC-RIDE-003 |
| **Title** | Rider cancels own ride within grace period |
| **Priority** | P0 |
| **Type** | Integration |
| **Module** | Ride / Cancellation |
| **Preconditions** | Rider has an active ride with status `searching`. Ride was created < 2 minutes ago. |

**Steps:**
1. Mock `now()` to return a time 1 minute after ride creation
2. Sanctum acting as the ride's rider
3. Send POST `/api/v1/rides/{id}/cancel`
4. Assert HTTP 200 status
5. Assert `ride.status` = `cancelled`
6. Assert `cancellation_fee` = 0 (no fee within grace period)
7. Assert wallet refund was issued (if prepaid)

**Expected result:** 200 OK. Ride cancelled. No fee charged. Wallet refunded if applicable.

**Edge cases:** Cancelling ride that was already accepted by driver (status `accepted`) — should still be free within 2 min of creation.

---

### TC-RIDE-004: Rider cancels after 2 minutes

| Field | Value |
|-------|-------|
| **ID** | TC-RIDE-004 |
| **Title** | Rider cancels ride after grace period |
| **Priority** | P1 |
| **Type** | Integration |
| **Module** | Ride / Cancellation |
| **Preconditions** | Rider has an active ride. Ride was created > 2 minutes ago. Driver may or may not be assigned. |

**Steps:**
1. Mock `now()` to return 3 minutes after ride creation
2. Send POST `/api/v1/rides/{id}/cancel`
3. Assert HTTP 200
4. Assert `ride.status` = `cancelled`
5. Assert `cancellation_fee` > 0
6. Assert fee is deducted from wallet or pending payment
7. Assert cancellation fee is credited to driver (if driver was assigned)

**Expected result:** 200 OK. Ride cancelled. Cancellation fee charged. Driver compensated.

**Edge cases:** Fee schedule: no driver assigned = R5 fee, driver assigned = R15 fee, driver arrived = R25 fee.

---

### TC-RIDE-005: Driver accepts ride

| Field | Value |
|-------|-------|
| **ID** | TC-RIDE-005 |
| **Title** | Driver accepts a ride |
| **Priority** | P0 |
| **Type** | Integration |
| **Module** | Ride / Acceptance |
| **Preconditions** | Ride exists in `searching` status. Driver is authenticated, verified, and online. |

**Steps:**
1. Sanctum acting as verified driver
2. Send POST `/api/v1/rides/{id}/accept`
3. Assert HTTP 200 status
4. Assert `ride.status` = `accepted`
5. Assert `ride.driver_id` matches authenticated driver
6. Assert rider receives real-time notification via Socket.io
7. Assert ride record shows `accepted_at` timestamp

**Expected result:** 200 OK. Ride status changed to `accepted`. Driver assigned. Rider notified.

**Edge cases:** Driver not verified → 403. Driver offline → 403. Driver already on a ride → 409.

---

### TC-RIDE-006: Two drivers accept same ride simultaneously

| Field | Value |
|-------|-------|
| **ID** | TC-RIDE-006 |
| **Title** | Two drivers accept the same ride — first wins |
| **Priority** | P1 |
| **Type** | Integration |
| **Module** | Ride / Acceptance |
| **Preconditions** | Ride exists in `searching` status. Two verified, online drivers exist. |

**Steps:**
1. Using database transactions or lock simulation:
   a. Driver A sends POST `/api/v1/rides/{id}/accept` → assert 200
   b. Driver B sends POST `/api/v1/rides/{id}/accept` → assert 409 Conflict
2. Assert `ride.driver_id` = Driver A
3. Assert `ride.status` = `accepted`
4. Assert Driver B receives error message: "Ride has already been accepted"

**Expected result:** First driver wins. Second gets 409 Conflict. Ride state is consistent.

**Edge case verification:** Verify database row-level locking prevents race condition. Verify rollback if notification fails after acceptance.

---

### TC-RIDE-007: Driver arrives at pickup

| Field | Value |
|-------|-------|
| **ID** | TC-RIDE-007 |
| **Title** | Driver arrives at pickup location |
| **Priority** | P0 |
| **Type** | Integration |
| **Module** | Ride / Status |
| **Preconditions** | Ride is in `accepted` status. Driver is authenticated and is the assigned driver. |

**Steps:**
1. Sanctum acting as assigned driver
2. Send POST `/api/v1/rides/{id}/arrived`
3. Assert HTTP 200
4. Assert `ride.status` = `arrived`
5. Assert `ride.arrived_at` timestamp is set
6. Assert rider receives push notification: "Your driver has arrived"
7. Assert driver's location is within 100m of pickup coordinates (geofence check)

**Expected result:** 200 OK. Ride status = `arrived`. Rider notified.

**Edge cases:** Driver arrives but rider cancels → cancellation fee applies. Driver marks arrived before reaching geofence → 422.

---

### TC-RIDE-008: Ride expires after 5 minutes with no driver

| Field | Value |
|-------|-------|
| **ID** | TC-RIDE-008 |
| **Title** | Ride auto-cancels when no driver accepts |
| **Priority** | P1 |
| **Type** | Integration |
| **Module** | Ride / Expiry |
| **Preconditions** | Ride exists in `searching` status. No driver has accepted. |

**Steps:**
1. Create ride at time T
2. Dispatch the scheduled expiry job or mock time + 5 minutes
3. Run queue worker to process expiry job
4. Fetch ride → status = `expired`
5. Assert rider receives notification: "No drivers available"
6. Assert no cancellation fee charged

**Expected result:** Ride auto-cancels after expiry period. No fee. Rider notified.

**Edge cases:** Driver accepts at T+4m59s → ride should NOT expire. Multiple expiry jobs should not double-process.

---

### TC-RIDE-009: Rider rates ride 1-5 stars

| Field | Value |
|-------|-------|
| **ID** | TC-RIDE-009 |
| **Title** | Rider rates completed ride |
| **Priority** | P1 |
| **Type** | Integration |
| **Module** | Ride / Rating |
| **Preconditions** | Ride is in `completed` status. Authenticated rider is the ride rider. |

**Test data:**
```json
{
  "rating": 5,
  "comment": "Great ride, very professional driver"
}
```

**Steps:**
1. Send POST `/api/v1/rides/{id}/rate` with rating 5
2. Assert HTTP 201 status
3. Assert rating stored in `ratings` table
4. Assert `rating.rider_id` matches authenticated user
5. Assert `rating.ride_id` matches ride
6. Assert driver's average rating recalculated

**Scenarios:**

| Rating | Expected |
|--------|----------|
| 1 | 201 Created. Rating stored. Driver notified of low rating. |
| 3 | 201 Created. Neutral rating. No notification. |
| 5 + comment | 201 Created. Driver sees comment in earnings page. |
| 5 (no comment) | 201 Created. Comment is nullable. |

**Expected result:** 201 Created. Rating stored. Driver rating updated.

**Edge cases:** Rating < 1 or > 5 → 422. Rating ride that isn't completed → 422. Rating someone else's ride → 403.

---

### TC-RIDE-010: Rider rates ride they didn't take

| Field | Value |
|-------|-------|
| **ID** | TC-RIDE-010 |
| **Title** | Rider rates a ride belonging to another user |
| **Priority** | P1 |
| **Type** | Integration |
| **Module** | Ride / Authorization |
| **Preconditions** | Ride exists in `completed` status. Authenticated rider is NOT the ride rider. |

**Steps:**
1. Send POST `/api/v1/rides/{id}/rate` with rating
2. Assert HTTP 403 status
3. Assert message: "You can only rate your own rides"

**Expected result:** 403 Forbidden. Cross-user rating prevented.

---

### TC-RIDE-011: Fare calculation for different categories

| Field | Value |
|-------|-------|
| **ID** | TC-RIDE-011 |
| **Title** | Fare calculation produces correct amounts per category |
| **Priority** | P0 |
| **Type** | Unit |
| **Module** | FareCalculationService |

**Scenarios:**

| Category | Distance | Duration | Expected Base | Expected Total |
|----------|----------|----------|---------------|----------------|
| Economy | 5km | 10min | R8.00 base + R32.50 km + R10.00 min | R50.50 |
| Standard | 5km | 10min | R12.00 base + R42.50 km + R15.00 min | R69.50 |
| Premium | 5km | 10min | R20.00 base + R60.00 km + R20.00 min | R100.00 |
| XL | 5km | 10min | R18.00 base + R50.00 km + R15.00 min | R83.00 |

**Steps:**
1. Mock FareCalculationService with known distance/duration
2. Calculate fare for each category
3. Assert base, distance, time, and total match expected values
4. Assert minimum fare enforcement (Economy: R18.00 minimum)

**Expected result:** Fare breakdown matches pricing table for each category.

---

### TC-RIDE-012: Surge pricing multiplier applied correctly

| Field | Value |
|-------|-------|
| **ID** | TC-RIDE-012 |
| **Title** | Surge pricing multiplier applied when demand > supply |
| **Priority** | P1 |
| **Type** | Unit |
| **Module** | SurgePricingService |

**Scenarios:**

| Demand/Supply Ratio | Expected Multiplier |
|---------------------|---------------------|
| < 1.0 (low demand) | 1.0x (no surge) |
| 1.0 - 1.5 | 1.2x |
| 1.5 - 2.0 | 1.5x |
| 2.0 - 3.0 | 1.8x |
| > 3.0 | 2.0x (maximum) |

**Steps:**
1. Mock current demand (active ride requests) and supply (available drivers)
2. Calculate surge multiplier for each ratio
3. Assert multiplier matches expected value
4. Assert total fare = base fare × multiplier

**Expected result:** Surge multiplier scales with demand/supply ratio, capped at 2.0x.

**Edge cases:** Zero available drivers → maximum surge (attract drivers). Event-based surge (configured manually) overrides calculated surge.

---

### TC-RIDE-013: Rider views ride history with pagination

| Field | Value |
|-------|-------|
| **ID** | TC-RIDE-013 |
| **Title** | Rider views paginated ride history |
| **Priority** | P1 |
| **Type** | Integration |
| **Module** | Ride / History |
| **Preconditions** | Rider has 15 completed rides. |

**Steps:**
1. Send GET `/api/v1/rides?per_page=10&page=1`
2. Assert HTTP 200
3. Assert response has `data` array with 10 items
4. Assert `meta` contains pagination: `total` = 15, `current_page` = 1, `last_page` = 2
5. Assert each ride has `id`, `status`, `pickup_address`, `dropoff_address`, `created_at`, `fare`
6. Send GET `/api/v1/rides?page=2` → 5 items

**Expected result:** Paginated ride history. Correct data set per page.

**Edge cases:** Filter by status (`?status=completed`). Filter by date range (`?from=...&to=...`). Empty history returns empty array.

---

### TC-RIDE-014: Driver sends location updates during ride

| Field | Value |
|-------|-------|
| **ID** | TC-RIDE-014 |
| **Title** | Driver's location updates are stored and broadcast |
| **Priority** | P2 |
| **Type** | Integration |
| **Module** | Ride / Location |
| **Preconditions** | Ride is in `accepted` or `started` status. Driver is authenticated and assigned. |

**Steps:**
1. Sanctum acting as driver
2. Send POST `/api/v1/rides/{id}/location` with valid coordinates
3. Assert HTTP 200
4. Assert location stored in `location_history` table
5. Assert Socket.io event `ride:location` emitted with coordinates

**Expected result:** Location stored and broadcast in real-time.

**Edge cases:** Driver not assigned to this ride → 403. Location outside expected geofence → 200 (stored but flagged). Rate-limited to 1 per 3 seconds.

---

### TC-RIDE-015: Concurrent ride requests prevent double-booking

| Field | Value |
|-------|-------|
| **ID** | TC-RIDE-015 |
| **Title** | Rider cannot have two active rides simultaneously |
| **Priority** | P1 |
| **Type** | Integration |
| **Module** | Ride / Concurrency |
| **Preconditions** | Rider has an active ride in `searching` status. |

**Steps:**
1. Send POST `/api/v1/rides` with valid data
2. Assert HTTP 409 Conflict
3. Assert message: "You already have an active ride"

**Expected result:** 409 Conflict. Second ride request rejected.

**Edge cases:** Rider completes first ride (status = `completed`) → can create new ride. Rider cancels first ride → can create new ride. Race condition: two simultaneous requests from same rider → first succeeds, second gets 409.
