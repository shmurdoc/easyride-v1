#!/bin/bash
set -e

ENVIRONMENT=${1:-production}
BLUE_COMPOSE="docker-compose.prod.blue.yml"
GREEN_COMPOSE="docker-compose.prod.green.yml"
NGINX_CONF="nginx/blue-green.conf"

echo "Starting blue/green deploy to $ENVIRONMENT"

# Determine active color
if docker ps --format '{{.Names}}' | grep -q 'easyryde-nginx-blue'; then
  INACTIVE="green"
  ACTIVE="blue"
else
  INACTIVE="blue"
  ACTIVE="green"
fi

echo "Active: $ACTIVE, Deploying: $INACTIVE"

# Build and start inactive
COMPOSE_FILE="${INACTIVE}_COMPOSE"
COMPOSE_PATH="${!COMPOSE_FILE}"
echo "Using compose file: $COMPOSE_PATH"

docker compose -f "$COMPOSE_PATH" build
docker compose -f "$COMPOSE_PATH" up -d

# Wait for health check
echo "Waiting for $INACTIVE to become healthy..."
HEALTH_CHECK_PORT=""
if [ "$INACTIVE" = "blue" ]; then
  HEALTH_CHECK_PORT="8081"
else
  HEALTH_CHECK_PORT="8082"
fi

HEALTHY=false
for i in $(seq 1 30); do
  if curl -sf "http://localhost:${HEALTH_CHECK_PORT}/api/health" > /dev/null 2>&1; then
    echo "$INACTIVE is healthy"
    HEALTHY=true
    break
  fi
  echo "Attempt $i/30: health check not ready yet"
  sleep 2
done

if [ "$HEALTHY" = false ]; then
  echo "Health check FAILED for $INACTIVE. Initiating rollback..."
  docker compose -f "$COMPOSE_PATH" down
  exit 1
fi

# Run migrations (run once, not per color)
php artisan migrate --force

# Switch nginx traffic
sed -i "s/server ${ACTIVE}:80 weight=1/server ${ACTIVE}:80 weight=0/g" $NGINX_CONF
sed -i "s/server ${INACTIVE}:80 weight=0/server ${INACTIVE}:80 weight=1/g" $NGINX_CONF
nginx -s reload

echo "Traffic switched to $INACTIVE"

# Keep old version running for drain
sleep 60

# Stop old version
OLD_COMPOSE_VAR="${ACTIVE}_COMPOSE"
OLD_COMPOSE_PATH="${!OLD_COMPOSE_VAR}"
docker compose -f "$OLD_COMPOSE_PATH" down
echo "Deploy complete. $INACTIVE is now active."
