<?php
require __DIR__ . '/vendor/autoload.php';

$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Http\Request;
use Illuminate\Support\Str;

function callApi(string $method, string $uri, array $payload = [], array $headers = []): array
{
    $server = array_merge([
        'HTTP_ACCEPT' => 'application/json',
        'CONTENT_TYPE' => 'application/json',
    ], $headers);

    $request = Request::create($uri, $method, [], [], [], $server, json_encode($payload));
    $response = app()->handle($request);

    return [
        'status' => $response->getStatusCode(),
        'body' => $response->getContent(),
    ];
}

$email = 'owner@test.com';
$password = 'Password@123';

echo "== LOGIN ==\n";
$login = callApi('POST', '/api/auth/login', [
    'email' => $email,
    'password' => $password,
]);
echo "status={$login['status']}\n";
echo $login['body'] . "\n\n";

echo "== REGISTER (new owner) ==\n";
$randomEmail = 'owner_' . Str::lower(Str::random(6)) . '@test.com';
$register = callApi('POST', '/api/auth/register', [
    'name' => 'Owner Test',
    'email' => $randomEmail,
    'password' => $password,
    'password_confirmation' => $password,
    'role' => 'owner',
]);
echo "email={$randomEmail}\n";
echo "status={$register['status']}\n";
echo $register['body'] . "\n";

