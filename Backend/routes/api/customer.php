<?php

use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\BookingHistoryController;
use App\Http\Controllers\Api\HotelSelectionController;
use App\Http\Controllers\Api\TripGroupController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:customer,admin'])->group(function () {
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/customer/{customerId}', [BookingController::class, 'customerBookings']);
    Route::get('/customer/booking-history', [BookingHistoryController::class, 'index']);

    Route::get('/customer/bookings', [BookingController::class, 'myBookings']);
    Route::post('/customer/bookings', [BookingController::class, 'store']);

    Route::apiResource('hotel-selections', HotelSelectionController::class);
    Route::get('/hotel-selections/status/{status}', [HotelSelectionController::class, 'getByStatus']);
    Route::post('/hotel-selections/{hotelSelection}/confirm', [HotelSelectionController::class, 'confirm']);
    Route::post('/hotel-selections/{hotelSelection}/cancel', [HotelSelectionController::class, 'cancel']);

    Route::post('/trip-groups', [TripGroupController::class, 'create']);
    Route::post('/trip-groups/join', [TripGroupController::class, 'join']);
    Route::get('/trip-groups/{groupId}', [TripGroupController::class, 'show']);
    Route::post('/trip-groups/{groupId}/messages', [TripGroupController::class, 'sendMessage']);
});
