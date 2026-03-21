<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$u = App\Models\User::query()->where('email', 'owner@test.com')->first();
if (!$u) {
    echo "not found\n";
    exit(0);
}

echo "found role={$u->role} password_prefix=" . substr($u->password, 0, 12) . "\n";

$ok = Illuminate\Support\Facades\Hash::check('password123', $u->password);
echo "hash_check_password123=" . ($ok ? 'true' : 'false') . "\n";
