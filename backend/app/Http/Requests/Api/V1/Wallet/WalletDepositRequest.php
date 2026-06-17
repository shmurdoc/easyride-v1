<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Wallet;

use App\Http\Requests\Api\V1\ApiFormRequest;

class WalletDepositRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'amount' => 'required|numeric|min:1|max:100000',
            'payment_method' => 'required|string|in:payfast,ozow,stripe',
        ];
    }
}
