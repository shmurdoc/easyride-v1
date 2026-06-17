<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Payment;

use App\Http\Requests\Api\V1\ApiFormRequest;

class OzowWebhookRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'TransactionId' => 'nullable|string',
            'TransactionReference' => 'nullable|string',
            'Amount' => 'nullable|string',
            'CurrencyCode' => 'nullable|string',
            'Status' => 'nullable|string',
            'SiteCode' => 'nullable|string',
            'Hash' => 'nullable|string',
        ];
    }
}
