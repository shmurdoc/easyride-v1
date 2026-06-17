<?php

namespace App\Services\Payment;

use App\Events\PaymentFailed;
use App\Events\PaymentSucceeded;
use App\Models\Payment;

class PayFastService
{
    protected array $config;

    public function __construct()
    {
        $this->config = config('services.payfast');
    }

    public function generatePaymentUrl(float $amount, string $itemName, array $merchantData = []): string
    {
        $data = [
            'merchant_id' => $this->config['merchant_id'],
            'merchant_key' => $this->config['merchant_key'],
            'return_url' => $this->config['return_url'],
            'cancel_url' => $this->config['cancel_url'],
            'notify_url' => $this->config['notify_url'],
            'm_payment_id' => $merchantData['payment_id'] ?? '',
            'amount' => number_format($amount, 2, '.', ''),
            'item_name' => $itemName,
            'custom_int1' => $merchantData['ride_id'] ?? '',
            'custom_int2' => $merchantData['rider_id'] ?? '',
            'custom_int3' => $merchantData['driver_id'] ?? '',
        ];

        $passphrase = $this->config['passphrase'] ?? '';
        $data['signature'] = $this->generateSignature($data, $passphrase);

        $base = $this->config['sandbox']
            ? 'https://sandbox.payfast.co.za/eng/process'
            : 'https://www.payfast.co.za/eng/process';

        return $base.'?'.http_build_query($data);
    }

    public function verifyItn(array $data): bool
    {
        $signature = $data['signature'] ?? '';
        $expectedSig = $this->generateSignature($data, $this->config['passphrase'] ?? '');
        if ($signature !== $expectedSig) {
            return false;
        }

        $payment = Payment::find($data['custom_int1'] ?? '');
        if (! $payment) {
            return false;
        }

        if (($data['payment_status'] ?? '') !== 'COMPLETE') {
            return false;
        }

        return true;
    }

    public function processItn(array $data): Payment
    {
        $payment = Payment::findOrFail($data['custom_int1'] ?? '');
        $payment->update([
            'gateway_reference' => $data['pf_payment_id'] ?? '',
            'gateway_response' => json_encode($data),
            'status' => ($data['payment_status'] ?? '') === 'COMPLETE' ? 'completed' : 'failed',
        ]);

        if ($payment->status === 'completed') {
            event(new PaymentSucceeded($payment));
        } else {
            event(new PaymentFailed($payment));
        }

        return $payment;
    }

    protected function generateSignature(array $data, string $passphrase = ''): string
    {
        unset($data['signature']);

        $pfOutput = '';
        foreach ($data as $key => $val) {
            if ($val !== '') {
                $pfOutput .= $key.'='.urlencode(trim($val)).'&';
            }
        }
        $pfOutput = substr($pfOutput, 0, -1);

        if (! empty($passphrase)) {
            $pfOutput .= '&passphrase='.urlencode($passphrase);
        }

        return md5($pfOutput);
    }
}
