<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Food\FoodAssignDriverRequest;
use App\Http\Requests\Api\V1\Food\FoodOrderCreateRequest;
use App\Http\Requests\Api\V1\Food\FoodOrderRateRequest;
use App\Http\Requests\Api\V1\Food\FoodUpdateStatusRequest;
use App\Models\FoodOrder;
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
                    '(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) <= ?',
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

    public function createOrder(FoodOrderCreateRequest $request, Restaurant $restaurant): JsonResponse
    {
        $validated = $request->validated();

        try {
            $order = $this->foodDeliveryService->createOrder(
                $restaurant,
                $request->user(),
                $validated['items'],
                [
                    'address' => $validated['delivery_address'],
                    'latitude' => $validated['delivery_lat'],
                    'longitude' => $validated['delivery_lng'],
                    'notes' => $validated['notes'] ?? null,
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
            && ! $request->user()->hasAnyRole(['admin', 'super-admin'])
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

        if (! in_array($order->status, ['pending', 'confirmed'])) {
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

    public function rateOrder(FoodOrderRateRequest $request, FoodOrder $order): JsonResponse
    {
        if ($order->customer_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validated();

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

    public function availableOrders(Request $request): JsonResponse
    {
        $orders = $this->foodDeliveryService->getAvailableOrders(
            $request->user(),
            $request->status,
        );

        return response()->json($orders);
    }

    public function driverAcceptOrder(Request $request, FoodOrder $order): JsonResponse
    {
        try {
            $order = $this->foodDeliveryService->driverAcceptOrder(
                $order,
                $request->user(),
            );

            return response()->json($order);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function restaurantOrders(Request $request): JsonResponse
    {
        $restaurantIds = Restaurant::where('tenant_id', $request->user()->tenant_id)
            ->pluck('id');

        if ($restaurantIds->isEmpty()) {
            return response()->json(['data' => []]);
        }

        $orders = FoodOrder::whereIn('restaurant_id', $restaurantIds)
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->with(['items', 'customer', 'driver'])
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($orders);
    }

    public function assignDriver(FoodAssignDriverRequest $request, FoodOrder $order): JsonResponse
    {
        $validated = $request->validated();

        $driver = User::findOrFail($validated['driver_id']);

        try {
            $order = $this->foodDeliveryService->assignDriver($order, $driver);

            return response()->json($order);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function updateStatus(FoodUpdateStatusRequest $request, FoodOrder $order): JsonResponse
    {
        $validated = $request->validated();

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
