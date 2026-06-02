<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Ride;
use App\Models\PromoCode;
use App\Services\FareCalculationService;
use App\Services\RideMatchingService;
use App\Services\PaymentService;
use App\Services\RatingService;
use App\Services\PromoCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;

class RideController extends Controller
{
    public function __construct(
        protected FareCalculationService $fareCalculationService,
        protected RideMatchingService $rideMatchingService,
        protected PaymentService $paymentService,
        protected RatingService $ratingService,
        protected PromoCodeService $promoCodeService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $rides = Ride::query()
            ->when($request->status, fn($q, $v) => $q->where('status', $v))
            ->when($request->category, fn($q, $v) => $q->where('category', $v))
            ->when($request->from_date, fn($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($request->to_date, fn($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->when($request->user()->role === 'rider', fn($q) => $q->where('rider_id', $request->user()->id))
            ->when($request->user()->role === 'driver', fn($q) => $q->where('driver_id', $request->user()->id))
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($rides);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pickup_latitude' => 'required|numeric',
            'pickup_longitude' => 'required|numeric',
            'dropoff_latitude' => 'required|numeric',
            'dropoff_longitude' => 'required|numeric',
            'pickup_address' => 'required|string|max:255',
            'dropoff_address' => 'required|string|max:255',
            'category' => 'required|string|in:standard,premium,xl,delivery',
        ]);

        $fare = $this->fareCalculationService->calculate(
            $validated['pickup_latitude'], $validated['pickup_longitude'],
            $validated['dropoff_latitude'], $validated['dropoff_longitude'],
            $validated['category'],
        );

        $ride = Ride::create([
            ...$validated,
            'tenant_id' => $request->user()->tenant_id,
            'rider_id' => $request->user()->id,
            'status' => 'searching',
            ...$fare,
        ]);

        Event::dispatch(new \App\Events\NewRideRequest($ride));

        return response()->json($ride->load('rider'), 201);
    }

    public function show(Ride $ride): JsonResponse
    {
        return response()->json(
            $ride->load([
                'rider',
                'driver',
                'driver.driverProfile',
                'driver.vehicle',
                'payment',
                'rating',
                'delivery',
            ])
        );
    }

    public function cancel(Request $request, Ride $ride): JsonResponse
    {
        if ($ride->rider_id !== $request->user()->id && $ride->driver_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if (!in_array($ride->status, ['searching', 'accepted', 'arrived'])) {
            return response()->json(['message' => 'Ride cannot be cancelled.'], 422);
        }

        $ride->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancelled_by' => $request->user()->id,
        ]);

        if ($ride->payment && $ride->payment->status === 'completed') {
            $this->paymentService->processRefund($ride->payment, 'Ride cancelled');
        }

        return response()->json($ride);
    }

    public function rate(Request $request, Ride $ride): JsonResponse
    {
        if ($ride->rider_id !== $request->user()->id) {
            return response()->json(['message' => 'Only the rider can rate.'], 403);
        }

        if ($ride->status !== 'completed') {
            return response()->json(['message' => 'Only completed rides can be rated.'], 422);
        }

        $validated = $request->validate([
            'score' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $rater = \App\Models\User::find($request->user()->id);
        $ratee = \App\Models\User::find($ride->driver_id);

        $rating = $this->ratingService->rateRide(
            $ride,
            $rater,
            $ratee,
            $validated['score'],
            $validated['comment'] ?? null,
        );

        return response()->json($rating, 201);
    }

    public function applyPromo(Request $request, Ride $ride): JsonResponse
    {
        if ($ride->rider_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($ride->status !== 'searching') {
            return response()->json(['message' => 'Promo code cannot be applied at this stage.'], 422);
        }

        $validated = $request->validate(['code' => 'required|string']);

        try {
            $promo = $this->promoCodeService->validateCode(
                $validated['code'],
                $request->user()->tenant_id,
                null,
            );

            $discount = $this->promoCodeService->applyDiscount($promo, (float) $ride->total_fare);

            $ride->update([
                'promo_code_id' => $promo->id,
                'discount_amount' => $discount['discount'],
            ]);

            return response()->json([
                'promo_code' => $promo,
                'discount' => $discount,
                'new_total' => round((float) $ride->total_fare - $discount['discount'], 2),
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function driverAccept(Request $request, Ride $ride): JsonResponse
    {
        if ($ride->status !== 'searching') {
            return response()->json(['message' => 'Ride is no longer available.'], 422);
        }

        $driver = $request->user();
        $result = $this->rideMatchingService->accept($ride, $driver);

        if (!$result['success']) {
            return response()->json(['message' => $result['message']], 422);
        }

        $driver->update(['current_ride_id' => $ride->id]);

        return response()->json($ride->fresh()->load(['driver', 'driver.driverProfile', 'driver.vehicle']));
    }

    public function driverArrived(Request $request, Ride $ride): JsonResponse
    {
        if ($ride->driver_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($ride->status !== 'accepted') {
            return response()->json(['message' => 'Invalid ride status.'], 422);
        }

        $ride->update(['status' => 'arrived']);

        return response()->json($ride);
    }

    public function startRide(Request $request, Ride $ride): JsonResponse
    {
        if ($ride->driver_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($ride->status !== 'arrived') {
            return response()->json(['message' => 'Driver has not arrived yet.'], 422);
        }

        $ride->update([
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        return response()->json($ride);
    }

    public function completeRide(Request $request, Ride $ride): JsonResponse
    {
        if ($ride->driver_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($ride->status !== 'in_progress') {
            return response()->json(['message' => 'Ride is not in progress.'], 422);
        }

        $finalFare = $this->fareCalculationService->calculateFinalFare($ride);

        DB::transaction(function () use ($ride, $finalFare, $request) {
            $ride->update([
                'status' => 'completed',
                'total_fare' => $finalFare,
                'completed_at' => now(),
            ]);

            $this->paymentService->processRidePayment($ride);

            $ride->driver->update(['current_ride_id' => null]);
        });

        return response()->json($ride->fresh()->load('payment'));
    }

    public function updateLocation(Request $request, Ride $ride): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $user->update([
            'current_latitude' => $validated['latitude'],
            'current_longitude' => $validated['longitude'],
            'last_location_update' => now(),
        ]);

        return response()->json(['message' => 'Location updated.']);
    }

    public function current(Request $request): JsonResponse
    {
        $ride = Ride::whereIn('status', ['searching', 'accepted', 'arrived', 'in_progress'])
            ->where(function ($q) use ($request) {
                $q->where('rider_id', $request->user()->id)
                  ->orWhere('driver_id', $request->user()->id);
            })
            ->latest()
            ->first();

        if (!$ride) {
            return response()->json(['message' => 'No active ride.'], 404);
        }

        return response()->json(
            $ride->load([
                'rider',
                'driver',
                'driver.driverProfile',
                'driver.vehicle',
                'payment',
            ])
        );
    }
}
