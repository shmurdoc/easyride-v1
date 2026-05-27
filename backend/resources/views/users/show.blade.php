@extends('layouts.app')

@section('title', 'User Profile')

@section('content')
    <div class="mb-6">
        <a href="{{ route('users.index') }}" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Users
        </a>
        <h1 class="text-2xl font-bold text-gray-900">User Profile</h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
            <div class="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <div class="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600 mx-auto mb-4">SJ</div>
                <h2 class="text-xl font-semibold text-gray-900">Sarah Johnson</h2>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 mt-2">Rider</span>
                <div class="mt-4 flex justify-center gap-2">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-medium"><i data-lucide="check-circle" class="w-3.5 h-3.5 mr-1"></i> Active</span>
                </div>

                <hr class="my-5 border-gray-200">

                <div class="space-y-3 text-left">
                    <div>
                        <p class="text-xs text-gray-500">Email</p>
                        <p class="text-sm text-gray-900">sarah@example.com</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Phone</p>
                        <p class="text-sm text-gray-900">+1 (555) 123-4567</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Joined</p>
                        <p class="text-sm text-gray-900">January 15, 2026</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Total Rides</p>
                        <p class="text-sm text-gray-900">47</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Total Spent</p>
                        <p class="text-sm text-gray-900">$842.50</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="lg:col-span-2 space-y-6">
            <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Rides</h2>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-100">
                                <th class="text-left py-3 text-gray-500 font-medium">Date</th>
                                <th class="text-left py-3 text-gray-500 font-medium">Pickup</th>
                                <th class="text-left py-3 text-gray-500 font-medium hidden sm:table-cell">Dropoff</th>
                                <th class="text-left py-3 text-gray-500 font-medium">Status</th>
                                <th class="text-right py-3 text-gray-500 font-medium">Fare</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ([
                                ['date' => 'May 27', 'pickup' => '123 Main St', 'dropoff' => '456 Oak Ave', 'status' => 'completed', 'fare' => '$24.50'],
                                ['date' => 'May 25', 'pickup' => 'Airport T3', 'dropoff' => 'Downtown', 'status' => 'completed', 'fare' => '$38.00'],
                                ['date' => 'May 24', 'pickup' => 'Central Park', 'dropoff' => 'Times Square', 'status' => 'cancelled', 'fare' => '$0.00'],
                                ['date' => 'May 22', 'pickup' => 'Grand Hotel', 'dropoff' => 'Convention Center', 'status' => 'completed', 'fare' => '$19.20'],
                                ['date' => 'May 20', 'pickup' => 'Mall', 'dropoff' => 'Home', 'status' => 'completed', 'fare' => '$15.75'],
                            ] as $ride)
                            <tr class="border-b border-gray-50 hover:bg-gray-50">
                                <td class="py-3 text-gray-600">{{ $ride['date'] }}</td>
                                <td class="py-3 text-gray-900">{{ $ride['pickup'] }}</td>
                                <td class="py-3 text-gray-600 hidden sm:table-cell">{{ $ride['dropoff'] }}</td>
                                <td class="py-3">
                                    @php $c = ['completed' => 'bg-green-100 text-green-700', 'cancelled' => 'bg-red-100 text-red-700']; @endphp
                                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {{ $c[$ride['status']] }}">{{ ucfirst($ride['status']) }}</span>
                                </td>
                                <td class="py-3 text-right font-medium">{{ $ride['fare'] }}</td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Activity Log</h2>
                <div class="space-y-3">
                    @foreach ([
                        ['action' => 'Completed ride #ER-2847', 'time' => '2 hours ago'],
                        ['action' => 'Added payment method', 'time' => '1 day ago'],
                        ['action' => 'Updated profile photo', 'time' => '3 days ago'],
                        ['action' => 'Rated driver 5 stars', 'time' => '1 week ago'],
                        ['action' => 'Created account', 'time' => 'January 15, 2026'],
                    ] as $log)
                    <div class="flex items-start gap-3">
                        <div class="w-2 h-2 bg-indigo-400 rounded-full mt-2"></div>
                        <div class="flex-1">
                            <p class="text-sm text-gray-900">{{ $log['action'] }}</p>
                            <p class="text-xs text-gray-400">{{ $log['time'] }}</p>
                        </div>
                    </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>
@endsection