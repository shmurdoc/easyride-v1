@extends('layouts.app')

@section('title', 'Payments')

@section('content')
    <div class="mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Payments</h1>
                <p class="text-gray-500 text-sm mt-1">View and manage payment transactions</p>
            </div>
            <div class="flex gap-2">
                <button class="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    <i data-lucide="download" class="w-4 h-4 inline-block mr-1"></i> Export
                </button>
            </div>
        </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div class="flex flex-wrap items-center gap-2 mb-4">
            <button class="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg">All</button>
            <button class="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200">Cash</button>
            <button class="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200">Card</button>
            <button class="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200">Wallet</button>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
            <div class="relative flex-1">
                <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
                <input type="text" placeholder="Search by ID or rider..." class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <input type="date" value="2026-05-01" class="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <input type="date" value="2026-05-27" class="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
        </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="bg-gray-50 border-b border-gray-200">
                        <th class="text-left py-3.5 px-4 text-gray-500 font-medium">Transaction ID</th>
                        <th class="text-left py-3.5 px-4 text-gray-500 font-medium">Rider</th>
                        <th class="text-right py-3.5 px-4 text-gray-500 font-medium">Amount</th>
                        <th class="text-left py-3.5 px-4 text-gray-500 font-medium hidden md:table-cell">Method</th>
                        <th class="text-left py-3.5 px-4 text-gray-500 font-medium">Status</th>
                        <th class="text-right py-3.5 px-4 text-gray-500 font-medium hidden lg:table-cell">Date</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ([
                        ['id' => 'TXN-2847', 'rider' => 'Sarah Johnson', 'amount' => '$24.50', 'method' => 'Visa **** 4242', 'status' => 'completed', 'date' => 'May 27, 2026'],
                        ['id' => 'TXN-2846', 'rider' => 'Mike Chen', 'amount' => '$38.00', 'method' => 'Wallet', 'status' => 'completed', 'date' => 'May 27, 2026'],
                        ['id' => 'TXN-2845', 'rider' => 'Emily Davis', 'amount' => '$15.75', 'method' => 'Mastercard **** 9876', 'status' => 'pending', 'date' => 'May 27, 2026'],
                        ['id' => 'TXN-2844', 'rider' => 'James Wilson', 'amount' => '$19.20', 'method' => 'Cash', 'status' => 'completed', 'date' => 'May 26, 2026'],
                        ['id' => 'TXN-2843', 'rider' => 'Lisa Brown', 'amount' => '$0.00', 'method' => 'Visa **** 4242', 'status' => 'refunded', 'date' => 'May 26, 2026'],
                        ['id' => 'TXN-2842', 'rider' => 'Anna White', 'amount' => '$45.00', 'method' => 'Wallet', 'status' => 'pending', 'date' => 'May 26, 2026'],
                        ['id' => 'TXN-2841', 'rider' => 'Tom Harris', 'amount' => '$12.30', 'method' => 'Cash', 'status' => 'completed', 'date' => 'May 26, 2026'],
                    ] as $txn)
                    <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td class="py-3.5 px-4 font-mono text-xs text-gray-900">{{ $txn['id'] }}</td>
                        <td class="py-3.5 px-4 text-gray-900">{{ $txn['rider'] }}</td>
                        <td class="py-3.5 px-4 text-right font-medium text-gray-900">{{ $txn['amount'] }}</td>
                        <td class="py-3.5 px-4 text-gray-600 hidden md:table-cell">{{ $txn['method'] }}</td>
                        <td class="py-3.5 px-4">
                            @php
                                $sc3 = ['completed' => 'bg-green-100 text-green-700', 'pending' => 'bg-amber-100 text-amber-700', 'refunded' => 'bg-purple-100 text-purple-700'];
                            @endphp
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $sc3[$txn['status']] }}">{{ ucfirst($txn['status']) }}</span>
                        </td>
                        <td class="py-3.5 px-4 text-right text-gray-500 hidden lg:table-cell">{{ $txn['date'] }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p class="text-sm text-gray-500">Showing 1 to 7 of 3,842 transactions</p>
            <div class="flex items-center gap-1">
                <button class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">Previous</button>
                <button class="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm">1</button>
                <button class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">2</button>
                <button class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">3</button>
                <span class="px-2 text-gray-400">...</span>
                <button class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">549</button>
                <button class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">Next</button>
            </div>
        </div>
    </div>
@endsection