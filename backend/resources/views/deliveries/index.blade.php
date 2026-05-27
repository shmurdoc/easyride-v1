@extends('layouts.app')

@section('title', 'Deliveries')

@section('content')
    <div class="mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Deliveries</h1>
                <p class="text-gray-500 text-sm mt-1">Track and manage delivery requests</p>
            </div>
            <button class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                <i data-lucide="plus" class="w-4 h-4 inline-block mr-1"></i> New Delivery
            </button>
        </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div class="flex flex-wrap items-center gap-2 mb-4">
            <button class="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg">All</button>
            <button class="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200">Pending</button>
            <button class="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200">In Transit</button>
            <button class="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200">Delivered</button>
            <button class="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200">Failed</button>
        </div>
        <div class="relative">
            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
            <input type="text" placeholder="Search deliveries by ID, sender or recipient..." class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
        </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="bg-gray-50 border-b border-gray-200">
                        <th class="text-left py-3.5 px-4 text-gray-500 font-medium">Delivery ID</th>
                        <th class="text-left py-3.5 px-4 text-gray-500 font-medium">Type</th>
                        <th class="text-left py-3.5 px-4 text-gray-500 font-medium">Sender</th>
                        <th class="text-left py-3.5 px-4 text-gray-500 font-medium hidden md:table-cell">Recipient</th>
                        <th class="text-left py-3.5 px-4 text-gray-500 font-medium">Status</th>
                        <th class="text-right py-3.5 px-4 text-gray-500 font-medium hidden lg:table-cell">Est. Delivery</th>
                        <th class="text-right py-3.5 px-4 text-gray-500 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ([
                        ['id' => 'DEL-1023', 'type' => 'Food', 'sender' => 'Pizza Palace', 'recipient' => 'John Smith · 123 Main St', 'status' => 'delivered', 'eta' => 'Delivered'],
                        ['id' => 'DEL-1022', 'type' => 'Package', 'sender' => 'Amazon', 'recipient' => 'Alice Wang · 456 Oak Ave', 'status' => 'in_transit', 'eta' => '2:45 PM'],
                        ['id' => 'DEL-1021', 'type' => 'Food', 'sender' => 'Sushi Bar', 'recipient' => 'Bob Lee · 789 Pine Rd', 'status' => 'in_transit', 'eta' => '2:30 PM'],
                        ['id' => 'DEL-1020', 'type' => 'Grocery', 'sender' => 'Fresh Mart', 'recipient' => 'Carol Chen · 321 Elm St', 'status' => 'pending', 'eta' => '4:00 PM'],
                        ['id' => 'DEL-1019', 'type' => 'Package', 'sender' => 'Best Buy', 'recipient' => 'Dan Brown · 654 Maple Dr', 'status' => 'failed', 'eta' => 'N/A'],
                        ['id' => 'DEL-1018', 'type' => 'Food', 'sender' => 'Burger Joint', 'recipient' => 'Eve Wilson · 987 Cedar Ln', 'status' => 'delivered', 'eta' => 'Delivered'],
                    ] as $del)
                    <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td class="py-3.5 px-4 font-mono text-xs text-gray-900 font-medium">{{ $del['id'] }}</td>
                        <td class="py-3.5 px-4">
                            @php
                                $tc = ['Food' => 'bg-red-100 text-red-700', 'Package' => 'bg-blue-100 text-blue-700', 'Grocery' => 'bg-green-100 text-green-700'];
                            @endphp
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $tc[$del['type']] }}">{{ $del['type'] }}</span>
                        </td>
                        <td class="py-3.5 px-4 text-gray-900">{{ $del['sender'] }}</td>
                        <td class="py-3.5 px-4 text-gray-600 hidden md:table-cell">{{ $del['recipient'] }}</td>
                        <td class="py-3.5 px-4">
                            @php
                                $sc4 = ['delivered' => 'bg-green-100 text-green-700', 'in_transit' => 'bg-blue-100 text-blue-700', 'pending' => 'bg-amber-100 text-amber-700', 'failed' => 'bg-red-100 text-red-700'];
                            @endphp
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $sc4[$del['status']] }}">
                                {{ str_replace('_', ' ', ucwords($del['status'], '_')) }}
                            </span>
                        </td>
                        <td class="py-3.5 px-4 text-right text-gray-500 hidden lg:table-cell">{{ $del['eta'] }}</td>
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
            <p class="text-sm text-gray-500">Showing 1 to 6 of 892 deliveries</p>
            <div class="flex items-center gap-1">
                <button class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">Previous</button>
                <button class="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm">1</button>
                <button class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">2</button>
                <button class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">3</button>
                <span class="px-2 text-gray-400">...</span>
                <button class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">149</button>
                <button class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">Next</button>
            </div>
        </div>
    </div>
@endsection