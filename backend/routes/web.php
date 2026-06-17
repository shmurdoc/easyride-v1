<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/dashboard', function () {
        return view('dashboard.index');
    })->name('dashboard');

    Route::get('/rides', function () {
        return view('rides.index');
    })->name('rides.index');

    Route::get('/rides/{ride}', function () {
        return view('rides.show');
    })->name('rides.show');

    Route::get('/users', function () {
        return view('users.index');
    })->name('users.index');

    Route::get('/users/{user}', function () {
        return view('users.show');
    })->name('users.show');

    Route::get('/drivers', function () {
        return view('drivers.index');
    })->name('drivers.index');

    Route::get('/drivers/{driver}', function () {
        return view('drivers.show');
    })->name('drivers.show');

    Route::get('/payments', function () {
        return view('payments.index');
    })->name('payments.index');

    Route::get('/wallet', function () {
        return view('wallet.index');
    })->name('wallet.index');

    Route::get('/promotions', function () {
        return view('promotions.index');
    })->name('promotions.index');

    Route::get('/deliveries', function () {
        return view('deliveries.index');
    })->name('deliveries.index');

    Route::get('/settings', function () {
        return view('settings.index');
    })->name('settings.index');

    Route::get('/rider/book', function () {
        return view('rider.book');
    })->name('rider.book');

    Route::get('/rider/track', function () {
        return view('rider.track');
    })->name('rider.track');

    Route::get('/driver/rides', function () {
        return view('driver.rides');
    })->name('driver.rides');

    Route::get('/driver/live', function () {
        return view('driver.live');
    })->name('driver.live');
});
