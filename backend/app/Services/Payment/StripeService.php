<?php

namespace App\Services\Payment;

use App\Events\PaymentFailed;
use App\Events\PaymentSucceeded;
use App\Models\Payment;
use Stripe\StripeClient;
use Stripe\Webhook;

class StripeService
{
    protected StripeClient $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret_key'));
    }

    public function createPaymentIntent(float $amount, string $currency = 'zar', array $metadata = []): array
    {
        $intent = $this->stripe->paymentIntents->create([
            'amount' => (int) round($amount * 100),
            'currency' => strtolower($currency),
            'metadata' => $metadata,
            'automatic_payment_methods' => ['enabled' => true],
        ]);

        return ['client_secret' => $intent->client_secret, 'id' => $intent->id];
    }

    public function confirmPayment(string $paymentIntentId): array
    {
        $intent = $this->stripe->paymentIntents->retrieve($paymentIntentId);

        return ['status' => $intent->status, 'payment_intent' => $intent];
    }

    public function handleWebhook(string $payload, string $sigHeader): array
    {
        $event = $this->constructEvent($payload, $sigHeader);

        return match ($event->type) {
            'payment_intent.succeeded' => $this->handlePaymentSucceeded($event->data->object),
            'payment_intent.payment_failed' => $this->handlePaymentFailed($event->data->object),
            'charge.refunded' => $this->handleRefunded($event->data->object),
            default => ['handled' => false, 'type' => $event->type],
        };
    }

    protected function handlePaymentSucceeded($intent): array
    {
        $payment = Payment::where('gateway_reference', $intent->id)->first();
        if ($payment && $payment->status !== 'completed') {
            $payment->update(['status' => 'completed', 'gateway_response' => json_encode($intent)]);
            event(new PaymentSucceeded($payment));
        }

        return ['handled' => true, 'status' => 'completed'];
    }

    protected function handlePaymentFailed($intent): array
    {
        $payment = Payment::where('gateway_reference', $intent->id)->first();
        if ($payment) {
            $payment->update(['status' => 'failed', 'gateway_response' => json_encode($intent)]);
            event(new PaymentFailed($payment));
        }

        return ['handled' => true, 'status' => 'failed'];
    }

    protected function handleRefunded($charge): array
    {
        $payment = Payment::where('gateway_reference', $charge->payment_intent)->first();
        if ($payment) {
            $payment->update(['status' => 'refunded', 'gateway_response' => json_encode($charge)]);
        }

        return ['handled' => true, 'status' => 'refunded'];
    }

    protected function constructEvent(string $payload, string $sigHeader): mixed
    {
        return Webhook::constructEvent(
            $payload, $sigHeader, config('services.stripe.webhook_secret')
        );
    }

    public function refund(string $paymentIntentId, ?int $amount = null): array
    {
        $params = ['payment_intent' => $paymentIntentId];
        if ($amount) {
            $params['amount'] = $amount;
        }
        $refund = $this->stripe->refunds->create($params);

        return ['id' => $refund->id, 'status' => $refund->status];
    }
}
