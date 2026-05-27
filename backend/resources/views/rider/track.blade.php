@extends('layouts.app')

@section('title', 'Track Ride')

@section('content')
    <div class="mb-6">
        <div class="flex items-center gap-3">
            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Ride in Progress</h1>
                <p class="text-gray-500 text-sm mt-1">Your driver is on the way - Ride #ER-2847</p>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
            <div class="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                <div class="bg-gray-100 rounded-lg h-[400px] flex items-center justify-center text-gray-400">
                    <div class="text-center">
                        <i data-lucide="map" class="w-16 h-16 mx-auto mb-3 text-gray-300"></i>
                        <p class="text-sm">Live Map Tracking</p>
                        <p class="text-xs text-gray-300 mt-1">Driver location updates in real-time</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Trip Status</h2>
                <div class="space-y-0">

                    <div class="flex gap-3 pb-6 relative">
                        <div class="flex flex-col items-center">
                            <div class="w-4 h-4 bg-indigo-600 rounded-full ring-4 ring-indigo-100 z-10"></div>
                            <div class="w-0.5 flex-1 bg-indigo-200 absolute top-4 left-2"></div>
                        </div>
                        <div>
                            <p class="text-sm font-semibold text-gray-900">Driver Assigned</p>
                            <p class="text-xs text-gray-500">David Lee is on the way</p>
                            <p class="text-xs text-gray-400">2:10 PM</p>
                        </div>
                    </div>

                    <div class="flex gap-3 pb-6 relative">
                        <div class="flex flex-col items-center">
                            <div class="w-4 h-4 bg-indigo-600 rounded-full ring-4 ring-indigo-100 z-10"></div>
                            <div class="w-0.5 flex-1 bg-indigo-200 absolute top-4 left-2"></div>
                        </div>
                        <div>
                            <p class="text-sm font-semibold text-gray-900">Driver Arrived</p>
                            <p class="text-xs text-gray-500">At pickup location</p>
                            <p class="text-xs text-gray-400">2:15 PM</p>
                        </div>
                    </div>

                    <div class="flex gap-3 pb-6 relative">
                        <div class="flex flex-col items-center">
                            <div class="w-4 h-4 bg-indigo-600 rounded-full ring-4 ring-indigo-100 z-10 animate-pulse"></div>
                            <div class="w-0.5 flex-1 bg-gray-200 absolute top-4 left-2"></div>
                        </div>
                        <div>
                            <p class="text-sm font-semibold text-gray-900">In Progress</p>
                            <p class="text-xs text-gray-500">En route to destination</p>
                            <p class="text-xs text-gray-400">2:18 PM · Est. 19 min</p>
                        </div>
                    </div>

                    <div class="flex gap-3">
                        <div class="flex flex-col items-center">
                            <div class="w-4 h-4 bg-gray-300 rounded-full z-10"></div>
                        </div>
                        <div>
                            <p class="text-sm font-semibold text-gray-400">Completed</p>
                            <p class="text-xs text-gray-400">Awaiting dropoff</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="space-y-6">
            <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Your Driver</h2>
                <div class="text-center mb-4">
                    <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-2xl font-bold text-green-600 mx-auto mb-3">DL</div>
                    <h3 class="text-lg font-semibold text-gray-900">David Lee</h3>
                    <div class="flex items-center justify-center gap-1 text-amber-400 mt-1">
                        <i data-lucide="star" class="w-4 h-4 fill-current"></i>
                        <i data-lucide="star" class="w-4 h-4 fill-current"></i>
                        <i data-lucide="star" class="w-4 h-4 fill-current"></i>
                        <i data-lucide="star" class="w-4 h-4 fill-current"></i>
                        <i data-lucide="star" class="w-4 h-4 fill-current"></i>
                        <span class="text-gray-600 text-sm ml-1">4.9</span>
                    </div>
                </div>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-500">Vehicle</span>
                        <span class="text-gray-900 font-medium">Toyota Camry</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">License</span>
                        <span class="text-gray-900 font-medium">ABC 1234</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">ETA</span>
                        <span class="text-gray-900 font-medium" x-data="{ minutes: 4 }" x-init="setInterval(() => { if(minutes > 0) minutes-- }, 60000)">
                            <span x-text="minutes"></span> min
                        </span>
                    </div>
                </div>
                <hr class="my-4 border-gray-200">
                <div class="flex gap-2">
                    <button class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors">
                        <i data-lucide="phone" class="w-4 h-4 inline-block mr-1"></i> Call
                    </button>
                    <button class="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-50 transition-colors">
                        <i data-lucide="message-circle" class="w-4 h-4 inline-block mr-1"></i> Message
                    </button>
                </div>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h2 class="text-lg font-semibold text-gray-900 mb-3">Route Info</h2>
                <div class="space-y-3">
                    <div class="flex gap-3">
                        <div class="flex flex-col items-center">
                            <div class="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                            <div class="w-0.5 h-8 bg-gray-300"></div>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900">Pickup</p>
                            <p class="text-xs text-gray-500">123 Main Street, Downtown</p>
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <div class="flex flex-col items-center">
                            <div class="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900">Dropoff</p>
                            <p class="text-xs text-gray-500">456 Oak Avenue, Uptown</p>
                        </div>
                    </div>
                </div>
                <hr class="my-4 border-gray-200">
                <div class="flex justify-between">
                    <span class="text-sm text-gray-500">Est. Fare</span>
                    <span class="text-sm font-bold text-gray-900">$18.00 - $24.00</span>
                </div>
            </div>

            <button class="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-sm">
                <i data-lucide="x-circle" class="w-4 h-4 inline-block mr-1"></i> Cancel Ride
            </button>
        </div>
    </div>
@endsection