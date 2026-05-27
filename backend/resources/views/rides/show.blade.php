@extends('layouts.app')

@section('title', 'Ride Details')

@section('content')
    <div class="mb-6">
        <a href="{{ route('rides.index') }}" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Rides
        </a>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Ride #ER-2847</h1>
                <p class="text-gray-500 text-sm mt-1">Completed on May 27, 2026 at 2:34 PM</p>
            </div>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">Completed</span>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">

            <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Route</h2>
                <div class="bg-gray-100 rounded-lg h-48 flex items-center justify-center text-gray-400 mb-4">
                    <div class="text-center">
                        <i data-lucide="map" class="w-10 h-10 mx-auto mb-2"></i>
                        <p class="text-sm">Map View</p>
                    </div>
                </div>
                <div class="space-y-4">
                    <div class="flex gap-3">
                        <div class="flex flex-col items-center">
                            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div class="w-0.5 h-10 bg-gray-300"></div>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900">Pickup</p>
                            <p class="text-sm text-gray-500">123 Main Street, Downtown</p>
                            <p class="text-xs text-gray-400">2:15 PM</p>
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <div class="flex flex-col items-center">
                            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900">Dropoff</p>
                            <p class="text-sm text-gray-500">456 Oak Avenue, Uptown</p>
                            <p class="text-xs text-gray-400">2:34 PM (19 min)</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-gray-500">Base Fare</p>
                        <p class="text-sm font-medium text-gray-900">$12.00</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Distance Charge</p>
                        <p class="text-sm font-medium text-gray-900">$8.50</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Time Charge</p>
                        <p class="text-sm font-medium text-gray-900">$2.00</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Promo Applied</p>
                        <p class="text-sm font-medium text-green-600">-$3.00</p>
                    </div>
                    <div class="col-span-2 border-t border-gray-200 pt-3">
                        <div class="flex justify-between">
                            <p class="text-sm font-semibold text-gray-900">Total</p>
                            <p class="text-sm font-bold text-gray-900">$24.50</p>
                        </div>
                        <p class="text-xs text-gray-400 mt-1">Paid via Visa **** 4242</p>
                    </div>
                </div>
            </div>

        </div>

        <div class="space-y-6">

            <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Rider</h2>
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-lg font-semibold text-indigo-600">SJ</div>
                    <div>
                        <p class="font-medium text-gray-900">Sarah Johnson</p>
                        <p class="text-sm text-gray-500">sarah@example.com</p>
                        <p class="text-sm text-gray-500">+1 (555) 123-4567</p>
                    </div>
                </div>
                <a href="{{ route('users.show', 1) }}" class="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View Profile</a>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Driver</h2>
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-lg font-semibold text-green-600">DL</div>
                    <div>
                        <p class="font-medium text-gray-900">David Lee</p>
                        <p class="text-sm text-gray-500">Toyota Camry · ABC 1234</p>
                        <div class="flex items-center gap-1 text-amber-400 mt-1">
                            <i data-lucide="star" class="w-3.5 h-3.5 fill-current"></i>
                            <i data-lucide="star" class="w-3.5 h-3.5 fill-current"></i>
                            <i data-lucide="star" class="w-3.5 h-3.5 fill-current"></i>
                            <i data-lucide="star" class="w-3.5 h-3.5 fill-current"></i>
                            <i data-lucide="star" class="w-3.5 h-3.5 fill-current"></i>
                            <span class="text-gray-500 text-xs">5.0</span>
                        </div>
                    </div>
                </div>
                <a href="{{ route('drivers.show', 1) }}" class="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View Profile</a>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Rating</h2>
                <div class="text-center mb-3">
                    <div class="text-3xl font-bold text-gray-900">4.8</div>
                    <div class="flex items-center justify-center gap-1 text-amber-400 mt-1">
                        <i data-lucide="star" class="w-4 h-4 fill-current"></i>
                        <i data-lucide="star" class="w-4 h-4 fill-current"></i>
                        <i data-lucide="star" class="w-4 h-4 fill-current"></i>
                        <i data-lucide="star" class="w-4 h-4 fill-current"></i>
                        <i data-lucide="star" class="w-4 h-4 fill-current"></i>
                    </div>
                    <p class="text-xs text-gray-400 mt-1">by Sarah Johnson</p>
                </div>
                <p class="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">"Great ride, very clean car and friendly driver. Arrived on time!"</p>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h2 class="text-lg font-semibold text-gray-900 mb-3">Delivery Info</h2>
                <p class="text-sm text-gray-500">This was not a delivery ride.</p>
            </div>

        </div>
    </div>
@endsection