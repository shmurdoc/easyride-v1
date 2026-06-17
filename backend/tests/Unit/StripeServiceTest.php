<?php

namespace Tests\Unit;

use App\Services\StripeService;
use Tests\TestCase;

class StripeServiceTest extends TestCase
{
    private StripeService $service;

    protected function setUp(): void
    {
        parent::setUp();

        if (empty(config('services.stripe.secret_key'))) {
            $this->markTestSkipped('Stripe secret key not configured.');
        }

        $this->service = $this->app->make(StripeService::class);
    }

    public function test_create_payment_intent_returns_client_secret(): void
    {
        $result = $this->service->createPaymentIntent(100.00, 'zar');

        $this->assertArrayHasKey('client_secret', $result);
        $this->assertArrayHasKey('id', $result);
        $this->assertStringContainsString('pi_', $result['id']);
    }

    public function test_confirm_payment_returns_status(): void
    {
        $intent = $this->service->createPaymentIntent(50.00, 'zar');

        $result = $this->service->confirmPayment($intent['id']);

        $this->assertArrayHasKey('status', $result);
        $this->assertArrayHasKey('id', $result);
    }

    public function test_refund_payment(): void
    {
        $intent = $this->service->createPaymentIntent(30.00, 'zar');

        $result = $this->service->refundPayment($intent['id']);

        $this->assertArrayHasKey('status', $result);
        $this->assertArrayHasKey('id', $result);
    }

    public function test_partial_refund(): void
    {
        $intent = $this->service->createPaymentIntent(100.00, 'zar');

        $result = $this->service->refundPayment($intent['id'], 25.00);

        $this->assertArrayHasKey('status', $result);
        $this->assertEquals(25.0, $result['amount']);
    }
}
