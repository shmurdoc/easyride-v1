<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Models\RestaurantCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FoodAdminController extends Controller
{
    public function restaurants(Request $request): JsonResponse
    {
        $restaurants = Restaurant::where('tenant_id', $request->user()->tenant_id)
            ->when($request->search, fn ($q, $v) => $q->where('name', 'like', "%{$v}%"))
            ->when($request->is_active, fn ($q, $v) => $q->where('is_active', filter_var($v, FILTER_VALIDATE_BOOLEAN)))
            ->withCount('menuItems')
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($restaurants);
    }

    public function storeRestaurant(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:restaurants,slug',
            'description' => 'nullable|string|max:2000',
            'image_url' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'required|string|max:500',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'cuisine_type' => 'nullable|string|max:100',
            'price_range' => 'sometimes|string|max:10',
            'delivery_fee' => 'sometimes|numeric|min:0',
            'minimum_order' => 'sometimes|numeric|min:0',
            'estimated_delivery_minutes' => 'sometimes|integer|min:5|max:120',
            'is_active' => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean',
            'opens_at' => 'nullable|date_format:H:i',
            'closes_at' => 'nullable|date_format:H:i',
        ]);

        $restaurant = Restaurant::create([
            'tenant_id' => $request->user()->tenant_id,
            ...$validated,
        ]);

        return response()->json($restaurant, 201);
    }

    public function updateRestaurant(Request $request, Restaurant $restaurant): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:2000',
            'image_url' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'sometimes|string|max:500',
            'latitude' => 'sometimes|numeric|between:-90,90',
            'longitude' => 'sometimes|numeric|between:-180,180',
            'cuisine_type' => 'nullable|string|max:100',
            'price_range' => 'sometimes|string|max:10',
            'delivery_fee' => 'sometimes|numeric|min:0',
            'minimum_order' => 'sometimes|numeric|min:0',
            'estimated_delivery_minutes' => 'sometimes|integer|min:5|max:120',
            'is_active' => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean',
            'opens_at' => 'nullable|date_format:H:i',
            'closes_at' => 'nullable|date_format:H:i',
        ]);

        $restaurant->update($validated);

        return response()->json($restaurant);
    }

    public function storeCategory(Request $request, Restaurant $restaurant): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'sort_order' => 'sometimes|integer|min:0',
        ]);

        $category = RestaurantCategory::create([
            'restaurant_id' => $restaurant->id,
            ...$validated,
        ]);

        return response()->json($category, 201);
    }

    public function storeMenuItem(Request $request, Restaurant $restaurant): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|nullable|exists:restaurant_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'price' => 'required|numeric|min:0',
            'image_url' => 'nullable|string|max:500',
            'is_available' => 'sometimes|boolean',
            'is_vegetarian' => 'sometimes|boolean',
            'is_vegan' => 'sometimes|boolean',
            'is_gluten_free' => 'sometimes|boolean',
            'spice_level' => 'sometimes|integer|min:0|max:5',
            'preparation_time_minutes' => 'nullable|integer|min:1',
            'calories' => 'nullable|integer|min:0',
            'sort_order' => 'sometimes|integer|min:0',
        ]);

        $item = MenuItem::create([
            'restaurant_id' => $restaurant->id,
            ...$validated,
        ]);

        return response()->json($item, 201);
    }

    public function updateMenuItem(Request $request, MenuItem $item): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|nullable|exists:restaurant_categories,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:2000',
            'price' => 'sometimes|numeric|min:0',
            'image_url' => 'nullable|string|max:500',
            'is_available' => 'sometimes|boolean',
            'is_vegetarian' => 'sometimes|boolean',
            'is_vegan' => 'sometimes|boolean',
            'is_gluten_free' => 'sometimes|boolean',
            'spice_level' => 'sometimes|integer|min:0|max:5',
            'preparation_time_minutes' => 'nullable|integer|min:1',
            'calories' => 'nullable|integer|min:0',
            'sort_order' => 'sometimes|integer|min:0',
        ]);

        $item->update($validated);

        return response()->json($item);
    }

    public function destroyMenuItem(MenuItem $item): JsonResponse
    {
        $item->delete();

        return response()->json(null, 204);
    }
}
