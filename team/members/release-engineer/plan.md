---
objective: "Fix critical production integration gaps in docker-compose and CI"
ticket: "FIX-INTEGRATION-CRIT-001"
state: running
priority: "critical"
estimated_hours: 3
context_files:
  - docker-compose.prod.yml
  - .docker/socket/Dockerfile
  - .docker/php/Dockerfile
  - socket-server/src/config.js
  - .github/workflows/deploy.yml
  - .github/workflows/cd.yml
  - .github/workflows/ci.yml
quality_gates:
  - "Add port mapping + env vars for socket-server in prod compose"
  - "Fix socket-server Dockerfile build context path"
  - "Add DB/Redis env vars to php-fpm and horizon in prod compose"
  - "De-duplicate deploy workflows (remove cd.yml or consolidate)"
  - "Add Redis service to socket CI job in ci.yml"
---

## Acceptance Criteria
- [ ] Socket-server has port mapping in docker-compose.prod.yml
- [ ] Socket-server has JWT_SECRET and APP_API_BASE_URL env vars in prod
- [ ] Socket-server Dockerfile build context works
- [ ] PHP-FPM and Horizon have DB_PASSWORD and REDIS_PASSWORD in prod
- [ ] Only one deploy workflow runs on push to main
- [ ] Socket CI tests have Redis service
