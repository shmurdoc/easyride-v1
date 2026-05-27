FROM php:8.4-fpm

COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/

RUN install-php-extensions \
    pdo_pgsql \
    pgsql \
    redis \
    zip \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    intl \
    @composer

RUN groupadd -g 1000 appuser && useradd -u 1000 -g appuser -m appuser

USER appuser
WORKDIR /var/www/html

COPY --chown=appuser:appuser backend .

RUN mkdir -p storage/app/public storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]
