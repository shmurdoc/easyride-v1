<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Services\DeliveryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    public function __construct(
        protected DeliveryService $deliveryService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $deliveries = Delivery::query()
            ->when($request->status, fn($q, $v) => $q->where('status', $v))
            ->when($request->type, fn($q, $v) => $q->where('type', $v))
            ->when($request->user()->role === 'rider', fn($q) => $q->whereHas('ride', fn($qr) => $qr->where('rider_id', $request->user()->id)))
            ->when($request->user()->role === 'driver', fn($q) => $q->whereHas('ride', fn($qr) => $qr->where('driver_id', $request->user()->id)))
            ->with(['ride', 'ride.rider', 'ride.driver'])
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($deliveries);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ride_id' => 'required|string|exists:rides,id',
            'type' => 'required|string|in:parcel,food,grocery,other',
            'description' => 'nullable|string|max:1000',
            'sender_name' => 'required|string|max:255',
            'sender_phone' => 'required|string|max:20',
            'recipient_name' => 'required|string|max:255',
            'recipient_phone' => 'required|string|max:20',
            'recipient_address' => 'required|string|max:255',
            'recipient_latitude' => 'required|numeric',
            'recipient_longitude' => 'required|numeric',
            'pickup_notes' => 'nullable|string|max:500',
            'delivery_notes' => 'nullable|string|max:500',
            'package_size' => 'nullable|string|in:small,medium,large',
            'package_weight_kg' => 'nullable|numeric|min:0.1',
            'estimated_value' => 'nullable|numeric|min:0',
            'requires_signature' => 'sometimes|boolean',
            'is_fragile' => 'sometimes|boolean',
        ]);

        $delivery = $this->deliveryService->createDelivery(
            $request->user(),
            $validated,
        );

        return response()->json(
            $delivery->load(['ride', 'ride.rider', 'ride.driver']),
            201,
        );
    }

    public function show(Delivery $delivery): JsonResponse
    {
        return response()->json(
            $delivery->load(['ride', 'ride.rider', 'ride.driver', 'ride.payment', 'tenant'])
        );
    }

    public function updateStatus(Request $request, Delivery $delivery): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,picked_up,in_transit,delivered,failed',
        ]);

        $delivery = $this->deliveryService->updateStatus($delivery, $validated['status']);

        return response()->json($delivery);
    }

    public function active(Request $request): JsonResponse
    {
        $deliveries = Delivery::whereIn('status', ['pending', 'picked_up', 'in_transit'])
            ->whereHas('ride', function ($q) use ($request) {
                $q->where('rider_id', $request->user()->id)
                  ->orWhere('driver_id', $request->user()->id);
            })
            ->with(['ride', 'ride.rider', 'ride.driver'])
            ->latest()
            ->get();

        return response()->json($deliveries);
    }
}
