#!/bin/bash
set -e

ENVIRONMENT=${1:-production}
BLUE_COMPOSE="docker-compose.prod.blue.yml"
GREEN_COMPOSE="docker-compose.prod.green.yml"
NGINX_CONF="nginx/blue-green.conf"

echo "Starting blue/green deploy to $ENVIRONMENT"

# Determine active color
if docker ps --format '{{.Names}}' | grep -q 'blue'; then
  INACTIVE="green"
  ACTIVE="blue"
else
  INACTIVE="blue"
  ACTIVE="green"
fi

echo "Active: $ACTIVE, Deploying: $INACTIVE"

# Build and start inactive
if [ "$INACTIVE" = "green" ]; then
  docker compose -f $GREEN_COMPOSE build
  docker compose -f $GREEN_COMPOSE up -d
else
  docker compose -f $BLUE_COMPOSE build
  docker compose -f $BLUE_COMPOSE up -d
fi

# Wait for health check
echo "Waiting for $INACTIVE to become healthy..."
for i in $(seq 1 30); do
  if curl -sf http://${INACTIVE}:8000/api/health > /dev/null 2>&1; then
    echo "$INACTIVE is healthy"
    break
  fi
  sleep 2
done

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
docker compose -f "${ACTIVE}_compose.yml" down
echo "Deploy complete. $INACTIVE is now active."
