<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Consent;

use App\Http\Requests\Api\V1\ApiFormRequest;

class ConsentGrantRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'consent_type' => 'required|string|in:terms_of_service,privacy_policy,location_tracking,marketing,data_sharing',
            'consent_version' => 'required|string',
        ];
    }
}
