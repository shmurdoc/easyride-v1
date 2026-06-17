<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Kyc;

use App\Http\Requests\Api\V1\ApiFormRequest;

class KycRejectRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['admin', 'super-admin']);
    }

    public function rules(): array
    {
        return [
            'reason' => 'required|string|max:500',
        ];
    }
}
