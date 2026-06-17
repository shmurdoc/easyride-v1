# EasyRyde — Data Model

**Version:** 1.0.0  
**Updated:** 2026-06-17  
**Status:** Final  
**Database:** PostgreSQL 16 + PostGIS 3.4  
**Naming:** snake_case, plural table names, UUID primary keys  

---

## Conventions

- All tables use UUID primary keys (`HasUuids` trait, `string` key type, `$incrementing = false`)
- All tables have `created_at` / `updated_at` timestamps (Laravel convention)
- Monetary columns: `decimal(16, 2)` — stored in ZAR (cents not used for readability)
- Coordinate columns: `decimal(10, 7)` — PostGIS spatial index where applicable
- Soft deletes via `deleted_at` where noted
- `tenant_id` on tenant-scoped tables for multi-tenant isolation
- All foreign keys are UUIDs matching parent table key type

---

## Current Tables (27)

### 1. `users`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | HasUuids trait |
| tenant_id | UUID | FK → tenants.id | nullable |
| name | string(255) | NOT NULL | |
| email | string(255) | UNIQUE, NOT NULL | Encrypted at rest |
| phone_number | string(20) | UNIQUE, nullable | Encrypted at rest |
| password | string(255) | NOT NULL | Hashed (bcrypt) |
| role | string(20) | NOT NULL, default:'rider' | rider/driver/admin/super-admin |
| is_active | boolean | default:true | |
| is_online | boolean | default:false | Driver online status |
| is_approved | boolean | default:false | Driver admin approval |
| is_kyc_verified | boolean | default:false | KYC completed |
| email_verified_at | timestamp | nullable | |
| kyc_verified_at | timestamp | nullable | |
| current_latitude | decimal(10,7) | nullable | Last known location |
| current_longitude | decimal(10,7) | nullable | |
| last_location_update | timestamp | nullable | |
| current_ride_id | string(36) | nullable | FK → rides.id |
| anonymized_at | timestamp | nullable | POPIA data erasure |
| deleted_at | timestamp | nullable | Soft deletes |
| remember_token | string(100) | nullable |
| created_at | timestamp | |
| updated_at | timestamp | |

**Refinements needed:**
- Add index on `(tenant_id, role, is_active)` for admin user queries
- Add index on `(role, is_online, is_approved)` for driver discovery
- Add index on `email` for login lookups (already unique, but index needed)
- Add index on `phone_number` for login lookups
- Add `last_login_at` column for security audit
- Add `last_activity_at` column for presence tracking
- Add `failed_login_attempts` column for brute force protection
- Add `locked_until` column for account lockout

### 2. `rides`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| tenant_id | UUID | FK → tenants.id | nullable |
| rider_id | UUID | FK → users.id, NOT NULL | |
| driver_id | UUID | FK → users.id | nullable until accepted |
| pickup_latitude | decimal(10,7) | NOT NULL | |
| pickup_longitude | decimal(10,7) | NOT NULL | |
| dropoff_latitude | decimal(10,7) | NOT NULL | |
| dropoff_longitude | decimal(10,7) | NOT NULL | |
| pickup_address | text | NOT NULL | |
| dropoff_address | text | NOT NULL | |
| status | string(20) | NOT NULL, default:'pending' | pending→accepted→driver_arrived→in_progress→completed/cancelled |
| category | string(20) | default:'standard' | standard/premium/minivan/pets/delivery |
| distance_km | decimal(8,3) | nullable | |
| duration_minutes | decimal(5,1) | nullable | |
| base_fare | decimal(16,2) | nullable | |
| per_km_fare | decimal(16,2) | nullable | |
| surge_multiplier | decimal(4,2) | default:1.0 | |
| total_fare | decimal(16,2) | nullable | |
| promo_code_id | UUID | FK → promo_codes.id | nullable |
| discount_amount | decimal(16,2) | default:0 | |
| payment_method | string(20) | default:'card' | card/cash/wallet |
| payment_status | string(20) | default:'pending' | pending/completed/refunded/failed |
| driver_eta | integer | nullable | Seconds |
| route_polyline | text | nullable | Encoded polyline |
| started_at | timestamp | nullable | |
| completed_at | timestamp | nullable | |
| cancelled_at | timestamp | nullable | |
| cancelled_by | string(36) | nullable | User UUID who cancelled |
| cancellation_reason | text | nullable | |
| created_at | timestamp | |
| updated_at | timestamp | |

**Refinements needed:**
- Add PostGIS `GEOGRAPHY(Point, 4326)` column for `pickup_location` (computed from lat/lng)
- Add PostGIS `GEOGRAPHY(Point, 4326)` column for `dropoff_location`
- Add GIST index on spatial columns for proximity queries
- Add index on `(status, created_at)` for pending ride queries
- Add composite index on `(rider_id, status)` for "my rides" queries
- Add composite index on `(driver_id, status)` for driver ride queries
- Add `waiting_time_minutes` column for waiting time charges
- Add `route_distance_km` vs `straight_distance_km` for fare audit
- Add `estimated_fare` column for fare comparison audit trail

### 3. `vehicles`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, UNIQUE | One vehicle per driver |
| make | string(50) | NOT NULL | |
| model | string(50) | NOT NULL | |
| year | integer | NOT NULL | |
| color | string(30) | NOT NULL | |
| license_plate | string(20) | NOT NULL | |
| category | string(20) | default:'standard' | standard/premium/minivan |
| is_active | boolean | default:true | |
| created_at | timestamp | |
| updated_at | timestamp | |

**Missing columns:**
- `insurance_provider` string(100) nullable
- `insurance_policy_number` string(50) nullable
- `insurance_expiry` date nullable
- `registration_document_path` string(255) nullable
- `vehicle_photo_path` string(255) nullable
- `last_inspection_at` timestamp nullable
- `is_inspected` boolean default:false

**Missing indexes:**
- Index on `(user_id)` already unique via FK
- Index on `(category, is_active)` for fleet queries

### 4. `payments`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| ride_id | UUID | FK → rides.id, nullable | |
| payer_id | UUID | FK → users.id, NOT NULL | |
| payee_id | UUID | FK → users.id, nullable | Driver receiving payout |
| method | string(20) | NOT NULL | card/cash/wallet |
| gateway | string(20) | nullable | stripe/payfast/ozow/cash |
| gateway_reference | string(255) | nullable | External payment ID |
| amount | decimal(16,2) | NOT NULL | |
| platform_fee | decimal(16,2) | default:0 | |
| driver_payout | decimal(16,2) | nullable | |
| status | string(20) | NOT NULL, default:'pending' | pending/completed/failed/refunded |
| paid_at | timestamp | nullable | |
| gateway_response | jsonb | nullable | Raw gateway response |
| refunded_at | timestamp | nullable | |
| refund_reason | text | nullable | |
| refund_amount | decimal(16,2) | nullable | |
| refunded_by | string(36) | nullable | Admin UUID |
| escrow_released | boolean | default:false | |
| escrow_released_at | timestamp | nullable | |
| dispute_hold | boolean | default:false | |
| dispute_hold_shortfall | decimal(16,2) | nullable | |
| cash_received | decimal(16,2) | nullable | Cash payment tracking |
| cash_discrepancy | decimal(16,2) | nullable | |
| cash_settled_at | timestamp | nullable | |
| cash_reconciled | boolean | default:false | |
| created_at | timestamp | |
| updated_at | timestamp | |

**Missing columns:**
- `currency` string(3) default:'ZAR'
- `failure_reason` text nullable
- `retry_count` integer default:0

**Missing indexes:**
- Index on `(payer_id, status)` for user payment queries
- Index on `(gateway, gateway_reference)` for webhook deduplication
- Composite index on `(status, created_at)` for reconciliation queries
- Index on `(ride_id)` for ride→payment lookup

### 5. `wallets`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, UNIQUE | One wallet per user |
| tenant_id | UUID | FK → tenants.id | nullable |
| balance | decimal(16,2) | default:0 | |
| pending_balance | decimal(16,2) | default:0 | Unsettled funds |
| currency | string(3) | default:'ZAR' | |
| created_at | timestamp | |
| updated_at | timestamp | |

**Refinements needed:**
- Add check constraint: `balance >= 0`
- Add check constraint: `pending_balance >= 0`
- Add index on `(user_id)` already via FK

### 6. `wallet_transactions`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| wallet_id | UUID | FK → wallets.id, NOT NULL | |
| type | string(20) | NOT NULL | deposit/withdrawal/payment/refund/referral_bonus/payout/fee |
| amount | decimal(16,2) | NOT NULL | |
| balance_before | decimal(16,2) | NOT NULL | |
| balance_after | decimal(16,2) | NOT NULL | |
| reference_type | string(50) | nullable | Polymorphic: ride/payment/payout |
| reference_id | string(36) | nullable | UUID of referenced entity |
| description | text | nullable | |
| created_at | timestamp | |
| updated_at | timestamp | |

**Missing columns:**
- `status` string(20) default:'completed' (pending/completed/failed)

**Missing indexes:**
- Index on `(wallet_id, created_at)` for transaction history
- Index on `(reference_type, reference_id)` for polymorphic lookups
- Index on `(type, created_at)` for reconciliation

### 7. `ratings`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| ride_id | UUID | FK → rides.id, UNIQUE | One rating per ride |
| rater_id | UUID | FK → users.id, NOT NULL | |
| ratee_id | UUID | FK → users.id, NOT NULL | |
| score | integer | NOT NULL, 1-5 | |
| comment | text | nullable | |
| created_at | timestamp | |
| updated_at | timestamp | |

**Missing columns:**
- `tags` jsonb nullable (e.g. ["on_time", "friendly", "clean_vehicle"])
- `is_driver_rating` boolean (distinguish driver→rider vs rider→driver)

**Missing indexes:**
- Index on `(ratee_id, score)` for average rating computation
- Composite unique on `(ride_id, rater_id)`

### 8. `promo_codes`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| tenant_id | UUID | FK → tenants.id | nullable |
| code | string(50) | UNIQUE, NOT NULL | |
| type | string(20) | NOT NULL | percentage/fixed |
| value | decimal(16,2) | NOT NULL | |
| min_ride_amount | decimal(16,2) | nullable | |
| max_discount | decimal(16,2) | nullable | For percentage type |
| max_uses | integer | nullable | NULL = unlimited |
| used_count | integer | default:0 | |
| starts_at | timestamp | nullable | |
| expires_at | timestamp | nullable | |
| is_active | boolean | default:true | |
| created_at | timestamp | |
| updated_at | timestamp | |

**Missing columns:**
- `applicable_to` string(50) default:'all' (rides/food/delivery/all)
- `first_ride_only` boolean default:false
- `applicable_categories` jsonb nullable (restrict to certain ride categories)

**Missing indexes:**
- Index on `code` (already unique)
- Index on `(is_active, expires_at, starts_at)` for active promo queries

### 9. `promo_code_redemptions`

*(Assumed table — not yet modeled in code)*

**Suggested schema:**
- `id` UUID PK
- `promo_code_id` UUID FK → promo_codes.id
- `user_id` UUID FK → users.id
- `ride_id` UUID FK → rides.id, nullable
- `discount_amount` decimal(16,2)
- `redeemed_at` timestamp

**Missing indexes:**
- Unique on `(promo_code_id, user_id)` — one use per user per code
- Index on `(user_id, redeemed_at)`

### 10. `deliveries`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| tenant_id | UUID | FK → tenants.id | nullable |
| ride_id | UUID | FK → rides.id | nullable - linked ride |
| sender_id | UUID | FK → users.id | |
| driver_id | UUID | FK → users.id | nullable |
| type | string(20) | NOT NULL | parcel/food/grocery/other |
| description | text | nullable | |
| item_description | text | nullable | |
| item_value | decimal(16,2) | nullable | |
| sender_name | string(255) | NOT NULL | |
| sender_phone | string(20) | NOT NULL | |
| recipient_name | string(255) | NOT NULL | |
| recipient_phone | string(20) | NOT NULL | |
| recipient_address | text | NOT NULL | |
| recipient_latitude | decimal(10,7) | NOT NULL | |
| recipient_longitude | decimal(10,7) | NOT NULL | |
| pickup_address | text | NOT NULL | |
| pickup_lat | decimal(10,7) | NOT NULL | |
| pickup_lng | decimal(10,7) | NOT NULL | |
| dropoff_address | text | NOT NULL | |
| dropoff_lat | decimal(10,7) | NOT NULL | |
| dropoff_lng | decimal(10,7) | NOT NULL | |
| pickup_notes | text | nullable | |
| delivery_notes | text | nullable | |
| package_size | string(20) | default:'medium' | small/medium/large |
| package_weight_kg | decimal(5,2) | nullable | |
| estimated_value | decimal(16,2) | nullable | |
| requires_signature | boolean | default:false | |
| is_fragile | boolean | default:false | |
| status | string(20) | NOT NULL | pending/assigned/picked_up/in_transit/delivered/failed |
| payment_method | string(20) | default:'card' | |
| payment_status | string(20) | default:'pending' | |
| fare_amount | decimal(16,2) | nullable | |
| notes | text | nullable | |
| picked_up_at | timestamp | nullable | |
| delivered_at | timestamp | nullable | |
| created_at | timestamp | |
| updated_at | timestamp | |

**Missing columns:**
- `signature_image_path` string(255) nullable (delivery proof)
- `delivery_photo_path` string(255) nullable
- `otp_code` string(6) nullable (recipient verification code)
- `otp_verified_at` timestamp nullable

**Missing indexes:**
- Index on `(sender_id, status)` for sender queries
- Index on `(driver_id, status)` for driver queries
- Index on `(status, created_at)` for available deliveries
- PostGIS spatial index on pickup/dropoff locations

### 11. `notifications`

**(model: `InAppNotification`)**

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| title | string(255) | NOT NULL | |
| body | text | nullable | |
| type | string(50) | nullable | ride_update/payment/sos/promo/system |
| data | jsonb | nullable | Arbitrary payload |
| is_read | boolean | default:false | |
| read_at | timestamp | nullable | |
| created_at | timestamp | |
| updated_at | timestamp | |

**Missing indexes:**
- Index on `(user_id, is_read, created_at)` for unread notification queries
- Index on `(type, created_at)` for notification type queries

### 12. `system_settings`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| tenant_id | UUID | FK → tenants.id | nullable - null = global |
| key | string(100) | NOT NULL | |
| value | text | NOT NULL | |
| description | text | nullable | |
| type | string(20) | default:'string' | string/boolean/number/json |
| created_at | timestamp | |
| updated_at | timestamp | |

**Missing indexes:**
- Unique on `(tenant_id, key)` — one value per key per tenant

### 13. `audit_logs`

**(model: `AdminAuditLog`)**

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| tenant_id | UUID | FK → tenants.id | nullable |
| user_id | UUID | FK → users.id | Admin who performed action |
| action | string(50) | NOT NULL | create/update/delete/approve/reject |
| resource_type | string(50) | NOT NULL | user/ride/payment/driver/kyc |
| resource_id | string(36) | NOT NULL | |
| old_values | jsonb | nullable | |
| new_values | jsonb | nullable | |
| ip_address | string(45) | nullable | |
| user_agent | text | nullable | |
| created_at | timestamp | |
| updated_at | timestamp | |

**Missing indexes:**
- Index on `(resource_type, resource_id)` for resource audit trail
- Index on `(user_id, created_at)` for user action history
- Index on `(action, created_at)` for action type queries
- Index on `created_at` for time-range queries

### 14. `tenants`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| name | string(255) | NOT NULL | |
| slug | string(100) | UNIQUE, NOT NULL | |
| domain | string(255) | nullable | Custom domain |
| region | string(100) | nullable | Geographic region |
| currency | string(3) | default:'ZAR' | |
| is_active | boolean | default:true | |
| settings | jsonb | nullable | Tenant-specific config |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## Food Delivery Tables (Restaurants + Orders)

### 15. `restaurants`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| tenant_id | UUID | FK → tenants.id | nullable |
| name | string(255) | NOT NULL | |
| slug | string(100) | UNIQUE | |
| description | text | nullable | |
| image_url | string(255) | nullable | |
| phone | string(20) | nullable | |
| email | string(255) | nullable | |
| address | text | nullable | |
| latitude | decimal(10,7) | nullable | |
| longitude | decimal(10,7) | nullable | |
| cuisine_type | string(50) | nullable | |
| price_range | integer | nullable | 1-4 |
| delivery_fee | decimal(16,2) | default:0 | |
| minimum_order | decimal(16,2) | default:0 | |
| estimated_delivery_minutes | integer | default:30 | |
| is_active | boolean | default:true | |
| is_featured | boolean | default:false | |
| opens_at | time | nullable | Opening time |
| closes_at | time | nullable | Closing time |
| rating | decimal(3,2) | default:0 | |
| rating_count | integer | default:0 | |
| total_orders | integer | default:0 | |
| created_at | timestamp | |
| updated_at | timestamp | |

**Missing columns:**
- `delivery_radius_km` decimal(5,2) default:10
- `commission_rate` decimal(5,2) nullable (per-restaurant override)
- `is_open` computed from opens_at/closes_at + day of week
- `menu_last_updated_at` timestamp nullable
- `cover_image_url` string(255) nullable
- `address_components` jsonb nullable (structured address)

**Missing indexes:**
- PostGIS spatial index on `(latitude, longitude)` for nearby restaurant queries
- Index on `(is_active, is_featured)` for featured restaurants
- Index on `(cuisine_type, is_active)` for cuisine filtering
- Index on `slug` (already unique)

### 16. `restaurant_categories`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| restaurant_id | UUID | FK → restaurants.id | |
| name | string(100) | NOT NULL | |
| sort_order | integer | default:0 | |
| is_active | boolean | default:true | |
| created_at | timestamp | |
| updated_at | timestamp | |

**Missing indexes:**
- Index on `(restaurant_id, sort_order)`

### 17. `menu_items`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| restaurant_id | UUID | FK → restaurants.id | |
| category_id | UUID | FK → restaurant_categories.id | nullable |
| name | string(255) | NOT NULL | |
| description | text | nullable | |
| price | decimal(16,2) | NOT NULL | |
| image_url | string(255) | nullable | |
| is_available | boolean | default:true | |
| is_active | boolean | default:true | |
| is_vegetarian | boolean | default:false | |
| is_vegan | boolean | default:false | |
| is_gluten_free | boolean | default:false | |
| spice_level | integer | default:0 | 0-5 |
| preparation_time_minutes | integer | nullable | |
| calories | integer | nullable | |
| sort_order | integer | default:0 | |
| created_at | timestamp | |
| updated_at | timestamp | |

**Missing columns:**
- `variants` jsonb nullable (e.g. sizes, add-ons with prices)
- `allergen_info` text nullable
- `is_signature` boolean default:false (chef's special)
- `original_price` decimal(16,2) nullable (for showing discounts)

**Missing indexes:**
- Index on `(restaurant_id, category_id, sort_order)` for menu display
- Index on `(category_id)` for category queries
- Index on `(is_available, is_active)` for availability filters

### 18. `food_orders`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| tenant_id | UUID | FK → tenants.id | nullable |
| restaurant_id | UUID | FK → restaurants.id | |
| customer_id | UUID | FK → users.id | |
| driver_id | UUID | FK → users.id | nullable |
| delivery_id | UUID | FK → deliveries.id | nullable |
| status | string(20) | NOT NULL | pending→confirmed→preparing→ready→assigned→picked_up→in_transit→delivered→cancelled |
| subtotal | decimal(16,2) | NOT NULL | |
| delivery_fee | decimal(16,2) | default:0 | |
| service_fee | decimal(16,2) | default:0 | |
| tip_amount | decimal(16,2) | default:0 | |
| total_amount | decimal(16,2) | NOT NULL | |
| delivery_address | text | NOT NULL | |
| delivery_latitude | decimal(10,7) | NOT NULL | |
| delivery_longitude | decimal(10,7) | NOT NULL | |
| delivery_notes | text | nullable | |
| estimated_delivery_at | timestamp | nullable | |
| actual_delivery_at | timestamp | nullable | |
| cancelled_at | timestamp | nullable | |
| cancelled_by | string(36) | nullable | |
| cancellation_reason | text | nullable | |
| payment_method | string(20) | default:'card' | |
| payment_status | string(20) | default:'pending' | |
| payment_id | UUID | FK → payments.id | nullable |
| rating | integer | nullable | 1-5 |
| rating_comment | text | nullable | |
| created_at | timestamp | |
| updated_at | timestamp | |

**Missing columns:**
- `restaurant_notes` text nullable (order notes for restaurant)
- `confirmed_at` timestamp nullable
- `preparing_at` timestamp nullable
- `ready_at` timestamp nullable
- `preparation_time_actual` integer nullable (minutes)
- `accepted_by_driver_at` timestamp nullable

**Missing indexes:**
- Index on `(customer_id, status)` for customer order queries
- Index on `(driver_id, status)` for driver order queries
- Index on `(restaurant_id, status)` for restaurant queries
- Index on `(status, created_at)` for available/active orders
- Index on `(estimated_delivery_at)` for scheduling queries

### 19. `food_order_items`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| food_order_id | UUID | FK → food_orders.id | |
| menu_item_id | UUID | FK → menu_items.id | nullable |
| name | string(255) | NOT NULL | Snapshot at order time |
| price | decimal(16,2) | NOT NULL | |
| quantity | integer | NOT NULL, min:1 | |
| special_instructions | text | nullable | |
| line_total | decimal(16,2) | NOT NULL | |
| created_at | timestamp | |
| updated_at | timestamp | |

**Missing indexes:**
- Index on `(food_order_id)` for order items retrieval
- Index on `(menu_item_id)` for popular item analytics

---

## Additional Tables (Compliance / Safety)

### 20. `push_tokens`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id | |
| token | text | NOT NULL | FCM/APNs token |
| platform | string(10) | NOT NULL | ios/android/web |
| is_active | boolean | default:true | |
| last_used_at | timestamp | nullable | |
| created_at | timestamp | |
| updated_at | timestamp | |

**Missing indexes:**
- Index on `(user_id, is_active)` for push notification dispatch
- Index on `token` for deduplication

### 21. `consent_records`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| consent_type | string(50) | NOT NULL | terms_of_service/privacy_policy/location_tracking/marketing_notifications/data_sharing |
| consent_version | string(20) | NOT NULL | Version of the consent document |
| granted_at | timestamp | NOT NULL | |
| revoked_at | timestamp | nullable | |
| ip_address | string(45) | nullable | |
| user_agent | text | nullable | |
| metadata | jsonb | nullable | |
| created_at | timestamp | |
| updated_at | timestamp | |

**Missing indexes:**
- Index on `(user_id, consent_type, granted_at)` for current consent status
- Index on `(consent_type, consent_version)` for version tracking

### 22. `kyc_verifications`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id | |
| verification_type | string(50) | NOT NULL | See model constants |
| document_type | string(50) | NOT NULL | |
| document_number | string(100) | nullable | Encrypted at rest |
| document_front_path | string(255) | nullable | |
| document_back_path | string(255) | nullable | |
| selfie_path | string(255) | nullable | |
| status | string(20) | default:'pending' | pending/under_review/approved/rejected/expired |
| rejection_reason | text | nullable | |
| verified_at | timestamp | nullable | |
| verified_by | string(36) | FK → users.id | nullable |
| expires_at | timestamp | nullable | |
| metadata | jsonb | nullable | OCR results, risk flags |
| created_at | timestamp | |
| updated_at | timestamp | |

**Missing indexes:**
- Index on `(user_id, status)` for user KYC status
- Index on `(status, created_at)` for admin review queue
- Index on `(verification_type, status)` for type-specific queues

### 23. `incident_reports`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| reporter_id | UUID | FK → users.id, NOT NULL | |
| ride_id | UUID | FK → rides.id | nullable |
| delivery_id | UUID | FK → deliveries.id | nullable |
| incident_type | string(50) | NOT NULL | See model constants (13 types) |
| severity | string(20) | default:'medium' | low/medium/high/critical |
| title | string(255) | NOT NULL | |
| description | text | NOT NULL | |
| status | string(20) | default:'open' | open/investigating/resolved/closed/escalated |
| assigned_to | string(36) | FK → users.id | nullable |
| resolution | text | nullable | |
| resolved_at | timestamp | nullable | |
| evidence_paths | jsonb | nullable | Array of file paths |
| metadata | jsonb | nullable | |
| created_at | timestamp | |
| updated_at | timestamp | |

**Missing indexes:**
- Index on `(status, severity)` for triage queue
- Index on `(incident_type, status)` for type-based analysis
- Index on `(assigned_to, status)` for admin workload view
- Index on `(reporter_id)` for user incident history
- Index on `(ride_id)` for ride-linked incidents

### 24. `sos_alerts`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| ride_id | UUID | FK → rides.id | nullable |
| latitude | decimal(10,7) | NOT NULL | |
| longitude | decimal(10,7) | NOT NULL | |
| location_description | text | nullable | |
| status | string(20) | default:'active' | active/acknowledged/resolved/cancelled |
| severity | string(20) | default:'high' | low/medium/high/critical |
| acknowledged_by | string(36) | FK → users.id | nullable |
| acknowledged_at | timestamp | nullable | |
| resolved_at | timestamp | nullable | |
| notes | text | nullable | |
| created_at | timestamp | |
| updated_at | timestamp | |

**Missing indexes:**
- Index on `(status, severity, created_at)` for active alert monitoring
- Index on `(user_id)` for user alert history

### 25. `referral_codes`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, UNIQUE | One code per user |
| code | string(50) | UNIQUE, NOT NULL | |
| is_active | boolean | default:true | |
| usage_count | integer | default:0 | |
| max_uses | integer | nullable | NULL = unlimited |
| created_at | timestamp | |
| updated_at | timestamp | |

**Missing indexes:**
- Index on `code` (already unique)

### 26. `referral_redemptions`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| referral_code_id | UUID | FK → referral_codes.id | |
| referrer_id | UUID | FK → users.id | |
| referred_id | UUID | FK → users.id | |
| bonus_amount | decimal(16,2) | NOT NULL | |
| bonus_paid | boolean | default:false | |
| completed_at | timestamp | nullable | When referred user completed first ride |
| created_at | timestamp | |
| updated_at | timestamp | |

**Missing indexes:**
- Index on `(referrer_id)` for referrer statistics
- Index on `(referred_id)` for duplicate prevention
- Index on `(bonus_paid, completed_at)` for payout processing

### 27. `disputes`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| ride_id | UUID | FK → rides.id | nullable |
| payment_id | UUID | FK → payments.id | nullable |
| raised_by | UUID | FK → users.id | |
| reason | string(50) | NOT NULL | |
| description | text | nullable | |
| status | string(20) | default:'open' | open/investigating/resolved/closed |
| resolved_by | string(36) | FK → users.id | nullable |
| resolved_at | timestamp | nullable | |
| resolution | text | nullable | |
| created_at | timestamp | |
| updated_at | timestamp | |

**Missing indexes:**
- Index on `(status, created_at)` for dispute queue
- Index on `(raised_by)` for user dispute history

---

## Suggested New Tables for Phase 0 Implementation

### 1. `driver_payouts`

Purpose: Track batch payouts to drivers as opposed to per-ride payments.

```sql
CREATE TABLE driver_payouts (
    id UUID PRIMARY KEY,
    driver_id UUID NOT NULL REFERENCES users(id),
    amount decimal(16,2) NOT NULL,
    platform_fee decimal(16,2) DEFAULT 0,
    net_amount decimal(16,2) NOT NULL,
    status varchar(20) DEFAULT 'pending',  -- pending/processing/completed/failed
    payout_method varchar(20) DEFAULT 'bank_transfer', -- bank_transfer/wallet/cash
    bank_account_id UUID NULL,
    reference varchar(255) NULL,
    notes text NULL,
    period_start timestamp NULL,
    period_end timestamp NULL,
    paid_at timestamp NULL,
    created_at timestamp,
    updated_at timestamp
);

CREATE INDEX idx_driver_payouts_driver_id ON driver_payouts(driver_id);
CREATE INDEX idx_driver_payouts_status ON driver_payouts(status);
```

### 2. `cash_reconciliation`

Purpose: Record admin reconciliation of cash ride payments against driver collections.

```sql
CREATE TABLE cash_reconciliation (
    id UUID PRIMARY KEY,
    driver_id UUID NOT NULL REFERENCES users(id),
    admin_id UUID NOT NULL REFERENCES users(id),
    period_start timestamp NOT NULL,
    period_end timestamp NOT NULL,
    expected_amount decimal(16,2) NOT NULL,
    collected_amount decimal(16,2) NOT NULL,
    discrepancy decimal(16,2) NOT NULL,
    status varchar(20) DEFAULT 'pending', -- pending/resolved/disputed
    notes text NULL,
    resolved_at timestamp NULL,
    created_at timestamp,
    updated_at timestamp
);

CREATE INDEX idx_cash_reconciliation_driver ON cash_reconciliation(driver_id);
CREATE INDEX idx_cash_reconciliation_status ON cash_reconciliation(status);
```

### 3. `webhook_events`

Purpose: Dead letter queue for webhook processing failures.

```sql
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY,
    source varchar(50) NOT NULL, -- stripe/payfast/ozow/partner
    event_type varchar(100) NOT NULL,
    payload jsonb NOT NULL,
    headers jsonb NULL,
    status varchar(20) DEFAULT 'pending', -- pending/processing/completed/failed
    attempt_count integer DEFAULT 0,
    max_attempts integer DEFAULT 5,
    last_error text NULL,
    last_attempt_at timestamp NULL,
    processed_at timestamp NULL,
    created_at timestamp,
    updated_at timestamp
);

CREATE INDEX idx_webhook_events_status ON webhook_events(status);
CREATE INDEX idx_webhook_events_source ON webhook_events(source, status);
```

### 4. `user_documents`

Purpose: Store uploaded document metadata separately from KYC for flexibility.

```sql
CREATE TABLE user_documents (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    document_type varchar(50) NOT NULL,
    file_path varchar(255) NOT NULL,
    file_size integer NULL,
    mime_type varchar(100) NULL,
    status varchar(20) DEFAULT 'pending', -- pending/verified/rejected
    verified_by UUID NULL REFERENCES users(id),
    verified_at timestamp NULL,
    expires_at timestamp NULL,
    created_at timestamp,
    updated_at timestamp
);

CREATE INDEX idx_user_documents_user ON user_documents(user_id);
CREATE INDEX idx_user_documents_status ON user_documents(status);
```

### 5. `notification_templates`

Purpose: Manage notification content centrally instead of hardcoding.

```sql
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY,
    type varchar(50) NOT NULL UNIQUE, -- ride_accepted/ride_completed/payment_received/sos_triggered/etc
    title_template text NOT NULL,
    body_template text NOT NULL,
    push_priority varchar(20) DEFAULT 'normal',
    is_active boolean DEFAULT true,
    variables jsonb NULL, -- list of expected variables
    created_at timestamp,
    updated_at timestamp
);
```

### 6. `ride_chat_messages`

Purpose: Persistent storage for ride chat messages (currently only in Redis).

```sql
CREATE TABLE ride_chat_messages (
    id UUID PRIMARY KEY,
    ride_id UUID NOT NULL REFERENCES rides(id),
    sender_id UUID NOT NULL REFERENCES users(id),
    receiver_id UUID NOT NULL REFERENCES users(id),
    message text NOT NULL,
    is_read boolean DEFAULT false,
    read_at timestamp NULL,
    created_at timestamp,
    updated_at timestamp
);

CREATE INDEX idx_ride_chat_messages_ride ON ride_chat_messages(ride_id, created_at);
CREATE INDEX idx_ride_chat_messages_sender ON ride_chat_messages(sender_id);
CREATE INDEX idx_ride_chat_messages_unread ON ride_chat_messages(receiver_id, is_read);
```

### 7. `scheduled_rides`

*(Table may exist but was not in current model files. If not yet created:)*

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| rider_id | UUID FK | |
| pickup_latitude | decimal(10,7) | |
| pickup_longitude | decimal(10,7) | |
| pickup_address | text | |
| dropoff_latitude | decimal(10,7) | |
| dropoff_longitude | decimal(10,7) | |
| dropoff_address | text | |
| scheduled_at | timestamp | When the ride should occur |
| status | string(20) | pending/cancelled/auto_dispatched/completed |
| category | string(20) | |
| ride_id | UUID FK | Linked ride after auto-dispatch |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## Entity Relationship Summary

```
Tenant 1──N User
User   1──1 DriverProfile
User   1──1 Vehicle
User   1──1 Wallet
User   1──N Ride (as rider or driver)
User   1──N Payment (as payer)
User   1──N InAppNotification
User   1──N PushToken
User   1──N ConsentRecord
User   1──N KycVerification
User   1──N IncidentReport (as reporter)
User   1──N SosAlert
User   1──1 ReferralCode
User   1──N ReferralRedemption (as referrer or referred)

Ride   1──1 Payment
Ride   1──1 Rating
Ride   1──1 Delivery (optional)
Ride   1──N SosAlert
Ride   1──N RideChatMessage
Ride   N──N Dispute

PromoCode 1──N PromoCodeRedemption
PromoCode 1──N Ride (discount applied)

Restaurant 1──N RestaurantCategory
Restaurant 1──N MenuItem
Restaurant 1──N FoodOrder

MenuItem 1──N FoodOrderItem

FoodOrder 1──N FoodOrderItem
FoodOrder 1──1 Delivery (association)
FoodOrder 1──1 Payment (association)

Delivery 1──N IncidentReport

Payment 1──1 Dispute
```

---

## Index Strategy Summary

| Priority | Table | Index | Rationale |
|----------|-------|-------|-----------|
| P0 | rides | `(status, created_at)` | Pending ride discovery |
| P0 | rides | `(rider_id, status)` | Rider active ride lookup |
| P0 | rides | `(driver_id, status)` | Driver active ride lookup |
| P0 | users | `(role, is_online, is_approved)` | Driver discovery |
| P0 | users | `email` | Login lookup (already unique) |
| P0 | users | `phone_number` | Login lookup |
| P0 | payments | `(gateway, gateway_reference)` | Webhook dedup |
| P1 | driver_payouts | `(driver_id, status)` | Driver payout queries |
| P1 | notifications | `(user_id, is_read, created_at)` | Unread notification queries |
| P1 | kyc_verifications | `(status, created_at)` | Admin review queue |
| P1 | incident_reports | `(status, severity)` | Admin triage queue |
| P1 | sos_alerts | `(status, severity, created_at)` | Active alerts monitor |
| P1 | audit_logs | `(resource_type, resource_id)` | Resource audit trail |
| P1 | audit_logs | `created_at` | Time-range queries |
| P2 | restaurants | `(latitude, longitude)` PostGIS GIST | Nearby restaurant search |
| P2 | menu_items | `(restaurant_id, category_id, sort_order)` | Menu display ordering |
| P2 | food_orders | `(status, created_at)` | Available orders |
| P2 | wallet_transactions | `(wallet_id, created_at)` | Transaction history |
| P2 | webhook_events | `(source, status)` | Failed webhook processing |

---

## Migration Strategy

1. **Phase 0.1:** Add missing indexes (P0 priority) — online, no downtime
2. **Phase 0.2:** Add missing columns with nullable defaults — online
3. **Phase 0.3:** Create new tables (driver_payouts, cash_reconciliation, webhook_events, user_documents, notification_templates, ride_chat_messages)
4. **Phase 0.4:** Add PostGIS spatial columns to rides table
5. **Phase 0.5:** Data migration for existing records (if any)
6. **Phase 0.6:** Add check constraints on wallet balances
