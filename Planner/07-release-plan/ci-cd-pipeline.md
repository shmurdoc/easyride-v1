# CI/CD Pipeline

**Phase:** 07 — Release Plan  
**Document:** CI/CD Pipeline  
**Version:** 1.0.0  
**Date:** 2026-06-17  
**Status:** Draft

---

## 1. Branch Strategy

```
main (production)
  └── staging (pre-release)
       └── feature/*
            └── developer/* (optional personal branches)
```

| Branch | Deployed To | Purpose |
|--------|-------------|---------|
| `main` | Production | Stable releases only. Protected — no direct pushes. |
| `staging` | Staging | Integration testing, QA sign-off, E2E tests. |
| `feature/*` | — | New features, bug fixes. PR into `staging`. |
| `hotfix/*` | Production (emergency) | Critical bug fix. PR directly to `main` with lead approval. |

---

## 2. CI — GitHub Actions (PR to staging/main)

### 2.1 Trigger

- Push to any branch (run lint + typecheck)
- PR to `staging` (run full CI suite)
- PR to `main` (run full CI suite + load test)

### 2.2 Workflow: `ci.yml`

```yaml
name: CI

on:
  push:
    branches: ['*']
  pull_request:
    branches: [staging, main]

jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgis/postgis:16-3.4
        env:
          POSTGRES_DB: easyryde_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: 8.4
          extensions: pdo, pdo_pgsql, redis, bcmath, gd, intl
          tools: composer, phpstan

      - name: Cache Composer dependencies
        uses: actions/cache@v3
        with:
          path: vendor
          key: composer-${{ hashFiles('**/composer.lock') }}
          restore-keys: composer-

      - name: Install Composer dependencies
        run: composer install --no-progress --prefer-dist

      - name: Setup environment
        run: |
          cp .env.example .env
          php artisan key:generate
          php artisan config:clear

      - name: Run Pint (PHP lint)
        run: vendor/bin/pint --test

      - name: Run PHPStan
        run: vendor/bin/phpstan analyse --level=5 --no-progress

      - name: Run PHPUnit
        run: php artisan test --parallel --coverage --min=80
        env:
          DB_CONNECTION: pgsql
          DB_HOST: localhost
          DB_PORT: 5432
          DB_DATABASE: easyryde_test
          DB_USERNAME: postgres
          DB_PASSWORD: postgres
          REDIS_HOST: localhost
          REDIS_PORT: 6379

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Cache npm dependencies
        uses: actions/cache@v3
        with:
          path: ~/.npm
          key: npm-${{ hashFiles('**/package-lock.json') }}

      - name: Install npm dependencies
        run: npm ci

      - name: Run TypeScript check
        run: npx tsc --noEmit

      - name: Run ESLint
        run: npx eslint .

  load-test:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request' && github.base_ref == 'main'
    steps:
      - uses: actions/checkout@v4

      - name: Run k6 smoke test
        uses: grafana/k6-action@v0.3.1
        with:
          filename: load-tests/ride-load-test.js
          flags: --vus 10 --duration 30s
```

---

## 3. CD — GitHub Actions (Merge to main)

### 3.1 Trigger

- Merge to `main` branch

### 3.2 Workflow: `deploy.yml`

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push app image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ github.repository }}/app:${{ github.sha }}
            ghcr.io/${{ github.repository }}/app:latest

      - name: Build and push socket.io image
        uses: docker/build-push-action@v5
        with:
          context: ./socket-server
          push: true
          tags: |
            ghcr.io/${{ github.repository }}/socketio:${{ github.sha }}
            ghcr.io/${{ github.repository }}/socketio:latest

      - name: Deploy to production
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_SSH_KEY }}
          script: |
            cd /var/www/easyryde
            docker compose pull
            docker compose up -d --no-deps --force-recreate app horizon socketio nginx
            sleep 10

      - name: Health check
        run: |
          for i in {1..12}; do
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.easyryde.co.za/api/v1/health)
            if [ "$STATUS" = "200" ]; then
              echo "Health check passed"
              exit 0
            fi
            echo "Waiting for health check... attempt $i/12"
            sleep 5
          done
          echo "Health check failed"
          exit 1

      - name: Run post-deploy smoke test
        run: |
          npx k6 run --vus 5 --duration 30s load-tests/ride-load-test.js
        env:
          BASE_URL: https://api.easyryde.co.za/api/v1

      - name: Notify deployment success
        run: |
          curl -X POST -H "Content-Type: application/json" \
            -d '{"text": "✅ EasyRyde deploy ${{ github.sha }} successful"}' \
            ${{ secrets.SLACK_DEPLOY_WEBHOOK }}
```

---

## 4. Release Process

### 4.1 Standard Release Flow

```
1. Feature branch → PR to staging
       ↓
2. CI runs (tests, lint, PHPStan, typecheck)
       ↓ [pass]
3. Reviewer approves PR
       ↓ [approve]
4. Merge to staging → auto-deploys to staging environment
       ↓
5. QA runs E2E tests + smoke tests on staging
       ↓ [pass]
6. QA lead signs off
       ↓
7. PR from staging to main (release PR)
       ↓
8. CI runs (full suite + load tests)
       ↓ [pass]
9. Reviewer approves release PR
       ↓ [approve]
10. Merge to main → auto-deploys to production
       ↓
11. Post-deploy health check + canary verification
```

### 4.2 Hotfix Flow

```
1. Developer creates hotfix branch from main
       ↓
2. CI runs (full suite)
       ↓ [pass]
3. Lead engineer reviews + approves
       ↓ [approve]
4. PR directly to main (skip staging)
       ↓
5. Merge → auto-deploy to production
       ↓
6. Cherry-pick hotfix into staging branch
```

### 4.3 Version Tagging

- Tags are auto-created on merge to `main` by GitHub Actions
- Format: `vYYYY.MM.DD.N` where N is the release count for that day
- Example: `v2026.06.17.2` (2nd release on June 17, 2026)
- Tags trigger Sentry release tracking automatically

---

## 5. Quality Gates in CI

| Gate | CI Step | Blocking | Action on Failure |
|------|---------|----------|-------------------|
| G1 | PHPStan (Level 5) | Yes | Fix type errors |
| G2 | PHPUnit (all pass, ≥80% coverage) | Yes | Fix tests or code |
| G3 | Pint + ESLint (zero errors) | Yes | Auto-fix then retry |
| G4 | k6 smoke test | Yes (main only) | Profile and fix bottleneck |
| G5 | Health check | Yes (deploy step) | Rollback |
| G6 | Post-deploy smoke | No (alert only) | Investigate + hotfix if needed |

---

## 6. CI/CD Infrastructure

| Resource | Configuration |
|----------|---------------|
| CI runner | GitHub-hosted (ubuntu-latest) |
| CD runner | Self-hosted deploy via SSH |
| Docker registry | GitHub Container Registry (ghcr.io) |
| Secrets | GitHub Actions Secrets |
| Artifact retention | 90 days |

### 6.1 Required Secrets

| Secret | Purpose |
|--------|---------|
| `DEPLOY_HOST` | Production server IP/hostname |
| `DEPLOY_USER` | SSH username for deploy |
| `DEPLOY_SSH_KEY` | SSH private key for deploy |
| `SLACK_DEPLOY_WEBHOOK` | Slack incoming webhook for deploy notifications |
| `DOCKER_REGISTRY_TOKEN` | GHCR access token |

---

## 7. Rollback via CI

If a deployment fails health check, the deploy pipeline should automatically:

1. Log the failure with the deploy SHA
2. Revert Docker tags to previous version (`deploy/rollback.sh`)
3. Re-deploy previous images
4. Notify the team via Slack
5. Tag the release as `ROLLED_BACK-v2026.06.17.2`

Manual rollback command on server:

```bash
cd /var/www/easyryde
./deploy/scripts/rollback.sh [version-tag]
```
