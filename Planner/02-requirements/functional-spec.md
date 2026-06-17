# Functional Specification

**Phase:** 02 — Requirements  
**Document:** Functional Specification  
**Version:** 1.0.0  
**Date:** 2026-06-17  
**Status:** Draft

---

## 1. Auth Module

### 1.1 Rider Authentication

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| AUTH-R-01 | Rider registration (phone) | User enters SA mobile number → receives 6-digit OTP via SMS → verifies → prompted for name, email (optional) → account created |
| AUTH-R-02 | Rider registration (Google SSO) | User taps "Sign in with Google" → OAuth flow → profile pre-filled → phone verification required → account created |
| AUTH-R-03 | Rider registration (Apple SSO) | Same flow as Google but Apple-only on iOS devices |
| AUTH-R-04 | Rider login | Phone + OTP or SSO. Token-based session (JWT, 30-day expiry). Remember device. |
| AUTH-R-05 | Password reset | Email-based reset link → enter new password → confirm → token invalidated |
| AUTH-R-06 | Profile management | Update name, email, phone, emergency contacts, default payment method |
| AUTH-R-07 | Account deletion | Self-service account deletion with verification → data anonymised within 30 days (per POPIA) |

### 1.2 Driver Authentication

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| AUTH-D-01 | Driver registration | Phone + email + password → upload ID document → upload driver's license → upload vehicle papers → submit for approval |
| AUTH-D-02 | Driver login | Phone/email + password. JWT token. Must be approved + not suspended. |
| AUTH-D-03 | Admin creates driver | Admin fills driver details → system sends invite link → driver sets password → KYC required before activation |
| AUTH-D-04 | Session management | Max 1 active session per driver. New login invalidates old session. |

### 1.3 Admin Authentication

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| AUTH-A-01 | Admin login | Email + password + TOTP 2FA. IP-restricted access. |
| AUTH-A-02 | Role-based access | Super Admin, Ops Admin, Finance Admin, Support Admin. Each role has granular permissions (CRUD per module). |
| AUTH-A-03 | Admin audit log | Every login, action, and configuration change logged with timestamp, admin ID, IP address, and diff. |

### 1.4 API Security

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| AUTH-01 | Token format | JWT (RS256), 15-minute access token + 30-day refresh token (HTTP-only cookie) |
| AUTH-02 | Rate limiting | 10 requests/minute on /api/auth/* endpoints. 60/minute on all others. Redis-backed. |
| AUTH-03 | Device fingerprint | Login records device ID + user agent + IP. Flag unknown devices. |

---

## 2. Ride Module

### 2.1 Ride Request & Estimation

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| RIDE-01 | Fare estimate | Rider enters pickup + drop-off → system calculates distance (PostGIS) → applies rate card + time multiplier → returns price breakdown |
| RIDE-02 | Ride type selection | Rider chooses from Economy, Standard, Premium, XL → prices update live |
| RIDE-03 | Surge pricing | Dynamic multiplier (1.0x–2.5x) based on: time of day, demand ratio, special events. Show surge indicator to rider before booking. |
| RIDE-04 | Request ride | Rider confirms → ride enters SEARCHING state → broadcast to nearby drivers |

### 2.2 Ride Lifecycle

| State | Trigger | Actions |
|-------|---------|---------|
| SEARCHING | Rider confirms ride | Broadcast to drivers within 3km. 60-second timeout. |
| ACCEPTED | Driver accepts | Cancel other notifications. Show driver+rider details. |
| ARRIVED | Driver taps "Arrived" | Notify rider. Start 5-minute grace timer. |
| IN_PROGRESS | Driver taps "Start Ride" | Begin fare metering. Enable live tracking. |
| COMPLETED | Driver taps "Complete Ride" | Calculate final fare. Process payment. Enable rating. |
| CANCELLED | Either party cancels | Determine cancellation fee. Log reason. |

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| RIDE-05 | Driver matching | Find nearest available (online, not on a ride) driver within 3km. Expand radius by 1km every 15s up to 8km. |
| RIDE-06 | 60-second timeout | No driver accepts in 60s → notify rider "No drivers available, try again later" |
| RIDE-07 | Arrived notification | Push + SMS to rider: "Your driver [name] has arrived in [car model] [plate]" |
| RIDE-08 | 5-minute grace timer | Driver waits 5 min after ARRIVED. If rider doesn't appear → driver can cancel with fee. Timer displayed to both. |
| RIDE-09 | Live fare metering | During IN_PROGRESS, fare updates every 30s based on actual distance + time. |
| RIDE-10 | Final fare calculation | Base + distance (actual GPS path) + time (actual duration) + surge. Must be within 20% of estimate or rider gets adjustment. |
| RIDE-11 | Cancellation (rider) | Before driver ARRIVED: free. After ARRIVED: R15 fee. Rider selects reason from list. |
| RIDE-12 | Cancellation (driver) | 1% cancellation rate allowed. >1% → reduced dispatch priority for 24h. Driver selects reason. |
| RIDE-13 | Rating | 1–5 stars + optional comment for both parties. Rating prompt shows within 2 minutes of ride end. |

### 2.3 Receipts & History

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| RIDE-14 | Digital receipt | Generated on completion. Shows: distance, time, base fare, per-km, per-min, surge multiplier, platform fee, total. PDF + email + in-app. |
| RIDE-15 | Ride history | Paginated list of past rides. Filter by date range, status. Tap for details, receipt, rebook. |
| RIDE-16 | Rebook | One-tap rebook from history — same pickup/drop-off, same ride type. |

### 2.4 Scheduled Rides

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| RIDE-17 | Schedule ride | Select future time (1–72h ahead). System confirms availability at time of booking. |
| RIDE-18 | Scheduled ride dispatch | 15 minutes before scheduled time: system begins driver search. Must have driver assigned 5 min before scheduled time or rider notified. |
| RIDE-19 | Scheduled ride management | Rider can view, modify, or cancel scheduled rides. Cancel up to 30 min before. |

---

## 3. Driver Module

### 3.1 Availability & Dispatch

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| DRV-01 | Go online/offline | One-tap toggle. Online = eligible for ride requests. Offline = no requests. |
| DRV-02 | Auto-offline | System sets driver offline after 3 consecutive rejected rides, or 30 min idle. |
| DRV-03 | Ride request notification | Sound + vibration + heads-up notification. Shows: pickup location, estimated distance, estimated fare, rider rating. |
| DRV-04 | Accept/reject ride | 30-second countdown. Accept → ride locked. Reject → next driver. Reject reason optional. |
| DRV-05 | Busy mode | After accepting a ride, driver is unavailable for new requests until ride completes. |

### 3.2 Navigation

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| DRV-06 | Navigate to pickup | Deep link to Google Maps or Waze with pickup coordinates |
| DRV-07 | Navigate to drop-off | Same as pickup but with drop-off coordinates after ride starts |
| DRV-08 | Live GPS reporting | Send GPS coordinates every 5 seconds to server during ACTIVE ride. Aggregated to 10s intervals for rider view. |

### 3.3 Earnings

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| DRV-09 | Earnings dashboard | Today, this week, this month. Shows: gross fare, platform fee, net earnings, ride count, hours online. |
| DRV-10 | Trip earnings detail | Per-ride breakdown: fare, distance, time, tip, platform fee. |
| DRV-11 | Weekly statement | Automatically generated each Monday. PDF available in-app. Shows all rides, fees, net amount, payout status. |
| DRV-12 | Payout request | Request payout of available balance. Min R100. Processed within 24h (automated) or next business day. |

### 3.4 Vehicle & Document Management

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| DRV-13 | Add vehicle | Make, model, year, colour, plate number, photos (exterior, interior). |
| DRV-14 | Manage documents | Upload/renew: driver's license, vehicle registration, insurance certificate, operating permit. Expiry tracking with 30-day reminder. |
| DRV-15 | Profile | Photo, bio, language preference, bank details (for payouts). |

---

## 4. Payment Module

### 4.1 Payment Methods

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| PAY-01 | Stripe cards | Collect card via Stripe Elements. Tokenise — never store raw PAN. Support Visa, Mastercard, Amex. |
| PAY-02 | PayFast EFT | Redirect to PayFast for EFT/deposit. Webhook confirms payment. |
| PAY-03 | Ozow instant EFT | Redirect to Ozow. Customer selects bank → auto-login → confirms → webhook confirms. |
| PAY-04 | Cash | Rider pays driver in cash at drop-off. Driver marks "received" in app. |
| PAY-05 | Wallet | Top-up via any digital method. Balance shown at booking. Auto-use wallet before other methods. |

### 4.2 Ride Payment

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| PAY-06 | Auto-charge | On COMPLETED: charge rider's selected payment method. |
| PAY-07 | Escrow hold | Charge goes to EasyRyde holding account. Held for 24h before released to driver escrow. |
| PAY-08 | Escrow release | 24h after ride completion: funds move from holding to driver available balance. |
| PAY-09 | Payment failure | If charge fails → notify rider. Provide in-app link to retry. 3 failures → restrict account. |
| PAY-10 | Refund | Admin initiates refund. Full ride amount or partial. Rider notified. Driver balance adjusted. |

### 4.3 Driver Payouts

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| PAY-11 | Weekly payout batch | Every Monday: calculate all driver earnings (previous Mon–Sun). Batch process. |
| PAY-12 | Payout reporting | Admin can see: total payout amount, number of drivers, success/failure rate, transaction IDs. |
| PAY-13 | Failed payout retry | If payout fails (invalid bank details, etc.) → notify driver + admin. Retry mechanism with 3 attempts. |

---

## 5. Food Delivery Module

### 5.1 Restaurant Onboarding

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| FOOD-01 | Restaurant registration | Admin creates restaurant profile: name, address, GPS coordinates, contact, operating hours, cuisine type, photos. |
| FOOD-02 | Menu management | Add categories, items, modifiers (size, extras), prices, photos, availability. |
| FOOD-03 | Restaurant dashboard | Web dashboard: view incoming orders, mark status, update availability. |

### 5.2 Customer Ordering

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| FOOD-04 | Browse restaurants | List view with search, filter by cuisine, rating, distance. |
| FOOD-05 | View menu | Menu with categories, item descriptions, photos, modifiers, special instructions. |
| FOOD-06 | Cart | Add/remove items, modify quantities, see total. Delivery address + special instructions. |
| FOOD-07 | Place order | Confirm cart → choose payment → order placed → status: PENDING |

### 5.3 Order Lifecycle

| State | Description |
|-------|-------------|
| PENDING | Order received by restaurant |
| CONFIRMED | Restaurant accepted the order |
| PREPARING | Restaurant is making the food |
| READY | Food is packed, waiting for driver |
| PICKED_UP | Driver has the food |
| DELIVERED | Food delivered to customer |

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| FOOD-08 | Order tracking | Customer sees real-time order status + driver location after pickup |
| FOOD-09 | Driver assignment | After PREPARING: find nearest available driver, assign for pickup |
| FOOD-10 | Delivery fee | Calculated: restaurant → customer distance × per-km rate |
| FOOD-11 | Rating | Rate food (1–5) and delivery (1–5) separately after DELIVERED |

---

## 6. Admin Module

### 6.1 Dashboard

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| ADM-01 | KPI display | Live cards: rides today, revenue today, active drivers, cancellation %, avg wait time, avg rating. Auto-refresh every 30s. |
| ADM-02 | Charts | 24h ride volume (line chart), revenue trend (7-day bar chart), driver online count (area chart), cancellation reasons (pie chart). |
| ADM-03 | Alert panel | Top-right notification panel: system alerts, SOS incidents, failed payments, driver disputes. |

### 6.2 User Management

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| ADM-04 | Rider list | Search, filter (active/suspended/deleted), sort by name/date/rides. Tap for profile. |
| ADM-05 | Driver list | Search, filter (pending/active/suspended/approved), KYC status. Tap for profile + documents. |
| ADM-06 | Driver approval | View uploaded docs. Approve/reject with reason. Side-by-side doc viewer. |
| ADM-07 | Suspend user | Immediate suspension with reason. Driver/rider notified. Re-activate with audit trail. |

### 6.3 Pricing & Promos

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| ADM-08 | Rate card editor | Edit per-km, per-min, base fare, minimum fare by ride type. Preview impact on example trip. |
| ADM-09 | Surge config | Enable/disable surge, set max multiplier, schedule time-based multipliers. |
| ADM-10 | Promo codes | Create code: type (fixed/percentage/free ride), value, max uses, expiry, min fare. |

### 6.4 Compliance & Audit

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| ADM-11 | Audit log | All admin actions: who, what, when, IP, diff. Searchable, filterable, exportable. |
| ADM-12 | Incident management | SOS alerts, dispute reports. Timeline view. Resolution workflow. |
| ADM-13 | KYC report | All drivers with document status, expiry dates, verification status. Export CSV. |
| ADM-14 | Data retention | Auto-purge personal data per retention schedule. Admin can view purge log. |

### 6.5 Payout Management

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| ADM-15 | Payout queue | Weekly pending payouts. Show total, per-driver breakdown. |
| ADM-16 | Process payout | Admin reviews → approves → batch processed via payment gateway. |
| ADM-17 | Payout history | All past payouts with status, date, amount, driver list. |

---

## 7. Safety Module

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| SFT-01 | SOS button | Red button on rider ride screen. Tapping sends: rider location (every 5s), ride details, contact info to admin dashboard + SMS alert to admin on call. |
| SFT-02 | SOS confirmation | After tapping SOS: screen shows "Help is on the way." Admin calls rider within 30 seconds or dispatches support. |
| SFT-03 | Ride sharing | Rider can share live tracking link via WhatsApp, SMS, or any share sheet. Link expires after ride ends. |
| SFT-04 | Trusted contacts | Add up to 5 contacts. Auto-share ride details when ride starts (opt-in per ride). |
| SFT-05 | In-app chat | Rider ↔ Driver chat during ACTIVE ride. Admin can view if flagged. |
| SFT-06 | Incident reporting | Post-ride: rider/driver can report incident. Form: type (safety, harassment, accident, other), description, optional photos. |
| SFT-07 | Driver verification | Document photos + live selfie at registration. Periodic reverification (every 6 months). |
| SFT-08 | Night mode | 10PM–5AM: only drivers with "verified" badge (extra background check) receive ride requests. |

---

## 8. Notification Module

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| NOT-01 | Push notifications (FCM) | Ride status changes, SOS, payment receipts, promo alerts. Configurable per user. |
| NOT-02 | Email notifications | Receipts, weekly summaries, account verification, password reset. |
| NOT-03 | SMS notifications | OTP (programmable SMS), critical alerts (SOS, account suspension). Only for actions requiring immediate attention. |
| NOT-04 | In-app notification center | Notification history with read/unread status. Tap to navigate to relevant screen. |
| NOT-05 | Notification preferences | Per-channel toggle (push/email/SMS) per notification type. Saved per user. |

---

## 9. Feature Traceability Matrix

| Module | P0 Features | P1 Features | P2 Features |
|--------|-------------|-------------|-------------|
| Auth | 7 | 3 | 0 |
| Ride | 11 | 6 | 2 |
| Driver | 8 | 5 | 2 |
| Payment | 9 | 3 | 1 |
| Food | 7 | 3 | 1 |
| Admin | 11 | 5 | 1 |
| Safety | 5 | 2 | 1 |
| Notification | 3 | 2 | 0 |
| **Total** | **61** | **29** | **8** |
