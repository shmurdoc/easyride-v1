<?php

namespace Tests\Unit;

use App\Models\PromoCode;
use App\Services\PromoCodeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PromoCodeServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_validate_code_throws_for_invalid_code(): void
    {
        $this->expectException(\RuntimeException::class);
        $service = app(PromoCodeService::class);
        $service->validateCode('INVALID');
    }

    public function test_apply_discount_flat_returns_correct_amount(): void
    {
        $promo = PromoCode::factory()->create([
            'type' => 'fixed',
            'value' => 25,
            'is_active' => true,
        ]);

        $service = app(PromoCodeService::class);
        $result = $service->applyDiscount($promo, 100);

        $this->assertEquals(25, $result['discount']);
        $this->assertEquals('fixed', $result['type']);
    }

    public function test_apply_discount_percentage_returns_correct_amount(): void
    {
        $promo = PromoCode::factory()->create([
            'type' => 'percentage',
            'value' => 10,
            'max_discount' => 50,
            'is_active' => true,
        ]);

        $service = app(PromoCodeService::class);
        $result = $service->applyDiscount($promo, 200);

        $this->assertEquals(20, $result['discount']);
    }
}
