<?php

declare(strict_types=1);

namespace App\Exceptions;

use RuntimeException;

class PaymentAlreadyHeldException extends RuntimeException
{
    public function render($request)
    {
        if ($request->expectsJson()) {
            return response()->json([
                'message' => $this->getMessage(),
            ], 409);
        }

        return back()->withErrors(['payment' => $this->getMessage()]);
    }
}
