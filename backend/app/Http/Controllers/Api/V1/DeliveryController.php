<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\User;
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
            ->when($request->user()->role === 'driver', fn ($q) => $q->where('driver_id', $request->user()->id))
            ->when($request->user()->role === 'rider', fn ($q) => $q->where('sender_id', $request->user()->id))
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->with(['sender', 'driver'])
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($deliveries);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'item_description' => 'required|string|max:1000',
            'item_value' => 'sometimes|numeric|min:0',
            'recipient_name' => 'required|string|max:255',
            'recipient_phone' => 'required|string|max:20',
            'pickup_address' => 'required|string|max:500',
            'pickup_lat' => 'required|numeric|between:-90,90',
            'pickup_lng' => 'required|numeric|between:-180,180',
            'dropoff_address' => 'required|string|max:500',
            'dropoff_lat' => 'required|numeric|between:-90,90',
            'dropoff_lng' => 'required|numeric|between:-180,180',
            'payment_method' => 'required|string|in:wallet,cash,payfast,ozow',
            'notes' => 'nullable|string|max:1000',
        ]);

        $delivery = $this->deliveryService->createDelivery([
            'tenant_id' => $request->user()->tenant_id,
            'sender_id' => $request->user()->id,
            'status' => 'pending',
            'payment_method' => $validated['payment_method'],
            'payment_status' => 'pending',
            'item_description' => $validated['item_description'],
            'item_value' => $validated['item_value'] ?? null,
            'recipient_name' => $validated['recipient_name'],
            'recipient_phone' => $validated['recipient_phone'],
            'pickup_address' => $validated['pickup_address'],
            'pickup_lat' => $validated['pickup_lat'],
            'pickup_lng' => $validated['pickup_lng'],
            'dropoff_address' => $validated['dropoff_address'],
            'dropoff_lat' => $validated['dropoff_lat'],
            'dropoff_lng' => $validated['dropoff_lng'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json($delivery, 201);
    }

    public function show(Delivery $delivery): JsonResponse
    {
        return response()->json($delivery->load(['sender', 'driver', 'ride']));
    }

    public function updateStatus(Request $request, Delivery $delivery): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,picked_up,in_transit,delivered,failed,cancelled',
        ]);

        $delivery = $this->deliveryService->updateStatus($delivery, $validated['status']);

        return response()->json($delivery);
    }

    public function assignDriver(Request $request, Delivery $delivery): JsonResponse
    {
        $validated = $request->validate([
            'driver_id' => 'required|string|exists:users,id',
        ]);

        $user = User::find($validated['driver_id']);
        $delivery->update(['driver_id' => $user->id, 'status' => 'pending']);

        return response()->json($delivery->fresh()->load(['sender', 'driver']));
    }

    public function driverDeliveries(Request $request): JsonResponse
    {
        $deliveries = Delivery::where('driver_id', $request->user()->id)
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->with(['sender', 'ride'])
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($deliveries);
    }
}
