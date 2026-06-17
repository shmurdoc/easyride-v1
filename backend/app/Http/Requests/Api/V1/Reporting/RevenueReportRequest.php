<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Reporting;

use App\Http\Requests\Api\V1\ApiFormRequest;

class RevenueReportRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['admin', 'super-admin']);
    }

    public function rules(): array
    {
        return [
            'from' => 'sometimes|date',
            'to' => 'sometimes|date|after_or_equal:from',
            'group_by' => 'sometimes|string|in:day,week,month',
        ];
    }
}
