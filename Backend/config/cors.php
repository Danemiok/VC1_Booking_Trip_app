<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    // Allow local dev on localhost, loopback, and LAN IPs (Vite default port 5173).
    'allowed_origins' => ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://[::1]:5173'],
    'allowed_origins_patterns' => ['/^http:\\/\\/\\d{1,3}(?:\\.\\d{1,3}){3}:5173$/'],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true, // CHANGE THIS TO true for authentication
];
