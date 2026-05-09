<?php

use App\Http\Controllers\Customer\MessageController as CustomerMessageController;
use App\Http\Controllers\Owner\MessageController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:owner'])->group(function () {
    Route::get('/owner/customers/search', [MessageController::class, 'findCustomerByEmail']);
    Route::get('/owner/messages/unread-count', [MessageController::class, 'unreadCount']);

    Route::get('/messages', [MessageController::class, 'index']);
    Route::get('/messages/{customerId}', [MessageController::class, 'conversation']);
    Route::post('/messages/send', [MessageController::class, 'send']);
    Route::get('/messages/unread-count', [MessageController::class, 'unreadCount']);

    Route::get('/owner/messages', [MessageController::class, 'index']);
    Route::get('/owner/messages/{customerId}', [MessageController::class, 'conversation']);
    Route::post('/owner/messages/send', [MessageController::class, 'send']);
    Route::get('/owner/messages/unread-count', [MessageController::class, 'unreadCount']);
});

Route::middleware(['auth:sanctum', 'role:customer'])->group(function () {
    Route::get('/customer/messages', [CustomerMessageController::class, 'index']);
    Route::get('/customer/messages/{ownerId}', [CustomerMessageController::class, 'conversation']);
    Route::post('/customer/messages/send', [CustomerMessageController::class, 'send']);
    Route::get('/customer/messages/unread-count', [CustomerMessageController::class, 'unreadCount']);
});

