<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\PlaceController;
use App\Http\Controllers\Api\V1\RideController;
use App\Http\Controllers\Api\V1\DriverController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\WalletController;
use App\Http\Controllers\Api\V1\RatingController;
use App\Http\Controllers\Api\V1\PromoCodeController;
use App\Http\Controllers\Api\V1\DeliveryController;
use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\ReportingController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\ScheduledRideController;
use App\Http\Controllers\Api\V1\ReferralController;
use App\Http\Controllers\Api\V1\SosController;
use App\Http\Controllers\Api\V1\ChatController;
use App\Http\Controllers\Api\V1\PartnerWebhookController;
use App\Http\Controllers\Api\V1\ConfigController;
use App\Http\Controllers\Api\V1\FoodDeliveryController;
use App\Http\Controllers\Api\V1\FoodAdminController;
use App\Http\Controllers\Api\V1\HealthCheckController;
use App\Http\Controllers\Api\V1\ConsentController;
use App\Http\Controllers\Api\V1\KycController;
use App\Http\Controllers\Api\V1\IncidentController;
use App\Http\Controllers\Api\V1\DataRetentionController;

Route::prefix('v1')->group(function () {
    // Health check endpoint
    Route::get('health', HealthCheckController::class);

    // Public config endpoint
    Route::get('config', ConfigController::class);

    // Public auth routes
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('reset-password', [AuthController::class, 'resetPassword']);
    });

    // Public promo validation
    Route::post('promo-codes/validate', [PromoCodeController::class, 'validateCode']);

    // Webhook routes (no auth)
    Route::prefix('webhooks')->group(function () {
        Route::post('payfast', [PaymentController::class, 'payfastWebhook']);
        Route::get('payfast/return', [PaymentController::class, 'payfastReturn']);
        Route::post('ozow', [PaymentController::class, 'ozowWebhook']);
        Route::get('ozow/return', [PaymentController::class, 'ozowReturn']);
        Route::post('partner/order', [PartnerWebhookController::class, 'receiveOrder']);
        Route::post('partner/status', [PartnerWebhookController::class, 'orderStatus']);
    });

    // Public discovery routes
    Route::get('places/search', [PlaceController::class, 'search']);

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);

        // Users
        Route::apiResource('users', UserController::class)->except(['store']);
        Route::get('admin/stats', [UserController::class, 'adminStats']);

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
            Route::put('profile', [DriverController::class, 'updateProfile']);
            Route::post('vehicle', [DriverController::class, 'registerVehicle']);
            Route::post('toggle-online', [DriverController::class, 'toggleOnline']);
            Route::get('earnings', [DriverController::class, 'earnings']);
            Route::get('trips', [DriverController::class, 'trips']);
            Route::get('deliveries', [DeliveryController::class, 'driverDeliveries']);
            Route::get('{driver}', [DriverController::class, 'show']);
        });

        // Payments
        Route::prefix('payments')->group(function () {
            Route::get('/', [PaymentController::class, 'index']);
            Route::get('methods', [PaymentController::class, 'methods']);
            Route::get('{payment}', [PaymentController::class, 'show']);
            Route::post('rides/{ride}/pay', [PaymentController::class, 'processRidePayment']);
            Route::post('{payment}/refund', [PaymentController::class, 'refund'])->middleware('role:admin|super-admin');
            Route::post('{payment}/dispute', [PaymentController::class, 'dispute']);
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
            Route::get('{delivery}', [DeliveryController::class, 'show']);
            Route::put('{delivery}/status', [DeliveryController::class, 'updateStatus']);
            Route::post('{delivery}/assign', [DeliveryController::class, 'assignDriver']);
        });

        // Food Delivery
        Route::prefix('food')->group(function () {
            Route::get('restaurants', [FoodDeliveryController::class, 'restaurants']);
            Route::get('restaurants/{restaurant}', [FoodDeliveryController::class, 'show']);
            Route::get('restaurants/{restaurant}/menu', [FoodDeliveryController::class, 'menu']);
            Route::post('restaurants/{restaurant}/order', [FoodDeliveryController::class, 'createOrder']);
            Route::get('orders', [FoodDeliveryController::class, 'myOrders']);
            Route::get('orders/{order}', [FoodDeliveryController::class, 'showOrder']);
            Route::post('orders/{order}/cancel', [FoodDeliveryController::class, 'cancelOrder']);
            Route::post('orders/{order}/rate', [FoodDeliveryController::class, 'rateOrder']);
        });

        // Driver food orders
        Route::prefix('driver/food')->group(function () {
            Route::get('orders', [FoodDeliveryController::class, 'driverOrders']);
            Route::post('orders/{order}/status', [FoodDeliveryController::class, 'updateStatus']);
        });

        // Notifications
        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationController::class, 'index']);
            Route::get('unread-count', [NotificationController::class, 'unreadCount']);
            Route::post('{notification}/read', [NotificationController::class, 'markAsRead']);
            Route::post('read-all', [NotificationController::class, 'markAllAsRead']);
            Route::post('register-token', [NotificationController::class, 'registerToken']);
            Route::post('unregister-token', [NotificationController::class, 'unregisterToken']);
        });

        // Scheduled Rides
        Route::prefix('scheduled-rides')->group(function () {
            Route::get('/', [ScheduledRideController::class, 'index']);
            Route::post('/', [ScheduledRideController::class, 'store']);
            Route::post('{id}/cancel', [ScheduledRideController::class, 'cancel']);
        });

        // Referrals
        Route::prefix('referrals')->group(function () {
            Route::get('/my-code', [ReferralController::class, 'myCode']);
            Route::post('/apply', [ReferralController::class, 'apply']);
            Route::get('/stats', [ReferralController::class, 'stats']);
        });

        // SOS
        Route::prefix('sos')->group(function () {
            Route::post('/', [SosController::class, 'trigger']);
            Route::post('{id}/cancel', [SosController::class, 'cancel']);
            Route::post('{id}/acknowledge', [SosController::class, 'acknowledge'])->middleware('role:admin|super-admin');
            Route::post('{id}/resolve', [SosController::class, 'resolve'])->middleware('role:admin|super-admin');
            Route::get('/active', [SosController::class, 'active'])->middleware('role:admin|super-admin');
        });

        // Chat
        Route::prefix('chat')->group(function () {
            Route::get('rides/{ride}/messages', [ChatController::class, 'messages']);
            Route::post('rides/{ride}/messages', [ChatController::class, 'send']);
            Route::get('rides/{ride}/unread', [ChatController::class, 'unread']);
            Route::post('rides/{ride}/read', [ChatController::class, 'markRead']);
        });

        // Reporting (admin)
        Route::prefix('reports')->middleware('role:admin|super-admin')->group(function () {
            Route::get('dashboard', [ReportingController::class, 'dashboard']);
            Route::get('revenue', [ReportingController::class, 'revenue']);
            Route::get('drivers', [ReportingController::class, 'drivers']);
        });

        // Admin
        Route::prefix('admin')->middleware('role:admin|super-admin')->group(function () {
            Route::get('dashboard', [AdminController::class, 'dashboard']);
            Route::get('users', [AdminController::class, 'users']);
            Route::get('rides', [AdminController::class, 'rides']);
            Route::get('drivers', [AdminController::class, 'drivers']);
            Route::post('drivers', [AuthController::class, 'createDriver']);
            Route::post('drivers/{driver}/approve', [AdminController::class, 'approveDriver']);
            Route::post('drivers/{driver}/reject', [AdminController::class, 'rejectDriver']);
            Route::get('settings', [AdminController::class, 'settings']);
            Route::post('settings', [AdminController::class, 'updateSettings']);
            Route::get('audit-logs', [AdminController::class, 'auditLogs']);

            // Food Delivery Admin
            Route::prefix('food')->group(function () {
                Route::get('restaurants', [FoodAdminController::class, 'restaurants']);
                Route::post('restaurants', [FoodAdminController::class, 'storeRestaurant']);
                Route::put('restaurants/{restaurant}', [FoodAdminController::class, 'updateRestaurant']);
                Route::post('restaurants/{restaurant}/categories', [FoodAdminController::class, 'storeCategory']);
                Route::post('restaurants/{restaurant}/menu-items', [FoodAdminController::class, 'storeMenuItem']);
                Route::put('menu-items/{item}', [FoodAdminController::class, 'updateMenuItem']);
                Route::delete('menu-items/{item}', [FoodAdminController::class, 'destroyMenuItem']);
                Route::post('food-orders/{order}/assign-driver', [FoodDeliveryController::class, 'assignDriver']);
            });

            // Compliance Admin
            Route::prefix('compliance')->group(function () {
                Route::get('kyc/pending', [KycController::class, 'pending']);
                Route::post('kyc/{verification}/approve', [KycController::class, 'approve']);
                Route::post('kyc/{verification}/reject', [KycController::class, 'reject']);
                Route::get('incidents', [IncidentController::class, 'index']);
                Route::get('incidents/open', [IncidentController::class, 'open']);
                Route::get('incidents/stats', [IncidentController::class, 'stats']);
                Route::post('incidents/{incident}/assign', [IncidentController::class, 'assign']);
                Route::post('incidents/{incident}/escalate', [IncidentController::class, 'escalate']);
                Route::post('incidents/{incident}/resolve', [IncidentController::class, 'resolve']);
                Route::post('incidents/{incident}/close', [IncidentController::class, 'close']);
                Route::get('data-retention', [DataRetentionController::class, 'retentionInfo']);
                Route::post('data-retention/cleanup', [DataRetentionController::class, 'runCleanup']);
            });
        });

        // Consent
        Route::prefix('consent')->group(function () {
            Route::get('/', [ConsentController::class, 'index']);
            Route::post('/grant', [ConsentController::class, 'grant']);
            Route::post('/revoke', [ConsentController::class, 'revoke']);
            Route::get('/history', [ConsentController::class, 'history']);
        });

        // KYC
        Route::prefix('kyc')->group(function () {
            Route::post('/', [KycController::class, 'submit']);
            Route::get('/my', [KycController::class, 'myVerifications']);
            Route::get('/{verification}/{documentType}', [KycController::class, 'download']);
        });

        // Incidents
        Route::prefix('incidents')->group(function () {
            Route::post('/', [IncidentController::class, 'store']);
            Route::get('/my', [IncidentController::class, 'myIncidents']);
            Route::get('/{incident}', [IncidentController::class, 'show']);
            Route::get('/{incident}/evidence/{index}', [IncidentController::class, 'downloadEvidence']);
        });

        // Data Rights (POPIA)
        Route::prefix('data')->group(function () {
            Route::get('/export', [DataRetentionController::class, 'exportData']);
            Route::post('/anonymize', [DataRetentionController::class, 'requestAnonymization']);
            Route::delete('/erasure', [DataRetentionController::class, 'requestErasure']);
        });
    });
});
