<?php

namespace Tests\Unit;

use App\Models\FoodOrder;
use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Models\RestaurantCategory;
use App\Models\Tenant;
use App\Models\User;
use App\Services\FoodDeliveryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FoodDeliveryServiceTest extends TestCase
{
    use RefreshDatabase;

    private FoodDeliveryService $service;

    private Restaurant $restaurant;

    private User $customer;

    private User $driver;

    private MenuItem $menuItem;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = $this->app->make(FoodDeliveryService::class);

        $tenant = Tenant::factory()->create();
        $this->customer = User::factory()->create(['tenant_id' => $tenant->id]);
        $this->driver = User::factory()->create(['tenant_id' => $tenant->id]);

        $this->restaurant = Restaurant::factory()->create([
            'tenant_id' => $tenant->id,
            'minimum_order' => 60,
            'delivery_fee' => 15,
            'opens_at' => '00:00',
            'closes_at' => '23:59',
        ]);

        $category = RestaurantCategory::factory()->create([
            'restaurant_id' => $this->restaurant->id,
        ]);

        $this->menuItem = MenuItem::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'category_id' => $category->id,
            'price' => 50,
        ]);
    }

    public function test_is_restaurant_open_returns_true(): void
    {
        $this->assertTrue($this->service->isRestaurantOpen($this->restaurant));
    }

    public function test_is_restaurant_open_returns_false_when_closed(): void
    {
        $restaurant = Restaurant::factory()->create([
            'opens_at' => now()->subHours(3)->format('H:i'),
            'closes_at' => now()->subHour()->format('H:i'),
        ]);

        $this->assertFalse($this->service->isRestaurantOpen($restaurant));
    }

    public function test_create_order_success(): void
    {
        $order = $this->service->createOrder(
            $this->restaurant,
            $this->customer,
            [
                ['menu_item_id' => $this->menuItem->id, 'quantity' => 2],
            ],
            [
                'address' => '123 Test St',
                'latitude' => -33.9249,
                'longitude' => 18.4241,
                'payment_method' => 'stripe',
                'tip_amount' => 10,
            ],
        );

        $this->assertInstanceOf(FoodOrder::class, $order);
        $this->assertEquals('pending', $order->status);
        $this->assertEquals(100.0, (float) $order->subtotal);
        $this->assertEquals(15.0, (float) $order->delivery_fee);
        $this->assertEquals(5.0, (float) $order->service_fee);
        $this->assertEquals(10.0, (float) $order->tip_amount);
        $this->assertEquals(130.0, (float) $order->total_amount);
        $this->assertCount(1, $order->items);
    }

    public function test_create_order_fails_below_minimum(): void
    {
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Minimum order');

        $this->service->createOrder(
            $this->restaurant,
            $this->customer,
            [
                ['menu_item_id' => $this->menuItem->id, 'quantity' => 1],
            ],
            [
                'address' => '123 Test St',
                'latitude' => -33.9249,
                'longitude' => 18.4241,
                'payment_method' => 'cash',
                'tip_amount' => 0,
            ],
        );
    }

    public function test_create_order_fails_when_closed(): void
    {
        $restaurant = Restaurant::factory()->create([
            'minimum_order' => 10,
            'opens_at' => now()->subHours(3)->format('H:i'),
            'closes_at' => now()->subHour()->format('H:i'),
        ]);

        $menuItem = MenuItem::factory()->create([
            'restaurant_id' => $restaurant->id,
            'price' => 60,
        ]);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('closed');

        $this->service->createOrder(
            $restaurant,
            $this->customer,
            [
                ['menu_item_id' => $menuItem->id, 'quantity' => 2],
            ],
            [
                'address' => '123 Test St',
                'latitude' => -33.9249,
                'longitude' => 18.4241,
                'payment_method' => 'cash',
                'tip_amount' => 0,
            ],
        );
    }

    public function test_driver_accept_order(): void
    {
        $order = FoodOrder::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'customer_id' => $this->customer->id,
            'status' => 'pending',
            'subtotal' => 100,
            'total_amount' => 130,
        ]);

        $result = $this->service->driverAcceptOrder($order, $this->driver);

        $this->assertEquals('confirmed', $result->status);
        $this->assertEquals($this->driver->id, $result->driver_id);
    }

    public function test_driver_accept_fails_for_taken_order(): void
    {
        $order = FoodOrder::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'customer_id' => $this->customer->id,
            'driver_id' => $this->driver->id,
            'status' => 'confirmed',
        ]);

        $this->expectException(\RuntimeException::class);

        $this->service->driverAcceptOrder($order, $this->driver);
    }

    public function test_status_transitions(): void
    {
        $order = FoodOrder::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'customer_id' => $this->customer->id,
            'status' => 'pending',
        ]);

        $order = $this->service->updateStatus($order, 'confirmed');
        $this->assertEquals('confirmed', $order->status);

        $order = $this->service->updateStatus($order, 'preparing');
        $this->assertEquals('preparing', $order->status);

        $order = $this->service->updateStatus($order, 'ready');
        $this->assertEquals('ready', $order->status);

        $order = $this->service->updateStatus($order, 'picked_up');
        $this->assertEquals('picked_up', $order->status);

        $order = $this->service->updateStatus($order, 'in_transit');
        $this->assertEquals('in_transit', $order->status);

        $order = $this->service->updateStatus($order, 'delivered');
        $this->assertEquals('delivered', $order->status);
        $this->assertNotNull($order->actual_delivery_at);
    }

    public function test_invalid_status_transition(): void
    {
        $order = FoodOrder::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'customer_id' => $this->customer->id,
            'status' => 'pending',
        ]);

        $this->expectException(\RuntimeException::class);

        $this->service->updateStatus($order, 'delivered');
    }

    public function test_rate_order(): void
    {
        $order = FoodOrder::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'customer_id' => $this->customer->id,
            'status' => 'delivered',
            'rating' => null,
            'actual_delivery_at' => now(),
        ]);

        $result = $this->service->rateOrder($order, 5, 'Great food!');

        $this->assertEquals(5, $result->rating);
        $this->assertEquals('Great food!', $result->rating_comment);
    }

    public function test_rate_order_fails_if_not_delivered(): void
    {
        $order = FoodOrder::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'customer_id' => $this->customer->id,
            'status' => 'pending',
        ]);

        $this->expectException(\RuntimeException::class);

        $this->service->rateOrder($order, 5);
    }
}
