<?php

namespace Tests\Feature;

use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Models\RestaurantCategory;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class FoodAdminTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    private User $admin;

    private Restaurant $restaurant;

    private RestaurantCategory $category;

    private MenuItem $menuItem;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'rider', 'guard_name' => 'web']);
        Role::create(['name' => 'admin', 'guard_name' => 'web']);

        $this->tenant = Tenant::factory()->create();
        $this->admin = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->admin->assignRole('admin');

        $this->restaurant = Restaurant::factory()->create([
            'tenant_id' => $this->tenant->id,
        ]);

        $this->category = RestaurantCategory::factory()->create([
            'restaurant_id' => $this->restaurant->id,
        ]);

        $this->menuItem = MenuItem::factory()->create([
            'restaurant_id' => $this->restaurant->id,
            'category_id' => $this->category->id,
            'price' => 45,
        ]);
    }

    public function test_admin_can_list_restaurants(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->getJson('/api/v1/admin/food/restaurants');

        $response->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_admin_can_create_restaurant(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson('/api/v1/admin/food/restaurants', [
            'name' => 'New Restaurant',
            'slug' => 'new-restaurant',
            'address' => '456 Test Ave',
            'latitude' => -23.9500,
            'longitude' => 29.4800,
        ]);

        $response->assertCreated()
            ->assertJsonPath('name', 'New Restaurant');
    }

    public function test_admin_can_update_restaurant(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->putJson("/api/v1/admin/food/restaurants/{$this->restaurant->id}", [
            'name' => 'Updated Restaurant',
        ]);

        $response->assertOk()
            ->assertJsonPath('name', 'Updated Restaurant');
    }

    public function test_admin_can_create_category(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson("/api/v1/admin/food/restaurants/{$this->restaurant->id}/categories", [
            'name' => 'Beverages',
        ]);

        $response->assertCreated()
            ->assertJsonPath('name', 'Beverages');
    }

    public function test_admin_can_create_menu_item(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson("/api/v1/admin/food/restaurants/{$this->restaurant->id}/menu-items", [
            'name' => 'Burger',
            'price' => 65,
            'category_id' => $this->category->id,
        ]);

        $response->assertCreated()
            ->assertJsonPath('name', 'Burger');
    }

    public function test_admin_can_update_menu_item(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->putJson("/api/v1/admin/food/menu-items/{$this->menuItem->id}", [
            'name' => 'Updated Item',
            'price' => 55,
        ]);

        $response->assertOk()
            ->assertJsonPath('name', 'Updated Item');
    }

    public function test_admin_can_delete_menu_item(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->deleteJson("/api/v1/admin/food/menu-items/{$this->menuItem->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('menu_items', ['id' => $this->menuItem->id]);
    }

    public function test_non_admin_cannot_access_food_admin(): void
    {
        $rider = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->getJson('/api/v1/admin/food/restaurants');

        $response->assertStatus(403);
    }

    public function test_unauthenticated_cannot_access_food_admin(): void
    {
        $response = $this->getJson('/api/v1/admin/food/restaurants');

        $response->assertStatus(401);
    }
}
