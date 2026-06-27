# EasyRyde Comprehensive Testing Strategy

## Overview

- **Environment:** Android emulator `easyryde_x86` (AVD)
- **Docker Backend:** API at `http://10.0.0.11:8080/api/v1`, Socket at `http://10.0.0.11:13099`
- **Apps:** Rider, Driver, Admin (Expo/React Native)
- **Auth:** Sanctum token-based, stored in `expo-secure-store` key `auth_token`
- **Socket:** Socket.IO at `:13099`, auth via JWT token, reconnects up to 10×
- **API Client:** Automatic retry (2×), 401 → auto-logout, timeout via `API_TIMEOUT`

---

## Verification Methods Key

| Method | Command |
|--------|---------|
| **Logcat** | `adb -s emulator-5554 logcat -v time \| grep -E "(EasyRyde\|ReactNative\|Axios\|ApiClient\|Socket\|auth)"` |
| **Docker API logs** | `docker logs easyryde-app-1 --tail 50` |
| **Docker Socket logs** | `docker logs easyryde-socket-server-1 --tail 50` |
| **Docker Nginx logs** | `docker logs easyryde-nginx-1 --tail 50` |
| **Visual** | Direct observation on emulator screen |
| **Expo DevTools** | Check Metro bundler output |

---

## 1. Login / Auth Flow

### AUTH-001: Login Screen Renders
| Field | Detail |
|-------|--------|
| **Steps** | 1. Launch any app (Rider/Driver/Admin). 2. Observe screen. |
| **Expected** | Login screen visible with email input, password input, sign-in button |
| **Verify** | Visual inspection; `testID="login-screen"` |
| **Priority** | **P0** |

### AUTH-002: Empty Fields Validation
| Field | Detail |
|-------|--------|
| **Steps** | 1. Leave email + password blank. 2. Tap Sign In. |
| **Expected** | Alert: "Please fill in all fields" (`auth.fillAllFields`) |
| **Verify** | Visual: alert dialog appears; `adb logcat \| grep fillAllFields` |
| **Priority** | **P0** |

### AUTH-003: Invalid Email Format
| Field | Detail |
|-------|--------|
| **Steps** | 1. Enter `notanemail`. 2. Enter any password. 3. Tap Sign In. |
| **Expected** | Alert: "Please enter a valid email address" (`auth.enterValidEmail`) |
| **Verify** | Visual; logcat grep for regex pattern `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| **Priority** | **P1** |

### AUTH-004: Successful Login (Rider)
| Field | Detail |
|-------|--------|
| **Steps** | 1. Enter valid rider email + password. 2. Tap Sign In. |
| **Expected** | POST `/auth/login` returns `{ user, token }`. Token stored in SecureStore. Navigate to Home. |
| **Verify** | **Docker:** `docker logs easyryde-app-1 2>&1 \| grep "POST.*/api/v1/auth/login"` — expect 200. **Logcat:** `grep "auth_token"`. **Visual:** Home screen. |
| **Priority** | **P0** |

### AUTH-005: Successful Login (Driver)
| Field | Detail |
|-------|--------|
| **Steps** | 1. Enter valid driver email + password. 2. Tap Sign In. |
| **Expected** | Same as AUTH-004, navigates to Driver Dashboard |
| **Verify** | Docker: 200 on `/auth/login`. Visual: Driver Dashboard. Logcat: `testID="driver-home-screen"` visible. |
| **Priority** | **P0** |

### AUTH-006: Successful Login (Admin)
| Field | Detail |
|-------|--------|
| **Steps** | 1. Enter valid admin email + password. 2. Tap Sign In. |
| **Expected** | Same flow. Navigates to Admin Dashboard. |
| **Verify** | Docker: 200 on `/auth/login`. Visual: Admin Dashboard with stats. Logcat: `testID="admin-dashboard"` visible. |
| **Priority** | **P0** |

### AUTH-007: Invalid Credentials
| Field | Detail |
|-------|--------|
| **Steps** | 1. Enter `wrong@email.com` + any password. 2. Tap Sign In. |
| **Expected** | POST `/auth/login` returns 401. Alert: "Login failed" with server error message |
| **Verify** | Docker: `docker logs easyryde-app-1 2>&1 \| grep "401.*POST.*/auth/login"`. Visual: alert. |
| **Priority** | **P0** |

### AUTH-008: Token Persistence Across App Restart
| Field | Detail |
|-------|--------|
| **Steps** | 1. Login successfully. 2. Background app → force close. 3. Reopen app. |
| **Expected** | App reads token from SecureStore → calls `GET /auth/me` → restores session without re-login |
| **Verify** | Docker: 200 on `/auth/me` on startup. Visual: Home screen (not login). Logcat: `grep "loadStoredAuth"` |
| **Priority** | **P1** |

### AUTH-009: Logout
| Field | Detail |
|-------|--------|
| **Steps** | 1. Login. 2. Tap logout. |
| **Expected** | POST `/auth/logout`. Token cleared from SecureStore. Return to Login screen. |
| **Verify** | Docker: 200 on `/auth/logout`. Logcat: `grep "deleteItemAsync.*auth_token"`. Visual: Login screen. |
| **Priority** | **P1** |

### AUTH-010: Expired / Revoked Token
| Field | Detail |
|-------|--------|
| **Steps** | 1. Login. 2. Manually delete or expire token in DB. 3. Perform any API action. |
| **Expected** | API returns 401 → `onUnauthorized` fires → token cleared → user returned to Login |
| **Verify** | Docker: 401 response. Logcat: `grep "onUnauthorized\|clearToken"`. Visual: Login screen. |
| **Priority** | **P1** |

### AUTH-011: Registration (Rider only)
| Field | Detail |
|-------|--------|
| **Steps** | 1. Tap "Create Account". 2. Fill name, email, phone, password, confirm password. 3. Tap Sign Up. |
| **Expected** | POST `/auth/register` returns `{ user, token }`. Auto-login. Navigate to Home. |
| **Verify** | Docker: 201 on `/auth/register`. Visual: Home screen. Logcat: `grep "register"` |
| **Priority** | **P1** |

### AUTH-012: Registration Validation — Password Mismatch
| Field | Detail |
|-------|--------|
| **Steps** | 1. Fill all fields, enter different passwords. 2. Tap Sign Up. |
| **Expected** | Client-side alert: "Passwords do not match" before any API call |
| **Verify** | Visual. No API call to `/auth/register`. |
| **Priority** | **P1** |

### AUTH-013: Registration Validation — Short Password
| Field | Detail |
|-------|--------|
| **Steps** | 1. Enter password < 8 chars. 2. Tap Sign Up. |
| **Expected** | Alert: "Password must be at least 8 characters" |
| **Verify** | Visual. No API call. |
| **Priority** | **P2** |

---

## 2. Rider App

### RIDER-001: Home Screen Loads After Login
| Field | Detail |
|-------|--------|
| **Steps** | 1. Login as rider. |
| **Expected** | Home screen visible with map, pickup input, quick actions |
| **Verify** | Visual: `testID="home-screen"` |
| **Priority** | **P0** |

### RIDER-002: Place Search Autocomplete
| Field | Detail |
|-------|--------|
| **Steps** | 1. Tap pick-up / destination input. 2. Type ≥3 characters. |
| **Expected** | GET `/places/search?q=...` fires. Suggestions list appears. Shimmer loading shown while fetching. |
| **Verify** | Docker: 200 on `/places/search`. Visual: shimmer animation, then list of places. Logcat: `grep "places/search"` |
| **Priority** | **P1** |

### RIDER-003: Place Search Empty Results
| Field | Detail |
|-------|--------|
| **Steps** | 1. Type a nonsense query (e.g. `zzzzzzzz`). |
| **Expected** | List empty, "No matching places" text shown (via `ListEmptyComponent`) |
| **Verify** | Docker: 200 with empty array. Visual: "No matching places" |
| **Priority** | **P2** |

### RIDER-004: Request a Ride — Full Flow
| Field | Detail |
|-------|--------|
| **Steps** | 1. Select pickup location. 2. Select destination. 3. Choose ride category (confirm fare estimate GET `/rides/fare-estimate`). 4. Tap Request Ride. |
| **Expected** | POST `/rides` returns ride object with status `searching`. Navigate to tracking screen. |
| **Verify** | Docker: 200 on POST `/rides`. Logcat: `grep "ride.*searching"`. Visual: Tracking screen with driver search animation. |
| **Priority** | **P0** |

### RIDER-005: Ride Tracking — Driver Assigned
| Field | Detail |
|-------|--------|
| **Steps** | 1. After ride requested, a driver accepts. |
| **Expected** | Socket event `ride:accepted`. Ride status updates to `accepted`. Driver info displayed (name, photo). ETA shown. |
| **Verify** | Socket logs: `docker logs easyryde-socket-server-1 2>&1 \| grep "ride:accepted"`. Visual: driver card, ETA. |
| **Priority** | **P0** |

### RIDER-006: Ride Tracking — Driver Arrived
| Field | Detail |
|-------|--------|
| **Steps** | 1. After driver accepts, driver taps "Mark Arrived". |
| **Expected** | Socket event `ride:arrived`. Status updates to `arrived`. |
| **Verify** | Socket: `grep "ride:arrived"`. Visual: status changes. |
| **Priority** | **P0** |

### RIDER-007: Ride Tracking — Driver En Route (In Progress)
| Field | Detail |
|-------|--------|
| **Steps** | 1. Driver taps "Start Ride". |
| **Expected** | Socket event `ride:started`. Status `in_progress`. Chat with driver button appears. Route polyline on map. |
| **Verify** | Socket: `grep "ride:started"`. Visual: moving driver marker, polyline. |
| **Priority** | **P0** |

### RIDER-008: Real-time Driver Location Updates
| Field | Detail |
|-------|--------|
| **Steps** | 1. During active ride, driver moves. |
| **Expected** | Socket event `driver:location` received every ~50m. Animated driver marker moves smoothly on map (1000ms animated transition). |
| **Verify** | Socket: `grep "driver:location"`. Visual: marker glides, does not jump. Logcat: `grep "AnimatedDriverMarker"` |
| **Priority** | **P1** |

### RIDER-009: Ride Completion — Rating Flow
| Field | Detail |
|-------|--------|
| **Steps** | 1. Driver taps "Complete Ride". 2. Rider sees rating prompt. |
| **Expected** | Socket `ride:completed`. Status `completed`. Rating UI with 5 stars + comment appears. Total fare shown. |
| **Verify** | Socket: `grep "ride:completed"`. Visual: star rating, fare. |
| **Priority** | **P0** |

### RIDER-010: Submit Rating
| Field | Detail |
|-------|--------|
| **Steps** | 1. Select star rating. 2. (Optional) enter comment. 3. Tap Submit. |
| **Expected** | POST `/rides/{id}/rate` with `{ score, comment }`. Alert "Thank you". Return to Home. |
| **Verify** | Docker: 200 on `/rides/rate`. Visual: Thank you alert. |
| **Priority** | **P1** |

### RIDER-011: Cancel a Ride (Before Driver Accepts)
| Field | Detail |
|-------|--------|
| **Steps** | 1. Request ride. 2. While `searching`, tap Cancel. 3. Confirm. |
| **Expected** | POST `/rides/{id}/cancel`. Ride cancelled. Return to Home. |
| **Verify** | Docker: 200 on `/rides/{id}/cancel`. Visual: navigated to Home. |
| **Priority** | **P1** |

### RIDER-012: Cancel a Ride (After Driver Assigned)
| Field | Detail |
|-------|--------|
| **Steps** | 1. Wait for driver accept. 2. Tap Cancel. 3. Confirm. |
| **Expected** | Socket event `ride:cancelled` fires to driver + rider. Both see alert. |
| **Verify** | Socket: `grep "ride:cancelled"`. Visual: driver gets "Ride Cancelled" alert. |
| **Priority** | **P1** |

### RIDER-013: Payment Selection
| Field | Detail |
|-------|--------|
| **Steps** | 1. After ride, navigate to Payment screen. 2. Select payment method. 3. Tap Confirm. |
| **Expected** | POST `/payments/rides/{id}/pay` with `{ method }`. API returns 200. Alert "Payment Successful". |
| **Verify** | Docker: 200 on `/payments/rides/pay`. Visual: success alert. |
| **Priority** | **P0** |

### RIDER-014: Payment Methods Listed
| Field | Detail |
|-------|--------|
| **Steps** | 1. Navigate to Payment screen. |
| **Expected** | GET `/payments/methods` returns list. Cash, Wallet, PayFast, Ozow EFT shown. |
| **Verify** | Docker: 200 on `/payments/methods`. Visual: 4 payment options. |
| **Priority** | **P1** |

### RIDER-015: Ride History
| Field | Detail |
|-------|--------|
| **Steps** | 1. Navigate to Ride History. |
| **Expected** | GET `/rides` returns paginated list. Past rides shown with status, fare, date. |
| **Verify** | Docker: 200 on `/rides`. Visual: list of past rides. |
| **Priority** | **P1** |

### RIDER-016: Ride History — Empty State
| Field | Detail |
|-------|--------|
| **Steps** | 1. Login as new rider with no rides. 2. Navigate to Ride History. |
| **Expected** | Empty state component shown. |
| **Verify** | Visual: `EmptyState` component. |
| **Priority** | **P2** |

### RIDER-017: Ride Tracking — Map Rendering
| Field | Detail |
|-------|--------|
| **Steps** | 1. Request ride. 2. Observe map on tracking screen. |
| **Expected** | Map renders with pickup (green) and dropoff (red) markers. Route polyline shown when available. |
| **Verify** | Visual: map, markers, polyline. |
| **Priority** | **P1** |

### RIDER-018: Wallet Screen
| Field | Detail |
|-------|--------|
| **Steps** | 1. Navigate to Wallet. |
| **Expected** | GET `/wallet` returns balance. GET `/wallet/transactions` returns list. Balance + transactions displayed. |
| **Verify** | Docker: 200 on `/wallet` and `/wallet/transactions`. Visual: `testID="wallet-balance"`. |
| **Priority** | **P1** |

### RIDER-019: Chat with Driver
| Field | Detail |
|-------|--------|
| **Steps** | 1. During active ride, tap "Chat with Driver". 2. Type message. 3. Send. |
| **Expected** | POST `/chat/rides/{rideId}/messages`. Message appears in chat. Socket delivers to driver. |
| **Verify** | Docker: 200 on `/chat/rides/messages`. Socket: `grep "message"`. Visual: message bubble appears. |
| **Priority** | **P2** |

---

## 3. Driver App

### DRIVER-001: Dashboard Loads After Login
| Field | Detail |
|-------|--------|
| **Steps** | 1. Login as driver. |
| **Expected** | Dashboard with earnings cards (Today, Total, Trips), GO ONLINE button, location permission check. |
| **Verify** | Visual: `testID="driver-home-screen"`. 3 earnings cards visible. |
| **Priority** | **P0** |

### DRIVER-002: Earnings Load
| Field | Detail |
|-------|--------|
| **Steps** | 1. After login, observe earnings cards. |
| **Expected** | GET `/drivers/earnings` returns `{ today_earnings, total_earnings, total_trips }`. Cards populated with animated numbers. |
| **Verify** | Docker: 200 on `/drivers/earnings`. Visual: AnimatedNumber with prefix "R". |
| **Priority** | **P1** |

### DRIVER-003: Toggle Online — Go Online
| Field | Detail |
|-------|--------|
| **Steps** | 1. Tap "GO ONLINE" button. |
| **Expected** | POST `/drivers/toggle-online` returns `{ is_online: true }`. Button changes to green "ONLINE" with glowing dot. Location tracking starts. |
| **Verify** | Docker: 200 on `/drivers/toggle-online`. Visual: "ONLINE" green button, `testID="online-status"` visible. Logcat: `grep "startForegroundLocation\|Location.watchPositionAsync"` |
| **Priority** | **P0** |

### DRIVER-004: Toggle Online — Go Offline
| Field | Detail |
|-------|--------|
| **Steps** | 1. While online, tap the "ONLINE" button. |
| **Expected** | POST `/drivers/toggle-online` returns `{ is_online: false }`. Button reverts to "GO ONLINE". Location tracking stops. |
| **Verify** | Docker: 200 on `/drivers/toggle-online`. Visual: "GO ONLINE" button. Logcat: `grep "stopForegroundLocation"` |
| **Priority** | **P1** |

### DRIVER-005: Location Permission Denied
| Field | Detail |
|-------|--------|
| **Steps** | 1. Deny location permission when prompted. 2. Try going online. |
| **Expected** | Alert: "Location permission is required to go online". "Enable Location" button appears on dashboard. |
| **Verify** | Visual: permission denied alert, then "Enable Location" button. |
| **Priority** | **P1** |

### DRIVER-006: Background Location Tracking
| Field | Detail |
|-------|--------|
| **Steps** | 1. Go online. 2. Press Home button (app goes to background). 3. Wait 30s. 4. Return to app. |
| **Expected** | Background location task runs (`easyryde-background-location`). Driver location sent to server periodically. |
| **Verify** | Logcat: `grep "easyryde-background-location\|startLocationUpdatesAsync"`. Docker socket: `grep "driver:location-update"` |
| **Priority** | **P1** |

### DRIVER-007: Receive Ride Request via Socket
| Field | Detail |
|-------|--------|
| **Steps** | 1. Rider requests a ride while driver is online. |
| **Expected** | Socket event `ride:request` received. Alert: "New Ride Request" with distance. |
| **Verify** | Socket: `docker logs easyryde-socket-server-1 2>&1 \| grep "ride:request"`. Visual: alert dialog with Accept/Decline. |
| **Priority** | **P0** |

### DRIVER-008: Accept Ride Request
| Field | Detail |
|-------|--------|
| **Steps** | 1. Receive ride request. 2. Tap Accept. |
| **Expected** | Socket emit `driver:accept-ride`. Navigate to ActiveRide screen. Pickup + dropoff markers on map. |
| **Verify** | Socket: `grep "driver:accept-ride"`. Visual: ActiveRide screen with map. |
| **Priority** | **P0** |

### DRIVER-009: Decline Ride Request
| Field | Detail |
|-------|--------|
| **Steps** | 1. Receive ride request. 2. Tap Decline. |
| **Expected** | Request removed from list/alert. No navigation. Remain on Dashboard. |
| **Verify** | Visual: alert dismissed, no navigation. |
| **Priority** | **P2** |

### DRIVER-010: Mark Arrived at Pickup
| Field | Detail |
|-------|--------|
| **Steps** | 1. After accepting ride. 2. Tap "Mark Arrived". |
| **Expected** | POST `/{rideId}/driver-arrived` (or socket emit `driver:arrived`). Status updates to `arrived`. |
| **Verify** | Docker/socket: `grep "arrived"`. Visual: "Start Ride" button appears. |
| **Priority** | **P0** |

### DRIVER-011: Start Ride
| Field | Detail |
|-------|--------|
| **Steps** | 1. After arriving. 2. Tap "Start Ride". |
| **Expected** | Socket emit `ride:start`. Status `in_progress`. Notification: "Ride Started". |
| **Verify** | Socket: `grep "ride:start"`. Visual: Complete Ride + Chat buttons appear. |
| **Priority** | **P0** |

### DRIVER-012: Complete Ride
| Field | Detail |
|-------|--------|
| **Steps** | 1. During ride, tap "Complete Ride". |
| **Expected** | Socket emit `ride:complete` with fare. Alert: "Ride Completed". Return to Dashboard. |
| **Verify** | Socket: `grep "ride:complete"`. Visual: "Great job!" alert. Dashboard shown. |
| **Priority** | **P0** |

### DRIVER-013: Trip History
| Field | Detail |
|-------|--------|
| **Steps** | 1. Navigate to Trip History. |
| **Expected** | GET `/drivers/trips` returns paginated list. Trips shown with addresses and fares. |
| **Verify** | Docker: 200 on `/drivers/trips`. Visual: trip list. |
| **Priority** | **P1** |

### DRIVER-014: Earnings Detail Screen
| Field | Detail |
|-------|--------|
| **Steps** | 1. Navigate to Earnings screen. |
| **Expected** | GET `/drivers/earnings`. Shows today earnings, total, pending payout, recent transactions. |
| **Verify** | Docker: 200 on `/drivers/earnings`. Visual: `EarningsSummaryCard` with breakdown. |
| **Priority** | **P1** |

### DRIVER-015: Socket Reconnection on Network Drop
| Field | Detail |
|-------|--------|
| **Steps** | 1. Driver online with active socket. 2. Disable emulator WiFi. 3. Re-enable. |
| **Expected** | Socket reconnects (up to 10 attempts, 1-5s delay). Status indicator changes to "Disconnected" then "Connected". |
| **Verify** | Visual: GradientText shows "Disconnected" → "Connected". Socket logs: `grep "reconnection"`. |
| **Priority** | **P1** |

---

## 4. Admin App

### ADMIN-001: Dashboard Loads with Metrics
| Field | Detail |
|-------|--------|
| **Steps** | 1. Login as admin. |
| **Expected** | GET `/admin/dashboard` returns stats. 4 metric cards (Users, Drivers, Active, Total rides). Revenue card. Loading shimmer shown first. |
| **Verify** | Docker: 200 on `/admin/dashboard`. Visual: metric cards with AnimatedNumbers, `testID="admin-dashboard"`, `testID="metric-card"` |
| **Priority** | **P0** |

### ADMIN-002: Users List
| Field | Detail |
|-------|--------|
| **Steps** | 1. Navigate to Users screen. |
| **Expected** | GET `/admin/users?per_page=50`. List of users with name, email, phone, role badge. Pull-to-refresh. |
| **Verify** | Docker: 200 on `/admin/users`. Visual: user cards with role badges (driver=green, user=blue). |
| **Priority** | **P0** |

### ADMIN-003: Users Search
| Field | Detail |
|-------|--------|
| **Steps** | 1. On Users screen, type in search box. 2. Submit. |
| **Expected** | GET `/admin/users?per_page=50&search=...`. Filtered results. |
| **Verify** | Docker: 200 with search param. Visual: matching users only. |
| **Priority** | **P1** |

### ADMIN-004: Users — Empty State
| Field | Detail |
|-------|--------|
| **Steps** | 1. Search for a non-existent user. |
| **Expected** | "No users found" text shown (`ListEmptyComponent`). |
| **Verify** | Visual: empty state text. Docker: 200 with empty `data` array. |
| **Priority** | **P2** |

### ADMIN-005: Drivers List
| Field | Detail |
|-------|--------|
| **Steps** | 1. Navigate to Drivers screen. |
| **Expected** | GET `/admin/drivers?per_page=50`. List of drivers with online/offline status dot, Approve/Reject buttons. |
| **Verify** | Docker: 200 on `/admin/drivers`. Visual: `testID="drivers-list"`, green/grey status dots. |
| **Priority** | **P0** |

### ADMIN-006: Approve Driver
| Field | Detail |
|-------|--------|
| **Steps** | 1. On Drivers screen, tap Approve on an unapproved driver. |
| **Expected** | POST `/admin/drivers/{id}/approve`. Alert "Approved". List refreshes. |
| **Verify** | Docker: 200 on `/admin/drivers/{id}/approve`. Visual: success alert, driver updated. |
| **Priority** | **P1** |

### ADMIN-007: Reject Driver
| Field | Detail |
|-------|--------|
| **Steps** | 1. On Drivers screen, tap Reject. |
| **Expected** | POST `/admin/drivers/{id}/reject`. Alert "Rejected". |
| **Verify** | Docker: 200. Visual: alert. |
| **Priority** | **P1** |

### ADMIN-008: Rides List with Status Filters
| Field | Detail |
|-------|--------|
| **Steps** | 1. Navigate to Rides screen. |
| **Expected** | GET `/admin/rides?per_page=50`. Chip filters: All, Searching, Accepted, In Progress, Completed, Cancelled. Tapping a chip filters the list. |
| **Verify** | Docker: 200 on `/admin/rides` with different `?status=` params. Visual: chips, filtered ride cards with RideStatusBadge. |
| **Priority** | **P0** |

### ADMIN-009: Rides — Status Chip Filtering
| Field | Detail |
|-------|--------|
| **Steps** | 1. Tap "Completed" chip. |
| **Expected** | GET `/admin/rides?per_page=50&status=completed`. Only completed rides shown. |
| **Verify** | Docker: status param in URL. Visual: only completed rides. |
| **Priority** | **P1** |

### ADMIN-010: Platform Settings
| Field | Detail |
|-------|--------|
| **Steps** | 1. Navigate to Settings. |
| **Expected** | GET `/admin/settings`. Key-value settings list with editable text inputs and Save buttons. Type badges. |
| **Verify** | Docker: 200 on `/admin/settings`. Visual: settings cards with type badges. |
| **Priority** | **P1** |

### ADMIN-011: Update Platform Setting
| Field | Detail |
|-------|--------|
| **Steps** | 1. Edit a setting value. 2. Tap Save. |
| **Expected** | POST `/admin/settings` with `{ key, value }`. Button shows "Saving..." then reverts. |
| **Verify** | Docker: 200 on POST `/admin/settings`. Visual: "Saving..." text. |
| **Priority** | **P1** |

### ADMIN-012: Dashboard Pull-to-Refresh
| Field | Detail |
|-------|--------|
| **Steps** | 1. On Dashboard, pull down. |
| **Expected** | RefreshControl triggers. GET `/admin/dashboard` called again. Metrics update. |
| **Verify** | Docker: second 200 on `/admin/dashboard`. Visual: refreshing indicator. |
| **Priority** | **P2** |

### ADMIN-013: Admin Logout
| Field | Detail |
|-------|--------|
| **Steps** | 1. Tap "Sign Out" button (top-right of Dashboard). |
| **Expected** | POST `/auth/logout`. Return to Admin Login screen. |
| **Verify** | Docker: 200 on `/auth/logout`. Visual: login screen. |
| **Priority** | **P1** |

---

## 5. API Connectivity

### API-001: Health Check
| Field | Detail |
|-------|--------|
| **Steps** | 1. From emulator browser, open `http://10.0.0.11:8080/api/v1/health`. |
| **Expected** | 200 response with health status. |
| **Verify** | Docker: `docker logs easyryde-nginx-1 2>&1 \| grep "GET.*/health"`. Response body. |
| **Priority** | **P0** |

### API-002: All Auth Endpoints Reachable
| Field | Detail |
|-------|--------|
| **Steps** | 1. Run AUTH-004, AUTH-005, AUTH-006, AUTH-011. |
| **Expected** | POST `/auth/login`, POST `/auth/register`, POST `/auth/logout`, GET `/auth/me` all return proper responses. |
| **Verify** | Docker logs for each endpoint. Check method matches POST/GET. |
| **Priority** | **P0** |

### API-003: All Ride Endpoints Reachable
| Field | Detail |
|-------|--------|
| **Steps** | 1. Run full ride flow: create, cancel, rate, etc. |
| **Expected** | POST `/rides`, POST `/rides/{id}/cancel`, POST `/rides/{id}/rate`, GET `/rides/{id}`, POST `/rides/{id}/driver-accept`, POST `/rides/{id}/start`, POST `/rides/{id}/complete`, POST `/rides/{id}/location` all return 200/201. |
| **Verify** | Docker: verify each request + method + status code. |
| **Priority** | **P0** |

### API-004: All Driver Endpoints Reachable
| Field | Detail |
|-------|--------|
| **Steps** | 1. Run driver flow: toggle online, earnings, trips. |
| **Expected** | POST `/drivers/toggle-online`, GET `/drivers/earnings`, GET `/drivers/trips`, PUT `/drivers/profile` all return 200. |
| **Verify** | Docker + logcat. |
| **Priority** | **P0** |

### API-005: All Admin Endpoints Reachable
| Field | Detail |
|-------|--------|
| **Steps** | 1. Run admin flow: dashboard, users, drivers, rides, settings. |
| **Expected** | GET `/admin/dashboard`, GET `/admin/users`, GET `/admin/drivers`, GET `/admin/rides`, GET `/admin/settings`, POST `/admin/settings` all return 200. GET `/admin/reports/*` all return 200. |
| **Verify** | Docker for each. |
| **Priority** | **P0** |

### API-006: All Payment Endpoints Reachable
| Field | Detail |
|-------|--------|
| **Steps** | 1. Navigate Payment screens. |
| **Expected** | GET `/payments/methods`, POST `/payments/rides/{id}/pay` return 200. |
| **Verify** | Docker. |
| **Priority** | **P1** |

### API-007: All Public Endpoints Reachable
| Field | Detail |
|-------|--------|
| **Steps** | 1. Check non-auth endpoints. |
| **Expected** | GET `/config`, GET `/places/search`, GET `/places/reverse`, GET `/rides/fare-estimate`, POST `/promo-codes/validate` all return valid responses. |
| **Verify** | Docker for each. |
| **Priority** | **P1** |

### API-008: Correct HTTP Methods
| Field | Detail |
|-------|--------|
| **Steps** | 1. For each endpoint, verify method. |
| **Expected** | No 405 Method Not Allowed errors. POSTs are POSTs, GETs are GETs, PUTs are PUTs, DELETEs are DELETEs. |
| **Verify** | Docker: check no 405 responses. Cross-reference with `routes/api.php`. |
| **Priority** | **P1** |

### API-009: Correct Request Payloads
| Field | Detail |
|-------|--------|
| **Steps** | 1. Inspect what each endpoint sends. |
| **Expected** | `Content-Type: application/json` on all requests. Correct field names match API contract (e.g. `pickup_latitude`, not `pickupLat`). |
| **Verify** | Docker: `grep "application/json"`. Check request body via Laravel request logs. |
| **Priority** | **P1** |

### API-010: Socket Connection Health
| Field | Detail |
|-------|--------|
| **Steps** | 1. After login, check socket status. |
| **Expected** | Socket connects to `ws://10.0.0.11:13099` with auth token. `isConnected` true. |
| **Verify** | Socket: `grep "connection\|connect"`. Logcat: `grep "isConnected\|Socket.*connected"`. Visual: app shows "Connected". |
| **Priority** | **P0** |

### API-011: Socket Events Received
| Field | Detail |
|-------|--------|
| **Steps** | 1. Trigger events across apps. |
| **Expected** | `ride:request`, `ride:accepted`, `driver:location`, `ride:started`, `ride:completed`, `ride:cancelled`, `ride:arrived` all received by appropriate clients. |
| **Verify** | Socket: `docker logs easyryde-socket-server-1 2>&1 \| grep -E "ride:|driver:"` |
| **Priority** | **P0** |

### API-012: API Timeout Handling
| Field | Detail |
|-------|--------|
| **Steps** | 1. Simulate slow API response (e.g., add `sleep(30)` in a test route). 2. Make request from app. |
| **Expected** | API client times out (controlled by `API_TIMEOUT`). Retry logic triggered (2 retries, 1s apart). Error surfaced. |
| **Verify** | Logcat: `grep "AbortError\|retries\|timeout"`. Visual: error alert or fallback UI. |
| **Priority** | **P1** |

### API-013: 401 Auto-Logout
| Field | Detail |
|-------|--------|
| **Steps** | 1. Modify token to be invalid. 2. Make any API call. |
| **Expected** | 401 response → `onUnauthorized()` → token cleared → redirected to Login. |
| **Verify** | Docker: 401. Logcat: `grep "onUnauthorized\|clearToken"`. Visual: Login screen. |
| **Priority** | **P0** |

---

## 6. Error Handling

### ERR-001: Backend Completely Down
| Field | Detail |
|-------|--------|
| **Steps** | 1. `docker compose stop app`. 2. Perform any API action (login, request ride). |
| **Expected** | Network error caught. Alert shown with error message or retry option. App does not crash. |
| **Verify** | Visual: error alert. Logcat: `grep "Network request failed\|TypeError\|ERR_NETWORK"`. No crash. |
| **Priority** | **P0** |

### ERR-002: Backend Returns 500
| Field | Detail |
|-------|--------|
| **Steps** | 1. Trigger server error (e.g., malformed request). |
| **Expected** | 500 response → error thrown → alert shown. App remains usable. |
| **Verify** | Docker: 500. Visual: error message. |
| **Priority** | **P1** |

### ERR-003: Backend Returns 422 Validation Error
| Field | Detail |
|-------|--------|
| **Steps** | 1. Submit registration with existing email (unique violation). |
| **Expected** | 422 response with validation errors. Alert or inline error shown. |
| **Verify** | Docker: 422. Visual: error message from server. |
| **Priority** | **P1** |

### ERR-004: Network Timeout
| Field | Detail |
|-------|--------|
| **Steps** | 1. Set emulator to "Airplane Mode". 2. Try to login. |
| **Expected** | Network error after timeout. Alert displayed. App does not freeze or crash. |
| **Verify** | Visual: error alert. Logcat: `grep "timeout\|Network"`. |
| **Priority** | **P0** |

### ERR-005: Socket Connection Failure
| Field | Detail |
|-------|--------|
| **Steps** | 1. `docker compose stop socket-server`. 2. Login. |
| **Expected** | Socket fails to connect. App works in degraded mode (no live updates). Error logged, not alerted to user. |
| **Verify** | Logcat: `grep "connect_error\|Socket.*Connection error"`. Visual: app loads, "Disconnected" shown, no crash. |
| **Priority** | **P1** |

### ERR-006: Invalid Token on Startup
| Field | Detail |
|-------|--------|
| **Steps** | 1. Manually corrupt SecureStore token. 2. Launch app. |
| **Expected** | `loadStoredAuth` → `auth.me()` fails → token cleared → Login screen shown. |
| **Verify** | Logcat: `grep "loadStoredAuth\|clearToken"`. Visual: Login screen immediately. |
| **Priority** | **P1** |

### ERR-007: Ride Cancel While Searching
| Field | Detail |
|-------|--------|
| **Steps** | 1. Request ride. 2. Tap Cancel. 3. Server fails to cancel. |
| **Expected** | Error caught. Alert with error message. Ride remains in current state. App does not crash. |
| **Verify** | Visual: error alert. Docker: error from backend. |
| **Priority** | **P1** |

### ERR-008: Payment Failure — Insufficient Funds
| Field | Detail |
|-------|--------|
| **Steps** | 1. Select Wallet payment. 2. Confirm with insufficient balance. |
| **Expected** | POST fails (400/402). Alert: "Payment Failed". User can select different method. |
| **Verify** | Docker: 400/402. Visual: failure alert, not redirected. |
| **Priority** | **P1** |

### ERR-009: Rating — Submit Without Stars
| Field | Detail |
|-------|--------|
| **Steps** | 1. Tap Submit Rating without selecting any star. |
| **Expected** | Button disabled (`disabled={rating === 0}`). No API call made. |
| **Verify** | Visual: greyed-out button. No Docker request. |
| **Priority** | **P2** |

### ERR-010: Ride Request — Missing Pickup/Dropoff
| Field | Detail |
|-------|--------|
| **Steps** | 1. Tap Request Ride without selecting destination. |
| **Expected** | Client-side validation prevents submission. Alert or disabled button. |
| **Verify** | Visual. No API call. |
| **Priority** | **P1** |

---

## 7. Offline Behavior

### OFFLINE-001: App Launch Offline
| Field | Detail |
|-------|--------|
| **Steps** | 1. Enable Airplane Mode. 2. Launch app. 3. Observe. |
| **Expected** | Splash screen → stored token check → `auth.me()` fails with network error → Login screen shown. No crash, no freeze. |
| **Verify** | Logcat: `grep "Network error on startup\|ERR_NETWORK"`. Visual: Login screen loads. |
| **Priority** | **P1** |

### OFFLINE-002: Authenticated Action Offline
| Field | Detail |
|-------|--------|
| **Steps** | 1. Login while online. 2. Enable Airplane Mode. 3. Try any action (request ride). |
| **Expected** | Network error caught. Alert shown with error message. App does not crash. `offlineQueue` may enqueue the request. |
| **Verify** | Visual: error alert. Logcat: `grep "offlineQueue\|enqueue"`. |
| **Priority** | **P1** |

### OFFLINE-003: Offline Banner Display
| Field | Detail |
|-------|--------|
| **Steps** | 1. Login. 2. Enable Airplane Mode. |
| **Expected** | `OfflineBanner` component appears at top of screen. |
| **Verify** | Visual: banner stating "No internet connection" or similar. Check `packages/ui-kit/src/components/OfflineBanner.tsx` |
| **Priority** | **P1** |

### OFFLINE-004: Offline → Online Transition
| Field | Detail |
|-------|--------|
| **Steps** | 1. App in offline state. 2. Disable Airplane Mode. 3. Wait. |
| **Expected** | Socket reconnects. API calls start working. Offline banner disappears. Queued requests flush. |
| **Verify** | Visual: banner gone. Logcat: `grep "reconnection\|flush"`. Docker: queued requests sent. |
| **Priority** | **P1** |

### OFFLINE-005: Offline Queue Persistence
| Field | Detail |
|-------|--------|
| **Steps** | 1. Make request while offline. 2. Force close app. 3. Reopen online. |
| **Expected** | Queued request stored in AsyncStorage (`@easyryde/offline_queue`). On reconnect, queue is processed. |
| **Verify** | Logcat: `grep "offline_queue\|enqueue"`. Docker: request eventually sent. |
| **Priority** | **P2** |

---

## 8. Edge Cases

### EDGE-001: Rapid Button Tapping
| Field | Detail |
|-------|--------|
| **Steps** | 1. On login screen, rapidly tap Sign In (10× in 1s). |
| **Expected** | Only one API call made. Button disabled while loading. No duplicate ride creations. |
| **Verify** | Docker: only 1 POST `/auth/login`. Visual: `disabled={loading}` prevents multiple taps. |
| **Priority** | **P1** |

### EDGE-002: Back Navigation During API Call
| Field | Detail |
|-------|--------|
| **Steps** | 1. Tap Sign In. 2. Immediately press Android Back button. |
| **Expected** | API call completes. If success, token stored silently. If navigates away, no crash. React cleanup runs (e.g., `cancelled` flag on BookRide). |
| **Verify** | Visual: no crash, no inconsistent state. Logcat: no "unmounted component" warnings. |
| **Priority** | **P1** |

### EDGE-003: Double Ride Request
| Field | Detail |
|-------|--------|
| **Steps** | 1. Tap Request Ride rapidly. |
| **Expected** | Button disabled during request. Only one POST `/rides` call. |
| **Verify** | Docker: one POST. Visual: loading state. |
| **Priority** | **P0** |

### EDGE-004: Empty Ride History / Empty Lists
| Field | Detail |
|-------|--------|
| **Steps** | 1. Use brand-new account. 2. Check each list screen. |
| **Expected** | Ride History: "No rides yet". Wallet transactions: empty. Drivers (admin): "No drivers found". Rides (admin): "No rides found". Settings (admin): "No settings configured". |
| **Verify** | Visual: `ListEmptyComponent` renders for each. |
| **Priority** | **P2** |

### EDGE-005: Very Long List Scrolling
| Field | Detail |
|-------|--------|
| **Steps** | 1. Have 100+ users/rides. 2. Scroll to bottom. |
| **Expected** | FlatList renders smoothly. If paginated, load more on scroll to bottom. No lag or crash. |
| **Verify** | Visual: smooth scroll, `onEndReached` fires if paginated. |
| **Priority** | **P2** |

### EDGE-006: Special Characters in Inputs
| Field | Detail |
|-------|--------|
| **Steps** | 1. Enter `<script>alert('xss')</script>` in name/address fields. 2. Submit. |
| **Expected** | Backend sanitizes/special-chars input. No XSS. Stored data displays escaped. |
| **Verify** | Docker: 200. Visual: literal text `<script>...`, not executed. |
| **Priority** | **P1** |

### EDGE-007: Emulator Rotation
| Field | Detail |
|-------|--------|
| **Steps** | 1. Rotate emulator to landscape. 2. Observe each screen. |
| **Expected** | Layouts adapt. No clipped elements, no overlapping. KeyboardAvoidingView works correctly. |
| **Verify** | Visual: all elements visible and properly laid out. |
| **Priority** | **P2** |

### EDGE-008: Deep Link Handling
| Field | Detail |
|-------|--------|
| **Steps** | 1. Trigger a deep link (e.g., password reset link). |
| **Expected** | `deeplink` package handles the link. Correct screen presented. |
| **Verify** | Visual: navigates to correct screen. Logcat: `grep "deeplink\|deep.*link"` |
| **Priority** | **P2** |

### EDGE-009: Low Battery / Background Kill
| Field | Detail |
|-------|--------|
| **Steps** | 1. Driver online, ride in progress. 2. Simulate low battery kill (adb shell am force-stop). 3. Relaunch. |
| **Expected** | On relaunch, token restored. App checks current ride. If ride still active, re-navigates to tracking screen. |
| **Verify** | Docker: GET `/rides/current` called. Visual: ride tracking screen re-opens. |
| **Priority** | **P1** |

### EDGE-010: Simultaneous Login on Multiple Devices
| Field | Detail |
|-------|--------|
| **Steps** | 1. Login on emulator. 2. Login on another device with same credentials. |
| **Expected** | New token issued. Old token invalidated. First device gets 401 on next API call → auto-logout. |
| **Verify** | Docker: second login returns new token. First device: 401 → `/auth/login` screen. |
| **Priority** | **P2** |

---

## Execution Summary

### Recommended Test Run Order

```
Phase 1 — Smoke (P0 only, ~20 tests)
  AUTH-001, AUTH-002, AUTH-004→006, AUTH-007
  RIDER-001, RIDER-004→005→006→007→009→013
  DRIVER-001, DRIVER-003, DRIVER-007→008→010→011→012
  ADMIN-001, ADMIN-002, ADMIN-005, ADMIN-008
  API-001, API-010, API-011, API-013
  ERR-001, ERR-004

Phase 2 — Functional (P1, all remaining P0 verified)
  All P1 tests for auth, rider, driver, admin

Phase 3 — Edge Cases (P2)
  All P2 tests

Phase 4 — Offline & Resilience
  All OFFLINE tests
  ERR series
```

### Test Commands Cheat Sheet

| Action | Command |
|--------|---------|
| Launch Rider app | `npx expo start --dev-client` from `mobile/apps/rider` |
| Launch Driver app | `npx expo start --dev-client` from `mobile/apps/driver` |
| Launch Admin app | `npx expo start --dev-client` from `mobile/apps/admin` |
| Run PHPUnit tests | `docker exec easyryde-app-1 php artisan test` |
| Check Docker API logs | `docker logs easyryde-app-1 --tail 100 -f` |
| Check Docker Socket logs | `docker logs easyryde-socket-server-1 --tail 100 -f` |
| Check Docker Nginx logs | `docker logs easyryde-nginx-1 --tail 50 -f` |
| View Logcat | `adb -s emulator-5554 logcat -v time \| grep -E "(EasyRyde\|ApiClient\|Socket\|auth\|useAuth)"` |
| Clear app data | `adb -s emulator-5554 shell pm clear com.easyryde.rider` |
| Force stop app | `adb -s emulator-5554 shell am force-stop com.easyryde.rider` |
| Simulate airplane mode | `adb -s emulator-5554 shell settings put global airplane_mode_on 1 && adb -s emulator-5554 shell am broadcast -a android.intent.action.AIRPLANE_MODE` |

---

*Test plan generated from full source analysis of mobile apps, backend routes, API client, auth flow, socket server, and docker configuration.*
