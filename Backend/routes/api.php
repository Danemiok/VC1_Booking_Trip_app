<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Owner\MessageController;
use App\Http\Controllers\Customer\MessageController as CustomerMessageController;

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\Owner\DestinationController;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Route;

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
                default => 'customer-dashboard',
            };

            return response()->json([
                'user' => $user,
                'next_view' => $nextView,
            ]);
        });
    });
});

/*
|--------------------------------------------------------------------------
| Role Protected Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/admin/access', function () {
        return response()->json(['message' => 'Admin access granted']);
    });
});

Route::middleware(['auth:sanctum', 'role:customer'])->group(function () {
    Route::get('/customer/access', function () {
        return response()->json(['message' => 'Customer access granted']);
    });
});

Route::middleware(['auth:sanctum', 'role:owner'])->group(function () {
    Route::get('/owner/access', function () {
        return response()->json(['message' => 'Owner access granted']);
    });
});

/*
|--------------------------------------------------------------------------
| User CRUD
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->apiResource('users', AuthController::class);

/*
|--------------------------------------------------------------------------
| Messaging System (Owner ↔ Customer)
|--------------------------------------------------------------------------
*/


Route::middleware(['auth:sanctum','role:owner'])->group(function () {

    Route::get('/messages', [MessageController::class,'index']);

    Route::get('/messages/{customerId}', [MessageController::class,'conversation']);

    Route::post('/messages/send', [MessageController::class,'send']);

});
/*
|--------------------------------------------------------------------------
| Messaging System (Customer ↔ Owner)
|--------------------------------------------------------------------------
|
| Routes for customers to view and send messages to owners.
| Uses Sanctum for authentication and 'role:customer' middleware.
|
*/

Route::middleware(['auth:sanctum','role:customer'])->group(function () {

    // List all messages/conversations for the customer
    Route::get('/customer/messages', [CustomerMessageController::class,'index']);

    // View conversation with a specific owner
    Route::get('/customer/messages/{ownerId}', [CustomerMessageController::class,'conversation']);

    // Send a new message to an owner
    Route::post('/customer/messages/send', [CustomerMessageController::class,'send']);
});
