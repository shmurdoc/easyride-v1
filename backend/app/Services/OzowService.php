<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OzowService
{
    private const SANDBOX_URL = 'https://api.ozow.com';
    private const PRODUCTION_URL = 'https://api.ozow.com';

    public function __construct(
        private readonly string $siteCode,
        private readonly string $apiKey,
        private readonly string $privateKey,
        private readonly bool $sandbox,
        private readonly string $notifyUrl,
        private readonly string $returnUrl,
        private readonly string $cancelUrl,
    ) {}

    public function createPayment(array $data): array
    {
        $transactionReference = $data['transaction_reference'] ?? uniqid('OZOW-', true);
        $amount = number_format((float) $data['amount'], 2, '.', '');
        $hash = $this->generateHash($transactionReference, $amount, $data['site_reference'] ?? $this->siteCode);

        $payload = [
            'SiteCode' => $this->siteCode,
            'CountryCode' => 'ZA',
            'CurrencyCode' => 'ZAR',
            'Amount' => $amount,
            'TransactionReference' => $transactionReference,
            'BankReference' => $data['bank_reference'] ?? 'EasyRyde',
            'Customer' => [
                'FullName' => $data['customer']['name'] ?? '',
                'EmailAddress' => $data['customer']['email'] ?? '',
                'PhoneNumber' => $data['customer']['phone'] ?? '',
            ],
            'NotifyUrl' => $this->notifyUrl,
            'ReturnUrl' => $this->returnUrl,
            'CancelUrl' => $this->cancelUrl,
            'IsTest' => $this->sandbox,
            'Hash' => $hash,
        ];

        try {
            $response = Http::withHeaders([
                'ApiKey' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post($this->getBaseUrl() . '/api/transaction/create', $payload);

            if ($response->successful()) {
                $body = $response->json();
                return [
                    'success' => true,
                    'url' => $body['Url'] ?? null,
                    'transaction_reference' => $transactionReference,
                    'payment_reference' => $body['PaymentReference'] ?? null,
                ];
            }

            Log::error('Ozow create payment failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [
                'success' => false,
                'error' => 'Payment gateway error: ' . $response->body(),
            ];
        } catch (\Exception $e) {
            Log::error('Ozow create payment exception', ['error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function verifyWebhook(Request $request): bool
    {
        $data = $request->all();

        $transactionReference = $data['TransactionReference'] ?? $data['transactionReference'] ?? '';
        $amount = $data['Amount'] ?? $data['amount'] ?? '';
        $status = $data['Status'] ?? $data['status'] ?? '';
        $currencyCode = $data['CurrencyCode'] ?? 'ZAR';
        $hash = $data['HashCode'] ?? $data['hash'] ?? '';

        $expectedHash = $this->generateWebhookHash(
            $transactionReference,
            (string) $amount,
            $currencyCode,
            $status,
        );

        if ($hash !== $expectedHash) {
            Log::warning('Ozow webhook: Invalid hash', [
                'expected' => $expectedHash,
                'received' => $hash,
            ]);
            return false;
        }

        return true;
    }

    private function generateHash(string $transactionReference, string $amount, string $siteReference): string
    {
        $hashString = strtolower($this->siteCode . $this->privateKey . $transactionReference . $amount . $siteReference);
        return strtolower(hash('sha512', $hashString));
    }

    private function generateWebhookHash(
        string $transactionReference,
        string $amount,
        string $currencyCode,
        string $status,
    ): string {
        $hashString = $this->privateKey . $transactionReference . $amount . $currencyCode . $status;
        return strtolower(hash('sha512', $hashString));
    }

    public function getBaseUrl(): string
    {
        return $this->sandbox ? self::SANDBOX_URL : self::PRODUCTION_URL;
    }
}
