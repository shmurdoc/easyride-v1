FROM php:8.4-fpm-bookworm

RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    libzip-dev \
    libicu-dev \
    libpng-dev \
    libgmp-dev \
    unzip \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install -j$(nproc) \
    pdo_pgsql \
    pgsql \
    zip \
    bcmath \
    gmp \
    intl \
    gd \
    pcntl \
    posix \
    exif

RUN pecl install redis && docker-php-ext-enable redis

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN addgroup --gid 1000 appuser && \
    adduser --uid 1000 --gid 1000 --disabled-password --gecos "" appuser

WORKDIR /var/www/html

COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts && \
    composer dump-autoload --optimize --no-interaction --no-scripts

COPY backend/ .

RUN touch database/database.sqlite && \
    php artisan package:discover --ansi && \
    rm database/database.sqlite && \
    rm -rf public/storage && \
    mkdir -p storage/logs storage/framework/cache storage/framework/sessions \
    storage/framework/views bootstrap/cache public/storage \
    && chmod -R 775 storage bootstrap/cache public/storage \
    && chown -R appuser:appuser storage bootstrap/cache public/storage

USER appuser

EXPOSE 9000
CMD ["php-fpm"]
