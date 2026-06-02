<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PayFastService
{
    private const SANDBOX_URL = 'https://sandbox.payfast.co.za/eng/process';
    private const PRODUCTION_URL = 'https://www.payfast.co.za/eng/process';
    private const SANDBOX_ITN_URL = 'https://sandbox.payfast.co.za/eng/query/validate';
    private const PRODUCTION_ITN_URL = 'https://www.payfast.co.za/eng/query/validate';

    public function __construct(
        private readonly string $merchantId,
        private readonly string $merchantKey,
        private readonly string $passphrase,
        private readonly bool $sandbox,
        private readonly string $returnUrl,
        private readonly string $cancelUrl,
        private readonly string $notifyUrl,
    ) {}

    public function generatePaymentForm(array $data): string
    {
        $fields = [
            'merchant_id' => $this->merchantId,
            'merchant_key' => $this->merchantKey,
            'return_url' => $this->returnUrl,
            'cancel_url' => $this->cancelUrl,
            'notify_url' => $this->notifyUrl,
            'name_first' => $data['name_first'] ?? '',
            'name_last' => $data['name_last'] ?? '',
            'email_address' => $data['email'] ?? '',
            'm_payment_id' => (string) $data['payment_id'],
            'amount' => number_format((float) $data['amount'], 2, '.', ''),
            'item_name' => $data['item_name'] ?? 'EasyRyde Payment',
            'item_description' => $data['item_description'] ?? '',
        ];

        $fields['signature'] = $this->generateSignature($fields);

        $html = '<form id="payfast-form" action="' . $this->getBaseUrl() . '" method="post">';
        foreach ($fields as $key => $value) {
            $html .= '<input type="hidden" name="' . $key . '" value="' . htmlspecialchars((string) $value) . '" />';
        }
        $html .= '</form>';
        $html .= '<script>document.getElementById("payfast-form").submit();</script>';

        return $html;
    }

    public function generatePaymentUrl(array $data): string
    {
        $fields = [
            'merchant_id' => $this->merchantId,
            'merchant_key' => $this->merchantKey,
            'return_url' => $this->returnUrl,
            'cancel_url' => $this->cancelUrl,
            'notify_url' => $this->notifyUrl,
            'name_first' => $data['name_first'] ?? '',
            'name_last' => $data['name_last'] ?? '',
            'email_address' => $data['email'] ?? '',
            'm_payment_id' => (string) $data['payment_id'],
            'amount' => number_format((float) $data['amount'], 2, '.', ''),
            'item_name' => $data['item_name'] ?? 'EasyRyde Payment',
            'item_description' => $data['item_description'] ?? '',
        ];

        $fields['signature'] = $this->generateSignature($fields);

        return $this->getBaseUrl() . '?' . http_build_query($fields);
    }

    public function verifyItn(Request $request): bool
    {
        $data = $request->all();

        if (!isset($data['payment_status']) || $data['payment_status'] !== 'COMPLETE') {
            Log::warning('PayFast ITN: Payment not complete', ['status' => $data['payment_status'] ?? 'none']);
            return false;
        }

        $signature = $this->generateSignature($data);
        if (!isset($data['signature']) || $data['signature'] !== $signature) {
            Log::warning('PayFast ITN: Invalid signature');
            return false;
        }

        try {
            $verificationData = $this->buildVerificationData($data);
            $response = Http::timeout(30)->asForm()->post($this->getItnUrl(), $verificationData);

            if ($response->body() === 'VALID') {
                if ((float) $data['amount_gross'] !== (float) $data['amount']) {
                    Log::warning('PayFast ITN: Amount mismatch', [
                        'expected' => $data['amount'],
                        'received' => $data['amount_gross'],
                    ]);
                    return false;
                }

                return true;
            }

            Log::warning('PayFast ITN: Server returned INVALID', ['response' => $response->body()]);
            return false;
        } catch (\Exception $e) {
            Log::error('PayFast ITN: Verification failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    private function generateSignature(array $data): string
    {
        $excludedKeys = ['signature', 'action', 'controller', 'method', '_token'];

        $fields = [];
        foreach ($data as $key => $value) {
            if (in_array($key, $excludedKeys, true)) continue;
            if ($value === '') continue;
            $fields[$key] = $value;
        }

        ksort($fields);

        $parts = [];
        foreach ($fields as $key => $value) {
            $parts[] = $key . '=' . urlencode((string) $value);
        }

        $pfOutput = implode('&', $parts);

        if (!empty($this->passphrase)) {
            $pfOutput .= '&passphrase=' . urlencode($this->passphrase);
        }

        return md5($pfOutput);
    }

    private function buildVerificationData(array $data): array
    {
        $verificationFields = [
            'm_payment_id' => $data['m_payment_id'] ?? '',
            'amount' => $data['amount'] ?? '',
            'item_name' => $data['item_name'] ?? '',
            'item_description' => $data['item_description'] ?? '',
        ];

        $pfOutput = '';
        foreach ($verificationFields as $key => $value) {
            $pfOutput .= $key . '=' . urlencode((string) $value) . '&';
        }

        $pfOutput .= 'passphrase=' . urlencode($this->passphrase);

        return ['pf_output' => $pfOutput];
    }

    public function getBaseUrl(): string
    {
        return $this->sandbox ? self::SANDBOX_URL : self::PRODUCTION_URL;
    }

    public function getItnUrl(): string
    {
        return $this->sandbox ? self::SANDBOX_ITN_URL : self::PRODUCTION_ITN_URL;
    }
}
