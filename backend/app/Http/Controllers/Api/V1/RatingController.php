<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Rating;
use App\Models\Ride;
use App\Services\RatingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    public function __construct(
        protected RatingService $ratingService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $ratings = Rating::where('ratee_id', $request->user()->id)
            ->with(['rater', 'ride'])
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($ratings);
    }

    public function given(Request $request): JsonResponse
    {
        $ratings = Rating::where('rater_id', $request->user()->id)
            ->with(['ratee', 'ride'])
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($ratings);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ride_id' => 'required|string|exists:rides,id',
            'ratee_id' => 'required|string|exists:users,id',
            'score' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $ride = Ride::findOrFail($validated['ride_id']);

        if ($ride->rider_id !== $request->user()->id && $ride->driver_id !== $request->user()->id) {
            return response()->json(['message' => 'You did not participate in this ride.'], 403);
        }

        if (Rating::where('ride_id', $ride->id)->where('rater_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'You have already rated this ride.'], 422);
        }

        $rating = $this->ratingService->rateRide(
            $ride,
            $request->user()->id,
            $validated['ratee_id'],
            $validated['score'],
            $validated['comment'] ?? null,
        );

        return response()->json($rating, 201);
    }

    public function show(Rating $rating): JsonResponse
    {
        if ($rating->rater_id !== request()->user()->id && $rating->ratee_id !== request()->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json($rating->load(['rater', 'ratee', 'ride']));
    }
}
