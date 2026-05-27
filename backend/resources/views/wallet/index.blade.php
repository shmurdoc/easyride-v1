@extends('layouts.app')

@section('title', 'Wallet')

@section('content')
    <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Wallet</h1>
        <p class="text-gray-500 text-sm mt-1">Platform wallet and transaction overview</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl p-6 text-white">
            <p class="text-indigo-200 text-sm font-medium mb-1">Available Balance</p>
            <p class="text-3xl font-bold">$48,293.50</p>
            <p class="text-indigo-200 text-xs mt-2">As of today</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5">
            <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-medium text-gray-500">Pending Balance</span>
                <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <i data-lucide="clock" class="w-5 h-5 text-amber-600"></i>
                </div>
            </div>
            <p class="text-2xl font-bold text-gray-900">$3,420.00</p>
            <p class="text-xs text-gray-400 mt-1">Settlement in 2-3 business days</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5">
            <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-medium text-gray-500">Total Processed</span>
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <i data-lucide="trending-up" class="w-5 h-5 text-green-600"></i>
                </div>
            </div>
            <p class="text-2xl font-bold text-gray-900">$284,591.00</p>
            <p class="text-xs text-gray-400 mt-1">All time</p>
        </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-5 mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-gray-100">
                        <th class="text-left py-3 text-gray-500 font-medium">Description</th>
                        <th class="text-right py-3 text-gray-500 font-medium hidden md:table-cell">Amount</th>
                        <th class="text-left py-3 text-gray-500 font-medium">Type</th>
                        <th class="text-right py-3 text-gray-500 font-medium hidden lg:table-cell">Date</th>
                        <th class="text-right py-3 text-gray-500 font-medium">Status</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ([
                        ['desc' => 'Commission - Ride #ER-2847', 'amount' => '+$4.90', 'type' => 'credit', 'date' => 'May 27, 2026', 'status' => 'completed'],
                        ['desc' => 'Commission - Ride #ER-2846', 'amount' => '+$7.60', 'type' => 'credit', 'date' => 'May 27, 2026', 'status' => 'completed'],
                        ['desc' => 'Driver Payout - David Lee', 'amount' => '-$450.00', 'type' => 'debit', 'date' => 'May 27, 2026', 'status' => 'pending'],
                        ['desc' => 'Commission - Ride #ER-2844', 'amount' => '+$3.84', 'type' => 'credit', 'date' => 'May 26, 2026', 'status' => 'completed'],
                        ['desc' => 'Promo Redemption - WELCOME10', 'amount' => '-$5.00', 'type' => 'debit', 'date' => 'May 26, 2026', 'status' => 'completed'],
                        ['desc' => 'Driver Payout - Anna Kim', 'amount' => '-$520.00', 'type' => 'debit', 'date' => 'May 25, 2026', 'status' => 'completed'],
                        ['desc' => 'Wallet Top-up - Sarah Johnson', 'amount' => '+$50.00', 'type' => 'credit', 'date' => 'May 25, 2026', 'status' => 'completed'],
                    ] as $txn)
                    <tr class="border-b border-gray-50 hover:bg-gray-50">
                        <td class="py-3 text-gray-900">{{ $txn['desc'] }}</td>
                        <td class="py-3 text-right font-medium hidden md:table-cell {{ $txn['type'] === 'credit' ? 'text-green-600' : 'text-red-600' }}">{{ $txn['amount'] }}</td>
                        <td class="py-3">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {{ $txn['type'] === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' }}">
                                {{ ucfirst($txn['type']) }}
                            </span>
                        </td>
                        <td class="py-3 text-right text-gray-500 hidden lg:table-cell">{{ $txn['date'] }}</td>
                        <td class="py-3 text-right">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {{ $txn['status'] === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700' }}">
                                {{ ucfirst($txn['status']) }}
                            </span>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div class="flex flex-wrap gap-3">
            <button class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                <i data-lucide="plus-circle" class="w-4 h-4 inline-block mr-1"></i> Top Up Wallet
            </button>
            <button class="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                <i data-lucide="arrow-up-right" class="w-4 h-4 inline-block mr-1"></i> Process Payout
            </button>
            <button class="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                <i data-lucide="download" class="w-4 h-4 inline-block mr-1"></i> Export Statement
            </button>
        </div>
    </div>
@endsection