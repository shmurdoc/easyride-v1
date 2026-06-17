<?php

namespace App\Services\Notification;

use App\Models\PushToken;
use App\Models\User;
use Google\Client as GoogleClient;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PushNotificationService
{
    protected ?string $accessToken = null;

    public function send(User $user, string $title, string $body, array $data = []): void
    {
        $tokens = PushToken::where('user_id', $user->id)->where('is_active', true)->get();
        foreach ($tokens as $token) {
            $this->sendToDevice($token->token, $title, $body, $data);
        }
    }

    public function sendToRole(string $role, string $title, string $body, array $data = []): void
    {
        $tokens = PushToken::whereHas('user', fn ($q) => $q->where('role', $role))
            ->where('is_active', true)->get();
        foreach ($tokens as $token) {
            $this->sendToDevice($token->token, $title, $body, $data);
        }
    }

    protected function sendToDevice(string $deviceToken, string $title, string $body, array $data = []): void
    {
        try {
            $projectId = config('services.fcm.project_id');
            $accessToken = $this->getAccessToken();

            $response = Http::withToken($accessToken)
                ->post("https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send", [
                    'message' => [
                        'token' => $deviceToken,
                        'notification' => ['title' => $title, 'body' => $body],
                        'data' => array_merge(['title' => $title, 'body' => $body], $data),
                        'android' => ['priority' => 'high'],
                        'apns' => ['payload' => ['aps' => ['sound' => 'default']]],
                    ],
                ]);

            if ($response->failed()) {
                Log::warning('FCM send failed', ['token' => substr($deviceToken, 0, 10), 'error' => $response->body()]);
                if ($response->status() === 404 || $response->status() === 400) {
                    PushToken::where('token', $deviceToken)->update(['is_active' => false]);
                }
            }
        } catch (\Exception $e) {
            Log::error('FCM exception', ['error' => $e->getMessage()]);
        }
    }

    protected function getAccessToken(): string
    {
        if ($this->accessToken) {
            return $this->accessToken;
        }

        $client = new GoogleClient;
        $client->setAuthConfig(storage_path(config('services.fcm.service_account_path')));
        $client->addScope('https://www.googleapis.com/auth/firebase.messaging');
        $this->accessToken = $client->fetchAccessTokenWithAssertion()['access_token'] ?? '';

        return $this->accessToken;
    }
}
