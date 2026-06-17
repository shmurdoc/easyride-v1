<?php

namespace App\Services\Notification;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    public function send(string $to, string $message): bool
    {
        $rateKey = "sms_rate:{$to}";
        $count = (int) Cache::get($rateKey, 0);
        if ($count >= 5) {
            Log::warning('SMS rate limit exceeded', ['to' => $to]);

            return false;
        }
        Cache::put($rateKey, $count + 1, 3600);

        try {
            $sid = config('services.twilio.sid');
            $token = config('services.twilio.auth_token');
            $from = config('services.twilio.from_number');

            if (! $sid || ! $token) {
                Log::info('SMS not sent (Twilio not configured)', ['to' => $to]);

                return false;
            }

            $response = Http::withBasicAuth($sid, $token)
                ->asForm()
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json", [
                    'From' => $from,
                    'To' => $to,
                    'Body' => $message,
                ]);

            if ($response->successful()) {
                Log::info('SMS sent', ['to' => $to]);

                return true;
            }

            Log::warning('SMS failed', ['to' => $to, 'error' => $response->body()]);

            return false;
        } catch (\Exception $e) {
            Log::error('SMS exception', ['to' => $to, 'error' => $e->getMessage()]);

            return false;
        }
    }
}
