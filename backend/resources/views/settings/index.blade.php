@extends('layouts.app')

@section('title', 'Settings')

@section('content')
    <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">System Settings</h1>
        <p class="text-gray-500 text-sm mt-1">Configure platform settings and rates</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div class="lg:col-span-2 space-y-6">

            <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
                <form class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">App Name</label>
                            <input type="text" value="EasyRyde" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                            <input type="email" value="support@easyryde.com" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
                        <input type="text" value="+1 (555) 000-0000" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
                        <select class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                            <option selected>USD ($)</option>
                            <option>EUR (€)</option>
                            <option>GBP (£)</option>
                        </select>
                    </div>
                </form>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Fare Settings</h2>
                <form class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Base Fare</label>
                            <div class="relative">
                                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                <input type="text" value="2.50" class="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Per KM Rate</label>
                            <div class="relative">
                                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                <input type="text" value="1.20" class="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Per Minute Rate</label>
                            <div class="relative">
                                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                <input type="text" value="0.35" class="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Platform Fee (%)</label>
                            <div class="relative">
                                <input type="text" value="20" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Minimum Fare</label>
                            <div class="relative">
                                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                <input type="text" value="5.00" class="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Ride Type Pricing</h2>
                <form class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div class="bg-gray-50 rounded-lg p-4">
                            <p class="text-sm font-medium text-gray-900 mb-2">Economy</p>
                            <div>
                                <label class="block text-xs text-gray-500 mb-1">Multiplier</label>
                                <input type="text" value="1.0x" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                            </div>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4">
                            <p class="text-sm font-medium text-gray-900 mb-2">Standard</p>
                            <div>
                                <label class="block text-xs text-gray-500 mb-1">Multiplier</label>
                                <input type="text" value="1.5x" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                            </div>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4">
                            <p class="text-sm font-medium text-gray-900 mb-2">Premium</p>
                            <div>
                                <label class="block text-xs text-gray-500 mb-1">Multiplier</label>
                                <input type="text" value="2.0x" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                            </div>
                        </div>
                    </div>
                </form>
            </div>

        </div>

        <div class="space-y-6">

            <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Save Changes</h2>
                <p class="text-sm text-gray-500 mb-4">Your settings are saved locally. Publish to apply changes to all servers.</p>
                <div class="space-y-3">
                    <button class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors">
                        <i data-lucide="save" class="w-4 h-4 inline-block mr-1"></i> Save Settings
                    </button>
                    <button class="w-full py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-50 transition-colors">
                        <i data-lucide="rotate-ccw" class="w-4 h-4 inline-block mr-1"></i> Reset to Defaults
                    </button>
                </div>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">System Info</h2>
                <div class="space-y-2">
                    <div class="flex justify-between py-1">
                        <span class="text-sm text-gray-500">Version</span>
                        <span class="text-sm text-gray-900">1.2.0</span>
                    </div>
                    <div class="flex justify-between py-1">
                        <span class="text-sm text-gray-500">Environment</span>
                        <span class="text-sm font-medium text-green-600">Production</span>
                    </div>
                    <div class="flex justify-between py-1">
                        <span class="text-sm text-gray-500">PHP Version</span>
                        <span class="text-sm text-gray-900">8.2.12</span>
                    </div>
                    <div class="flex justify-between py-1">
                        <span class="text-sm text-gray-500">Laravel Version</span>
                        <span class="text-sm text-gray-900">11.x</span>
                    </div>
                    <div class="flex justify-between py-1">
                        <span class="text-sm text-gray-500">Timezone</span>
                        <span class="text-sm text-gray-900">UTC-5</span>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 p-5">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Danger Zone</h2>
                <p class="text-sm text-gray-500 mb-4">Irreversible actions. Proceed with caution.</p>
                <button class="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm transition-colors">
                    <i data-lucide="trash-2" class="w-4 h-4 inline-block mr-1"></i> Clear All Data
                </button>
            </div>

        </div>
    </div>
@endsection