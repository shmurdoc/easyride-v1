<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Chat;

use App\Http\Requests\Api\V1\ApiFormRequest;

class ChatSendRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'ride_id' => 'required|string|exists:rides,id',
            'message' => 'required|string|max:1000',
            'message_type' => 'nullable|string|in:text,image,location',
        ];
    }
}
