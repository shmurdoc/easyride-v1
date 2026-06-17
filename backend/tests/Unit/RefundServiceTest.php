<?php

namespace Tests\Unit;

use App\Models\Payment;
use App\Models\User;
use App\Services\Payment\RefundService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RefundServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_request_refund_creates_record(): void
    {
        $payment = Payment::factory()->create(['amount' => 100]);
        $service = app(RefundService::class);

        $refund = $service->requestRefund($payment, 'Duplicate charge');

        $this->assertNotNull($refund);
        $this->assertEquals('pending', $refund->status);
        $this->assertEquals(100, $refund->amount);
    }

    public function test_reject_refund_updates_status(): void
    {
        $payment = Payment::factory()->create(['amount' => 100]);
        $admin = User::factory()->create();
        $service = app(RefundService::class);
        $refund = $service->requestRefund($payment, 'Test reason');

        $service->rejectRefund($refund, $admin->id, 'Not eligible');

        $this->assertEquals('rejected', $refund->fresh()->status);
    }
}
