<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\GoogleAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [RegisterController::class, 'register']);
    Route::post('/login', [LoginController::class, 'login']);

    Route::get('/google/redirect', [GoogleAuthController::class, 'redirect']);
    Route::get('/google/callback', [GoogleAuthController::class, 'callbackGoogle']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [LogoutController::class, 'logout']);

        Route::get('/user', function (Request $request) {
            $user = $request->user();

            $nextView = match ($user->role) {
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
