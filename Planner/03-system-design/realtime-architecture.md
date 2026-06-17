# EasyRyde — Real-Time Architecture

**Version:** 1.0.0  
**Updated:** 2026-06-17  
**Status:** Final  

---

## 1. Overview

EasyRyde uses a dual-channel real-time communication system:

| Channel | Protocol | Port | Purpose |
|---------|----------|------|---------|
| **WebSocket (WSS)** | Socket.io v4 | 3001 (via Nginx proxy :8080) | Real-time ride events, chat, driver tracking, notifications |
| **REST API** | HTTPS | 8000 | Ride booking, payment, user management, data queries |

The Socket.io server runs as a standalone Node.js process using Express. It connects to Redis for pub/sub bridging with Laravel, geo-indexing for driver locations, and horizontal scaling via the Redis adapter.

---

## 2. Socket.io Server Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Socket.io Server (Node.js)                    │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐ │
│  │ JWT Auth   │  │ Rate       │  │ Redis      │  │ Health    │ │
│  │ Middleware  │──│ Limiter   │──│ Adapter    │──│ Check     │ │
│  └────────────┘  └────────────┘  └────────────┘  └───────────┘ │
│         │              │               │              │          │
│  ┌──────┴──────────────┴───────────────┴──────────────┴──────┐  │
│  │                    Event Handlers                          │  │
│  │  ┌─────────┐ ┌────────┐ ┌──────┐ ┌────────┐ ┌─────────┐  │  │
│  │  │ Driver  │ │ Ride   │ │ Chat │ │Delivery│ │FoodOrder│  │  │
│  │  │Handler  │ │Handler │ │Hndlr │ │Handler │ │ Handler  │  │  │
│  │  └─────────┘ └────────┘ └──────┘ └────────┘ └─────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Services                              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │   │
│  │  │ Geo      │  │ Auth     │  │ Laravel  │  │ Redis   │ │   │
│  │  │ Service  │  │ Service  │  │ Relay    │  │ Client  │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.1 Server Startup Sequence

1. Load environment config via `src/config.js` (validates JWT_SECRET min length)
2. Create Express + HTTP server
3. Initialize Socket.io with CORS, ping interval (25s), timeout (20s), buffer limits
4. Create Redis adapter from pub/sub clients (enables horizontal scaling)
5. Initialize Laravel relay (subscribes to Redis `laravel_database_*` channels)
6. Register JWT authentication middleware
7. Register all event handlers (driver, ride, chat, delivery, admin, foodOrder)
8. Start cleanup interval for stale driver locations (60s)
9. Listen on configured port (default: 3001)

### 2.2 Connection Lifecycle

```
Client                     Socket.io Server              Redis              Laravel
  │                              │                        │                    │
  ├── connect() ────────────────►│                        │                    │
  │                              ├── JWT middleware       │                    │
  │                              │   → authService        │                    │
  │                              │     .validateToken()   │                    │
  │                              │        │               │                    │
  │                              │        ├── Cache hit ──┤                    │
  │                              │        │   (60s TTL)   │                    │
  │                              │        │               │                    │
  │                              │        └── Cache miss ─┤                    │
  │                              │            GET /me ────┤── HTTP ────────────┤
  │                              │            Cache write ─┤                    │
  │                              │                        │                    │
  │                              ├── Set socket.data     │                    │
  │                              │   { userId, role,      │                    │
  │                              │     tenantId }         │                    │
  │                              │                        │                    │
  │                              ├── Join rooms:          │                    │
  │                              │   • user:{userId}      │                    │
  │                              │   • driver:{userId}    │                    │
  │                              │     (if role=driver)   │                    │
  │                              │   • admin              │                    │
  │                              │     (if role=admin)    │                    │
  │                              │                        │                    │
  │  ◄── connected ──────────────┤                        │                    │
```

---

## 3. Room Strategy

| Room | Members | Purpose |
|------|---------|---------|
| `user:{userId}` | Single user | Personal notifications, ride status updates |
| `driver:{driverId}` | Single driver | Ride requests, dispatch notifications |
| `ride:{rideId}` | Rider + Driver + Admin | Ride-specific events, chat, location sharing |
| `delivery:{deliveryId}` | Sender + Driver + Admin | Delivery events |
| `admin` | All admin users | System-wide broadcasts |

### 3.1 Room Join/Leave

- `user:{userId}` and `driver:{userId}` joined automatically on connect
- `ride:{rideId}` joined via `join:ride` event (explicitly in ride handler)
- `ride:{rideId}` left via `leave:ride` event and on disconnect
- Admin broadcasts: system alerts, SOS notifications, new ride alerts

---

## 4. Event Catalog

### 4.1 Client → Server Events

#### Driver Events

| Event | Payload | Rate Limit | Description |
|-------|---------|------------|-------------|
| `driver:location-update` | `{ rideId?, latitude, longitude }` | 1/5s | Update driver GPS location |
| `driver:toggle-online` | `{ isOnline }` | 1/10s | Go online/offline |
| `driver:nearby-requests` | (none) | 1/30s | Get nearby ride requests |

#### Rider Events

| Event | Payload | Rate Limit | Description |
|-------|---------|------------|-------------|
| `rider:book-ride` | `{ rideId, pickup, destination, category, fare }` | 1/10s | Request a new ride |

#### Ride Events

| Event | Payload | Rate Limit | Description |
|-------|---------|------------|-------------|
| `driver:accept-ride` | `{ rideId, riderId }` | 1/5s | Driver accepts a ride |
| `driver:arrived` | `{ rideId, riderId }` | 1/5s | Driver arrived at pickup |
| `ride:start` | `{ rideId, otherUserId }` | 1/5s | Ride started |
| `ride:complete` | `{ rideId, otherUserId, fare }` | 1/5s | Ride completed |
| `ride:cancel` | `{ rideId, otherUserId, reason? }` | 1/5s | Cancel ride |
| `ride:send-location` | `{ rideId, latitude, longitude }` | 1/3s | Share location during ride |
| `join:ride` | `{ rideId }` | 1/s | Join ride room |
| `leave:ride` | `{ rideId }` | 1/s | Leave ride room |

#### Chat Events

| Event | Payload | Rate Limit | Description |
|-------|---------|------------|-------------|
| `chat:send` | `{ rideId, message, receiverId }` | 1/s | Send chat message |
| `chat:typing` | `{ rideId, receiverId }` | 1/3s | Typing indicator |
| `chat:stop-typing` | `{ rideId, receiverId }` | 1/3s | Stop typing |

### 4.2 Server → Client Events

| Event | Payload | Target Room | Description |
|-------|---------|-------------|-------------|
| `ride:request` | `{ rideId, pickup, destination, category, fare, riderId, distance }` | `driver:{id}` | New ride available |
| `ride:broadcast-complete` | `{ rideId, driversNotified }` | Sender | Confirmation of driver broadcast |
| `ride:accepted` | `{ rideId, driverId, timestamp }` | `user:{id}` | Driver accepted ride |
| `ride:status-change` | `{ rideId, status, ... }` | `admin` | Ride status updates |
| `ride:arrived` | `{ rideId, driverId, timestamp }` | `user:{id}` | Driver arrived |
| `ride:started` | `{ rideId, timestamp }` | `user:{id}` | Ride began |
| `ride:completed` | `{ rideId, fare, timestamp }` | `user:{id}` | Ride ended |
| `ride:cancelled` | `{ rideId, cancelledBy, reason, timestamp }` | `user:{id}` | Ride cancelled |
| `ride:location-update` | `{ userId, latitude, longitude, timestamp }` | `ride:{id}` | Location during ride |
| `driver:location` | `{ driverId, latitude, longitude, timestamp }` | `ride:{id}` | Driver GPS to rider |
| `driver:online-status` | `{ isOnline }` | Sender | Toggle confirmation |
| `driver:nearby-requests:result` | `{ rides: [...] }` | Sender | Nearby requests response |
| `chat:message` | `{ id, rideId, senderId, receiverId, message, timestamp }` | `ride:{id}` | New chat message |
| `chat:history` | `{ rideId, messages }` | Sender | Chat history on join |
| `chat:typing` | `{ rideId, userId, isTyping }` | `user:{id}` | Typing indicator |
| `server:shutdown` | `{ message }` | All | Graceful shutdown notice |

---

## 5. Geo-Tracking System

### 5.1 Redis Geo-Index Architecture

```
Redis Keyspace:
├── drivers:geo                  → Sorted Set (geoadd)
│   driverId → (longitude, latitude, score=timestamp)
├── driver:location:{driverId}   → Hash
│   ├── latitude
│   ├── longitude
│   └── updatedAt
└── ride:pending:{rideId}        → Hash (TTL: 300s)
    ├── rider_id
    ├── pickup_lat
    ├── pickup_lng
    └── ...
```

### 5.2 Location Update Flow

```
Driver App                    Socket.io Server                    Redis
    │                              │                               │
    ├── driver:location-update ────┤                               │
    │    {lat: -23.9451,           │                               │
    │     lng: 31.1412,            │                               │
    │     rideId: "uuid"}          │                               │
    │                              ├── Validate                    │
    │                              │   • lat/lng are numbers       │
    │                              │   • lat ∈ [-90, 90]           │
    │                              │   • lng ∈ [-180, 180]         │
    │                              │                               │
    │                              ├── geoService                  │
    │                              │   .updateDriverLocation()     │
    │                              │       │                       │
    │                              │       ├── GEOADD ────────────►│
    │                              │       │   drivers:geo         │
    │                              │       │   {lng, lat, id}      │
    │                              │       │                       │
    │                              │       └── HSET ──────────────►│
    │                              │           driver:loc:{id}     │
    │                              │           EXPIRE 300s          │
    │                              │                               │
    │                              ├── If rideId:                  │
    │                              │   io.to(`ride:{rideId}`)      │
    │                              │   .emit("driver:location",    │
    │                              │    { lat, lng, timestamp })   │
    │                              │                               │
    │  ◄── (no echo) ─────────────┤                               │
```

### 5.3 Driver Matching Algorithm

When a ride is requested via Socket.io (`rider:book-ride`):

```
1. Store ride details in Redis Hash `ride:pending:{rideId}` (TTL: 300s)
2. Query Redis geo-index for nearby drivers:
     GEOSEARCH drivers:geo
       FROMLONLAT {pickupLng} {pickupLat}
       BYRADIUS 10 km ASC COUNT 50
       WITHCOORD WITHDIST
3. For each nearby driver:
     io.to(`driver:{driverId}`).emit("ride:request", { ... })
4. Return `driversNotified` count to rider
```

### 5.4 Ride Claim (Race Condition Prevention)

Uses Redis Lua script for atomic claim:

```lua
-- CLAIM_RIDE_LUA
if redis.call("SET", KEYS[1], ARGV[1], "NX", "EX", ARGV[2]) then
  return 1  -- claimed successfully
else
  return 0  -- already claimed
end
```

**Flow:**
```
1. Driver sends `driver:accept-ride` with { rideId, riderId }
2. Server executes Lua script with key `ride:claim:{rideId}` (TTL: 30s)
3. If claim = 1:
   → Delete `ride:pending:{rideId}`
   → Join socket to `ride:{rideId}`
   → Emit `ride:accepted` to rider
   → Emit `ride:status-change` to admin
4. If claim = 0:
   → Emit error `RIDE_ALREADY_CLAIMED` to driver
```

### 5.5 Stale Location Cleanup

```
Cleanup Timer (60s interval):
1. SCAN for ALL keys matching `driver:location:*`
2. For each key:
   → Read `updatedAt` from Hash
   → If (now - updatedAt) > 300s (5 minutes):
     → ZREM from `drivers:geo`
     → DEL the Hash
     → Increment cleaned counter
3. Log cleaned count
```

---

## 6. Laravel ↔ Socket.io Bridge

### 6.1 Redis Pub/Sub Architecture

```
Laravel (PHP/FPM)               Redis                     Socket.io Server
       │                          │                            │
       │  Broadcast::channel()    │                            │
       │  → RideRequested         │                            │
       │    event                 │                            │
       │                          │                            │
       │  ──── PUBLISH ──────────►│                            │
       │   laravel_database_      │                            │
       │   ride.{id}              │                            │
       │                          ├── PMESSAGE ───────────────►│
       │                          │   (pattern match            │
       │                          │    laravel_database_*)      │
       │                          │                            │
       │                          │                            ├── parseChannelName()
       │                          │                            │   "ride:{id}"
       │                          │                            │
       │                          │                            ├── resolveRoom()
       │                          │                            │   "ride:{id}"
       │                          │                            │
       │                          │                            ├── io.to("ride:{id}")
       │                          │                            │   .emit(event, data)
       │                          │                            │
```

### 6.2 Channel Name Parsing

**Laravel broadcast channels:**
- `App.Models.Ride.{id}` → Laravel naming → Redis channel: `laravel_database_ride.{id}`

**Relay parsing (`src/services/laravel.js`):**
```
Input:  "laravel_database_ride.uuid"
Output: { type: "ride", id: "uuid" } → room: "ride:uuid"

Input:  "laravel_database_user.uuid"
Output: { type: "user", id: "uuid" } → room: "user:uuid"

Input:  "laravel_database_driver.uuid"
Output: { type: "driver", id: "uuid" } → room: "driver:uuid"

Input:  "laravel_database_delivery.uuid"
Output: { type: "delivery", id: "uuid" } → room: "delivery:uuid"

Input:  "laravel_database_admin"
Output: { type: "admin", id: null } → room: "admin"
```

### 6.3 Laravel Event → Socket.io Mapping

| Laravel Event | Redis Channel | Socket.io Room | Socket.io Event |
|---------------|--------------|----------------|-----------------|
| `RideRequested` | `ride.{id}` | `ride:{id}` | `ride:requested` |
| `RideAccepted` | `user.{riderId}` | `user:{id}` | `ride:accepted` |
| `RideStarted` | `ride.{id}` | `ride:{id}` | `ride:started` |
| `RideCompleted` | `ride.{id}` | `ride:{id}` | `ride:completed` |
| `PaymentProcessed` | `user.{id}` | `user:{id}` | `payment:processed` |
| `DriverApproved` | `driver.{id}` | `driver:{id}` | `driver:approved` |
| `SosTriggered` | `admin` | `admin` | `sos:alert` |

---

## 7. Authentication (Socket.io)

### 7.1 JWT Validation Flow

```
Socket Connection
    ↓
Extract token from handshake:
  socket.handshake.auth.token  OR  socket.handshake.query.token
    ↓
Validate format: token must contain "|" (Sanctum format)
    ↓
Check Redis cache (TTL: 60s):
  auth:token:{token}
    ↓ (cache miss)
HTTP GET /api/v1/auth/me (Authorization: Bearer {token})
  → Response: { user: { id, role, tenant_id, name, email } }
  → Cache valid result in Redis (60s)
  → Cache invalid result as "INVALID" (30s)
    ↓
Set socket.data:
  { userId, role, tenantId, userName, userEmail, token, authFromCache }
    ↓
Allow connection
```

### 7.2 Token Caching

| Cache Key | Value | TTL | Purpose |
|-----------|-------|-----|---------|
| `auth:token:{token}` | `{ userId, role, ... }` or `"INVALID"` | 60s valid / 30s invalid | Reduce load on Laravel auth endpoint |
| `ride:claim:{rideId}` | `{driverId}` | 30s | Prevent double-accept race conditions |
| `ride:pending:{rideId}` | Ride details hash | 300s | Pending ride discovery |

---

## 8. Chat System

### 8.1 Architecture

```
Rider App                    Socket.io Server                    Driver App
    │                              │                               │
    │  chat:send                   │                               │
    │  { rideId, message,          │                               │
    │    receiverId }              │                               │
    │                              │                               │
    │                              ├── Validate:                   │
    │                              │   • rideId, message, receiver │
    │                              │   • message length ≤ 1000     │
    │                              │                               │
    │                              ├── LPUSH `chat:{rideId}` ─────►│
    │                              │   (max 100 messages)          │
    │                              │   EXPIRE 24h                  │
    │                              │                               │
    │                              ├── io.to(`ride:{rideId}`)      │
    │                              │   .emit("chat:message", msg)  │
    │                              │                               │
    │  ◄── chat:message ──────────┤◄── chat:message ──────────────┤
```

### 8.2 Chat Message Persistence

**Current (Redis-only):**
- Messages stored in Redis list `chat:{rideId}` (max 100, TTL 24h)
- History loaded on `join:ride` via `LRANGE`
- No persistent database storage

**Required (Phase 0):**
- New `ride_chat_messages` table for persistent storage
- Redis retains as hot cache for active rides
- Historical messages loaded from DB on join
- Redis TTL for active ride messages (24h)

---

## 9. Horizontal Scaling

### 9.1 Redis Adapter

```
                         ┌──────────────┐
                    ┌────┤ Load Balancer├────┐
                    │    └──────────────┘    │
                    ▼                        ▼
            ┌──────────────┐         ┌──────────────┐
            │ Socket.io    │         │ Socket.io    │
            │ Instance 1   │         │ Instance 2   │
            └──────┬───────┘         └──────┬───────┘
                   │                        │
                   └──────────┬─────────────┘
                              │
                     ┌────────▼────────┐
                     │   Redis Pub/Sub │
                     │   Adapter       │
                     └─────────────────┘
```

**How it works:**
1. Each Socket.io instance creates a Redis pub/sub client pair
2. When instance 1 emits to a room, it publishes the event to Redis
3. Redis broadcasts to all subscribed instances (including instance 1)
4. Instance 2 receives the event and emits to its local sockets in the same room

### 9.2 Sticky Sessions vs. Adapter

| Approach | Status | Rationale |
|----------|--------|-----------|
| Redis adapter | Default | Enables horizontal scaling without sticky sessions |
| Sticky sessions | Not needed | Redis adapter handles cross-instance broadcast |
| Socket.io v4 dynamic namespaces | Not used | Single namespace sufficient for current scale |

---

## 10. Connection Monitoring

### 10.1 Health Endpoint

```
GET /health

Response:
{
  "status": "ok",
  "uptime": 56843.2,
  "connections": 127,
  "onlineDrivers": 23,
  "timestamp": "2026-06-17T12:00:00Z"
}
```

### 10.2 Metrics Endpoint

```
GET /metrics

Response:
{
  "connections": 127,
  "onlineDrivers": 23,
  "uptime": 56843.2,
  "memory": { "rss": 48041984, "heapTotal": 37298176, "heapUsed": 28945208, "external": 1289472 },
  "pid": 42
}
```

### 10.3 Docker Health Check

```yaml
healthcheck:
  test: ["CMD", "wget", "-qO-", "http://localhost:3001/health"]
  interval: 30s
  timeout: 5s
  retries: 3
```

---

## 11. Graceful Shutdown

```
Signal Received (SIGTERM/SIGINT)
    ↓
Clear cleanup interval
    ↓
Emit "server:shutdown" to all connected clients
    ↓
Close Socket.io server (disconnect all sockets)
    ↓
Quit Redis pub/sub clients
    ↓
Close HTTP server
    ↓
Process exit (0 = clean, 1 = forced after 10s timeout)
```

---

## 12. Chat Message Storage (Persistent)

### 12.1 Current Limitations

- Chat messages exist only in Redis lists
- Redis `LRANGE` capped at 100 messages per ride
- 24-hour TTL means messages older than 24h are lost
- No search or audit capability for historical messages

### 12.2 Phase 0 Enhancement

New `ride_chat_messages` table:

```sql
CREATE TABLE ride_chat_messages (
    id UUID PRIMARY KEY,
    ride_id UUID NOT NULL REFERENCES rides(id),
    sender_id UUID NOT NULL REFERENCES users(id),
    receiver_id UUID NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ride_chat_ride ON ride_chat_messages(ride_id, created_at);
CREATE INDEX idx_ride_chat_unread ON ride_chat_messages(receiver_id, is_read);
```

**Hybrid approach:**
- Active ride messages: Redis (hot cache, low latency)
- Historical messages: PostgreSQL (persistent storage)
- On join: load recent 50 from Redis + older history from PostgreSQL
- Redis messages synced to PostgreSQL via background job

---

## 13. Performance & Scaling Targets

| Metric | Current | Target | Notes |
|--------|---------|--------|-------|
| Connections per instance | N/A | 10,000 | Single node.js instance |
| Driver location throughput | N/A | 2,000 updates/sec | Redis GEOADD ~10μs/op |
| Ride request latency | N/A | <500ms | From rider book to driver notification |
| Chat message latency | N/A | <200ms | Redis LPUSH + Socket.io emit |
| Redis memory (geo-index) | N/A | ~2MB per 10K drivers | Very efficient geohash storage |
| Cleanup interval | 60s | 60s | Stale driver detection |
| Driver location frequency | 5s | 5s | Configurable per environment |

---

## 14. Error Handling

| Scenario | Handling |
|----------|----------|
| Invalid JWT | Connection rejected with specific error message |
| Expired JWT | Connection rejected (client must refresh token) |
| Auth backend timeout | Connection rejected, error: "Auth backend timeout" |
| Auth backend unreachable | Connection rejected, error: "Auth backend unreachable" |
| Redis connection lost | Server crash — restart via Docker restart policy |
| Uncaught exception | Graceful shutdown via `process.on('uncaughtException')` |
| Unhandled promise rejection | Logged, server continues (may indicate memory leak) |
| Rate limit exceeded | Socket receives error event, event not processed |
| Invalid coordinates | Error emitted to sender socket only |
| Race condition (ride claim) | Second driver receives "Ride already accepted" error |
