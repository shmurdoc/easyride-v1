#!/bin/sh
set -e

# Ensure proper permissions on runtime volumes
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache 2>/dev/null || true

# Run artisan commands
if [ "$1" = 'php-fpm' ] || [ "$1" = 'php' ]; then
    if [ -f /var/www/html/artisan ]; then
        su appuser -c 'php artisan storage:link 2>/dev/null || true'
        su appuser -c 'php artisan config:cache 2>/dev/null || true'
        su appuser -c 'php artisan route:cache 2>/dev/null || true'
        su appuser -c 'php artisan view:cache 2>/dev/null || true'
        su appuser -c 'php artisan event:cache 2>/dev/null || true'
    fi
fi

exec "$@"
