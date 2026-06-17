<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Sos;

use App\Http\Requests\Api\V1\ApiFormRequest;

class SosResolveRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['admin', 'super-admin']);
    }

    public function rules(): array
    {
        return [
            'resolution' => 'required|string',
        ];
    }
}
