@extends('layouts.app')

@section('title', 'Users')

@section('content')
    <div class="mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Users</h1>
                <p class="text-gray-500 text-sm mt-1">Manage platform users</p>
            </div>
            <button class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                <i data-lucide="user-plus" class="w-4 h-4 inline-block mr-1"></i> Add User
            </button>
        </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div class="flex flex-wrap items-center gap-2 mb-4">
            <button class="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg">All</button>
            <button class="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200">Riders</button>
            <button class="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200">Drivers</button>
            <button class="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200">Admins</button>
        </div>
        <div class="relative">
            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
            <input type="text" placeholder="Search by name, email or phone..." class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
        </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="bg-gray-50 border-b border-gray-200">
                        <th class="text-left py-3.5 px-4 text-gray-500 font-medium">Name</th>
                        <th class="text-left py-3.5 px-4 text-gray-500 font-medium hidden md:table-cell">Email</th>
                        <th class="text-left py-3.5 px-4 text-gray-500 font-medium hidden lg:table-cell">Phone</th>
                        <th class="text-left py-3.5 px-4 text-gray-500 font-medium">Role</th>
                        <th class="text-left py-3.5 px-4 text-gray-500 font-medium">Status</th>
                        <th class="text-right py-3.5 px-4 text-gray-500 font-medium hidden lg:table-cell">Joined</th>
                        <th class="text-right py-3.5 px-4 text-gray-500 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ([
                        ['name' => 'Sarah Johnson', 'email' => 'sarah@example.com', 'phone' => '+1 (555) 123-4567', 'role' => 'Rider', 'active' => true, 'joined' => '2026-01-15'],
                        ['name' => 'David Lee', 'email' => 'david@example.com', 'phone' => '+1 (555) 234-5678', 'role' => 'Driver', 'active' => true, 'joined' => '2026-02-20'],
                        ['name' => 'Admin User', 'email' => 'admin@easyryde.com', 'phone' => '+1 (555) 345-6789', 'role' => 'Admin', 'active' => true, 'joined' => '2025-11-01'],
                        ['name' => 'Mike Chen', 'email' => 'mike@example.com', 'phone' => '+1 (555) 456-7890', 'role' => 'Rider', 'active' => true, 'joined' => '2026-03-10'],
                        ['name' => 'Lisa Brown', 'email' => 'lisa@example.com', 'phone' => '+1 (555) 567-8901', 'role' => 'Driver', 'active' => false, 'joined' => '2026-04-05'],
                        ['name' => 'Emily Davis', 'email' => 'emily@example.com', 'phone' => '+1 (555) 678-9012', 'role' => 'Rider', 'active' => true, 'joined' => '2026-03-22'],
                        ['name' => 'Robert Park', 'email' => 'robert@example.com', 'phone' => '+1 (555) 789-0123', 'role' => 'Driver', 'active' => true, 'joined' => '2026-01-30'],
                    ] as $user)
                    <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td class="py-3.5 px-4">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-semibold text-indigo-600">{{ substr($user['name'], 0, 1) }}{{ substr($user['name'], strpos($user['name'], ' ') + 1, 1) }}</div>
                                <span class="text-gray-900 font-medium">{{ $user['name'] }}</span>
                            </div>
                        </td>
                        <td class="py-3.5 px-4 text-gray-600 hidden md:table-cell">{{ $user['email'] }}</td>
                        <td class="py-3.5 px-4 text-gray-600 hidden lg:table-cell">{{ $user['phone'] }}</td>
                        <td class="py-3.5 px-4">
                            @php
                                $roleColors = ['Rider' => 'bg-blue-100 text-blue-700', 'Driver' => 'bg-green-100 text-green-700', 'Admin' => 'bg-purple-100 text-purple-700'];
                            @endphp
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $roleColors[$user['role']] }}">{{ $user['role'] }}</span>
                        </td>
                        <td class="py-3.5 px-4">
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" class="sr-only peer" {{ $user['active'] ? 'checked' : '' }}>
                                <div class="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </td>
                        <td class="py-3.5 px-4 text-right text-gray-500 hidden lg:table-cell">{{ $user['joined'] }}</td>
                        <td class="py-3.5 px-4 text-right">
                            <a href="{{ route('users.show', 1) }}" class="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                                View <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
                            </a>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p class="text-sm text-gray-500">Showing 1 to 7 of 2,456 users</p>
            <div class="flex items-center gap-1">
                <button class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">Previous</button>
                <button class="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm">1</button>
                <button class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">2</button>
                <button class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">3</button>
                <span class="px-2 text-gray-400">...</span>
                <button class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">246</button>
                <button class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">Next</button>
            </div>
        </div>
    </div>
@endsection