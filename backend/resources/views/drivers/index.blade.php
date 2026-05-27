@extends('layouts.app')

@section('title', 'Drivers')

@section('content')
    <div class="mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Drivers</h1>
                <p class="text-gray-500 text-sm mt-1">Manage driver accounts and verification</p>
            </div>
            <button class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                <i data-lucide="user-plus" class="w-4 h-4 inline-block mr-1"></i> Add Driver
            </button>
        </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div class="flex flex-wrap items-center gap-2 mb-4">
            <button class="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg">All</button>
            <button class="px-3 py-1.5 bg-amber-100 text-amber-700 text-sm font-medium rounded-lg hover:bg-amber-200">Pending</button>
            <button class="px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-lg hover:bg-green-200">Verified</button>
            <button class="px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200">Rejected</button>
        </div>
        <div class="relative">
            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
            <input type="text" placeholder="Search drivers by name, vehicle or email..." class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
        </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="bg-gray-50 border-b border-gray-200">
                        <th class="text-left py-3.5 px-4 text-gray-500 font-medium">Driver</th>
                        <th class="text-left py-3.5 px-4 text-gray-500 font-medium hidden md:table-cell">Vehicle</th>
                        <th class="text-left py-3.5 px-4 text-gray-500 font-medium">Rating</th>
                        <th class="text-right py-3.5 px-4 text-gray-500 font-medium hidden lg:table-cell">Earnings</th>
                        <th class="text-right py-3.5 px-4 text-gray-500 font-medium hidden lg:table-cell">Trips</th>
                        <th class="text-left py-3.5 px-4 text-gray-500 font-medium">Status</th>
                        <th class="text-right py-3.5 px-4 text-gray-500 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ([
                        ['name' => 'David Lee', 'vehicle' => 'Toyota Camry · ABC 1234', 'rating' => 4.9, 'earnings' => '$12,450', 'trips' => 856, 'status' => 'verified'],
                        ['name' => 'Anna Kim', 'vehicle' => 'Honda Accord · XYZ 5678', 'rating' => 4.8, 'earnings' => '$10,230', 'trips' => 723, 'status' => 'verified'],
                        ['name' => 'Robert Park', 'vehicle' => 'Ford Explorer · DEF 9012', 'rating' => 4.7, 'earnings' => '$8,970', 'trips' => 612, 'status' => 'verified'],
                        ['name' => 'Maria Garcia', 'vehicle' => 'Nissan Altima · GHI 3456', 'rating' => 4.5, 'earnings' => '$5,430', 'trips' => 234, 'status' => 'pending'],
                        ['name' => 'Chris Evans', 'vehicle' => 'Chevy Malibu · JKL 7890', 'rating' => 4.2, 'earnings' => '$3,210', 'trips' => 98, 'status' => 'pending'],
                        ['name' => 'Lisa Brown', 'vehicle' => 'Hyundai Elantra · MNO 1234', 'rating' => 3.8, 'earnings' => '$1,200', 'trips' => 45, 'status' => 'rejected'],
                    ] as $driver)
                    <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td class="py-3.5 px-4">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-xs font-semibold text-green-600">{{ substr($driver['name'], 0, 1) }}{{ substr($driver['name'], strpos($driver['name'], ' ') + 1, 1) }}</div>
                                <div>
                                    <span class="text-gray-900 font-medium">{{ $driver['name'] }}</span>
                                    <p class="text-xs text-gray-400">{{ $driver['vehicle'] }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="py-3.5 px-4 text-gray-600 hidden md:table-cell">{{ $driver['vehicle'] }}</td>
                        <td class="py-3.5 px-4">
                            <div class="flex items-center gap-1 text-amber-400">
                                @for($i = 0; $i < 5; $i++)
                                    <i data-lucide="star" class="w-3.5 h-3.5 {{ $i < floor($driver['rating']) ? 'fill-current' : 'text-gray-300' }}"></i>
                                @endfor
                                <span class="text-gray-600 text-xs ml-1">{{ $driver['rating'] }}</span>
                            </div>
                        </td>
                        <td class="py-3.5 px-4 text-right text-gray-900 font-medium hidden lg:table-cell">{{ $driver['earnings'] }}</td>
                        <td class="py-3.5 px-4 text-right text-gray-600 hidden lg:table-cell">{{ $driver['trips'] }}</td>
                        <td class="py-3.5 px-4">
                            @php
                                $sc = ['verified' => 'bg-green-100 text-green-700', 'pending' => 'bg-amber-100 text-amber-700', 'rejected' => 'bg-red-100 text-red-700'];
                            @endphp
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $sc[$driver['status']] }}">{{ ucfirst($driver['status']) }}</span>
                        </td>
                        <td class="py-3.5 px-4 text-right">
                            <div class="flex items-center justify-end gap-2">
                                @if($driver['status'] === 'pending')
                                <button class="px-2.5 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700">Approve</button>
                                <button class="px-2.5 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700">Reject</button>
                                @endif
                                <a href="{{ route('drivers.show', 1) }}" class="text-indigo-600 hover:text-indigo-700 font-medium text-sm">View</a>
                            </div>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p class="text-sm text-gray-500">Showing 1 to 6 of 1,284 drivers</p>
            <div class="flex items-center gap-1">
                <button class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">Previous</button>
                <button class="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm">1</button>
                <button class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">2</button>
                <button class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">3</button>
                <span class="px-2 text-gray-400">...</span>
                <button class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">215</button>
                <button class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">Next</button>
            </div>
        </div>
    </div>
@endsection