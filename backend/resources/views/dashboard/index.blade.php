@extends('layouts.app')

@section('title', 'Dashboard')

@section('content')
    <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-500 text-sm mt-1">Overview of your platform activity</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <div class="bg-white rounded-xl border border-gray-200 p-5">
            <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-medium text-gray-500">Total Users</span>
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i data-lucide="users" class="w-5 h-5 text-blue-600"></i>
                </div>
            </div>
            <p class="text-2xl font-bold text-gray-900">24,563</p>
            <p class="text-xs text-green-600 mt-1 flex items-center gap-1">
                <i data-lucide="trending-up" class="w-3.5 h-3.5"></i> +12.5% this month
            </p>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-5">
            <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-medium text-gray-500">Active Drivers</span>
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <i data-lucide="user-check" class="w-5 h-5 text-green-600"></i>
                </div>
            </div>
            <p class="text-2xl font-bold text-gray-900">1,284</p>
            <p class="text-xs text-green-600 mt-1 flex items-center gap-1">
                <i data-lucide="trending-up" class="w-3.5 h-3.5"></i> +3.2% this week
            </p>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-5">
            <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-medium text-gray-500">Active Rides</span>
                <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <i data-lucide="car" class="w-5 h-5 text-amber-600"></i>
                </div>
            </div>
            <p class="text-2xl font-bold text-gray-900">342</p>
            <p class="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <i data-lucide="clock" class="w-3.5 h-3.5"></i> Avg 4.2 min pickup
            </p>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-5">
            <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-medium text-gray-500">Today's Revenue</span>
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i data-lucide="dollar-sign" class="w-5 h-5 text-purple-600"></i>
                </div>
            </div>
            <p class="text-2xl font-bold text-gray-900">$12,846</p>
            <p class="text-xs text-green-600 mt-1 flex items-center gap-1">
                <i data-lucide="trending-up" class="w-3.5 h-3.5"></i> +8.1% vs yesterday
            </p>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-gray-900">Recent Rides</h2>
                <a href="{{ route('rides.index') }}" class="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All</a>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-gray-100">
                            <th class="text-left py-3 px-2 text-gray-500 font-medium">Rider</th>
                            <th class="text-left py-3 px-2 text-gray-500 font-medium">Pickup</th>
                            <th class="text-left py-3 px-2 text-gray-500 font-medium hidden md:table-cell">Dropoff</th>
                            <th class="text-left py-3 px-2 text-gray-500 font-medium">Status</th>
                            <th class="text-right py-3 px-2 text-gray-500 font-medium">Fare</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ([
                            ['name' => 'Sarah Johnson', 'pickup' => '123 Main St', 'dropoff' => '456 Oak Ave', 'status' => 'completed', 'fare' => '$24.50'],
                            ['name' => 'Mike Chen', 'pickup' => 'Airport T3', 'dropoff' => 'Downtown', 'status' => 'in_progress', 'fare' => '$38.00'],
                            ['name' => 'Emily Davis', 'pickup' => 'Central Park', 'dropoff' => 'Times Square', 'status' => 'pending', 'fare' => '$15.75'],
                            ['name' => 'James Wilson', 'pickup' => 'Grand Hotel', 'dropoff' => 'Convention Center', 'status' => 'completed', 'fare' => '$19.20'],
                            ['name' => 'Lisa Brown', 'pickup' => 'Westside Mall', 'dropoff' => 'Eastside Res', 'status' => 'cancelled', 'fare' => '$0.00'],
                        ] as $ride)
                        <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td class="py-3 px-2">
                                <div class="flex items-center gap-2">
                                    <div class="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">{{ substr($ride['name'], 0, 1) }}</div>
                                    <span class="text-gray-900 font-medium">{{ $ride['name'] }}</span>
                                </div>
                            </td>
                            <td class="py-3 px-2 text-gray-600">{{ $ride['pickup'] }}</td>
                            <td class="py-3 px-2 text-gray-600 hidden md:table-cell">{{ $ride['dropoff'] }}</td>
                            <td class="py-3 px-2">
                                @php
                                    $statusColors = ['completed' => 'bg-green-100 text-green-700', 'in_progress' => 'bg-blue-100 text-blue-700', 'pending' => 'bg-amber-100 text-amber-700', 'cancelled' => 'bg-red-100 text-red-700'];
                                @endphp
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $statusColors[$ride['status']] }}">
                                    {{ str_replace('_', ' ', ucwords($ride['status'], '_')) }}
                                </span>
                            </td>
                            <td class="py-3 px-2 text-right font-medium text-gray-900">{{ $ride['fare'] }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-5">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div class="space-y-3">
                <a href="{{ route('rides.index') }}" class="flex items-center gap-3 p-3 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors">
                    <i data-lucide="eye" class="w-5 h-5"></i>
                    <span class="text-sm font-medium">View All Rides</span>
                </a>
                <a href="{{ route('users.index') }}" class="flex items-center gap-3 p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                    <i data-lucide="users" class="w-5 h-5"></i>
                    <span class="text-sm font-medium">Manage Users</span>
                </a>
                <a href="{{ route('drivers.index') }}" class="flex items-center gap-3 p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
                    <i data-lucide="user-check" class="w-5 h-5"></i>
                    <span class="text-sm font-medium">Approve Drivers</span>
                </a>
                <a href="{{ route('promotions.index') }}" class="flex items-center gap-3 p-3 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors">
                    <i data-lucide="tags" class="w-5 h-5"></i>
                    <span class="text-sm font-medium">Create Promotion</span>
                </a>
                <a href="{{ route('payments.index') }}" class="flex items-center gap-3 p-3 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
                    <i data-lucide="credit-card" class="w-5 h-5"></i>
                    <span class="text-sm font-medium">View Payments</span>
                </a>
                <a href="{{ route('settings.index') }}" class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">
                    <i data-lucide="settings" class="w-5 h-5"></i>
                    <span class="text-sm font-medium">System Settings</span>
                </a>
            </div>
        </div>
    </div>
@endsection