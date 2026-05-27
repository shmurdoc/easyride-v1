<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::query()
            ->when($request->role, fn($q, $role) => $q->where('role', $role))
            ->when($request->tenant_id, fn($q, $tid) => $q->where('tenant_id', $tid))
            ->paginate($request->per_page ?? 15);

        return response()->json($users);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json($user->load(['tenant', 'driverProfile', 'vehicle']));
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $user->update($request->validated());
        return response()->json($user);
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();
        return response()->json(null, 204);
    }
}
