<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Payment;

use App\Http\Requests\Api\V1\ApiFormRequest;

class RefundRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['admin', 'super-admin']);
    }

    public function rules(): array
    {
        return [
            'reason' => 'required|string|in:admin_override,driver_no_show,duplicate_charge,technical_issue',
            'description' => 'nullable|string|max:500',
        ];
    }
}
