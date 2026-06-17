# EasyRyde — System Architecture

**Version:** 1.0.0  
**Updated:** 2026-06-17  
**Status:** Final  

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET (HTTPS/WSS)                          │
└─────────────────────────────────────────────────────────────────────────────┘
         │                        │                       │
    [Rider App]             [Driver App]            [Admin Web]
   (Expo/RN iOS)           (Expo/RN iOS)          (React 18 + Vite)
   (Expo/RN Android)       (Expo/RN Android)      (TailwindCSS)
         │                        │                       │
    ┌────┴────┐              ┌────┴────┐             ┌────┴────┐
    │ HTTP/HTTPS             │ HTTP/HTTPS            │ HTTP/HTTPS
    │ WSS (Socket.io)        │ WSS (Socket.io)       │
    └─────────┘              └─────────┘             └─────────┘
         │                        │                       │
         └──────────┬─────────────┴───────────┬───────────┘
                    │                         │
                    ▼                         ▼
         ┌────────────────────┐    ┌──────────────────────┐
         │   Nginx Reverse    │    │   Nginx Reverse      │
         │   Proxy :8000      │    │   Proxy :8080        │
         │   (Laravel API)    │    │   (Socket Server)    │
         └────────┬───────────┘    └──────────┬───────────┘
                  │                           │
                  ▼                           ▼
         ┌────────────────────┐    ┌──────────────────────┐
         │   Laravel API      │    │  Node.js Socket.io   │
         │   PHP 8.3 / FPM    │    │  Express + Socket.io │
         │   Port :9000       │    │  Port :3001          │
         │                    │    │                      │
         │   • Controllers    │    │  • JWT Middleware    │
         │   • Services       │    │  • Geo-Service      │
         │   • Models         │    │  • Chat Handler     │
         │   • Events         │    │  • Ride Handler     │
         │   • Horizon:Queue  │    │  • Admin Broadcast  │
         └────────┬───────────┘    └──────────┬───────────┘
                  │                           │
                  │          ┌────────────────┤
                  │          │                │
                  ▼          ▼                ▼
         ┌────────────┐ ┌──────────┐  ┌──────────────┐
         │ PostgreSQL │ │  Redis   │  │  Redis Pub/  │
         │ :5432      │ │ :6379    │  │  Sub Adapter │
         │            │ │          │  │              │
         │ • PostGIS  │ │ • Cache  │  │ • ride-      │
         │ • 16.3     │ │ • Queue  │  │   events     │
         │            │ │ • Sess.  │  │ • driver-    │
         │            │ │ • Geo-   │  │   events     │
         │            │ │   Index  │  │ • admin-     │
         │            │ │ • Rate   │  │   events     │
         │            │ │   Limit  │  └──────────────┘
         └────────────┘ └──────────┘
```

---

## 2. Component Breakdown

### 2.1 Laravel API (`app:9000`)

| Layer | Directory | Role |
|-------|-----------|------|
| Routes | `routes/api.php` | 105+ endpoints organized in 19 groups |
| Controllers | `app/Http/Controllers/Api/V1/` | 30 controllers, thin (delegate to services) |
| Services | `app/Services/` | 32 service classes encapsulating business logic |
| Models | `app/Models/` | 27 Eloquent models with UUID PK, casts, relations |
| Events | `app/Events/` | Dispatched → Redis broadcast → Socket.io relay |
| Jobs | `app/Jobs/` | Queued via Laravel Horizon on Redis |
| Middleware | `app/Http/Middleware/` | Auth (Sanctum), tenant-scope, role (Spatie) |

**Key packages:**
- `laravel/sanctum ^4.3` — Token-based auth (SPA + mobile)
- `spatie/laravel-permission ^7.4` — Role-based access control
- `spatie/laravel-query-builder ^6.0` — Filtering/sorting API queries
- `laravel/horizon ^5.47` — Queue monitoring dashboard
- `stripe/stripe-php` — Payment gateway integration
- `predis/predis ^2.3` — Redis client
- `sentry/sentry-laravel` — Error tracking
- `barryvdh/laravel-dompdf ^3.1` — PDF receipt generation

### 2.2 Socket.io Server (`socket-server:3001`)

| Layer | File | Role |
|-------|------|------|
| Entry | `src/index.js` | Express + Socket.io server setup, Redis adapter, JWT middleware |
| Config | `src/config.js` | Environment-based configuration with validation |
| Auth Service | `src/services/auth.js` | JWT validation against Laravel Sanctum with Redis token cache |
| Geo Service | `src/services/geo.js` | Redis geo-index operations (add, remove, search, cleanup) |
| Laravel Relay | `src/services/laravel.js` | Redis pub/sub subscriber bridging Laravel events → Socket.io rooms |
| Redis Service | `src/services/redis.js` | ioredis client setup (pub, sub, data clients) |
| Rate Limiter | `src/middleware/rateLimit.js` | Per-socket event rate limiting (default 60/min) |

**Handlers:**
- `handlers/driver.js` — `driver:location-update`, `driver:toggle-online`, `driver:nearby-requests`
- `handlers/ride.js` — `rider:book-ride`, `driver:accept-ride`, `driver:arrived`, `ride:start`, `ride:complete`, `ride:cancel`, `ride:send-location`, `join:ride`
- `handlers/chat.js` — `chat:send`, `chat:typing`, `chat:stop-typing`
- `handlers/delivery.js` — Delivery-specific event handlers
- `handlers/foodOrder.js` — Food order event handlers
- `handlers/admin.js` — Admin broadcast handlers

**Scalability:** Redis adapter via `@socket.io/redis-adapter ^8.3.0` enables multi-instance horizontal scaling.

### 2.3 Mobile Apps (Expo / React Native)

Three Expo apps in a monorepo with Turbo:

| App | Path | Target Users |
|-----|------|-------------|
| Rider | `apps/rider/` | Passengers requesting rides & food delivery |
| Driver | `apps/driver/` | Drivers accepting rides & deliveries |
| Admin Mobile | `apps/admin/` | Admin oversight on-the-go (limited view) |

**Shared libraries** in `packages/` include common UI components, API client, and Socket.io client configuration.

### 2.4 Admin Web Dashboard

- **Framework:** React 18 + TypeScript
- **Bundler:** Vite 5
- **Styling:** TailwindCSS 3.4 + PostCSS
- **Routing:** React Router DOM 6
- **Charts:** Recharts 2.12
- **Maps:** Leaflet + react-leaflet 4.2
- **HTTP:** Axios 1.7
- **Docker:** Multi-stage build → nginx:alpine static serve

### 2.5 Infrastructure

| Service | Image | Port | Persistence |
|---------|-------|------|-------------|
| PostgreSQL 16 + PostGIS 3.4 | `postgis/postgis:16-3.4` | 5432 | Docker volume `pgdata` |
| Redis 7 | `redis:7-alpine` | 6379 | Docker volume `redisdata` |
| PHP-FPM | Custom `.docker/php/Dockerfile` | 9000 | Layer cache |
| Nginx | Custom `.docker/nginx/Dockerfile` | 8000/8080/8443 | None |
| Socket Server | `socket-server/Dockerfile` | 3001 | None |
| Laravel Horizon | Custom PHP Dockerfile | — | None |
| Sentry | SaaS | — | External |

---

## 3. Key Design Decisions

### 3.1 Central Admin Model
- Drivers **cannot self-register**. Admin creates accounts via `POST /api/v1/admin/drivers`.
- Admin reviews and approves drivers via KYC workflow before they can go online.
- Rationale: regulatory compliance (South African transport laws), platform trust, safety.

### 3.2 Service Layer Pattern
- All business logic lives in `app/Services/` (32 services), not controllers.
- Controllers are thin — parse request → call service → return response.
- Enables unit testing services without HTTP context. Services are injectable via Laravel's container.

### 3.3 Redis Pub/Sub Bridge (Laravel ↔ Socket.io)
- Laravel broadcasts events to Redis channels via `BROADCAST_CONNECTION=redis`.
- Socket.io server subscribes to `laravel_database_*` patterns via Redis pub/sub.
- The `laravel.js` relay parses channel names and emits to the correct Socket.io room.
- No direct HTTP calls between Laravel and the socket server — all async via Redis.

### 3.4 PostGIS for Spatial Queries
- PostgreSQL with PostGIS extension for driver matching and proximity queries.
- Redis geo-index (sorted sets) used for real-time driver location tracking.
- Fallback Haversine formula in SQL for complex spatial queries.
- Dual approach: Redis for low-latency real-time queries, PostgreSQL for audit/historical data.

### 3.5 UUID Primary Keys
- All models use `HasUuids` trait with `string` key type, no auto-increment.
- Enables safer distributed ID generation, no sequential enumeration, easier data migration.
- Trade-off: slightly larger index size, no natural ordering.

### 3.6 Multi-Tenant Ready
- `tenant_id` column on all major tables (users, rides, payments, etc.).
- `Tenant` model for region/scoped deployment (slug, domain, region, currency).
- Query scoping via middleware or global scope for tenant isolation.

### 3.7 Dual Payment Flow (Cash + Card)
- Cash payments reconciled via admin settlement workflow.
- Card payments via Stripe (primary) or Ozow/PayFast (South African gateways).
- Escrow holds for disputed transactions.

---

## 4. Data Flow Diagrams

### 4.1 Ride Request Flow

```
Rider App                    Laravel API                Redis              Socket.io Server         Driver App
    │                            │                       │                     │                      │
    ├── POST /api/v1/rides ──────┤                       │                     │                      │
    │    {pickup, dropoff,       │                       │                     │                      │
    │     category}              │                       │                     │                      │
    │                            ├── RideController      │                     │                      │
    │                            │   → validate          │                     │                      │
    │                            │   → fare estimate     │                     │                      │
    │                            │   → create Ride       │                     │                      │
    │                            │   → dispatch event ───┼── RideRequested ────┤                      │
    │  ◄── 201 {ride, drivers} ──┤                       │                     │                      │
    │                            │                       │                     ├── rider:book-ride ────┤
    │                            │                       │                     │   (via WS)           │
    │                            │                       │                     │                      │
    │                            │                       │                     ├── ride:request ──────┤
    │                            │                       │   ride:pending      │   → room:driver:{id}  │
    │                            │                       │   (Redis Hash TTL)  │   {rideId, pickup,   │
    │                            │                       │                     │    dropoff, fare}    │
    │                            │                       │                     │                      │
    │                            │                       │                     │◄── driver:accept-ride┤
    │                            │                       │                     │    {rideId}          │
    │                            │                       │   ride:claim:{id}   │                      │
    │                            │                       │   (Redis SET NX)    ├── ride:accepted ─────┤
    │  ◄── ride:accepted ───────┤                       │                     │   → room:user:{id}   │
    │    (Socket.io event)       │                       │                     │                      │
```

### 4.2 Payment Flow

```
Ride Complete          PaymentService        Stripe API / PayFast       Webhook Endpoint        Wallet
    │                       │                       │                       │                      │
    ├── completeRide() ─────┤                       │                       │                      │
    │                       ├── calculateFare()      │                       │                      │
    │                       ├── Payment::create()    │                       │                      │
    │                       │                       │                       │                      │
    │                       ├── charge() ────────────┤                       │                      │
    │                       │    card/token          │                       │                      │
    │                       │                       ├──► process             │                      │
    │                       │                       │◄── webhook ────────────┤                      │
    │                       │◄──                      │                       │                      │
    │                       ├── onPaymentSuccess()   │                       │                      │
    │                       │   → Payment::update    │                       │                      │
    │                       │   → Wallet::credit     │                       ├── WalletTransaction ──┤
    │                       │   → Dispatch events ───┼───→ Ride:paid         │                      │
    │                       │                       │                       │                      │
    │                       ├── if cash              │                       │                      │
    │                       │   → Payment::cash      │                       │                      │
    │                       │   → Pending settlement │                       │                      │
```

### 4.3 Driver Tracking Flow

```
Driver App (Socket.io)      Socket.io Server               Redis              Rider App
    │                             │                          │                    │
    ├── driver:location-update ───┤                          │                    │
    │    {lat, lng}               ├── geoService             │                    │
    │                             │   .updateDriverLocation()│                    │
    │                             │       ├── GEOADD ────────┤                    │
    │                             │       └── HSET ─────────┤                    │
    │                             │                          │                    │
    │                             ├── if rideId               │                    │
    │                             │   io.to(`ride:{id}`) ────┤── ride:location ──┤
    │                             │                          │   update          │
    │                             │                          │                    │
    │                             ├── Cleanup timer          │                    │
    │                             │   (60s interval)         │                    │
    │                             │   → remove stale after    │                    │
    │                             │     300s no update        │                    │
```

### 4.4 Laravel → Socket.io Bridge Flow

```
Laravel Event         Redis Pub/Sub           Socket.io Server           Socket.io Room
    │                       │                       │                       │
    ├── broadcast() ────────┤                       │                       │
    │   RideRequested       │                       │                       │
    │   on channel:         │                       │                       │
    │   laravel_database_   │                       │                       │
    │   ride.{id}           │                       │                       │
    │                       ├── pmessage ───────────┤                       │
    │                       │                       ├── parseChannelName()  │
    │                       │                       │   "ride:{id}"          │
    │                       │                       ├── resolveRoom()        │
    │                       │                       │   "ride:{id}"          │
    │                       │                       ├── io.to("ride:{id}")  ──┤
    │                       │                       │   .emit(event, data)   │
```

---

## 5. Infrastructure Architecture

```
                    ┌──────────────┐
                    │   Internet   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   Nginx      │
                    │   TLS 1.3    │
                    │   Let's      │
                    │   Encrypt    │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              │                         │
       ┌──────▼──────┐          ┌──────▼──────┐
       │ :8000       │          │ :8080       │
       │ Laravel API │          │ Socket.io   │
       │ PHP-FPM     │          │ Node.js     │
       └──────┬──────┘          └──────┬──────┘
              │                         │
              └──────────┬──────────────┘
                         │
              ┌──────────▼──────────┐
              │    Docker Bridge    │
              │    Network          │
              │    "easyryde"       │
              └──────────┬──────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
   ┌─────▼─────┐   ┌────▼────┐   ┌──────▼──────┐
   │ PostgreSQL│   │  Redis  │   │   Horizon   │
   │ :5432     │   │ :6379   │   │   Queue     │
   │ +PostGIS  │   │         │   │   Worker    │
   └───────────┘   └─────────┘   └─────────────┘
```

---

## 6. Container Strategy

| Container | Image Base | Restart Policy | Health Check | Scaling |
|-----------|-----------|----------------|--------------|---------|
| postgres | postgis/postgis:16-3.4 | unless-stopped | pg_isready | Single instance |
| redis | redis:7-alpine | unless-stopped | redis-cli ping | Single instance |
| app | Custom PHP 8.3 | unless-stopped | PHP-FPM status | Horizontally scalable |
| nginx | Custom nginx-alpine | unless-stopped | — | Horizontally scalable |
| socket-server | node:20-alpine | unless-stopped | GET /health | Horizontally scalable |
| horizon | Custom PHP 8.3 | unless-stopped | — | Single (queue worker) |

---

## 7. Database Connection Pool

- PostgreSQL max_connections: 100 (default tuned for Docker)
- Laravel connection pool: 10 per worker via config
- PgBouncer recommended for production deployment with >50 concurrent workers
- Horizon queue workers: configurable via `config/horizon.php` (default: 3 processes)

---

## 8. Monitoring & Observability

- **Sentry:** PHP error tracking (already configured via `sentry/sentry-laravel`)
- **Socket metrics:** `/metrics` endpoint exposing connections, online drivers, uptime, memory
- **Health endpoints:**
  - `GET /api/v1/health` (Laravel)
  - `GET /health` (Socket.io server)
- **Horizon dashboard:** Queue monitoring at `/horizon`
- **Log channel:** `stderr` (Docker-friendly), collected via Docker log driver

---

## 9. Deployment Topology (Production Recommended)

```
Internet → Cloud Load Balancer → Nginx:8000/8080 (active-passive)
                                     │
                          ┌──────────┴──────────┐
                          │                     │
                   Laravel API x N        Socket.io x N
                   (behind Nginx)         (behind WSS LB)
                          │                     │
                          └──────────┬──────────┘
                                     │
                             ┌───────▼───────┐
                             │   Redis       │
                             │   Sentinel    │
                             │   or Cluster  │
                             └───────┬───────┘
                                     │
                             ┌───────▼───────┐
                             │  PostgreSQL   │
                             │  + Streaming  │
                             │  Replication  │
                             └───────────────┘
```
