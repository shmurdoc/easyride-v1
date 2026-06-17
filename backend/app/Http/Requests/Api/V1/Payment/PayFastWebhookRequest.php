<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Payment;

use App\Http\Requests\Api\V1\ApiFormRequest;

class PayFastWebhookRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pf_payment_id' => 'nullable|string',
            'amount_gross' => 'nullable|string',
            'amount_fees' => 'nullable|string',
            'amount_net' => 'nullable|string',
            'payment_status' => 'nullable|string',
            'item_name' => 'nullable|string',
            'item_description' => 'nullable|string',
            'merchant_id' => 'nullable|string',
            'merchant_key' => 'nullable|string',
            'signature' => 'nullable|string',
            'custom_int1' => 'nullable|string',
            'custom_int2' => 'nullable|string',
            'custom_int3' => 'nullable|string',
            'custom_int4' => 'nullable|string',
            'custom_int5' => 'nullable|string',
        ];
    }
}
