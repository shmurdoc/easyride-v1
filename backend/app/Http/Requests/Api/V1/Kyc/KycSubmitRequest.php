<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Kyc;

use App\Http\Requests\Api\V1\ApiFormRequest;

class KycSubmitRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'verification_type' => 'required|string|in:identity,license,vehicle',
            'document_type' => 'required|string|in:passport,id_card,drivers_license',
            'document_number' => 'required|string',
            'document_front' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'document_back' => 'required_if:verification_type,identity|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ];
    }
}
