<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\NewRideRequest;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Ride\FareEstimateRequest;
use App\Http\Requests\Api\V1\Ride\RideApplyPromoRequest;
use App\Http\Requests\Api\V1\Ride\RideCancelRequest;
use App\Http\Requests\Api\V1\Ride\RideCreateRequest;
use App\Http\Requests\Api\V1\Ride\RideRateRequest;
use App\Http\Requests\Api\V1\Ride\UpdateLocationRequest;
use App\Models\Ride;
use App\Models\User;
use App\Services\FareCalculationService;
use App\Services\PaymentService;
use App\Services\PromoCodeService;
use App\Services\RatingService;
use App\Services\ReceiptService;
use App\Services\RideMatchingService;
use App\Services\RouteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class RideController extends Controller
{
    public function __construct(
        protected FareCalculationService $fareCalculationService,
        protected RouteService $routeService,
        protected RideMatchingService $rideMatchingService,
        protected PaymentService $paymentService,
        protected RatingService $ratingService,
        protected PromoCodeService $promoCodeService,
        protected ReceiptService $receiptService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $rides = Ride::query()
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->category, fn ($q, $v) => $q->where('category', $v))
            ->when($request->from_date, fn ($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($request->to_date, fn ($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->when($request->user()->role === 'rider', fn ($q) => $q->where('rider_id', $request->user()->id))
            ->when($request->user()->role === 'driver', fn ($q) => $q->where('driver_id', $request->user()->id))
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($rides);
    }

    public function store(RideCreateRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $fare = $this->fareCalculationService->calculate(
            $validated['pickup_lat'], $validated['pickup_lng'],
            $validated['dropoff_lat'], $validated['dropoff_lng'],
            $validated['category'],
        );

        $ride = Ride::create([
            'pickup_latitude' => $validated['pickup_lat'],
            'pickup_longitude' => $validated['pickup_lng'],
            'dropoff_latitude' => $validated['dropoff_lat'],
            'dropoff_longitude' => $validated['dropoff_lng'],
            'pickup_address' => $validated['pickup_address'],
            'dropoff_address' => $validated['dropoff_address'],
            'category' => $validated['category'],
            'payment_method' => $validated['payment_method'],
            'promo_code' => $validated['promo_code'] ?? null,
            'tenant_id' => $request->user()->tenant_id,
            'rider_id' => $request->user()->id,
            'status' => 'searching',
            ...$fare,
        ]);

        Event::dispatch(new NewRideRequest($ride));

        return response()->json(['ride' => $ride->load('rider')], 201);
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

    public function cancel(RideCancelRequest $request, Ride $ride): JsonResponse
    {
        if ($ride->rider_id !== $request->user()->id && $ride->driver_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if (! in_array($ride->status, ['searching', 'accepted', 'arrived'])) {
            return response()->json(['message' => 'Ride cannot be cancelled.'], 422);
        }

        $validated = $request->validated();

        $ride->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancelled_by' => $request->user()->id,
            'cancellation_reason' => $validated['cancellation_reason'],
        ]);

        if ($ride->payment && $ride->payment->status === 'completed') {
            $this->paymentService->processRefund($ride->payment, 'Ride cancelled');
        }

        return response()->json($ride);
    }

    public function rate(RideRateRequest $request, Ride $ride): JsonResponse
    {
        if ($ride->rider_id !== $request->user()->id) {
            return response()->json(['message' => 'Only the rider can rate.'], 403);
        }

        if ($ride->status !== 'completed') {
            return response()->json(['message' => 'Only completed rides can be rated.'], 422);
        }

        $validated = $request->validated();

        $rater = User::find($request->user()->id);
        $ratee = User::find($ride->driver_id);

        $rating = $this->ratingService->rateRide(
            $ride,
            $rater,
            $ratee,
            $validated['score'],
            $validated['comment'] ?? null,
        );

        return response()->json($rating, 201);
    }

    public function applyPromo(RideApplyPromoRequest $request, Ride $ride): JsonResponse
    {
        if ($ride->rider_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($ride->status !== 'searching') {
            return response()->json(['message' => 'Promo code cannot be applied at this stage.'], 422);
        }

        $validated = $request->validated();

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

        if (! $result['success']) {
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

        DB::transaction(function () use ($ride, $finalFare) {
            $ride->update([
                'status' => 'completed',
                'total_fare' => $finalFare,
                'completed_at' => now(),
            ]);

            $this->paymentService->processRidePayment($ride);

            $ride->driver->update(['current_ride_id' => null]);
        });

        return response()->json([
            'ride' => $ride->fresh()->load('payment'),
            'rating_required' => true,
        ]);
    }

    public function receipt(Request $request, Ride $ride): BinaryFileResponse
    {
        if ($ride->rider_id !== $request->user()->id && $ride->driver_id !== $request->user()->id) {
            abort(403, 'Unauthorized.');
        }

        if ($ride->status !== 'completed') {
            abort(422, 'Ride is not completed.');
        }

        $path = $this->receiptService->generateReceipt($ride);
        $fullPath = storage_path('app/public/'.$path);

        return response()->file($fullPath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="receipt_'.$ride->id.'.pdf"',
        ]);
    }

    public function updateLocation(UpdateLocationRequest $request, Ride $ride): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validated();

        $user->update([
            'current_latitude' => $validated['latitude'],
            'current_longitude' => $validated['longitude'],
            'last_location_update' => now(),
        ]);

        return response()->json(['message' => 'Location updated.']);
    }

    public function fareEstimate(FareEstimateRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $route = $this->routeService->getRoute(
            (float) $validated['pickup_lat'],
            (float) $validated['pickup_lng'],
            (float) $validated['dropoff_lat'],
            (float) $validated['dropoff_lng'],
        );

        $fare = $this->fareCalculationService->calculateFare(
            $route['distance_km'],
            $route['duration_minutes'],
            $validated['category'] ?? 'standard',
        );

        return response()->json([
            'distance_km' => $route['distance_km'],
            'duration_minutes' => $route['duration_minutes'],
            'breakdown' => [
                'base_fare' => $fare['base_fare'],
                'distance_fare' => $fare['distance_fare'],
                'time_fare' => $fare['time_fare'],
                'surge' => $fare['surge_multiplier'],
                'subtotal' => $fare['subtotal'],
                'total_fare' => $fare['total_fare'],
            ],
        ]);
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

        if (! $ride) {
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
