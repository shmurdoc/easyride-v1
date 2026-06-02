<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Ride;
use App\Services\SosService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SosController extends Controller
{
    public function __construct(
        protected SosService $sosService,
    ) {}

    public function trigger(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'ride_id' => 'nullable|string',
            'notes' => 'nullable|string|max:500',
        ]);

        $ride = null;
        if ($validated['ride_id'] ?? null) {
            $ride = Ride::find($validated['ride_id']);
        }

        $alert = $this->sosService->triggerSos(
            $request->user(),
            $ride,
            $validated['latitude'],
            $validated['longitude'],
            $validated['notes'] ?? '',
        );

        return response()->json([
            'message' => 'SOS alert triggered. Help is on the way.',
            'alert_id' => $alert->id,
            'cancel_window' => 10,
        ], 201);
    }

    public function cancel(Request $request, string $id): JsonResponse
    {
        $result = $this->sosService->cancelSos($request->user(), $id);

        if (!$result['success']) {
            return response()->json($result, 422);
        }

        return response()->json($result);
    }

    public function acknowledge(Request $request, string $id): JsonResponse
    {
        if (!$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $result = $this->sosService->acknowledgeAlert($request->user(), $id, $request->input('notes', ''));

        if (!$result['success']) {
            return response()->json($result, 422);
        }

        return response()->json($result);
    }

    public function resolve(Request $request, string $id): JsonResponse
    {
        if (!$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'resolution' => 'required|string',
        ]);

        $result = $this->sosService->resolveAlert($request->user(), $id, $validated['resolution']);

        if (!$result['success']) {
            return response()->json($result, 422);
        }

        return response()->json($result);
    }

    public function active(Request $request): JsonResponse
    {
        if (!$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $alerts = $this->sosService->getActiveAlerts();
        return response()->json(['data' => iterator_to_array($alerts)]);
    }
}
