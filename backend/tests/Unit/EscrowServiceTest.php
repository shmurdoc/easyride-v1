<?php

namespace Tests\Unit;

use App\Models\Payment;
use App\Services\Payment\EscrowService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EscrowServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_hold_payment_updates_status(): void
    {
        $payment = Payment::factory()->create(['status' => 'pending']);
        $service = app(EscrowService::class);

        $result = $service->holdPayment($payment);

        if ($result) {
            $payment = $payment->fresh();
        }

        $this->assertEquals('held', $payment->fresh()->status);
        $this->assertNotNull($payment->fresh()->held_until);
    }

    public function test_dipute_payment_sets_disputed_status(): void
    {
        $payment = Payment::factory()->create(['status' => 'held']);
        $service = app(EscrowService::class);

        $service->disputePayment($payment, 'Customer complaint');

        $this->assertEquals('disputed', $payment->fresh()->status);
        $this->assertTrue($payment->fresh()->dispute_hold);
    }
}
