<?php

namespace Tests\Unit\Payment;

use App\Events\PaymentFailed;
use App\Events\PaymentSucceeded;
use App\Models\Payment;
use App\Services\Payment\OzowService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class OzowServiceTest extends TestCase
{
    use RefreshDatabase;

    private OzowService $service;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.ozow' => [
            'site_code' => 'SITE001',
            'api_key' => 'ozow_api_key_123',
            'currency_code' => 'ZAR',
            'country_code' => 'ZA',
            'sandbox' => true,
        ]]);
        $this->service = app(OzowService::class);
    }

    public function test_create_payment_request_builds_correct_structure_with_hash(): void
    {
        $result = $this->service->createPaymentRequest(250.50, 'TXN123', ['email' => 'test@example.com']);
        $expectedHash = hash_hmac('sha256', 'SITE001250.50ZARZATXN123', 'ozow_api_key_123');

        $this->assertEquals('SITE001', $result['site_code']);
        $this->assertEquals(250.50, $result['amount']);
        $this->assertEquals('ZAR', $result['currency']);
        $this->assertEquals('ZA', $result['country_code']);
        $this->assertEquals('TXN123', $result['transaction_reference']);
        $this->assertEquals($expectedHash, $result['hash']);
        $this->assertTrue($result['is_test']);
        $this->assertStringContainsString('sandbox.ozow.com', $result['url']);
    }

    public function test_create_payment_request_uses_production_url_when_not_sandbox(): void
    {
        config(['services.ozow.sandbox' => false]);
        $service = app(OzowService::class);
        $result = $service->createPaymentRequest(100.00, 'TXN456');

        $this->assertStringContainsString('pay.ozow.com', $result['url']);
        $this->assertFalse($result['is_test']);
    }

    public function test_verify_webhook_validates_correct_signature(): void
    {
        $payload = [
            'SiteCode' => 'SITE001',
            'Amount' => '250.50',
            'CurrencyCode' => 'ZAR',
            'TransactionReference' => 'TXN123',
        ];

        $signature = hash_hmac('sha256', 'SITE001250.50ZARTXN123', 'ozow_api_key_123');

        $this->assertTrue($this->service->verifyWebhook($payload, $signature));
    }

    public function test_verify_webhook_rejects_invalid_signature(): void
    {
        $payload = [
            'SiteCode' => 'SITE001',
            'Amount' => '250.50',
            'CurrencyCode' => 'ZAR',
            'TransactionReference' => 'TXN123',
        ];

        $this->assertFalse($this->service->verifyWebhook($payload, 'invalid_signature'));
    }

    public function test_process_webhook_updates_payment_and_dispatches_succeeded_event(): void
    {
        Event::fake();

        $payment = Payment::factory()->create([
            'gateway_reference' => 'TXN123',
            'status' => 'pending',
        ]);

        $payload = [
            'TransactionReference' => 'TXN123',
            'Status' => 'Complete',
            'Amount' => '250.50',
        ];

        $result = $this->service->processWebhook($payload);

        $this->assertNotNull($result);
        $this->assertEquals('completed', $result->fresh()->status);
        Event::assertDispatched(PaymentSucceeded::class, function ($e) use ($payment) {
            return $e->payment->id === $payment->id;
        });
    }

    public function test_process_webhook_updates_payment_and_dispatches_failed_event(): void
    {
        Event::fake();

        $payment = Payment::factory()->create([
            'gateway_reference' => 'TXN456',
            'status' => 'pending',
        ]);

        $payload = [
            'TransactionReference' => 'TXN456',
            'Status' => 'Error',
            'Amount' => '100.00',
        ];

        $result = $this->service->processWebhook($payload);

        $this->assertNotNull($result);
        $this->assertEquals('failed', $result->fresh()->status);
        Event::assertDispatched(PaymentFailed::class, function ($e) use ($payment) {
            return $e->payment->id === $payment->id;
        });
    }

    public function test_process_webhook_dispatches_failed_event_for_cancelled_status(): void
    {
        Event::fake();

        $payment = Payment::factory()->create([
            'gateway_reference' => 'TXN789',
            'status' => 'pending',
        ]);

        $payload = [
            'TransactionReference' => 'TXN789',
            'Status' => 'Cancelled',
            'Amount' => '50.00',
        ];

        $result = $this->service->processWebhook($payload);

        $this->assertNotNull($result);
        $this->assertEquals('cancelled', $result->fresh()->status);
        Event::assertDispatched(PaymentFailed::class, function ($e) use ($payment) {
            return $e->payment->id === $payment->id;
        });
    }

    public function test_process_webhook_returns_null_for_unknown_payment(): void
    {
        $payload = [
            'TransactionReference' => 'NONEXISTENT',
            'Status' => 'Complete',
        ];

        $result = $this->service->processWebhook($payload);

        $this->assertNull($result);
    }

    protected function tearDown(): void
    {
        \Mockery::close();
        parent::tearDown();
    }
}
