<?php

namespace App\Services\Payment;

use App\Events\PaymentFailed;
use App\Events\PaymentSucceeded;
use App\Models\Payment;

class OzowService
{
    protected array $config;

    public function __construct()
    {
        $this->config = config('services.ozow');
    }

    public function createPaymentRequest(float $amount, string $transactionReference, array $customer = []): array
    {
        $siteCode = $this->config['site_code'];
        $currency = $this->config['currency_code'] ?? 'ZAR';
        $country = $this->config['country_code'] ?? 'ZA';

        $hash = hash_hmac('sha256',
            $siteCode.number_format($amount, 2, '.', '').$currency.$country.$transactionReference,
            $this->config['api_key']
        );

        return [
            'site_code' => $siteCode,
            'amount' => $amount,
            'currency' => $currency,
            'country_code' => $country,
            'transaction_reference' => $transactionReference,
            'hash' => $hash,
            'is_test' => $this->config['sandbox'] !== false,
            'url' => $this->config['sandbox']
                ? 'https://sandbox.ozow.com'
                : 'https://pay.ozow.com',
        ];
    }

    public function verifyWebhook(array $payload, string $signature): bool
    {
        $expected = hash_hmac('sha256',
            $payload['SiteCode'].$payload['Amount'].$payload['CurrencyCode'].$payload['TransactionReference'],
            $this->config['api_key']
        );

        return hash_equals($expected, $signature);
    }

    public function processWebhook(array $payload): ?Payment
    {
        $payment = Payment::where('gateway_reference', $payload['TransactionReference'])->first();
        if (! $payment) {
            return null;
        }

        $status = match ($payload['Status'] ?? '') {
            'Complete' => 'completed',
            'Cancelled' => 'cancelled',
            'Error' => 'failed',
            'Pending' => 'pending',
            default => 'pending',
        };

        $payment->update([
            'status' => $status,
            'gateway_response' => json_encode($payload),
        ]);

        if ($status === 'completed') {
            event(new PaymentSucceeded($payment));
        } elseif ($status === 'failed' || $status === 'cancelled') {
            event(new PaymentFailed($payment));
        }

        return $payment;
    }
}
