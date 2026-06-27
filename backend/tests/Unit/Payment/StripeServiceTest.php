<?php

namespace Tests\Unit\Payment;

use App\Events\PaymentFailed;
use App\Events\PaymentSucceeded;
use App\Models\Payment;
use App\Services\Payment\StripeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;
use Stripe\StripeClient;
use Tests\TestCase;

#[RunTestsInSeparateProcesses]
class StripeServiceTest extends TestCase
{
    use RefreshDatabase;

    private StripeService $service;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.stripe.secret_key' => 'sk_test_xxx']);
        config(['services.stripe.webhook_secret' => 'whsec_xxx']);
        $this->service = app(StripeService::class);
    }

    public function test_create_payment_intent_creates_intent_with_correct_params(): void
    {
        $mockIntent = (object) [
            'client_secret' => 'pi_secret_123',
            'id' => 'pi_123',
        ];

        $mockPaymentIntents = \Mockery::mock();
        $mockPaymentIntents->shouldReceive('create')
            ->once()
            ->with(\Mockery::on(function ($params) {
                return $params['amount'] === 15000
                    && $params['currency'] === 'zar'
                    && $params['metadata']['ride_id'] === 'ride_1';
            }))
            ->andReturn($mockIntent);

        $mockStripe = \Mockery::mock(StripeClient::class);
        $mockStripe->paymentIntents = $mockPaymentIntents;

        $this->setStripeProperty($mockStripe);

        $result = $this->service->createPaymentIntent(150.00, 'zar', ['ride_id' => 'ride_1']);

        $this->assertEquals(['client_secret' => 'pi_secret_123', 'id' => 'pi_123'], $result);
    }

    public function test_confirm_payment_retrieves_intent(): void
    {
        $mockIntent = (object) [
            'id' => 'pi_123',
            'status' => 'succeeded',
            'amount' => 10000,
        ];

        $mockPaymentIntents = \Mockery::mock();
        $mockPaymentIntents->shouldReceive('retrieve')->once()->with('pi_123')->andReturn($mockIntent);

        $mockStripe = \Mockery::mock(StripeClient::class);
        $mockStripe->paymentIntents = $mockPaymentIntents;

        $this->setStripeProperty($mockStripe);

        $result = $this->service->confirmPayment('pi_123');

        $this->assertEquals('succeeded', $result['status']);
        $this->assertSame($mockIntent, $result['payment_intent']);
    }

    public function test_handle_webhook_routes_succeeded_event(): void
    {
        $mockObject = (object) ['id' => 'pi_123'];

        $service = \Mockery::mock(StripeService::class)->makePartial()->shouldAllowMockingProtectedMethods();
        $service->shouldReceive('constructEvent')->once()->andReturn(
            (object) ['type' => 'payment_intent.succeeded', 'data' => (object) ['object' => $mockObject]]
        );
        $service->shouldReceive('handlePaymentSucceeded')->once()->with($mockObject)->andReturn(['handled' => true, 'status' => 'completed']);

        $result = $service->handleWebhook('{}', 'sig_xxx');

        $this->assertEquals(['handled' => true, 'status' => 'completed'], $result);
    }

    public function test_handle_webhook_routes_failed_event(): void
    {
        $mockObject = (object) ['id' => 'pi_123'];

        $service = \Mockery::mock(StripeService::class)->makePartial()->shouldAllowMockingProtectedMethods();
        $service->shouldReceive('constructEvent')->once()->andReturn(
            (object) ['type' => 'payment_intent.payment_failed', 'data' => (object) ['object' => $mockObject]]
        );
        $service->shouldReceive('handlePaymentFailed')->once()->with($mockObject)->andReturn(['handled' => true, 'status' => 'failed']);

        $result = $service->handleWebhook('{}', 'sig_xxx');

        $this->assertEquals(['handled' => true, 'status' => 'failed'], $result);
    }

    public function test_handle_webhook_routes_refunded_event(): void
    {
        $mockObject = (object) ['id' => 'ch_123', 'payment_intent' => 'pi_123'];

        $service = \Mockery::mock(StripeService::class)->makePartial()->shouldAllowMockingProtectedMethods();
        $service->shouldReceive('constructEvent')->once()->andReturn(
            (object) ['type' => 'charge.refunded', 'data' => (object) ['object' => $mockObject]]
        );
        $service->shouldReceive('handleRefunded')->once()->with($mockObject)->andReturn(['handled' => true, 'status' => 'refunded']);

        $result = $service->handleWebhook('{}', 'sig_xxx');

        $this->assertEquals(['handled' => true, 'status' => 'refunded'], $result);
    }

    public function test_handle_webhook_returns_unknown_for_unhandled_event(): void
    {
        $service = \Mockery::mock(StripeService::class)->makePartial()->shouldAllowMockingProtectedMethods();
        $service->shouldReceive('constructEvent')->once()->andReturn(
            (object) ['type' => 'payment_intent.created', 'data' => (object) ['object' => (object) ['id' => 'pi_123']]]
        );

        $result = $service->handleWebhook('{}', 'sig_xxx');

        $this->assertEquals(['handled' => false, 'type' => 'payment_intent.created'], $result);
    }

    public function test_refund_creates_refund(): void
    {
        $mockRefund = (object) [
            'id' => 're_123',
            'status' => 'succeeded',
        ];

        $mockRefunds = \Mockery::mock();
        $mockRefunds->shouldReceive('create')
            ->once()
            ->with(['payment_intent' => 'pi_123'])
            ->andReturn($mockRefund);

        $mockStripe = \Mockery::mock(StripeClient::class);
        $mockStripe->refunds = $mockRefunds;

        $this->setStripeProperty($mockStripe);

        $result = $this->service->refund('pi_123');

        $this->assertEquals(['id' => 're_123', 'status' => 'succeeded'], $result);
    }

    public function test_refund_with_amount_creates_partial_refund(): void
    {
        $mockRefund = (object) [
            'id' => 're_456',
            'status' => 'succeeded',
        ];

        $mockRefunds = \Mockery::mock();
        $mockRefunds->shouldReceive('create')
            ->once()
            ->with(['payment_intent' => 'pi_123', 'amount' => 2500])
            ->andReturn($mockRefund);

        $mockStripe = \Mockery::mock(StripeClient::class);
        $mockStripe->refunds = $mockRefunds;

        $this->setStripeProperty($mockStripe);

        $result = $this->service->refund('pi_123', 2500);

        $this->assertEquals(['id' => 're_456', 'status' => 'succeeded'], $result);
    }

    public function test_handle_payment_succeeded_updates_payment_and_dispatches_event(): void
    {
        Event::fake();

        $payment = Payment::factory()->create([
            'gateway_reference' => 'pi_123',
            'status' => 'pending',
        ]);

        $intent = (object) ['id' => 'pi_123'];

        $reflection = new \ReflectionMethod(StripeService::class, 'handlePaymentSucceeded');
        $reflection->setAccessible(true);

        $result = $reflection->invoke($this->service, $intent);

        $this->assertEquals(['handled' => true, 'status' => 'completed'], $result);
        $this->assertEquals('completed', $payment->fresh()->status);
        Event::assertDispatched(PaymentSucceeded::class, function ($e) use ($payment) {
            return $e->payment->id === $payment->id;
        });
    }

    public function test_handle_payment_succeeded_skips_already_completed_payment(): void
    {
        Event::fake();

        $payment = Payment::factory()->create([
            'gateway_reference' => 'pi_123',
            'status' => 'completed',
        ]);

        $intent = (object) ['id' => 'pi_123'];

        $reflection = new \ReflectionMethod(StripeService::class, 'handlePaymentSucceeded');
        $reflection->setAccessible(true);

        $result = $reflection->invoke($this->service, $intent);

        $this->assertEquals(['handled' => true, 'status' => 'completed'], $result);
        Event::assertNotDispatched(PaymentSucceeded::class);
    }

    public function test_handle_payment_failed_updates_payment_and_dispatches_event(): void
    {
        Event::fake();

        $payment = Payment::factory()->create([
            'gateway_reference' => 'pi_123',
            'status' => 'pending',
        ]);

        $intent = (object) ['id' => 'pi_123'];

        $reflection = new \ReflectionMethod(StripeService::class, 'handlePaymentFailed');
        $reflection->setAccessible(true);

        $result = $reflection->invoke($this->service, $intent);

        $this->assertEquals(['handled' => true, 'status' => 'failed'], $result);
        $this->assertEquals('failed', $payment->fresh()->status);
        Event::assertDispatched(PaymentFailed::class, function ($e) use ($payment) {
            return $e->payment->id === $payment->id;
        });
    }

    public function test_handle_refunded_updates_payment(): void
    {
        $payment = Payment::factory()->create([
            'gateway_reference' => 'pi_123',
            'status' => 'completed',
        ]);

        $charge = (object) ['payment_intent' => 'pi_123'];

        $reflection = new \ReflectionMethod(StripeService::class, 'handleRefunded');
        $reflection->setAccessible(true);

        $result = $reflection->invoke($this->service, $charge);

        $this->assertEquals(['handled' => true, 'status' => 'refunded'], $result);
        $this->assertEquals('refunded', $payment->fresh()->status);
    }

    private function setStripeProperty(mixed $mockStripe): void
    {
        $reflection = new \ReflectionProperty(StripeService::class, 'stripe');
        $reflection->setAccessible(true);
        $reflection->setValue($this->service, $mockStripe);
    }

    protected function tearDown(): void
    {
        \Mockery::close();
        parent::tearDown();
    }
}
