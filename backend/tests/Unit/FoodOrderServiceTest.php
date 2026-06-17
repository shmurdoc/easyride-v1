<?php

namespace Tests\Unit;

use App\Models\FoodOrder;
use App\Services\Food\FoodOrderService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FoodOrderServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_update_status_changes_order_status(): void
    {
        $order = FoodOrder::factory()->create(['status' => 'pending']);
        $service = app(FoodOrderService::class);

        $updated = $service->updateStatus($order->id, 'confirmed');

        $this->assertEquals('confirmed', $updated->status);
    }

    public function test_update_status_throws_for_nonexistent_order(): void
    {
        $this->expectException(ModelNotFoundException::class);
        $service = app(FoodOrderService::class);
        $service->updateStatus('00000000-0000-0000-0000-000000000000', 'confirmed');
    }
}
