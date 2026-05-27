@extends('layouts.app')

@section('title', 'Promotions')

@section('content')
    <div class="mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Promotions</h1>
                <p class="text-gray-500 text-sm mt-1">Manage promo codes and discounts</p>
            </div>
            <button x-on:click="$dispatch('open-modal')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                <i data-lucide="plus" class="w-4 h-4 inline-block mr-1"></i> Create Promo
            </button>
        </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl border border-gray-200 p-4">
            <p class="text-sm text-gray-500">Active Codes</p>
            <p class="text-xl font-bold text-gray-900">12</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-4">
            <p class="text-sm text-gray-500">Total Usage</p>
            <p class="text-xl font-bold text-gray-900">1,847</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-4">
            <p class="text-sm text-gray-500">Revenue Lost</p>
            <p class="text-xl font-bold text-red-600">$4,230</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-4">
            <p class="text-sm text-gray-500">Avg. Discount</p>
            <p class="text-xl font-bold text-gray-900">$2.29</p>
        </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="bg-gray-50 border-b border-gray-200">
                        <th class="text-left py-3.5 px-4 text-gray-500 font-medium">Code</th>
                        <th class="text-left py-3.5 px-4 text-gray-500 font-medium">Type</th>
                        <th class="text-right py-3.5 px-4 text-gray-500 font-medium">Value</th>
                        <th class="text-right py-3.5 px-4 text-gray-500 font-medium">Usage</th>
                        <th class="text-right py-3.5 px-4 text-gray-500 font-medium hidden md:table-cell">Usage Limit</th>
                        <th class="text-right py-3.5 px-4 text-gray-500 font-medium hidden lg:table-cell">Expires</th>
                        <th class="text-left py-3.5 px-4 text-gray-500 font-medium">Status</th>
                        <th class="text-right py-3.5 px-4 text-gray-500 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ([
                        ['code' => 'WELCOME10', 'type' => 'Percentage', 'value' => '10%', 'usage' => 845, 'limit' => 1000, 'expires' => 'Dec 31, 2026', 'status' => 'active'],
                        ['code' => 'RIDE5', 'type' => 'Fixed', 'value' => '$5.00', 'usage' => 312, 'limit' => 500, 'expires' => 'Jun 30, 2026', 'status' => 'active'],
                        ['code' => 'FREEDEL', 'type' => 'Free Delivery', 'value' => '$0.00', 'usage' => 156, 'limit' => 200, 'expires' => 'Jul 15, 2026', 'status' => 'active'],
                        ['code' => 'SUMMER20', 'type' => 'Percentage', 'value' => '20%', 'usage' => 534, 'limit' => 500, 'expires' => 'May 15, 2026', 'status' => 'expired'],
                        ['code' => 'NEWUSER', 'type' => 'Fixed', 'value' => '$10.00', 'usage' => 1000, 'limit' => 1000, 'expires' => 'Apr 01, 2026', 'status' => 'expired'],
                    ] as $promo)
                    <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td class="py-3.5 px-4">
                            <span class="font-mono font-bold text-gray-900">{{ $promo['code'] }}</span>
                        </td>
                        <td class="py-3.5 px-4 text-gray-600">{{ $promo['type'] }}</td>
                        <td class="py-3.5 px-4 text-right font-medium text-gray-900">{{ $promo['value'] }}</td>
                        <td class="py-3.5 px-4 text-right text-gray-900">{{ $promo['usage'] }}</td>
                        <td class="py-3.5 px-4 text-right text-gray-600 hidden md:table-cell">{{ $promo['limit'] }}</td>
                        <td class="py-3.5 px-4 text-right text-gray-500 hidden lg:table-cell">{{ $promo['expires'] }}</td>
                        <td class="py-3.5 px-4">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $promo['status'] === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' }}">
                                {{ ucfirst($promo['status']) }}
                            </span>
                        </td>
                        <td class="py-3.5 px-4 text-right">
                            <button class="text-indigo-600 hover:text-indigo-700 font-medium text-sm">Edit</button>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

    <div x-data="{ open: false }" x-on:open-modal.window="open = true" x-show="open" class="fixed inset-0 z-50 overflow-y-auto" style="display: none;">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div x-show="open" x-transition:enter="ease-out duration-300" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100" x-transition:leave="ease-in duration-200" x-transition:leave-start="opacity-100" x-transition:leave-end="opacity-0" class="fixed inset-0 bg-black/50" x-on:click="open = false"></div>

            <div x-show="open" x-transition:enter="ease-out duration-300" x-transition:enter-start="opacity-0 translate-y-4" x-transition:enter-end="opacity-100 translate-y-0" x-transition:leave="ease-in duration-200" x-transition:leave-start="opacity-100 translate-y-0" x-transition:leave-end="opacity-0 translate-y-4" class="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 text-left">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-lg font-semibold text-gray-900">Create Promo Code</h3>
                    <button x-on:click="open = false" class="p-1 text-gray-400 hover:text-gray-600">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>

                <form class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Code</label>
                            <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="SAVE20">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                                <option>Percentage</option>
                                <option>Fixed</option>
                                <option>Free Delivery</option>
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Value</label>
                            <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="10">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                            <input type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="1000">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <input type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    <div class="flex items-center gap-2">
                        <input type="checkbox" class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                        <span class="text-sm text-gray-600">Active immediately</span>
                    </div>
                    <div class="flex gap-3 justify-end pt-2">
                        <button x-on:click="open = false" type="button" class="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">Create Promo</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection