---
project: "EasyRyde"
purpose: "Gap tracking — EasyRyde production readiness"
last_updated: "2026-06-18"
updated_by: "Leader"
---

# Gap Tracker — EasyRyde

## Open Gaps

### Critical (7)
| ID | Severity | Description | Owner | Status |
|----|----------|-------------|-------|--------|
| GAP-MAPS-KEY-001 | CRITICAL | Google Maps API key hardcoded in mobile/apps/*/app.json — move to env vars via app.config.js | builder-1 | closed |
| GAP-ANDROID-SIGNING-001 | CRITICAL | Android release builds use debug keystore — no production signing | builder-1 | closed |
| GAP-EAS-CONFIG-001 | CRITICAL | No eas.json for any of 3 mobile apps — no EAS Build/Update | builder-1 | closed |
| GAP-BG-COMPOSE-001 | CRITICAL | docker-compose.prod.blue.yml and docker-compose.prod.green.yml referenced in deploy script but don't exist | release-engineer | closed |
| GAP-POSTGIS-PROD-001 | CRITICAL | docker-compose.prod.yml uses plain postgres:16-alpine without PostGIS — spatial queries will fail | release-engineer | closed |
| GAP-WEB-DOCKERFILE-001 | CRITICAL | web/Dockerfile runs npm run dev instead of npm run build — no production static serving | release-engineer | closed |
| GAP-NGINX-PATH-001 | CRITICAL | docker-compose.prod.yml references wrong nginx config path (.docker/nginx/nginx.conf vs nginx/api.conf) | release-engineer | closed |

### High (12)
| ID | Severity | Description | Owner | Status |
|----|----------|-------------|-------|--------|
| GAP-SQL-INJECTION-001 | HIGH | Unsanitized orderBy column in FoodDeliveryController line 39 — whitelist allowed columns | builder-3 | closed |
| GAP-INDEXES-001 | HIGH | 6 missing critical indexes on rides (status,created_at), users (role,is_online,is_approved), payments (gateway,gateway_reference), phone_number | builder-3 | closed |
| GAP-WEBHOOK-EVENTS-001 | HIGH | Missing webhook_events table for payment gateway dead letter queue | builder-3 | closed |
| GAP-ESCROW-CRON-001 | HIGH | Escrow auto-release cron job not scheduled | builder-3 | closed |
| GAP-SSL-CERTS-001 | HIGH | No SSL certificate mounting in docker-compose.prod.yml — no HTTPS | release-engineer | closed |
| GAP-ADMIN-2FA-001 | HIGH | No Admin 2FA (TOTP) — admin accounts have no second factor | builder-3 | closed |
| GAP-SSO-001 | HIGH | Missing Google/Apple SSO (no Laravel Socialite) | builder-3 | closed |
| GAP-IOS-ENTITLEMENTS-001 | HIGH | No iOS entitlements for location, push notifications in mobile apps | builder-1 | closed |
| GAP-PHPUNIT-DB-001 | HIGH | phpunit.xml uses SQLite in-memory — misses PostgreSQL-specific issues | qa-lead-integration | closed |
| GAP-MOBILE-DEPS-001 | HIGH | chai and mocha in socket-server dependencies instead of devDependencies | builder-2 | closed |
| GAP-COMPOSER-UNPINNED-001 | HIGH | Sentry and Stripe PHP versions unpinned (*) in composer.json | builder-3 | closed |
| GAP-WEB-BUILD-PROD-001 | HIGH | No production build for web admin panel — dist/ only contains favicon.svg | builder-2 | closed |

## Closed Gaps
_(all previous gaps closed — see team.legacy for history)_
