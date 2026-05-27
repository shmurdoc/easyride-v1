@extends('layouts.app')

@section('title', 'Rides')

@section('content')
    <div class="mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Rides</h1>
                <p class="text-gray-500 text-sm mt-1">Manage all ride requests</p>
            </div>
            <div class="flex gap-2">
                <button class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                    <i data-lucide="plus" class="w-4 h-4 inline-block mr-1"></i> New Ride
                </button>
            </div>
        </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div class="flex flex-wrap items-center gap-2 mb-4">
            <button class="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg">All</button>
            <button class="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200">Pending</button>
            <button class="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200">In Progress</button>
            <button class="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200">Completed</button>
            <button class="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200">Cancelled</button>
        </div>
        <div class="relative">
            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
            <input type="text" placeholder="Search rides by rider, driver or location..." class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
        </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="bg-gray-50 border-b border-gray-200">
                        <th class="text-left py-3.5 px-4 text-gray-500 font-medium">Rider</th>
                        <th class="text-left py-3.5 px-4 text-gray-500 font-medium">Driver</th>
                        <th class="text-left py-3.5 px-4 text-gray-500 font-medium hidden md:table-cell">Route</th>
                        <th class="text-left py-3.5 px-4 text-gray-500 font-medium">Status</th>
                        <th class="text-right py-3.5 px-4 text-gray-500 font-medium">Fare</th>
                        <th class="text-right py-3.5 px-4 text-gray-500 font-medium hidden lg:table-cell">Date</th>
                        <th class="text-right py-3.5 px-4 text-gray-500 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ([
                        ['rider' => 'Sarah Johnson', 'driver' => 'David Lee', 'pickup' => '123 Main St', 'dropoff' => '456 Oak Ave', 'status' => 'completed', 'fare' => '$24.50', 'date' => '2026-05-27'],
                        ['rider' => 'Mike Chen', 'driver' => 'Anna Kim', 'pickup' => 'Airport T3', 'dropoff' => 'Downtown', 'status' => 'in_progress', 'fare' => '$38.00', 'date' => '2026-05-27'],
                        ['rider' => 'Emily Davis', 'driver' => 'Unassigned', 'pickup' => 'Central Park', 'dropoff' => 'Times Square', 'status' => 'pending', 'fare' => '$15.75', 'date' => '2026-05-27'],
                        ['rider' => 'James Wilson', 'driver' => 'Robert Park', 'pickup' => 'Grand Hotel', 'dropoff' => 'Convention Center', 'status' => 'completed', 'fare' => '$19.20', 'date' => '2026-05-26'],
                        ['rider' => 'Lisa Brown', 'driver' => 'Unassigned', 'pickup' => 'Westside Mall', 'dropoff' => 'Eastside Res', 'status' => 'cancelled', 'fare' => '$0.00', 'date' => '2026-05-26'],
                        ['rider' => 'Tom Harris', 'driver' => 'Maria Garcia', 'pickup' => 'Library', 'dropoff' => 'Stadium', 'status' => 'in_progress', 'fare' => '$12.30', 'date' => '2026-05-26'],
                        ['rider' => 'Anna White', 'driver' => 'Chris Evans', 'pickup' => 'Hotel California', 'dropoff' => 'Beachfront', 'status' => 'pending', 'fare' => '$45.00', 'date' => '2026-05-26'],
                    ] as $ride)
                    <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td class="py-3.5 px-4">
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">{{ substr($ride['rider'], 0, 1) }}</div>
                                <span class="text-gray-900 font-medium">{{ $ride['rider'] }}</span>
                            </div>
                        </td>
                        <td class="py-3.5 px-4">
                            @if($ride['driver'] !== 'Unassigned')
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-xs font-medium text-green-600">{{ substr($ride['driver'], 0, 1) }}</div>
                                <span class="text-gray-900">{{ $ride['driver'] }}</span>
                            </div>
                            @else
                            <span class="text-gray-400 italic">Unassigned</span>
                            @endif
                        </td>
                        <td class="py-3.5 px-4 text-gray-600 hidden md:table-cell">
                            <div class="flex items-center gap-1.5">
                                <span class="truncate max-w-[100px]">{{ $ride['pickup'] }}</span>
                                <i data-lucide="arrow-right" class="w-3.5 h-3.5 text-gray-400 flex-shrink-0"></i>
                                <span class="truncate max-w-[100px]">{{ $ride['dropoff'] }}</span>
                            </div>
                        </td>
                        <td class="py-3.5 px-4">
                            @php
                                $colors = ['completed' => 'bg-green-100 text-green-700', 'in_progress' => 'bg-blue-100 text-blue-700', 'pending' => 'bg-amber-100 text-amber-700', 'cancelled' => 'bg-red-100 text-red-700'];
                            @endphp
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $colors[$ride['status']] }}">
                                {{ str_replace('_', ' ', ucwords($ride['status'], '_')) }}
                            </span>
                        </td>
                        <td class="py-3.5 px-4 text-right font-medium text-gray-900">{{ $ride['fare'] }}</td>
                        <td class="py-3.5 px-4 text-right text-gray-500 hidden lg:table-cell">{{ $ride['date'] }}</td>
                        <td class="py-3.5 px-4 text-right">
                            <a href="{{ route('rides.show', 1) }}" class="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                                View <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
                            </a>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p class="text-sm text-gray-500">Showing 1 to 7 of 124 rides</p>
            <div class="flex items-center gap-1">
                <button class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">Previous</button>
                <button class="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm">1</button>
                <button class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">2</button>
                <button class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">3</button>
                <span class="px-2 text-gray-400">...</span>
                <button class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">13</button>
                <button class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">Next</button>
            </div>
        </div>
    </div>
@endsection