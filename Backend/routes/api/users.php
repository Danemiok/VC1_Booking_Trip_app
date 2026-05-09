<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::match(['put', 'patch'], '/users', [AuthController::class, 'updateSelf']);
});

Route::get('/users', [AuthController::class, 'index']);

if (app()->environment('local')) {
    Route::middleware(['auth:sanctum'])->apiResource('users', AuthController::class)->except(['index']);
} else {
    Route::middleware(['auth:sanctum', 'role:admin'])->apiResource('users', AuthController::class)->except(['index']);
}

