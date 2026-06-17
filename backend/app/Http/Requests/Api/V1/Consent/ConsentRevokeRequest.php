<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Consent;

use App\Http\Requests\Api\V1\ApiFormRequest;

class ConsentRevokeRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'consent_type' => 'required|string|in:location_tracking,marketing,data_sharing',
        ];
    }
}
