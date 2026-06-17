# EasyRyde — API Contracts

**Version:** 1.0.0  
**Updated:** 2026-06-17  
**Status:** Final  
**Base URL:** `https://api.easyryde.co.za/api/v1` (production) / `http://localhost:8000/api/v1` (dev)  
**Auth:** Laravel Sanctum (Bearer token in `Authorization` header)  
**Envelope:** `{ data: ..., message: ..., errors: {...} }` (Laravel JSON resource convention)

---

## General Notes

- **Rate limits:** 60 req/min general authenticated, 10 req/min auth endpoints, 5 req/min password reset
- **Roles:** `rider`, `driver`, `admin`, `super-admin`
- **All authenticated endpoints** require `Authorization: Bearer {token}`
- **UUIDs** used for all resource identifiers
- **Timestamps** in ISO 8601 format
- **Monetary values** in ZAR (South African Rand), decimal(2) precision
- **Coordinates** in decimal degrees (decimal:7 precision)

---

## 1. Auth (8 endpoints)

### POST /v1/auth/register
- **Auth:** None | **Rate:** 10/min
- **Request:**
  ```json
  {
    "name": "string|required|max:255",
    "email": "string|required|email|unique:users",
    "phone_number": "string|nullable|regex:/^(\+27|0)[0-9]{9}$/",
    "password": "string|required|min:8|confirmed",
    "role": "string|in:rider,driver|default:rider",
    "referral_code": "string|nullable|exists:referral_codes,code"
  }
  ```
- **Response 201:**
  ```json
  { "data": { "user": { "id", "name", "email", "phone_number", "role", "created_at" }, "token": "sanctum_token" } }
  ```
- **Response 422:** `{ "message": "...", "errors": { "email": ["The email has already been taken."] } }`

### POST /v1/auth/login
- **Auth:** None | **Rate:** 10/min
- **Request:**
  ```json
  {
    "email": "string|required_without:phone_number|email",
    "phone_number": "string|required_without:email",
    "password": "string|required"
  }
  ```
- **Response 200:**
  ```json
  { "data": { "user": { "id", "name", "email", "phone_number", "role", "is_kyc_verified", "is_approved", "wallet_balance" }, "token": "sanctum_token" } }
  ```
- **Response 401:** `{ "message": "Invalid credentials" }`

### POST /v1/auth/forgot-password
- **Auth:** None | **Rate:** 5/min
- **Request:** `{ "email": "string|required|email|exists:users,email" }`
- **Response 200:** `{ "message": "Password reset link sent" }`

### POST /v1/auth/reset-password
- **Auth:** None | **Rate:** 5/min
- **Request:** `{ "email": "string|required|email", "token": "string|required", "password": "string|required|min:8|confirmed" }`
- **Response 200:** `{ "message": "Password reset successfully" }`

### POST /v1/auth/logout
- **Auth:** Sanctum | **Rate:** 10/min
- **Request:** None
- **Response 200:** `{ "message": "Logged out successfully" }`

### GET /v1/auth/me
- **Auth:** Sanctum | **Rate:** 60/min
- **Response 200:**
  ```json
  { "data": { "user": { "id", "name", "email", "phone_number", "role", "is_kyc_verified", "is_approved", "is_active", "wallet": {...}, "driver_profile": {...}, "vehicle": {...} } } }
  ```

### POST /v1/admin/drivers
- **Auth:** Sanctum | **Rate:** 30/min | **Role:** admin/super-admin
- **Request:**
  ```json
  {
    "name": "string|required",
    "email": "string|required|email|unique:users",
    "phone_number": "string|required",
    "password": "string|required|min:8"
  }
  ```
- **Response 201:** `{ "data": { "user": {...}, "token": "..." } }`

---

## 2. Rides (14 endpoints)

### GET /v1/rides
- **Auth:** Sanctum | **Rate:** 60/min | **Role:** rider, driver, admin
- **Query params:** `status`, `per_page`, `page`, `from_date`, `to_date`
- **Response 200:** `{ "data": [ { "id", "status", "pickup_address", "dropoff_address", "total_fare", "created_at", "driver": {...}, "rider": {...} } ], "meta": { "current_page", "last_page", "total" } }`

### POST /v1/rides
- **Auth:** Sanctum | **Rate:** 30/min | **Role:** rider
- **Request:**
  ```json
  {
    "pickup_latitude": "numeric|required|between:-90,90",
    "pickup_longitude": "numeric|required|between:-180,180",
    "pickup_address": "string|required",
    "dropoff_latitude": "numeric|required|between:-90,90",
    "dropoff_longitude": "numeric|required|between:-180,180",
    "dropoff_address": "string|required",
    "category": "string|in:standard,premium,minivan,pets,delivery|default:standard",
    "payment_method": "string|in:card,cash,wallet|default:card",
    "promo_code": "string|nullable|exists:promo_codes,code"
  }
  ```
- **Response 201:**
  ```json
  { "data": { "ride": { "id", "status": "pending", "pickup_address", "dropoff_address", "category", "distance_km", "total_fare", "payment_method", "promo_code_id", "discount_amount", "driver_eta": null, "created_at" } } }
  ```
- **Response 422:** validation errors

### GET /v1/rides/current
- **Auth:** Sanctum | **Role:** rider, driver
- **Response 200:** `{ "data": { "ride": { "id", "status", "pickup_address", "dropoff_address", "driver": {...} or null } } }`
- **Response 200 (no current ride):** `{ "data": null }`

### GET /v1/rides/{ride}
- **Auth:** Sanctum | **Role:** ride participant or admin
- **Response 200:** `{ "data": { "id", "status", "pickup_latitude", "pickup_longitude", "pickup_address", "dropoff_latitude", "dropoff_longitude", "dropoff_address", "category", "distance_km", "duration_minutes", "base_fare", "per_km_fare", "surge_multiplier", "total_fare", "discount_amount", "payment_method", "payment_status", "driver_eta", "route_polyline", "started_at", "completed_at", "cancelled_at", "cancelled_by", "cancellation_reason", "driver": {...}, "rider": {...}, "payment": {...}, "rating": {...} } }`
- **Response 404:** `{ "message": "Ride not found" }`

### POST /v1/rides/{ride}/cancel
- **Auth:** Sanctum | **Role:** ride participant
- **Request:** `{ "reason": "string|nullable|max:500" }`
- **Response 200:** `{ "data": { "ride": { "id", "status": "cancelled", "cancelled_at", "cancelled_by", "cancellation_reason" } } }`

### POST /v1/rides/{ride}/rate
- **Auth:** Sanctum | **Role:** ride participant
- **Request:** `{ "score": "integer|required|between:1,5", "comment": "string|nullable|max:500" }`
- **Response 201:** `{ "data": { "rating": { "id", "score", "comment", "rater_id", "ratee_id", "created_at" } } }`

### POST /v1/rides/{ride}/apply-promo
- **Auth:** Sanctum | **Role:** rider
- **Request:** `{ "code": "string|required|exists:promo_codes,code" }`
- **Response 200:** `{ "data": { "discount_amount", "new_total_fare" } }`

### POST /v1/rides/{ride}/driver-accept
- **Auth:** Sanctum | **Role:** driver
- **Request:** (empty body)
- **Response 200:** `{ "data": { "ride": { "id", "status": "accepted", "driver_id", "driver_eta" } } }`

### POST /v1/rides/{ride}/driver-arrived
- **Auth:** Sanctum | **Role:** driver
- **Response 200:** `{ "data": { "ride": { "id", "status": "driver_arrived" } } }`

### POST /v1/rides/{ride}/start
- **Auth:** Sanctum | **Role:** driver
- **Response 200:** `{ "data": { "ride": { "id", "status": "in_progress", "started_at" } } }`

### POST /v1/rides/{ride}/complete
- **Auth:** Sanctum | **Role:** driver
- **Request:** `{ "actual_distance_km": "numeric|nullable" }`
- **Response 200:** `{ "data": { "ride": { "id", "status": "completed", "completed_at", "total_fare", "payment_status" }, "payment": {...} } }`

### POST /v1/rides/{ride}/location
- **Auth:** Sanctum | **Role:** driver
- **Request:** `{ "latitude": "numeric|required|between:-90,90", "longitude": "numeric|required|between:-180,180" }`
- **Response 200:** `{ "message": "Location updated" }`

### GET /v1/rides/{ride}/receipt
- **Auth:** Sanctum | **Role:** ride participant or admin
- **Response 200:** PDF binary (Content-Type: application/pdf) or
  ```json
  { "data": { "receipt": { "ride_id", "rider_name", "driver_name", "pickup_address", "dropoff_address", "base_fare", "per_km_fare", "distance_km", "duration_minutes", "surge_multiplier", "discount_amount", "total_fare", "payment_method", "payment_status", "paid_at", "receipt_number" } } }
  ```

### GET /v1/rides/fare-estimate
- **Auth:** None | **Rate:** 60/min
- **Query params:** `pickup_lat`, `pickup_lng`, `dropoff_lat`, `dropoff_lng`, `category`
- **Response 200:**
  ```json
  { "data": { "distance_km", "duration_minutes", "base_fare", "estimated_total", "surge_multiplier": 1.0, "breakdown": { "base", "distance", "time", "surge" } } }
  ```

---

## 3. Drivers (8 endpoints)

### GET /v1/drivers
- **Auth:** Sanctum | **Role:** admin only (non-admin sees own profile)
- **Query params:** `is_online`, `is_approved`, `near_lat`, `near_lng`, `radius_km`
- **Response 200:** `{ "data": [ { "id", "name", "phone_number", "email", "is_online", "is_approved", "rating", "current_latitude", "current_longitude", "vehicle": {...}, "driver_profile": {...} } ] }`

### GET /v1/drivers/nearby-rides
- **Auth:** Sanctum | **Role:** driver
- **Response 200:** `{ "data": [ { "ride_id", "pickup_latitude", "pickup_longitude", "pickup_address", "dropoff_address", "category", "estimated_fare", "distance_km", "rater_id" } ] }`

### PUT /v1/drivers/profile
- **Auth:** Sanctum | **Role:** driver
- **Request:**
  ```json
  {
    "phone_number": "string|nullable",
    "license_number": "string|nullable",
    "license_expiry": "date|nullable",
    "id_number": "string|nullable",
    "date_of_birth": "date|nullable",
    "emergency_contact_name": "string|nullable",
    "emergency_contact_phone": "string|nullable"
  }
  ```
- **Response 200:** `{ "data": { "user": {...}, "driver_profile": {...} } }`

### POST /v1/drivers/vehicle
- **Auth:** Sanctum | **Role:** driver
- **Request:**
  ```json
  {
    "make": "string|required",
    "model": "string|required",
    "year": "integer|required|min:2000|max:2030",
    "color": "string|required",
    "license_plate": "string|required",
    "category": "string|in:standard,premium,minivan|default:standard"
  }
  ```
- **Response 201:** `{ "data": { "vehicle": { "id", "make", "model", "year", "color", "license_plate", "category", "is_active" } } }`

### POST /v1/drivers/toggle-online
- **Auth:** Sanctum | **Role:** driver
- **Request:** `{ "is_online": "boolean|required" }`
- **Response 200:** `{ "data": { "is_online": true/false } }`

### GET /v1/drivers/earnings
- **Auth:** Sanctum | **Role:** driver
- **Query params:** `from_date`, `to_date`
- **Response 200:**
  ```json
  { "data": { "total_earnings", "this_week", "this_month", "pending_payout", "last_payout", "trip_count", "breakdown": [ { "date", "earnings", "trips", "tips" } ] } }
  ```

### GET /v1/drivers/trips
- **Auth:** Sanctum | **Role:** driver
- **Query params:** `status`, `per_page`, `page`
- **Response 200:** `{ "data": [ { "ride": {...} } ], "meta": { "current_page", "last_page", "total" } }`

### GET /v1/drivers/{driver}
- **Auth:** Sanctum | **Role:** admin (riders see public profile)
- **Response 200:** `{ "data": { "id", "name", "rating", "total_trips", "vehicle": {...}, "is_online" } }`

---

## 4. Payments (10 endpoints)

### GET /v1/payments
- **Auth:** Sanctum | **Rate:** 30/min | **Role:** rider, driver, admin
- **Query params:** `status`, `method`, `from_date`, `to_date`, `per_page`
- **Response 200:** `{ "data": [ { "id", "ride_id", "method", "gateway", "amount", "platform_fee", "status", "paid_at", "ride": {...} } ] }`

### GET /v1/payments/methods
- **Auth:** Sanctum | **Rate:** 30/min
- **Response 200:** `{ "data": [ { "type": "card", "last_four": "4242", "brand": "Visa", "expiry_month": "12", "expiry_year": "2027", "is_default": true } ] }`

### GET /v1/payments/{payment}
- **Auth:** Sanctum | **Role:** payment participant or admin
- **Response 200:**
  ```json
  { "data": { "id", "ride_id", "payer_id", "payee_id", "method", "gateway", "gateway_reference", "amount", "platform_fee", "driver_payout", "status", "paid_at", "gateway_response": {...}, "refunded_at", "refund_reason", "refund_amount", "escrow_released", "dispute_hold", "cash_received", "cash_reconciled", "ride": {...}, "payer": {...}, "payee": {...} } }
  ```

### POST /v1/payments/rides/{ride}/pay
- **Auth:** Sanctum | **Role:** rider
- **Request:**
  ```json
  {
    "method": "string|required|in:card,cash,wallet",
    "payment_method_id": "string|nullable|required_if:method,card"
  }
  ```
- **Response 200:**
  ```json
  { "data": { "payment": { "id", "status": "processing/completed", "amount", "gateway_reference" } } }
  ```

### POST /v1/payments/{payment}/refund
- **Auth:** Sanctum | **Role:** admin/super-admin
- **Request:**
  ```json
  {
    "reason": "string|required|max:500",
    "amount": "numeric|nullable|max:payment.amount"
  }
  ```
- **Response 200:** `{ "data": { "payment": { "id", "status": "refunded", "refund_amount", "refunded_at" } } }`

### POST /v1/payments/{payment}/dispute
- **Auth:** Sanctum | **Role:** payer
- **Request:**
  ```json
  {
    "reason": "string|required|in:incorrect_charge,service_not_provided,driver_issue,other",
    "description": "string|required|max:2000"
  }
  ```
- **Response 201:** `{ "data": { "dispute": { "id", "status": "open", "reason", "description", "created_at" } } }`

### POST /v1/webhooks/stripe
- **Auth:** Stripe webhook signature | **Rate:** 120/min
- **Request:** Raw Stripe event JSON
- **Response 200:** `{ "received": true }`

### POST /v1/webhooks/payfast
- **Auth:** IP verification | **Rate:** 60/min
- **Request:** PayFast ITN data (POST)
- **Response 200:** `OK`

### POST /v1/webhooks/ozow
- **Auth:** IP verification | **Rate:** 60/min
- **Request:** Ozow callback data (POST)
- **Response 200:** `{ "status": "received" }`

### POST /v1/webhooks/partner/order & POST /v1/webhooks/partner/status
- **Auth:** Partner API token (header) | **Rate:** 60/min
- **Request:** Partner order/status JSON
- **Response 200:** `{ "received": true }`

---

## 5. Wallet (4 endpoints)

### GET /v1/wallet
- **Auth:** Sanctum | **Role:** all
- **Response 200:**
  ```json
  { "data": { "id", "balance", "pending_balance", "currency": "ZAR", "user_id" } }
  ```

### GET /v1/wallet/transactions
- **Auth:** Sanctum | **Role:** all
- **Query params:** `type`, `per_page`, `page`, `from_date`, `to_date`
- **Response 200:** `{ "data": [ { "id", "type", "amount", "balance_before", "balance_after", "description", "reference_type", "reference_id", "created_at" } ] }`

### POST /v1/wallet/deposit
- **Auth:** Sanctum | **Role:** all
- **Request:**
  ```json
  {
    "amount": "numeric|required|min:10|max:10000",
    "payment_method_id": "string|required"
  }
  ```
- **Response 200:** `{ "data": { "payment": {...}, "new_balance": "..." } }`

### POST /v1/wallet/withdraw
- **Auth:** Sanctum | **Role:** driver
- **Request:** `{ "amount": "numeric|required|min:50|max:balance" }`
- **Response 200:** `{ "data": { "transaction": {...}, "new_balance": "..." } }`

---

## 6. Ratings (4 endpoints)

### GET /v1/ratings
- **Auth:** Sanctum | **Role:** all
- **Response 200:** `{ "data": [ { "id", "score", "comment", "ride_id", "rater": {...}, "ratee": {...}, "created_at" } ] }`

### GET /v1/ratings/given
- **Auth:** Sanctum | **Role:** all
- **Response 200:** ratings authored by the authenticated user

### POST /v1/ratings
- **Auth:** Sanctum | **Role:** all
- **Request:**
  ```json
  {
    "ride_id": "string|required|exists:rides,id",
    "rater_id": "string|required",  (auto-set to current user)
    "ratee_id": "string|required",
    "score": "integer|required|between:1,5",
    "comment": "string|nullable|max:500"
  }
  ```
- **Response 201:** `{ "data": { "rating": {...} } }`

### GET /v1/ratings/{rating}
- **Auth:** Sanctum | **Role:** all
- **Response 200:** `{ "data": { "rating": {...} } }`

---

## 7. Promo Codes (6 endpoints)

### POST /v1/promo-codes/validate
- **Auth:** None | **Rate:** 30/min
- **Request:** `{ "code": "string|required", "ride_amount": "numeric|nullable" }`
- **Response 200:**
  ```json
  { "data": { "valid": true, "type": "percentage|fixed", "value": 50, "max_discount": 100, "discount_amount": 50 } }
  ```
- **Response 200 (invalid):** `{ "data": { "valid": false, "reason": "expired|used_up|not_started" } }`

### GET /v1/promo-codes
- **Auth:** Sanctum | **Role:** admin/super-admin
- **Response 200:** `{ "data": [ { "id", "code", "type", "value", "min_ride_amount", "max_discount", "max_uses", "used_count", "starts_at", "expires_at", "is_active" } ] }`

### POST /v1/promo-codes
- **Auth:** Sanctum | **Role:** admin/super-admin
- **Request:**
  ```json
  {
    "code": "string|required|unique:promo_codes|alpha_dash|max:20",
    "type": "string|required|in:percentage,fixed",
    "value": "numeric|required|min:0",
    "min_ride_amount": "numeric|nullable|min:0",
    "max_discount": "numeric|nullable|min:0|required_if:type,percentage",
    "max_uses": "integer|nullable|min:1",
    "starts_at": "date|nullable",
    "expires_at": "date|nullable|after:starts_at"
  }
  ```
- **Response 201:** `{ "data": { "promo_code": {...} } }`

### GET /v1/promo-codes/{promoCode}
- **Auth:** Sanctum | **Role:** admin/super-admin
- **Response 200:** `{ "data": { "promo_code": {...} } }`

### PUT /v1/promo-codes/{promoCode}
- **Auth:** Sanctum | **Role:** admin/super-admin
- **Response 200:** `{ "data": { "promo_code": {...} } }`

### DELETE /v1/promo-codes/{promoCode}
- **Auth:** Sanctum | **Role:** admin/super-admin
- **Response 200:** `{ "message": "Deleted" }`

---

## 8. Deliveries (5 endpoints)

### GET /v1/deliveries
- **Auth:** Sanctum | **Role:** rider, driver, admin
- **Response 200:** `{ "data": [ { "id", "type", "status", "pickup_address", "dropoff_address", "fare_amount", "created_at", "sender": {...}, "driver": {...} } ] }`

### POST /v1/deliveries
- **Auth:** Sanctum | **Role:** rider
- **Request:**
  ```json
  {
    "type": "string|in:parcel,food,grocery,other",
    "description": "string|required|max:500",
    "item_description": "string|nullable",
    "item_value": "numeric|nullable",
    "sender_name": "string|required",
    "sender_phone": "string|required",
    "recipient_name": "string|required",
    "recipient_phone": "string|required",
    "recipient_address": "string|required",
    "recipient_latitude": "numeric|required",
    "recipient_longitude": "numeric|required",
    "pickup_address": "string|required",
    "pickup_lat": "numeric|required",
    "pickup_lng": "numeric|required",
    "dropoff_address": "string|required",
    "dropoff_lat": "numeric|required",
    "dropoff_lng": "numeric|required",
    "pickup_notes": "string|nullable",
    "delivery_notes": "string|nullable",
    "package_size": "string|in:small,medium,large",
    "package_weight_kg": "numeric|nullable|min:0.1|max:50",
    "estimated_value": "numeric|nullable",
    "requires_signature": "boolean|default:false",
    "is_fragile": "boolean|default:false",
    "payment_method": "string|in:card,cash,wallet|default:card"
  }
  ```
- **Response 201:** `{ "data": { "delivery": {...} } }`

### GET /v1/deliveries/{delivery}
- **Auth:** Sanctum | **Role:** participant or admin
- **Response 200:** `{ "data": { "delivery": {...} } }`

### PUT /v1/deliveries/{delivery}/status
- **Auth:** Sanctum | **Role:** driver
- **Request:** `{ "status": "string|required|in:picked_up,in_transit,delivered,failed", "notes": "string|nullable" }`
- **Response 200:** `{ "data": { "delivery": {...} } }`

### POST /v1/deliveries/{delivery}/assign
- **Auth:** Sanctum | **Role:** admin
- **Request:** `{ "driver_id": "string|required|exists:users,id" }`
- **Response 200:** `{ "data": { "delivery": {...} } }`

---

## 9. Food Delivery (15 endpoints)

### GET /v1/food/restaurants
- **Auth:** Sanctum | **Rate:** 60/min
- **Query params:** `cuisine_type`, `is_featured`, `near_lat`, `near_lng`, `radius_km`, `search`
- **Response 200:**
  ```json
  { "data": [ { "id", "name", "slug", "description", "image_url", "cuisine_type", "price_range", "delivery_fee", "minimum_order", "estimated_delivery_minutes", "rating", "rating_count", "is_featured", "is_open", "opens_at", "closes_at", "distance_km" } ] }
  ```

### GET /v1/food/restaurants/{restaurant}
- **Auth:** Sanctum
- **Response 200:** `{ "data": { "restaurant": {...}, "categories": [ {...} ], "menu_items": [ {...} ] } }`

### GET /v1/food/restaurants/{restaurant}/menu
- **Auth:** Sanctum
- **Response 200:** `{ "data": { "categories": [ { "id", "name", "sort_order", "items": [ { "id", "name", "description", "price", "image_url", "is_available", "is_vegetarian", "is_vegan", "is_gluten_free", "spice_level", "preparation_time_minutes", "calories" } ] } ] } }`

### POST /v1/food/restaurants/{restaurant}/order
- **Auth:** Sanctum | **Role:** rider
- **Request:**
  ```json
  {
    "items": "array|required|min:1",
    "items.*.menu_item_id": "string|required|exists:menu_items,id",
    "items.*.quantity": "integer|required|min:1|max:99",
    "items.*.special_instructions": "string|nullable|max:500",
    "delivery_address": "string|required",
    "delivery_latitude": "numeric|required",
    "delivery_longitude": "numeric|required",
    "delivery_notes": "string|nullable",
    "payment_method": "string|in:card,cash,wallet|default:card"
  }
  ```
- **Response 201:** `{ "data": { "order": { "id", "status": "pending", "restaurant_id", "subtotal", "delivery_fee", "service_fee", "total_amount", "estimated_delivery_at", "items": [...], "payment": {...} } } }`

### GET /v1/food/orders
- **Auth:** Sanctum | **Role:** rider
- **Response 200:** `{ "data": [ { "id", "status", "restaurant": {...}, "total_amount", "created_at", "items": [...] } ] }`

### GET /v1/food/orders/{order}
- **Auth:** Sanctum | **Role:** participant or admin
- **Response 200:** `{ "data": { "order": {...} } }`

### POST /v1/food/orders/{order}/cancel
- **Auth:** Sanctum | **Role:** customer
- **Request:** `{ "reason": "string|nullable|max:500" }`
- **Response 200:** `{ "data": { "order": { "id", "status": "cancelled" } } }`

### POST /v1/food/orders/{order}/rate
- **Auth:** Sanctum | **Role:** customer
- **Request:** `{ "score": "integer|between:1,5", "comment": "string|nullable|max:500" }`
- **Response 201:** updated order with rating

### GET /v1/driver/food/orders
- **Auth:** Sanctum | **Role:** driver
- **Response 200:** driver's accepted food orders

### GET /v1/driver/food/orders/available
- **Auth:** Sanctum | **Role:** driver
- **Response 200:** `{ "data": [ { "id", "restaurant": {...}, "total_amount", "delivery_address", "estimated_delivery_at", "distance_km" } ] }`

### POST /v1/driver/food/orders/{order}/accept
- **Auth:** Sanctum | **Role:** driver
- **Response 200:** `{ "data": { "order": { "id", "status": "assigned", "driver_id" } } }`

### POST /v1/driver/food/orders/{order}/status
- **Auth:** Sanctum | **Role:** driver
- **Request:** `{ "status": "string|in:picked_up,in_transit,delivered" }`
- **Response 200:** `{ "data": { "order": {...} } }`

### GET /v1/restaurant/food/orders
- **Auth:** Sanctum | **Role:** restaurant staff
- **Response 200:** orders for the restaurant managed by the authenticated user

### Admin Food Endpoints (see Admin section below)

---

## 10. Notifications (6 endpoints)

### GET /v1/notifications
- **Auth:** Sanctum | **Rate:** 30/min
- **Query params:** `is_read`, `per_page`, `page`
- **Response 200:** `{ "data": [ { "id", "title", "body", "type", "data": {...}, "is_read", "read_at", "created_at" } ], "meta": {...} }`

### GET /v1/notifications/unread-count
- **Auth:** Sanctum
- **Response 200:** `{ "data": { "count": 5 } }`

### POST /v1/notifications/{notification}/read
- **Auth:** Sanctum
- **Response 200:** `{ "data": { "notification": { "id", "is_read": true, "read_at" } } }`

### POST /v1/notifications/read-all
- **Auth:** Sanctum
- **Response 200:** `{ "message": "All notifications marked as read" }`

### POST /v1/notifications/register-token
- **Auth:** Sanctum
- **Request:** `{ "token": "string|required", "platform": "string|required|in:ios,android,web" }`
- **Response 200:** `{ "message": "Token registered" }`

### POST /v1/notifications/unregister-token
- **Auth:** Sanctum
- **Request:** `{ "token": "string|required" }`
- **Response 200:** `{ "message": "Token unregistered" }`

---

## 11. Scheduled Rides (3 endpoints)

### GET /v1/scheduled-rides
- **Auth:** Sanctum | **Role:** rider

### POST /v1/scheduled-rides
- **Auth:** Sanctum | **Role:** rider
- **Request:**
  ```json
  {
    "pickup_latitude": "numeric|required",
    "pickup_longitude": "numeric|required",
    "pickup_address": "string|required",
    "dropoff_latitude": "numeric|required",
    "dropoff_longitude": "numeric|required",
    "dropoff_address": "string|required",
    "scheduled_at": "date|required|after:now|before:+7 days",
    "category": "string|in:standard,premium,minivan|default:standard"
  }
  ```
- **Response 201:** `{ "data": { "scheduled_ride": {...} } }`

### POST /v1/scheduled-rides/{id}/cancel
- **Auth:** Sanctum | **Role:** rider
- **Response 200:** `{ "data": { "scheduled_ride": { "id", "status": "cancelled" } } }`

---

## 12. Referrals (3 endpoints)

### GET /v1/referrals/my-code
- **Auth:** Sanctum
- **Response 200:** `{ "data": { "code": "ABC123", "usage_count": 5, "max_uses": null, "bonus_earned": 250 } }`

### POST /v1/referrals/apply
- **Auth:** Sanctum | **Condition:** first ride only
- **Request:** `{ "code": "string|required|exists:referral_codes,code" }`
- **Response 200:** `{ "data": { "bonus_amount": 50, "message": "Referral applied" } }`

### GET /v1/referrals/stats
- **Auth:** Sanctum
- **Response 200:** `{ "data": { "total_referrals": 12, "completed_referrals": 8, "bonus_earned": 400, "pending_bonus": 100 } }`

---

## 13. SOS (5 endpoints)

### POST /v1/sos
- **Auth:** Sanctum | **Role:** rider, driver
- **Request:**
  ```json
  {
    "ride_id": "string|nullable",
    "latitude": "numeric|required",
    "longitude": "numeric|required",
    "location_description": "string|nullable|max:500",
    "severity": "string|in:low,medium,high,critical|default:high"
  }
  ```
- **Response 201:** `{ "data": { "sos_alert": { "id", "status": "active", "severity", "created_at" } } }`

### POST /v1/sos/{id}/cancel
- **Auth:** Sanctum | **Role:** alert owner
- **Response 200:** `{ "data": { "sos_alert": { "id", "status": "cancelled" } } }`

### POST /v1/sos/{id}/acknowledge
- **Auth:** Sanctum | **Role:** admin/super-admin
- **Response 200:** `{ "data": { "sos_alert": { "id", "status": "acknowledged", "acknowledged_by", "acknowledged_at" } } }`

### POST /v1/sos/{id}/resolve
- **Auth:** Sanctum | **Role:** admin/super-admin
- **Request:** `{ "notes": "string|nullable|max:2000" }`
- **Response 200:** `{ "data": { "sos_alert": { "id", "status": "resolved", "resolved_at", "notes" } } }`

### GET /v1/sos/active
- **Auth:** Sanctum | **Role:** admin/super-admin
- **Response 200:** `{ "data": [ { "id", "user": {...}, "ride": {...}, "latitude", "longitude", "severity", "status", "created_at" } ] }`

---

## 14. Chat (4 endpoints)

### GET /v1/chat/rides/{ride}/messages
- **Auth:** Sanctum | **Role:** ride participant
- **Query params:** `limit` (default 50)
- **Response 200:** `{ "data": [ { "id", "sender_id", "receiver_id", "message", "created_at" } ] }`

### POST /v1/chat/rides/{ride}/messages
- **Auth:** Sanctum | **Role:** ride participant
- **Request:** `{ "message": "string|required|max:1000", "receiver_id": "string|required|exists:users,id" }`
- **Response 201:** `{ "data": { "message": {...} } }`

### GET /v1/chat/rides/{ride}/unread
- **Auth:** Sanctum | **Role:** ride participant
- **Response 200:** `{ "data": { "count": 3 } }`

### POST /v1/chat/rides/{ride}/read
- **Auth:** Sanctum | **Role:** ride participant
- **Response 200:** `{ "message": "Messages marked as read" }`

---

## 15. Admin (12+ endpoints)

### GET /v1/admin/dashboard
- **Auth:** Sanctum | **Role:** admin/super-admin
- **Response 200:**
  ```json
  { "data": { "total_rides_today", "total_revenue_today", "active_drivers", "pending_rides", "new_users_today", "pending_kyc", "active_sos_alerts", "ride_chart": [...], "revenue_chart": [...] } }
  ```

### GET /v1/admin/users
- **Auth:** Sanctum | **Role:** admin/super-admin
- **Query params:** `role`, `is_active`, `search`, `per_page`, `page`
- **Response 200:** `{ "data": [ { "id", "name", "email", "phone_number", "role", "is_active", "is_approved", "is_kyc_verified", "created_at", "ride_count", "total_spent" } ] }`

### GET /v1/admin/rides
- **Auth:** Sanctum | **Role:** admin/super-admin
- **Query params:** `status`, `from_date`, `to_date`, `per_page`, `page`, `rider_id`, `driver_id`
- **Response 200:** `{ "data": [ { "ride": {...}, "rider": {...}, "driver": {...}, "payment": {...} } ] }`

### GET /v1/admin/drivers
- **Auth:** Sanctum | **Role:** admin/super-admin
- **Query params:** `is_approved`, `is_online`, `is_kyc_verified`, `search`
- **Response 200:** `{ "data": [ { "id", "name", "email", "phone", "is_approved", "is_online", "is_kyc_verified", "rating", "total_trips", "total_earnings", "vehicle": {...}, "kyc_status" } ] }`

### POST /v1/admin/drivers/{driver}/approve
- **Auth:** Sanctum | **Role:** admin/super-admin
- **Response 200:** `{ "data": { "user": { "id", "is_approved": true, "approved_at" } } }`

### POST /v1/admin/drivers/{driver}/reject
- **Auth:** Sanctum | **Role:** admin/super-admin
- **Request:** `{ "reason": "string|required|max:500" }`
- **Response 200:** `{ "data": { "user": { "id", "is_approved": false } } }`

### GET /v1/admin/settings
- **Auth:** Sanctum | **Role:** admin/super-admin
- **Response 200:** `{ "data": { "commission_rate", "driver_radius_km", "min_ride_fare", "surge_threshold", "referral_bonus_amount", "support_phone", "support_email", "terms_url", "privacy_url", ... } }`

### POST /v1/admin/settings
- **Auth:** Sanctum | **Role:** super-admin
- **Request:** key-value pairs of settings to update
- **Response 200:** `{ "data": { "updated": ["commission_rate", "referral_bonus_amount"] } }`

### GET /v1/admin/audit-logs
- **Auth:** Sanctum | **Role:** super-admin
- **Query params:** `user_id`, `action`, `resource_type`, `from_date`, `to_date`, `per_page`
- **Response 200:** `{ "data": [ { "id", "user_id", "action", "resource_type", "resource_id", "old_values": {...}, "new_values": {...}, "ip_address", "created_at" } ] }`

### Admin Food Endpoints:

#### GET /v1/admin/food/restaurants
- **Auth:** Sanctum | **Role:** admin/super-admin

#### POST /v1/admin/food/restaurants
- **Request:** `{ "name", "slug", "description", "phone", "email", "address", "latitude", "longitude", "cuisine_type", "price_range", "delivery_fee", "minimum_order", "estimated_delivery_minutes", "opens_at", "closes_at", "is_featured" }`

#### PUT /v1/admin/food/restaurants/{restaurant}
- Update restaurant details

#### POST /v1/admin/food/restaurants/{restaurant}/categories
- **Request:** `{ "name", "sort_order", "is_active" }`

#### POST /v1/admin/food/restaurants/{restaurant}/menu-items
- **Request:** `{ "category_id", "name", "description", "price", "image_url", "is_available", "is_vegetarian", "is_vegan", "is_gluten_free", "spice_level", "preparation_time_minutes", "calories", "sort_order" }`

#### PUT /v1/admin/food/menu-items/{item}
- Update menu item

#### DELETE /v1/admin/food/menu-items/{item}
- Soft delete menu item

#### POST /v1/admin/food/food-orders/{order}/assign-driver
- **Request:** `{ "driver_id": "string|required" }`

### Admin Compliance Endpoints (see Compliance section)

---

## 16. Reporting (3 endpoints)

### GET /v1/reports/dashboard
- **Auth:** Sanctum | **Role:** admin/super-admin

### GET /v1/reports/revenue
- **Auth:** Sanctum | **Role:** admin/super-admin
- **Query params:** `from_date`, `to_date`, `group_by` (day|week|month)
- **Response 200:**
  ```json
  { "data": { "total_revenue", "platform_fees", "driver_payouts", "refunds", "net_revenue", "breakdown": [ { "period", "revenue", "fees", "payouts" } ] } }
  ```

### GET /v1/reports/drivers
- **Auth:** Sanctum | **Role:** admin/super-admin
- **Response 200:** driver performance report

---

## 17. Config (1 endpoint)

### GET /v1/config
- **Auth:** None | **Rate:** 60/min
- **Response 200:**
  ```json
  { "data": { "app_name": "EasyRyde", "currency": "ZAR", "base_fare": 15.00, "per_km_rate": 8.50, "per_minute_rate": 1.50, "min_ride_fare": 25.00, "driver_radius_km": 10, "surge_multiplier_max": 3.0, "support_phone": "+27123456789", "support_email": "support@easyryde.co.za", "terms_url": "...", "privacy_url": "...", "enable_food_delivery": true, "enable_scheduled_rides": true, "enable_referrals": true, "payment_methods": ["card", "cash", "wallet"], "google_maps_api_key": "..." } }
  ```

---

## 18. Compliance (13 endpoints)

### KYC Endpoints

#### POST /v1/kyc
- **Auth:** Sanctum | **Role:** driver
- **Request:** (multipart/form-data)
  ```json
  {
    "verification_type": "string|required|in:id_document,drivers_license,proof_of_address,vehicle_registration,vehicle_insurance,psv_license",
    "document_type": "string|required",
    "document_number": "string|required",
    "document_front": "file|required|mimes:jpg,jpeg,png,pdf|max:10240",
    "document_back": "file|nullable|mimes:jpg,jpeg,png,pdf|max:10240",
    "selfie": "file|nullable|mimes:jpg,jpeg,png|max:5120"
  }
  ```
- **Response 201:** `{ "data": { "verification": { "id", "status": "pending", "verification_type", "created_at" } } }`

#### GET /v1/kyc/my
- **Auth:** Sanctum | **Role:** driver
- **Response 200:** list of driver's KYC submissions

#### GET /v1/kyc/{verification}/{documentType}
- **Auth:** Sanctum | **Role:** admin or owner
- **Response 200:** file download

#### GET /v1/admin/compliance/kyc/pending
- **Auth:** Sanctum | **Role:** admin/super-admin

#### POST /v1/admin/compliance/kyc/{verification}/approve
- **Auth:** Sanctum | **Role:** admin/super-admin

#### POST /v1/admin/compliance/kyc/{verification}/reject
- **Auth:** Sanctum | **Role:** admin/super-admin
- **Request:** `{ "reason": "string|required|max:1000" }`

### Incident Endpoints

#### POST /v1/incidents
- **Auth:** Sanctum | **Role:** rider, driver
- **Request:**
  ```json
  {
    "ride_id": "string|nullable",
    "delivery_id": "string|nullable",
    "incident_type": "string|required|in:accident,safety_concern,harassment,vehicle_damage,robbery,mechanical_failure,route_deviation,payment_issue,driver_misconduct,rider_misconduct,food_safety,delivery_damage,other",
    "severity": "string|in:low,medium,high,critical|default:medium",
    "title": "string|required|max:255",
    "description": "string|required|max:5000",
    "evidence": "array|nullable|max:5",
    "evidence.*": "file|mimes:jpg,jpeg,png,pdf,mp4|max:20480"
  }
  ```
- **Response 201:** `{ "data": { "incident": { "id", "status": "open", "incident_type", "severity", "created_at" } } }`

#### GET /v1/incidents/my
- **Auth:** Sanctum

#### GET /v1/incidents/{incident}
- **Auth:** Sanctum | **Role:** reporter or admin

#### GET /v1/admin/compliance/incidents
- **Auth:** Sanctum | **Role:** admin/super-admin
- **Query params:** `status`, `severity`, `incident_type`

#### GET /v1/admin/compliance/incidents/open
- **Auth:** Sanctum | **Role:** admin/super-admin

#### GET /v1/admin/compliance/incidents/stats
- **Auth:** Sanctum | **Role:** admin/super-admin

#### POST /v1/admin/compliance/incidents/{incident}/assign
- **Auth:** Sanctum | **Role:** admin/super-admin
- **Request:** `{ "assigned_to": "string|required|exists:users,id" }`

#### POST /v1/admin/compliance/incidents/{incident}/escalate
- **Auth:** Sanctum | **Role:** admin/super-admin

#### POST /v1/admin/compliance/incidents/{incident}/resolve
- **Auth:** Sanctum | **Role:** admin/super-admin
- **Request:** `{ "resolution": "string|required|max:5000" }`

#### POST /v1/admin/compliance/incidents/{incident}/close
- **Auth:** Sanctum | **Role:** admin/super-admin

### Data Retention Endpoints

#### GET /v1/admin/compliance/data-retention
- **Auth:** Sanctum | **Role:** admin/super-admin

#### POST /v1/admin/compliance/data-retention/cleanup
- **Auth:** Sanctum | **Role:** super-admin

---

## 19. Consent (4 endpoints)

### GET /v1/consent
- **Auth:** Sanctum
- **Response 200:** list of user's current consent records

### POST /v1/consent/grant
- **Auth:** Sanctum
- **Request:**
  ```json
  {
    "consent_type": "string|required|in:terms_of_service,privacy_policy,location_tracking,marketing_notifications,data_sharing",
    "consent_version": "string|required"
  }
  ```
- **Response 201:** `{ "data": { "consent": { "id", "consent_type", "consent_version", "granted_at" } } }`

### POST /v1/consent/revoke
- **Auth:** Sanctum
- **Request:** `{ "consent_type": "string|required" }`
- **Response 200:** `{ "data": { "consent": { "id", "revoked_at" } } }`

### GET /v1/consent/history
- **Auth:** Sanctum
- **Response 200:** full history of consent changes

---

## 20. Data Rights (POPIA) (3 endpoints)

### GET /v1/data/export
- **Auth:** Sanctum
- **Response 200:** JSON file download containing all user data (user profile, rides, payments, consents, etc.)

### POST /v1/data/anonymize
- **Auth:** Sanctum
- **Response 200:** `{ "message": "Anonymization requested. Will be processed within 30 days." }`

### DELETE /v1/data/erasure
- **Auth:** Sanctum
- **Response 200:** `{ "message": "Erasure requested. Will be processed within 30 days." }`

---

## 21. Health & Utility

### GET /v1/health
- **Auth:** None | **Rate:** 60/min
- **Response 200:**
  ```json
  { "status": "ok", "version": "1.0.0", "timestamp": "2026-06-17T12:00:00Z", "services": { "database": "ok", "redis": "ok", "queue": "ok" } }
  ```

### GET /v1/places/search
- **Auth:** None | **Rate:** 30/min
- **Query params:** `q` (search term), `limit` (default 10)
- **Response 200:** `{ "data": [ { "place_id", "name", "address", "latitude", "longitude" } ] }`

### GET /v1/places/reverse
- **Auth:** None | **Rate:** 30/min
- **Query params:** `lat`, `lng`
- **Response 200:** `{ "data": { "place_id", "name", "address", "latitude", "longitude" } }`
