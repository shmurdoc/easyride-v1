<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\User\UserUpdateRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::query()
            ->when($request->role, fn ($q, $role) => $q->where('role', $role))
            ->when($request->tenant_id, fn ($q, $tid) => $q->where('tenant_id', $tid))
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($users);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json($user->load(['tenant', 'driverProfile', 'vehicle']));
    }

    public function update(UserUpdateRequest $request, User $user): JsonResponse
    {
        $validated = $request->validated();

        $user->update($validated);

        return response()->json($user);
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json(null, 204);
    }

    public function adminStats(Request $request): JsonResponse
    {
        return response()->json([
            'total_users' => User::count(),
            'total_riders' => User::where('role', 'rider')->count(),
            'total_drivers' => User::where('role', 'driver')->count(),
            'active_drivers' => User::where('role', 'driver')
                ->whereHas('driverProfile', fn ($q) => $q->where('is_online', true))
                ->count(),
        ]);
    }
}
