<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Wallet;

use App\Http\Requests\Api\V1\ApiFormRequest;

class WalletWithdrawRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'amount' => 'required|numeric|min:10|max:50000',
            'bank_account' => 'required|string',
            'bank_code' => 'required|string',
            'bank_name' => 'required|string',
        ];
    }
}
