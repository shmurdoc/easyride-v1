<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminTotpMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->hasAnyRole(['admin', 'super-admin']) && $user->totp_enabled) {
            $code = $request->header('X-Totp-Code');

            if (! $code || ! $user->verifyTotp($code)) {
                return response()->json(['message' => 'TOTP verification required. Provide a valid code in X-Totp-Code header.'], 403);
            }
        }

        return $next($request);
    }
}
