<?php

use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\HotelController;
use App\Http\Controllers\Api\PromotionController as ApiPromotionController;
use App\Http\Controllers\ImageUploadController;
use App\Http\Controllers\Owner\DestinationController;
use App\Http\Controllers\Owner\TransportController;
use App\Http\Controllers\PublicFileController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'Laravel Backend API running',
    ]);
});

Route::get('/health', function () {
    try {
        DB::connection()->getPdo();

        return response()->json([
            'ok' => true,
            'db' => true,
            'driver' => DB::connection()->getDriverName(),
            'database' => method_exists(DB::connection(), 'getDatabaseName') ? DB::connection()->getDatabaseName() : null,
            'demo_owner_exists' => \App\Models\User::query()->where('email', 'owner@test.com')->exists(),
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'ok' => false,
            'db' => false,
            'message' => $e->getMessage(),
        ], 500);
    }
});

Route::get('/files/{path}', [PublicFileController::class, 'show'])->where('path', '.*');

Route::get('/hotels/public', [HotelController::class, 'index']);
Route::get('/activities/public', [ActivityController::class, 'index']);
Route::get('/promotions/public', [ApiPromotionController::class, 'index']);
Route::get('/destinations/public', [DestinationController::class, 'getAllPublic']);
Route::get('/transports', [TransportController::class, 'publicIndex']);

Route::post('/upload/image', [ImageUploadController::class, 'upload']);
