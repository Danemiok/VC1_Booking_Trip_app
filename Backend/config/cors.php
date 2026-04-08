<?php

$defaultOrigins = [
    'http://localhost:5173',
    'https://vc-1-trip-booking.vercel.app',
];

$allowedOrigins = array_filter(
    array_map('trim', explode(',', env('FRONTEND_URLS', implode(',', $defaultOrigins))))
);

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $allowedOrigins,
    'allowed_origins_patterns' => [
        '#^https?://(localhost|127\.0\.0\.1|vc-1-trip-booking\.vercel\.app)(:\d+)?$#',
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];