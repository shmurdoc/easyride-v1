<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FoodOrder;
use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Models\User;
use App\Services\FoodDeliveryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FoodDeliveryController extends Controller
{
    public function __construct(
        protected FoodDeliveryService $foodDeliveryService,
    ) {}

    public function restaurants(Request $request): JsonResponse
    {
        $restaurants = Restaurant::where('tenant_id', $request->user()->tenant_id)
            ->where('is_active', true)
            ->when($request->cuisine, fn ($q, $v) => $q->where('cuisine_type', $v))
            ->when($request->search, fn ($q, $v) => $q->where('name', 'like', "%{$v}%"))
            ->when($request->featured, fn ($q) => $q->where('is_featured', true))
            ->when($request->lat && $request->lng, function ($q) use ($request) {
                $q->whereRaw(
                    "(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) <= ?",
                    [$request->lat, $request->lng, $request->lat, $request->radius ?? 10]
                );
            })
            ->withCount('menuItems')
            ->orderBy($request->sort ?? 'name', $request->order ?? 'asc')
            ->paginate($request->per_page ?? 15);

        return response()->json($restaurants);
    }

    public function show(Restaurant $restaurant): JsonResponse
    {
        return response()->json(
            $restaurant->load(['categories.menuItems' => function ($q) {
                $q->where('is_active', true)->where('is_available', true)->orderBy('sort_order');
            }])
        );
    }

    public function menu(Restaurant $restaurant): JsonResponse
    {
        $menu = $restaurant->categories()
            ->where('is_active', true)
            ->with(['menuItems' => function ($q) {
                $q->where('is_active', true)->orderBy('sort_order');
            }])
            ->orderBy('sort_order')
            ->get();

        return response()->json($menu);
    }

    public function createOrder(Request $request, Restaurant $restaurant): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1|max:20',
            'items.*.special_instructions' => 'nullable|string|max:500',
            'delivery_address' => 'required|string|max:500',
            'delivery_latitude' => 'required|numeric|between:-90,90',
            'delivery_longitude' => 'required|numeric|between:-180,180',
            'delivery_notes' => 'nullable|string|max:500',
            'payment_method' => 'required|string|in:wallet,cash,payfast,ozow',
            'tip_amount' => 'sometimes|numeric|min:0|max:500',
        ]);

        try {
            $order = $this->foodDeliveryService->createOrder(
                $restaurant,
                $request->user(),
                $validated['items'],
                [
                    'address' => $validated['delivery_address'],
                    'latitude' => $validated['delivery_latitude'],
                    'longitude' => $validated['delivery_longitude'],
                    'notes' => $validated['delivery_notes'] ?? null,
                    'payment_method' => $validated['payment_method'],
                    'tip_amount' => $validated['tip_amount'] ?? 0,
                ],
            );

            return response()->json($order, 201);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function showOrder(Request $request, FoodOrder $order): JsonResponse
    {
        if ($order->customer_id !== $request->user()->id
            && $order->driver_id !== $request->user()->id
            && !$request->user()->hasAnyRole(['admin', 'super-admin'])
        ) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json(
            $order->load(['items', 'restaurant', 'customer', 'driver'])
        );
    }

    public function myOrders(Request $request): JsonResponse
    {
        $orders = $this->foodDeliveryService->getCustomerOrders(
            $request->user(),
            $request->status,
        );

        return response()->json($orders);
    }

    public function cancelOrder(Request $request, FoodOrder $order): JsonResponse
    {
        if ($order->customer_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if (!in_array($order->status, ['pending', 'confirmed'])) {
            return response()->json(['message' => 'Order cannot be cancelled at this stage.'], 422);
        }

        try {
            $order = $this->foodDeliveryService->updateStatus(
                $order,
                'cancelled',
                $request->input('reason', 'Cancelled by customer'),
            );

            return response()->json($order);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function rateOrder(Request $request, FoodOrder $order): JsonResponse
    {
        if ($order->customer_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        try {
            $order = $this->foodDeliveryService->rateOrder(
                $order,
                $validated['rating'],
                $validated['comment'] ?? null,
            );

            return response()->json($order);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function driverOrders(Request $request): JsonResponse
    {
        $orders = $this->foodDeliveryService->getDriverOrders(
            $request->user(),
            $request->status,
        );

        return response()->json($orders);
    }

    public function assignDriver(Request $request, FoodOrder $order): JsonResponse
    {
        if (!$request->user()->hasAnyRole(['admin', 'super-admin'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'driver_id' => 'required|string|exists:users,id',
        ]);

        $driver = User::findOrFail($validated['driver_id']);

        try {
            $order = $this->foodDeliveryService->assignDriver($order, $driver);
            return response()->json($order);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function updateStatus(Request $request, FoodOrder $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:confirmed,preparing,ready,picked_up,in_transit,delivered,cancelled',
        ]);

        try {
            $order = $this->foodDeliveryService->updateStatus(
                $order,
                $validated['status'],
                $request->input('reason'),
            );

            return response()->json($order);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
