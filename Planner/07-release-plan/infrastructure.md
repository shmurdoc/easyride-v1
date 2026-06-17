# Infrastructure

**Phase:** 07 — Release Plan  
**Document:** Infrastructure  
**Version:** 1.0.0  
**Date:** 2026-06-17  
**Status:** Draft

---

## 1. Production Topology

### 1.1 Architecture Overview

```
                                    External
                                       |
                                  [Cloudflare]
                                       |
                                   [Nginx:443]
                                       |
                          Internal Bridge Network
                            |       |       |       |
                        [PHP-FPM] [Node.js] [Redis] [PostgreSQL]
                            |       (Socket.io)      + PostGIS
                        [Laravel App]
                            |
                      [Laravel Horizon]
                      (Queue Worker)

                        [Scheduler]
                        (Cron container)
```

### 1.2 Technology Stack

| Service | Technology | Purpose |
|---------|-----------|---------|
| Reverse proxy | Nginx 1.26 | SSL termination, static assets, load balancing |
| Application server | PHP 8.4 FPM | Laravel API + admin web |
| Real-time server | Node.js 22 + Socket.io | GPS tracking, ride state, chat |
| Database | PostgreSQL 16 + PostGIS | Primary data store, spatial queries |
| Cache & queue | Redis 7 | Sessions, cache, queues, Socket.io adapter |
| Queue worker | Laravel Horizon | Job processing (notifications, matching, expiry) |
| Scheduler | Laravel scheduler | Cron tasks (expired rides, backups, reports) |
| File storage | S3-compatible (MinIO or AWS S3) | Driver docs, receipt PDFs, profile photos |
| Container orchestration | Docker Compose (single host) | Service management |

---

## 2. Networking

### 2.1 Port Mapping

| Service | Internal Port | External Port | Protocol |
|---------|---------------|---------------|----------|
| Nginx | 80/443 | 80/443 | TCP |
| PHP-FPM | 9000 | — | TCP (internal) |
| PostgreSQL | 5432 | — | TCP (internal) |
| Redis | 6379 | — | TCP (internal) |
| Socket.io | 3000 | — (proxied via Nginx) | TCP/WS |
| Horizon | — | — | CLI only |

### 2.2 Network Policy

- All containers on internal bridge network
- Only Nginx port 443 exposed to public
- Port 80 redirects to 443 (HSTS)
- PostgreSQL and Redis bound to internal network only, require password auth
- No direct public access to PHP-FPM, Socket.io, Redis, or PostgreSQL

---

## 3. SSL / TLS

| Setting | Value |
|---------|-------|
| Provider | Let's Encrypt (Certbot) |
| Certificate location | `/etc/letsencrypt/live/easyryde.co.za/` |
| Renewal | Certbot cron job (auto-renew) |
| TLS version | 1.3 only (fallback to 1.2 for legacy clients) |
| HSTS | `max-age=31536000; includeSubDomains` |

**Certbot auto-renewal cron (daily):**
```
0 3 * * * certbot renew --quiet --deploy-hook "systemctl reload nginx"
```

---

## 4. Storage

### 4.1 Local Storage

| Mount | Purpose | Size | Backed Up? |
|-------|---------|------|------------|
| `/var/www/easyryde/storage/app/` | Local file uploads | 10GB | Yes (to S3) |
| `/var/log/easyryde/` | Application logs | 5GB | Yes (to Loki) |
| `/docker/volumes/postgres/` | Database files | 20GB | Yes (pg_dump) |
| `/docker/volumes/redis/` | Redis persistence | 2GB | No (ephemeral) |

### 4.2 S3-Compatible Storage

| Bucket | Purpose | Public? |
|--------|---------|---------|
| `easyryde-driver-docs` | Driver licenses, vehicle registration, FICA docs | No |
| `easyryde-receipts` | Ride receipt PDFs | No (signed URLs) |
| `easyryde-profile-photos` | Rider and driver profile pictures | Yes (CDN) |
| `easyryde-backups` | Database and file backups | No (private) |

**Access control:** Pre-signed URLs with 1-hour expiry for document downloads. Public-read for profile photos behind CDN.

---

## 5. Resource Sizing

### 5.1 Launch Configuration (Expected 50 concurrent users)

| Resource | Spec | Monthly Cost (est.) |
|----------|------|---------------------|
| VPS (primary) | 4 vCPU, 8GB RAM, 100GB SSD | ~R1,200 |
| Database storage | 20GB provisioned | ~R200 |
| S3 storage | 10GB | ~R50 |
| CDN | 50GB transfer | ~R100 |
| Redis (managed, optional) | 1GB | ~R300 |
| Monitoring (Sentry) | Team plan | ~R400 |
| **Total** | | **~R2,250/mo** |

### 5.2 Scale-Up Path (Month 3+, 500 concurrent users)

| Component | Upgrade |
|-----------|---------|
| VPS | 8 vCPU, 16GB RAM |
| Database | Managed PostgreSQL with read replica |
| Redis | Managed Redis Cluster |
| App servers | 2× Nginx backend upstream (horizontally scale PHP containers) |
| Socket.io | Multi-node with Redis adapter |
| CDN | Enabled for all static assets |

### 5.3 Auto-Scaling Triggers

| Metric | Trigger | Action |
|--------|---------|--------|
| CPU > 75% for 5min | Add PHP-FPM worker container | Scale up |
| CPU < 30% for 15min | Remove PHP-FPM worker container | Scale down |
| Queue backlog > 100 jobs for 2min | Add Horizon worker | Scale up |
| WebSocket connections > 5000 | Add Socket.io node | Scale up |

---

## 6. Docker Compose Configuration

```yaml
# docker-compose.yml — Production Configuration
version: "3.8"

services:
  nginx:
    image: nginx:1.26-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/nginx/sites:/etc/nginx/sites-enabled:ro
      - ./storage/app:/var/www/storage:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    networks:
      - easyryde
    depends_on:
      - app
      - socketio

  app:
    build:
      context: .
      dockerfile: Dockerfile
    expose:
      - "9000"
    volumes:
      - ./storage:/var/www/storage
      - ./public:/var/www/public
    environment:
      - APP_ENV=production
      - APP_DEBUG=false
      - DB_HOST=postgres
      - REDIS_HOST=redis
    networks:
      - easyryde
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  socketio:
    build:
      context: ./socket-server
      dockerfile: Dockerfile
    expose:
      - "3000"
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    networks:
      - easyryde
    depends_on:
      - redis

  horizon:
    build:
      context: .
      dockerfile: Dockerfile
    command: php artisan horizon
    volumes:
      - ./storage:/var/www/storage
    environment:
      - APP_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
    networks:
      - easyryde
    depends_on:
      - postgres
      - redis

  scheduler:
    build:
      context: .
      dockerfile: Dockerfile
    command: php artisan schedule:work
    environment:
      - APP_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
    networks:
      - easyryde
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgis/postgis:16-3.4
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=easyryde
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U easyryde"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - easyryde

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - easyryde

volumes:
  postgres_data:
  redis_data:

networks:
  easyryde:
    driver: bridge
```

---

## 7. Backup Strategy

| Component | Frequency | Retention | Method |
|-----------|-----------|-----------|--------|
| PostgreSQL | Daily (full), hourly (WAL) | 30 days | `pg_dump` to S3 |
| Redis | Snapshot (RDB) every 5min | 24 hours | Redis BGSAVE |
| Application files | Daily | 30 days | `aws s3 sync` |
| Configuration | After every change | Git history | Version-controlled |
| SSL certificates | Before renewal | 1 year | Certbot auto-backup |

**Backup script location:** `deploy/scripts/backup.sh`
**Restore testing:** Monthly restore drill to staging environment.

---

## 8. Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name api.easyryde.co.za;

    ssl_certificate /etc/letsencrypt/live/easyryde.co.za/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/easyryde.co.za/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy strict-origin-when-cross-origin;

    root /var/www/public;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass app:9000;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location /socket.io/ {
        proxy_pass http://socketio:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /storage/ {
        alias /var/www/storage/;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

---

## 9. Deployment Directory Structure

```
/var/www/easyryde/
├── app/                    # Laravel application
├── config/                 # Configuration files
├── database/               # Migrations and seeds
├── docker/
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── sites/
│   │       └── easyryde.conf
│   └── php/
│       └── php.ini
├── public/                 # Web root (symlinked)
├── resources/              # Views, assets, lang
├── routes/                 # Route definitions
├── socket-server/          # Node.js Socket.io server
├── storage/                # Laravel storage
│   ├── app/
│   ├── framework/
│   └── logs/
├── tests/                  # Test suite
├── deploy/
│   ├── scripts/
│   │   ├── backup.sh
│   │   ├── deploy.sh
│   │   ├── health-check.sh
│   │   └── rollback.sh
│   └── docker-compose.yml
├── .env                    # Environment variables
├── Dockerfile
└── docker-compose.yml
```
