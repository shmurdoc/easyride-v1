<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Ride;
use App\Models\WalletTransaction;
use App\Models\DriverProfile;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DriverController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $drivers = User::role('driver')
            ->when($request->is_online, fn($q, $v) => $q->where('is_online', filter_var($v, FILTER_VALIDATE_BOOLEAN)))
            ->when($request->is_approved, fn($q, $v) => $q->whereHas('driverProfile', fn($qp) => $qp->where('is_approved', filter_var($v, FILTER_VALIDATE_BOOLEAN))))
            ->when($request->search, fn($q, $v) => $q->where(function ($qq) use ($v) {
                $qq->where('name', 'like', "%{$v}%")
                   ->orWhere('email', 'like', "%{$v}%")
                   ->orWhere('phone_number', 'like', "%{$v}%");
            }))
            ->with(['driverProfile', 'vehicle'])
            ->paginate($request->per_page ?? 15);

        return response()->json($drivers);
    }

    public function show(User $driver): JsonResponse
    {
        $driver->load(['driverProfile', 'vehicle', 'tenant']);

        $averageRating = $driver->driverProfile?->average_rating ?? 0;
        $ratingCount = $driver->driverProfile?->rating_count ?? 0;

        return response()->json([
            'user' => $driver,
            'average_rating' => $averageRating,
            'rating_count' => $ratingCount,
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'license_number' => 'sometimes|string|max:255',
            'license_expiry' => 'sometimes|date',
            'id_number' => 'sometimes|string|max:255',
            'date_of_birth' => 'sometimes|date',
            'emergency_contact_name' => 'sometimes|string|max:255',
            'emergency_contact_phone' => 'sometimes|string|max:20',
        ]);

        $user = $request->user();
        $profile = $user->driverProfile()->firstOrNew(['user_id' => $user->id]);
        $profile->fill($validated);
        $profile->save();

        return response()->json($profile);
    }

    public function registerVehicle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'make' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'year' => 'required|integer|min:1990|max:' . (date('Y') + 1),
            'color' => 'required|string|max:50',
            'license_plate' => 'required|string|max:20',
            'category' => 'required|string|in:standard,premium,xl',
        ]);

        $user = $request->user();
        $vehicle = $user->vehicle()->updateOrCreate(
            ['user_id' => $user->id],
            $validated,
        );

        return response()->json($vehicle, 201);
    }

    public function toggleOnline(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->update(['is_online' => !$user->is_online]);

        return response()->json([
            'is_online' => $user->fresh()->is_online,
        ]);
    }

    public function earnings(Request $request): JsonResponse
    {
        $user = $request->user();

        $profile = $user->driverProfile;

        $todayEarnings = Ride::where('driver_id', $user->id)
            ->where('status', 'completed')
            ->whereDate('completed_at', today())
            ->sum('total_fare');

        $pendingPayout = WalletTransaction::whereHas('wallet', fn($q) => $q->where('user_id', $user->id))
            ->where('type', 'pending_payout')
            ->sum('amount');

        $recentTransactions = WalletTransaction::whereHas('wallet', fn($q) => $q->where('user_id', $user->id))
            ->latest()
            ->take(20)
            ->get();

        return response()->json([
            'total_earnings' => (float) ($profile?->total_earnings ?? 0),
            'today_earnings' => (float) $todayEarnings,
            'pending_payout' => (float) $pendingPayout,
            'total_trips' => (int) ($profile?->total_trips ?? 0),
            'recent_transactions' => $recentTransactions,
        ]);
    }

    public function trips(Request $request): JsonResponse
    {
        $rides = Ride::where('driver_id', $request->user()->id)
            ->when($request->status, fn($q, $v) => $q->where('status', $v))
            ->with(['rider', 'payment', 'rating'])
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($rides);
    }

    public function nearbyRides(Request $request): JsonResponse
    {
        $latitude = $request->user()->current_latitude;
        $longitude = $request->user()->current_longitude;

        if (!$latitude || !$longitude) {
            return response()->json(['message' => 'Location not set.'], 422);
        }

        $rides = Ride::where('status', 'searching')
            ->where('tenant_id', $request->user()->tenant_id)
            ->whereRaw(
                "(6371 * acos(cos(radians(?)) * cos(radians(pickup_latitude)) * cos(radians(pickup_longitude) - radians(?)) + sin(radians(?)) * sin(radians(pickup_latitude)))) <= ?",
                [$latitude, $longitude, $latitude, $request->radius ?? 10]
            )
            ->with('rider')
            ->latest()
            ->get();

        return response()->json($rides);
    }
}
