<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Referral;

use App\Http\Requests\Api\V1\ApiFormRequest;

class ReferralApplyRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'code' => 'required|string',
        ];
    }
}
