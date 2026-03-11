<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\BookingController; // ADD THIS
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [RegisterController::class, 'register']);
    Route::post('/login', [LoginController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [LogoutController::class, 'logout']);
        Route::get('/user', function (Request $request) {
            $user = $request->user();
            $nextView = match ($user?->role) {
                'admin' => 'admin-dashboard',
                'owner' => 'owner-dashboard',
                'customer' => 'customer-dashboard',
                default => 'customer-dashboard',
            };

            return response()->json([
                'user' => $user,
                'next_view' => $nextView,
            ]);
        });
    });
});

// PROTECTED ROUTES (require authentication)
Route::middleware(['auth:sanctum'])->group(function () {
    // Customer booking routes
    Route::middleware(['role:customer,admin'])->group(function () {
        Route::post('/bookings', [BookingController::class, 'store']);
        Route::get('/bookings/customer/{customerId}', [BookingController::class, 'customerBookings']);

        // Backwards-compatible aliases
        Route::get('/customer/bookings', [BookingController::class, 'myBookings']);
        Route::post('/customer/bookings', [BookingController::class, 'store']);
    });

    // Owner routes - accessible by owners and admins
    Route::middleware(['role:owner,admin'])->group(function () {
        Route::get('/bookings', [BookingController::class, 'index']);
        Route::get('/bookings/stats', [BookingController::class, 'stats']);
        Route::get('/bookings/export', [BookingController::class, 'export']);
        Route::patch('/bookings/{id}/status', [BookingController::class, 'updateStatus']);
    });
    
    // Admin only routes
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/admin/access', function () {
            return response()->json(['message' => 'Admin access granted']);
        });
    });
    
    // Customer routes
    Route::middleware(['role:customer'])->get('/customer/access', function () {
        return response()->json(['message' => 'Customer access granted']);
    });
    
    // Owner routes
    Route::middleware(['role:owner'])->get('/owner/access', function () {
        return response()->json(['message' => 'Owner access granted']);
    });
});

Route::apiResource('users', AuthController::class);
