<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ScheduledRide\ScheduledRideCreateRequest;
use App\Services\ScheduledRideService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduledRideController extends Controller
{
    public function __construct(
        protected ScheduledRideService $scheduledRideService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $rides = $this->scheduledRideService->getUpcomingRides($request->user());

        return response()->json(['data' => $rides]);
    }

    public function store(ScheduledRideCreateRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $scheduled = $this->scheduledRideService->scheduleRide($request->user(), $validated);

        return response()->json([
            'message' => 'Ride scheduled successfully.',
            'scheduled_ride' => $scheduled,
        ], 201);
    }

    public function cancel(Request $request, string $id): JsonResponse
    {
        $result = $this->scheduledRideService->cancelScheduledRide($request->user(), $id);

        if (! $result['success']) {
            return response()->json($result, 422);
        }

        return response()->json($result);
    }
}
