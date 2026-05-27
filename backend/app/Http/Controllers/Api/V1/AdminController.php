<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Ride;
use App\Models\AdminAuditLog;
use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $totalUsers = User::count();
        $totalDrivers = User::role('driver')->count();
        $totalRides = Ride::count();
        $activeRides = Ride::whereIn('status', ['searching', 'accepted', 'arrived', 'in_progress'])->count();
        $totalRevenue = Ride::where('status', 'completed')->sum('total_fare');

        $ridesToday = Ride::whereDate('created_at', today())->count();
        $completedToday = Ride::whereDate('completed_at', today())->count();
        $revenueToday = Ride::where('status', 'completed')->whereDate('completed_at', today())->sum('total_fare');

        return response()->json([
            'total_users' => $totalUsers,
            'total_drivers' => $totalDrivers,
            'total_rides' => $totalRides,
            'active_rides' => $activeRides,
            'total_revenue' => (float) $totalRevenue,
            'rides_today' => $ridesToday,
            'completed_today' => $completedToday,
            'revenue_today' => (float) $revenueToday,
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $users = User::query()
            ->when($request->role, fn($q, $v) => $q->where('role', $v))
            ->when($request->is_active, fn($q, $v) => $q->where('is_active', filter_var($v, FILTER_VALIDATE_BOOLEAN)))
            ->when($request->tenant_id, fn($q, $v) => $q->where('tenant_id', $v))
            ->when($request->search, fn($q, $v) => $q->where(function ($qq) use ($v) {
                $qq->where('name', 'like', "%{$v}%")
                   ->orWhere('email', 'like', "%{$v}%")
                   ->orWhere('phone_number', 'like', "%{$v}%");
            }))
            ->with(['tenant', 'driverProfile', 'vehicle'])
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($users);
    }

    public function rides(Request $request): JsonResponse
    {
        $rides = Ride::query()
            ->when($request->status, fn($q, $v) => $q->where('status', $v))
            ->when($request->category, fn($q, $v) => $q->where('category', $v))
            ->when($request->tenant_id, fn($q, $v) => $q->where('tenant_id', $v))
            ->when($request->from_date, fn($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($request->to_date, fn($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->with(['rider', 'driver', 'payment', 'rating'])
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($rides);
    }

    public function drivers(Request $request): JsonResponse
    {
        $drivers = User::role('driver')
            ->when($request->is_approved, fn($q, $v) => $q->whereHas('driverProfile', fn($qp) => $qp->where('is_approved', filter_var($v, FILTER_VALIDATE_BOOLEAN))))
            ->when($request->is_verified, fn($q, $v) => $q->whereHas('driverProfile', fn($qp) => $qp->where('is_verified', filter_var($v, FILTER_VALIDATE_BOOLEAN))))
            ->when($request->is_online, fn($q, $v) => $q->where('is_online', filter_var($v, FILTER_VALIDATE_BOOLEAN)))
            ->when($request->search, fn($q, $v) => $q->where(function ($qq) use ($v) {
                $qq->where('name', 'like', "%{$v}%")
                   ->orWhere('email', 'like', "%{$v}%");
            }))
            ->with(['driverProfile', 'vehicle', 'tenant'])
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($drivers);
    }

    public function approveDriver(User $driver): JsonResponse
    {
        if (!$driver->hasRole('driver')) {
            return response()->json(['message' => 'User is not a driver.'], 422);
        }

        $profile = $driver->driverProfile;

        if (!$profile) {
            return response()->json(['message' => 'Driver has no profile.'], 422);
        }

        $profile->update([
            'is_approved' => true,
            'is_verified' => true,
            'approved_by' => request()->user()->id,
            'approved_at' => now(),
        ]);

        AdminAuditLog::create([
            'tenant_id' => request()->user()->tenant_id,
            'user_id' => request()->user()->id,
            'action' => 'approve_driver',
            'resource_type' => 'user',
            'resource_id' => $driver->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return response()->json($profile);
    }

    public function rejectDriver(User $driver): JsonResponse
    {
        $profile = $driver->driverProfile;

        if ($profile) {
            $profile->update([
                'is_approved' => false,
                'is_verified' => false,
            ]);
        }

        AdminAuditLog::create([
            'tenant_id' => request()->user()->tenant_id,
            'user_id' => request()->user()->id,
            'action' => 'reject_driver',
            'resource_type' => 'user',
            'resource_id' => $driver->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return response()->json(['message' => 'Driver rejected.']);
    }

    public function settings(): JsonResponse
    {
        $settings = SystemSetting::with('tenant')
            ->when(request()->user()->tenant_id, fn($q, $v) => $q->where('tenant_id', $v))
            ->get()
            ->keyBy('key');

        return response()->json($settings);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'key' => 'required|string|max:255',
            'value' => 'required',
            'description' => 'nullable|string|max:500',
            'type' => 'sometimes|string|in:string,boolean,number,json',
        ]);

        $setting = SystemSetting::updateOrCreate(
            [
                'tenant_id' => $request->user()->tenant_id,
                'key' => $validated['key'],
            ],
            [
                'value' => is_array($validated['value']) ? json_encode($validated['value']) : (string) $validated['value'],
                'description' => $validated['description'] ?? null,
                'type' => $validated['type'] ?? 'string',
            ],
        );

        AdminAuditLog::create([
            'tenant_id' => $request->user()->tenant_id,
            'user_id' => $request->user()->id,
            'action' => 'update_settings',
            'resource_type' => 'system_setting',
            'resource_id' => $setting->id,
            'new_values' => $setting->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json($setting);
    }

    public function auditLogs(Request $request): JsonResponse
    {
        $logs = AdminAuditLog::query()
            ->when($request->action, fn($q, $v) => $q->where('action', $v))
            ->when($request->resource_type, fn($q, $v) => $q->where('resource_type', $v))
            ->when($request->user_id, fn($q, $v) => $q->where('user_id', $v))
            ->when($request->from_date, fn($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($request->to_date, fn($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->with('user')
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($logs);
    }
}
