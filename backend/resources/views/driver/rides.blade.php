@extends('layouts.app')

@section('title', 'My Rides')

@section('content')
    <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">My Rides</h1>
        <p class="text-gray-500 text-sm mt-1">Ride requests, active ride, and history</p>
    </div>

    <div class="space-y-6">

        <div>
            <h2 class="text-lg font-semibold text-gray-900 mb-3">Ride Requests</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                @foreach ([
                    ['pickup' => 'Airport Terminal 3', 'dropoff' => 'Grand Hotel', 'distance' => '8.2 mi', 'fare' => '$24.50', 'time' => '2 min ago'],
                    ['pickup' => 'Central Station', 'dropoff' => 'Convention Center', 'distance' => '3.1 mi', 'fare' => '$12.00', 'time' => '5 min ago'],
                    ['pickup' => 'Westside Mall', 'dropoff' => 'Eastside Res', 'distance' => '6.7 mi', 'fare' => '$19.80', 'time' => '8 min ago'],
                ] as $request)
                <div class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex-1">
                            <div class="flex items-center gap-1.5 mb-2">
                                <i data-lucide="map-pin" class="w-4 h-4 text-green-500"></i>
                                <span class="text-sm font-medium text-gray-900">{{ $request['pickup'] }}</span>
                            </div>
                            <div class="flex items-center gap-1.5">
                                <i data-lucide="flag" class="w-4 h-4 text-red-500"></i>
                                <span class="text-sm text-gray-600">{{ $request['dropoff'] }}</span>
                            </div>
                        </div>
                        <span class="text-xs text-gray-400">{{ $request['time'] }}</span>
                    </div>
                    <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div class="flex items-center gap-2 text-sm text-gray-500">
                            <i data-lucide="navigation" class="w-3.5 h-3.5"></i>
                            <span>{{ $request['distance'] }}</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-lg font-bold text-gray-900">{{ $request['fare'] }}</span>
                            <button class="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">Accept</button>
                        </div>
                    </div>
                </div>
                @endforeach
            </div>
        </div>

        <div>
            <h2 class="text-lg font-semibold text-gray-900 mb-3">Active Ride</h2>
            <div class="bg-white rounded-xl border border-gray-200 p-5 border-l-4 border-l-green-500">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <div class="flex items-center gap-3 mb-3">
                            <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-lg font-semibold text-indigo-600">SJ</div>
                            <div>
                                <p class="font-semibold text-gray-900">Sarah Johnson</p>
                                <p class="text-xs text-gray-500">Rider</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 text-sm">
                            <i data-lucide="phone" class="w-4 h-4 text-gray-400"></i>
                            <span class="text-gray-600">+1 (555) 123-4567</span>
                        </div>
                    </div>
                    <div>
                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <div class="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                                <span class="text-sm text-gray-900">123 Main Street, Downtown</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                                <span class="text-sm text-gray-900">456 Oak Avenue, Uptown</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col items-end justify-center">
                        <p class="text-sm text-gray-500">Est. Fare</p>
                        <p class="text-2xl font-bold text-gray-900">$18.00</p>
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 mt-1">In Progress</span>
                    </div>
                </div>
                <div class="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                        <i data-lucide="phone" class="w-4 h-4 inline-block mr-1"></i> Call Rider
                    </button>
                    <button class="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                        <i data-lucide="message-circle" class="w-4 h-4 inline-block mr-1"></i> Message
                    </button>
                    <button class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors ml-auto">
                        <i data-lucide="check-circle" class="w-4 h-4 inline-block mr-1"></i> Complete Ride
                    </button>
                </div>
            </div>
        </div>

        <div>
            <h2 class="text-lg font-semibold text-gray-900 mb-3">Completed Rides</h2>
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="bg-gray-50 border-b border-gray-200">
                                <th class="text-left py-3 px-4 text-gray-500 font-medium">Rider</th>
                                <th class="text-left py-3 px-4 text-gray-500 font-medium hidden md:table-cell">Route</th>
                                <th class="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                                <th class="text-right py-3 px-4 text-gray-500 font-medium">Earnings</th>
                                <th class="text-right py-3 px-4 text-gray-500 font-medium">Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ([
                                ['rider' => 'Mike Chen', 'route' => 'Airport T3 → Downtown', 'date' => 'May 27', 'earnings' => '$30.40', 'rating' => 5],
                                ['rider' => 'Emily Davis', 'route' => 'Central Park → Times Sq', 'date' => 'May 26', 'earnings' => '$12.60', 'rating' => 4],
                                ['rider' => 'Tom Harris', 'route' => 'Library → Stadium', 'date' => 'May 26', 'earnings' => '$9.84', 'rating' => 5],
                                ['rider' => 'Anna White', 'route' => 'Hotel → Beachfront', 'date' => 'May 25', 'earnings' => '$28.00', 'rating' => 5],
                                ['rider' => 'James Wilson', 'route' => 'Grand Hotel → Conv Ctr', 'date' => 'May 25', 'earnings' => '$15.36', 'rating' => 4],
                            ] as $ride)
                            <tr class="border-b border-gray-100 hover:bg-gray-50">
                                <td class="py-3 px-4">
                                    <div class="flex items-center gap-2">
                                        <div class="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">{{ substr($ride['rider'], 0, 1) }}{{ substr($ride['rider'], strpos($ride['rider'], ' ') + 1, 1) }}</div>
                                        <span class="font-medium text-gray-900">{{ $ride['rider'] }}</span>
                                    </div>
                                </td>
                                <td class="py-3 px-4 text-gray-600 hidden md:table-cell">{{ $ride['route'] }}</td>
                                <td class="py-3 px-4 text-gray-500">{{ $ride['date'] }}</td>
                                <td class="py-3 px-4 text-right font-medium text-green-600">{{ $ride['earnings'] }}</td>
                                <td class="py-3 px-4 text-right">
                                    <div class="flex items-center justify-end gap-1 text-amber-400">
                                        @for($i = 0; $i < $ride['rating']; $i++)
                                            <i data-lucide="star" class="w-3 h-3 fill-current"></i>
                                        @endfor
                                    </div>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
@endsection