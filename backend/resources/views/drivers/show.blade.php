@extends('layouts.app')

@section('title', 'Driver Profile')

@section('content')
    <div class="mb-6">
        <a href="{{ route('drivers.index') }}" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Drivers
        </a>
        <h1 class="text-2xl font-bold text-gray-900">Driver Profile</h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
            <div class="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-2xl font-bold text-green-600 mx-auto mb-4">DL</div>
                <h2 class="text-xl font-semibold text-gray-900">David Lee</h2>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 mt-2">Verified</span>
                <div class="flex items-center justify-center gap-1 text-amber-400 mt-3">
                    <i data-lucide="star" class="w-4 h-4 fill-current"></i>
                    <i data-lucide="star" class="w-4 h-4 fill-current"></i>
                    <i data-lucide="star" class="w-4 h-4 fill-current"></i>
                    <i data-lucide="star" class="w-4 h-4 fill-current"></i>
                    <i data-lucide="star" class="w-4 h-4 fill-current"></i>
                    <span class="text-gray-600 text-sm ml-1">4.9</span>
                </div>

                <hr class="my-5 border-gray-200">

                <div class="space-y-3 text-left">
                    <div>
                        <p class="text-xs text-gray-500">Email</p>
                        <p class="text-sm text-gray-900">david@example.com</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Phone</p>
                        <p class="text-sm text-gray-900">+1 (555) 234-5678</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Joined</p>
                        <p class="text-sm text-gray-900">February 20, 2026</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Total Trips</p>
                        <p class="text-sm text-gray-900">856</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Total Earnings</p>
                        <p class="text-sm text-gray-900">$12,450</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Acceptance Rate</p>
                        <p class="text-sm text-gray-900">94%</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="lg:col-span-2 space-y-6">

            <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h2>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div class="bg-gray-50 rounded-lg p-3">
                        <p class="text-xs text-gray-500">Make</p>
                        <p class="text-sm font-medium text-gray-900">Toyota</p>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-3">
                        <p class="text-xs text-gray-500">Model</p>
                        <p class="text-sm font-medium text-gray-900">Camry</p>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-3">
                        <p class="text-xs text-gray-500">Year</p>
                        <p class="text-sm font-medium text-gray-900">2023</p>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-3">
                        <p class="text-xs text-gray-500">License Plate</p>
                        <p class="text-sm font-medium text-gray-900">ABC 1234</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Rating Breakdown</h2>
                <div class="space-y-2">
                    @foreach ([5 => 78, 4 => 15, 3 => 5, 2 => 1, 1 => 1] as $stars => $pct)
                    <div class="flex items-center gap-3">
                        <span class="text-sm text-gray-600 w-12">{{ $stars }} star{{ $stars > 1 ? 's' : '' }}</span>
                        <div class="flex-1 bg-gray-100 rounded-full h-2">
                            <div class="bg-amber-400 h-2 rounded-full" style="width: {{ $pct }}%"></div>
                        </div>
                        <span class="text-sm text-gray-500 w-8 text-right">{{ $pct }}%</span>
                    </div>
                    @endforeach
                </div>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Trips</h2>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-100">
                                <th class="text-left py-3 text-gray-500 font-medium">Date</th>
                                <th class="text-left py-3 text-gray-500 font-medium">Rider</th>
                                <th class="text-left py-3 text-gray-500 font-medium hidden sm:table-cell">Route</th>
                                <th class="text-left py-3 text-gray-500 font-medium">Status</th>
                                <th class="text-right py-3 text-gray-500 font-medium">Earnings</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ([
                                ['date' => 'May 27', 'rider' => 'Sarah Johnson', 'route' => 'Main St → Oak Ave', 'status' => 'completed', 'earnings' => '$19.60'],
                                ['date' => 'May 27', 'rider' => 'Mike Chen', 'route' => 'Airport T3 → Downtown', 'status' => 'completed', 'earnings' => '$30.40'],
                                ['date' => 'May 26', 'rider' => 'Tom Harris', 'route' => 'Library → Stadium', 'status' => 'completed', 'earnings' => '$9.84'],
                                ['date' => 'May 26', 'rider' => 'Emily Davis', 'route' => 'Central Park → Times Sq', 'status' => 'cancelled', 'earnings' => '$0.00'],
                            ] as $trip)
                            <tr class="border-b border-gray-50 hover:bg-gray-50">
                                <td class="py-3 text-gray-600">{{ $trip['date'] }}</td>
                                <td class="py-3 text-gray-900 font-medium">{{ $trip['rider'] }}</td>
                                <td class="py-3 text-gray-600 hidden sm:table-cell">{{ $trip['route'] }}</td>
                                <td class="py-3">
                                    @php $c2 = ['completed' => 'bg-green-100 text-green-700', 'cancelled' => 'bg-red-100 text-red-700']; @endphp
                                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {{ $c2[$trip['status']] }}">{{ ucfirst($trip['status']) }}</span>
                                </td>
                                <td class="py-3 text-right font-medium">{{ $trip['earnings'] }}</td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
@endsection