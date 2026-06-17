<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\Request;
use Stripe\Exception\SignatureVerificationException;
use Stripe\StripeClient;
use Stripe\Webhook;

class StripeService
{
    private readonly ?StripeClient $stripe;

    public function __construct()
    {
        require_once dirname(__DIR__, 2).'/vendor/stripe/stripe-php/init.php';
        $secretKey = config('services.stripe.secret_key');
        $this->stripe = $secretKey ? new StripeClient($secretKey) : null;
    }

    private function getStripe(): StripeClient
    {
        if (! $this->stripe) {
            throw new \RuntimeException('Stripe is not configured.');
        }

        return $this->stripe;
    }

    public function createPaymentIntent(float $amount, string $currency = 'zar'): array
    {
        $intent = $this->getStripe()->paymentIntents->create([
            'amount' => (int) round($amount * 100),
            'currency' => strtolower($currency),
        ]);

        return [
            'client_secret' => $intent->client_secret,
            'id' => $intent->id,
        ];
    }

    public function confirmPayment(string $paymentIntentId): array
    {
        $intent = $this->getStripe()->paymentIntents->retrieve($paymentIntentId);

        return [
            'id' => $intent->id,
            'status' => $intent->status,
            'amount' => $intent->amount / 100,
        ];
    }

    public function createCharge(float $amount, string $paymentMethodId, string $currency = 'zar'): array
    {
        $intent = $this->getStripe()->paymentIntents->create([
            'amount' => (int) round($amount * 100),
            'currency' => strtolower($currency),
            'payment_method' => $paymentMethodId,
            'confirm' => true,
            'return_url' => 'https://easyryde.co.za/payments/stripe/return',
        ]);

        return [
            'id' => $intent->id,
            'status' => $intent->status,
            'client_secret' => $intent->client_secret,
        ];
    }

    public function refundPayment(string $paymentIntentId, ?float $amount = null): array
    {
        $params = ['payment_intent' => $paymentIntentId];

        if ($amount !== null) {
            $params['amount'] = (int) round($amount * 100);
        }

        $refund = $this->getStripe()->refunds->create($params);

        return [
            'id' => $refund->id,
            'status' => $refund->status,
            'amount' => $refund->amount / 100,
        ];
    }

    public function handleWebhook(Request $request): array
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        try {
            $event = Webhook::constructEvent(
                $payload,
                $sigHeader,
                config('services.stripe.webhook_secret')
            );
        } catch (\UnexpectedValueException) {
            return ['error' => 'Invalid payload'];
        } catch (SignatureVerificationException) {
            return ['error' => 'Invalid signature'];
        }

        return [
            'type' => $event->type,
            'data' => $event->data->object,
        ];
    }
}
