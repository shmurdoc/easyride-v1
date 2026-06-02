<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class ApiRateLimiterMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $key = $this->resolveRequestSignature($request);

        if (RateLimiter::tooManyAttempts('api:'.$key, 60)) {
            $retryAfter = RateLimiter::availableIn('api:'.$key);

            return response()->json([
                'error' => 'Too many requests',
                'retry_after' => $retryAfter,
            ], 429)->withHeaders([
                'Retry-After' => $retryAfter,
                'X-RateLimit-Limit' => 60,
                'X-RateLimit-Remaining' => 0,
            ]);
        }

        RateLimiter::hit('api:'.$key, 60);

        $response = $next($request);

        return $response->withHeaders([
            'X-RateLimit-Limit' => 60,
            'X-RateLimit-Remaining' => RateLimiter::remaining('api:'.$key, 60),
        ]);
    }

    protected function resolveRequestSignature(Request $request): string
    {
        return $request->user()?->id ?? $request->ip();
    }
}
