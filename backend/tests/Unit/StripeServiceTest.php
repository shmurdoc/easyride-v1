<?php

namespace Tests\Unit;

use App\Services\StripeService;
use Stripe\StripeClient;
use Tests\TestCase;

class StripeServiceTest extends TestCase
{
    public function test_throws_when_stripe_not_configured(): void
    {
        config(['services.stripe.secret_key' => null]);

        $service = new StripeService;

        $reflection = new \ReflectionClass($service);
        $method = $reflection->getMethod('getStripe');
        $method->setAccessible(true);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Stripe is not configured.');

        $method->invoke($service);
    }

    public function test_create_payment_intent_returns_client_secret(): void
    {
        $mockIntent = (object) [
            'client_secret' => 'pi_fake_secret_123',
            'id' => 'pi_fake_123',
        ];

        $mockPaymentIntents = \Mockery::mock();
        $mockPaymentIntents->shouldReceive('create')->once()->andReturn($mockIntent);

        $mockStripe = \Mockery::mock(StripeClient::class);
        $mockStripe->paymentIntents = $mockPaymentIntents;

        $service = \Mockery::mock(StripeService::class)->makePartial()->shouldAllowMockingProtectedMethods();
        $service->shouldReceive('getStripe')->andReturn($mockStripe);

        $result = $service->createPaymentIntent(100.00, 'zar');

        $this->assertArrayHasKey('client_secret', $result);
        $this->assertArrayHasKey('id', $result);
        $this->assertEquals('pi_fake_123', $result['id']);
    }

    public function test_confirm_payment_returns_status(): void
    {
        $mockIntent = (object) [
            'id' => 'pi_fake_123',
            'status' => 'succeeded',
            'amount' => 5000,
        ];

        $mockPaymentIntents = \Mockery::mock();
        $mockPaymentIntents->shouldReceive('retrieve')->once()->with('pi_fake_123')->andReturn($mockIntent);

        $mockStripe = \Mockery::mock(StripeClient::class);
        $mockStripe->paymentIntents = $mockPaymentIntents;

        $service = \Mockery::mock(StripeService::class)->makePartial()->shouldAllowMockingProtectedMethods();
        $service->shouldReceive('getStripe')->andReturn($mockStripe);

        $result = $service->confirmPayment('pi_fake_123');

        $this->assertArrayHasKey('status', $result);
        $this->assertArrayHasKey('id', $result);
        $this->assertEquals('succeeded', $result['status']);
        $this->assertEquals(50.0, $result['amount']);
    }

    public function test_refund_payment(): void
    {
        $mockRefund = (object) [
            'id' => 're_fake_123',
            'status' => 'succeeded',
            'amount' => 3000,
        ];

        $mockRefunds = \Mockery::mock();
        $mockRefunds->shouldReceive('create')->once()->andReturn($mockRefund);

        $mockStripe = \Mockery::mock(StripeClient::class);
        $mockStripe->refunds = $mockRefunds;

        $service = \Mockery::mock(StripeService::class)->makePartial()->shouldAllowMockingProtectedMethods();
        $service->shouldReceive('getStripe')->andReturn($mockStripe);

        $result = $service->refundPayment('pi_fake_123');

        $this->assertArrayHasKey('status', $result);
        $this->assertArrayHasKey('id', $result);
        $this->assertEquals('re_fake_123', $result['id']);
    }

    public function test_partial_refund(): void
    {
        $mockRefund = (object) [
            'id' => 're_fake_456',
            'status' => 'succeeded',
            'amount' => 2500,
        ];

        $mockRefunds = \Mockery::mock();
        $mockRefunds->shouldReceive('create')->once()->with(\Mockery::on(function ($params) {
            return $params['payment_intent'] === 'pi_fake_123' && $params['amount'] === 2500;
        }))->andReturn($mockRefund);

        $mockStripe = \Mockery::mock(StripeClient::class);
        $mockStripe->refunds = $mockRefunds;

        $service = \Mockery::mock(StripeService::class)->makePartial()->shouldAllowMockingProtectedMethods();
        $service->shouldReceive('getStripe')->andReturn($mockStripe);

        $result = $service->refundPayment('pi_fake_123', 25.00);

        $this->assertEquals(25.0, $result['amount']);
    }

    protected function tearDown(): void
    {
        \Mockery::close();
        parent::tearDown();
    }
}
