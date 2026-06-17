#!/bin/bash
URL=${1:-http://localhost/api/health}
MAX_RETRIES=${2:-30}
SLEEP_SECONDS=${3:-2}

for i in $(seq 1 $MAX_RETRIES); do
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $URL)
  if [ "$RESPONSE" = "200" ]; then
    echo "Health check passed ($URL → $RESPONSE)"
    exit 0
  fi
  echo "Attempt $i/$MAX_RETRIES: $RESPONSE"
  sleep $SLEEP_SECONDS
done

echo "Health check FAILED after $MAX_RETRIES attempts"
exit 1
