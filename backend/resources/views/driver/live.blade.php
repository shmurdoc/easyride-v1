@extends('layouts.app')

@section('title', 'Live Mode')

@section('content')
    <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Live Mode</h1>
        <p class="text-gray-500 text-sm mt-1">Manage your online status and current ride</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div class="lg:col-span-2 space-y-6">

            <div class="bg-white rounded-xl border border-gray-200 p-6 text-center" x-data="{ online: true }">
                <div class="mb-4">
                    <div :class="online ? 'bg-green-500' : 'bg-gray-300'" class="w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-colors">
                        <i data-lucide="power" class="w-10 h-10 text-white"></i>
                    </div>
                </div>
                <h2 class="text-xl font-bold text-gray-900 mb-1" x-text="online ? 'You are Online' : 'You are Offline'"></h2>
                <p class="text-sm text-gray-500 mb-6" x-text="online ? 'Ready to receive ride requests' : 'Go online to start receiving requests'"></p>
                <button x-on:click="online = !online" :class="online ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'" class="px-8 py-3 text-white font-semibold rounded-xl text-lg transition-colors">
                    <span x-text="online ? 'Go Offline' : 'Go Online'"></span>
                </button>
            </div>

            <div x-data="{ show: true }">
                <div x-show="show" class="bg-white rounded-xl border border-gray-200 p-5 border-l-4 border-l-indigo-500">
                    <div class="flex items-start justify-between mb-4">
                        <h2 class="text-lg font-semibold text-gray-900">Current Ride</h2>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 animate-pulse">Active</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div class="flex items-center gap-3 mb-3">
                                <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-lg font-semibold text-indigo-600">SJ</div>
                                <div>
                                    <p class="font-semibold text-gray-900">Sarah Johnson</p>
                                    <a href="tel:+15551234567" class="text-sm text-indigo-600 hover:text-indigo-700">+1 (555) 123-4567</a>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div class="space-y-2">
                                <div class="flex items-center gap-2">
                                    <i data-lucide="map-pin" class="w-4 h-4 text-green-500 flex-shrink-0"></i>
                                    <span class="text-sm text-gray-900">123 Main Street, Downtown</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i data-lucide="flag" class="w-4 h-4 text-red-500 flex-shrink-0"></i>
                                    <span class="text-sm text-gray-900">456 Oak Avenue, Uptown</span>
                                </div>
                            </div>
                            <p class="text-sm text-gray-500 mt-2">~4.2 mi · 15 min remaining</p>
                        </div>
                    </div>
                    <div class="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                        <button class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
                            <i data-lucide="check-circle" class="w-4 h-4 inline-block mr-1"></i> Complete Ride
                        </button>
                        <button x-on:click="show = false" class="px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors">
                            <i data-lucide="x-circle" class="w-4 h-4 inline-block mr-1"></i> Cancel
                        </button>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Requests Log</h2>
                <div class="space-y-3">
                    @foreach ([
                        ['rider' => 'Sarah Johnson', 'pickup' => 'Airport Terminal 3', 'fare' => '$24.50', 'action' => 'Accepted', 'time' => '2:10 PM'],
                        ['rider' => 'Mike Chen', 'pickup' => 'Central Station', 'fare' => '$12.00', 'action' => 'Declined', 'time' => '2:05 PM'],
                        ['rider' => 'Emily Davis', 'pickup' => 'Central Park', 'fare' => '$15.75', 'action' => 'Declined', 'time' => '1:58 PM'],
                        ['rider' => 'Tom Harris', 'pickup' => 'Library', 'fare' => '$9.84', 'action' => 'Accepted', 'time' => '1:45 PM'],
                        ['rider' => 'Lisa Brown', 'pickup' => 'Mall', 'fare' => '$19.20', 'action' => 'Missed', 'time' => '1:30 PM'],
                    ] as $log)
                    <div class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">{{ substr($log['rider'], 0, 1) }}{{ substr($log['rider'], strpos($log['rider'], ' ') + 1, 1) }}</div>
                            <div>
                                <p class="text-sm font-medium text-gray-900">{{ $log['rider'] }}</p>
                                <p class="text-xs text-gray-500">{{ $log['pickup'] }} · {{ $log['fare'] }}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            @php
                                $ac = ['Accepted' => 'text-green-600', 'Declined' => 'text-red-500', 'Missed' => 'text-gray-400'];
                            @endphp
                            <p class="text-xs font-medium {{ $ac[$log['action']] }}">{{ $log['action'] }}</p>
                            <p class="text-xs text-gray-400">{{ $log['time'] }}</p>
                        </div>
                    </div>
                    @endforeach
                </div>
            </div>
        </div>

        <div class="space-y-6">
            <div class="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl p-6 text-white">
                <p class="text-indigo-200 text-sm font-medium mb-1">Earnings Today</p>
                <p class="text-3xl font-bold">$84.50</p>
                <div class="mt-4 flex justify-between text-sm text-indigo-200">
                    <span>Trips: 4</span>
                    <span>Online: 3h 12m</span>
                </div>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h2 class="text-lg font-semibold text-gray-900 mb-3">Weekly Stats</h2>
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span class="text-sm text-gray-500">Total Earnings</span>
                        <span class="text-sm font-bold text-gray-900">$452.00</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-sm text-gray-500">Total Trips</span>
                        <span class="text-sm font-bold text-gray-900">23</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-sm text-gray-500">Avg. Rating</span>
                        <div class="flex items-center gap-1 text-amber-400">
                            <i data-lucide="star" class="w-3.5 h-3.5 fill-current"></i>
                            <span class="text-sm font-bold text-gray-900">4.9</span>
                        </div>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-sm text-gray-500">Acceptance Rate</span>
                        <span class="text-sm font-bold text-gray-900">94%</span>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h2 class="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
                <div class="space-y-2">
                    <button class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <i data-lucide="bar-chart-3" class="w-5 h-5 text-indigo-600"></i>
                        <span class="text-sm font-medium text-gray-700">View My Stats</span>
                    </button>
                    <button class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <i data-lucide="wallet" class="w-5 h-5 text-green-600"></i>
                        <span class="text-sm font-medium text-gray-700">Payout Settings</span>
                    </button>
                    <button class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <i data-lucide="help-circle" class="w-5 h-5 text-amber-600"></i>
                        <span class="text-sm font-medium text-gray-700">Support</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
@endsection