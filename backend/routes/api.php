<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\RideController;
use App\Http\Controllers\Api\V1\DriverController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\WalletController;
use App\Http\Controllers\Api\V1\RatingController;
use App\Http\Controllers\Api\V1\PromoCodeController;
use App\Http\Controllers\Api\V1\DeliveryController;
use App\Http\Controllers\Api\V1\AdminController;

Route::prefix('v1')->group(function () {
    // Public auth routes
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('reset-password', [AuthController::class, 'resetPassword']);
    });

    // Public promo validation
    Route::post('promo-codes/validate', [PromoCodeController::class, 'validate']);

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);

        // Users
        Route::apiResource('users', UserController::class);

        // Rides
        Route::prefix('rides')->group(function () {
            Route::get('/', [RideController::class, 'index']);
            Route::post('/', [RideController::class, 'store']);
            Route::get('current', [RideController::class, 'current']);
            Route::get('{ride}', [RideController::class, 'show']);
            Route::post('{ride}/cancel', [RideController::class, 'cancel']);
            Route::post('{ride}/rate', [RideController::class, 'rate']);
            Route::post('{ride}/apply-promo', [RideController::class, 'applyPromo']);
            Route::post('{ride}/driver-accept', [RideController::class, 'driverAccept']);
            Route::post('{ride}/driver-arrived', [RideController::class, 'driverArrived']);
            Route::post('{ride}/start', [RideController::class, 'startRide']);
            Route::post('{ride}/complete', [RideController::class, 'completeRide']);
            Route::post('{ride}/location', [RideController::class, 'updateLocation']);
        });

        // Drivers
        Route::prefix('drivers')->group(function () {
            Route::get('/', [DriverController::class, 'index']);
            Route::get('nearby-rides', [DriverController::class, 'nearbyRides']);
            Route::get('{driver}', [DriverController::class, 'show']);
            Route::put('profile', [DriverController::class, 'updateProfile']);
            Route::post('vehicle', [DriverController::class, 'registerVehicle']);
            Route::post('toggle-online', [DriverController::class, 'toggleOnline']);
            Route::get('earnings', [DriverController::class, 'earnings']);
            Route::get('trips', [DriverController::class, 'trips']);
        });

        // Payments
        Route::prefix('payments')->group(function () {
            Route::get('/', [PaymentController::class, 'index']);
            Route::get('methods', [PaymentController::class, 'methods']);
            Route::get('{payment}', [PaymentController::class, 'show']);
            Route::post('rides/{ride}/pay', [PaymentController::class, 'processRidePayment']);
        });

        // Wallet
        Route::prefix('wallet')->group(function () {
            Route::get('/', [WalletController::class, 'show']);
            Route::get('transactions', [WalletController::class, 'transactions']);
            Route::post('deposit', [WalletController::class, 'deposit']);
            Route::post('withdraw', [WalletController::class, 'withdraw']);
        });

        // Ratings
        Route::prefix('ratings')->group(function () {
            Route::get('/', [RatingController::class, 'index']);
            Route::get('given', [RatingController::class, 'given']);
            Route::post('/', [RatingController::class, 'store']);
            Route::get('{rating}', [RatingController::class, 'show']);
        });

        // Promo Codes
        Route::prefix('promo-codes')->group(function () {
            Route::get('/', [PromoCodeController::class, 'index']);
            Route::post('/', [PromoCodeController::class, 'store']);
            Route::get('{promoCode}', [PromoCodeController::class, 'show']);
            Route::put('{promoCode}', [PromoCodeController::class, 'update']);
            Route::delete('{promoCode}', [PromoCodeController::class, 'destroy']);
        });

        // Deliveries
        Route::prefix('deliveries')->group(function () {
            Route::get('/', [DeliveryController::class, 'index']);
            Route::post('/', [DeliveryController::class, 'store']);
            Route::get('active', [DeliveryController::class, 'active']);
            Route::get('{delivery}', [DeliveryController::class, 'show']);
            Route::put('{delivery}/status', [DeliveryController::class, 'updateStatus']);
        });

        // Admin
        Route::prefix('admin')->middleware('role:admin|super-admin')->group(function () {
            Route::get('dashboard', [AdminController::class, 'dashboard']);
            Route::get('users', [AdminController::class, 'users']);
            Route::get('rides', [AdminController::class, 'rides']);
            Route::get('drivers', [AdminController::class, 'drivers']);
            Route::post('drivers/{driver}/approve', [AdminController::class, 'approveDriver']);
            Route::post('drivers/{driver}/reject', [AdminController::class, 'rejectDriver']);
            Route::get('settings', [AdminController::class, 'settings']);
            Route::post('settings', [AdminController::class, 'updateSettings']);
            Route::get('audit-logs', [AdminController::class, 'auditLogs']);
        });
    });
});
