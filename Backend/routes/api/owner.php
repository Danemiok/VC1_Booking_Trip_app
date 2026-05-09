<?php

use App\Http\Controllers\Api\OwnerNotificationController;
use App\Http\Controllers\Api\OwnerRecentActivityController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Owner\AccommodationController;
use App\Http\Controllers\Owner\DestinationController;
use App\Http\Controllers\Owner\OwnerProfileController;
use App\Http\Controllers\Owner\PromotionController;
use App\Http\Controllers\Owner\TransportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:owner'])->group(function () {
    Route::get('/owner/profile', [OwnerProfileController::class, 'show']);
    Route::put('/owner/profile', [OwnerProfileController::class, 'update']);

    Route::apiResource('destinations', DestinationController::class);
    Route::apiResource('promotions', PromotionController::class);
    Route::apiResource('hotels', AccommodationController::class);

    Route::get('/owner/transports', [TransportController::class, 'index']);
    Route::post('/owner/transports', [TransportController::class, 'store']);
    Route::put('/owner/transports/{transport}', [TransportController::class, 'update']);
    Route::patch('/owner/transports/{transport}', [TransportController::class, 'update']);
    Route::delete('/owner/transports/{transport}', [TransportController::class, 'destroy']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::middleware(['role:owner,admin'])->group(function () {
        Route::get('/bookings', [BookingController::class, 'index']);
        Route::get('/bookings/stats', [BookingController::class, 'stats']);
        Route::get('/bookings/export', [BookingController::class, 'export']);
        Route::patch('/bookings/{id}/status', [BookingController::class, 'updateStatus']);

        Route::get('/owner/notifications', [OwnerNotificationController::class, 'index']);
        Route::get('/owner/notifications/unread-count', [OwnerNotificationController::class, 'unreadCount']);
        Route::post('/owner/notifications/read-all', [OwnerNotificationController::class, 'markAllRead']);
        Route::post('/owner/notifications/{id}/read', [OwnerNotificationController::class, 'markRead']);

        Route::get('/owner/recent-activities', [OwnerRecentActivityController::class, 'index']);
    });
});
