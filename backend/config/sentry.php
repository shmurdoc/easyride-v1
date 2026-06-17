<?php

return [
    'dsn' => env('SENTRY_DSN'),
    'environment' => env('SENTRY_ENVIRONMENT', 'production'),
    'release' => env('SENTRY_RELEASE'),
    'traces_sample_rate' => (float) env('SENTRY_TRACES_SAMPLE_RATE', 0.25),
    'profiles_sample_rate' => (float) env('SENTRY_PROFILES_SAMPLE_RATE', 0.1),
    'breadcrumbs' => [
        'sql_queries' => true,
        'sql_bindings' => true,
        'redis' => true,
        'http_client' => true,
        'logs' => true,
        'cache' => true,
    ],
    'tracing' => [
        'enabled' => true,
        'routes' => true,
        'queues' => true,
        'views' => true,
        'db' => true,
        'redis' => true,
        'http_client' => true,
    ],
    'send_default_pii' => false,
    'capture_silenced_errors' => true,
];
