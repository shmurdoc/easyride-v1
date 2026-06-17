<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Incident;

use App\Http\Requests\Api\V1\ApiFormRequest;

class IncidentResolveRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'resolution' => 'required|string|max:2000',
            'status' => 'required|string|in:resolved,closed',
        ];
    }
}
