#!/bin/bash
set -e

ENVIRONMENT=${1:-production}
echo "Initiating rollback for $ENVIRONMENT"

# Determine which was previous active
if docker ps --format '{{.Names}}' | grep -q 'blue'; then
  ROLLBACK_TO="blue"
  CURRENT="green"
else
  ROLLBACK_TO="green"
  CURRENT="blue"
fi

echo "Rolling back from $CURRENT to $ROLLBACK_TO"

# Switch nginx back
sed -i "s/server ${CURRENT}:80 weight=1/server ${CURRENT}:80 weight=0/g" nginx/blue-green.conf
sed -i "s/server ${ROLLBACK_TO}:80 weight=0/server ${ROLLBACK_TO}:80 weight=1/g" nginx/blue-green.conf
nginx -s reload

echo "Rollback complete. Traffic switched to $ROLLBACK_TO"
