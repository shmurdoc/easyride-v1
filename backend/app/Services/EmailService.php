<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EmailService
{
    private const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';

    public function __construct(
        private readonly string $apiKey,
        private readonly string $fromEmail,
        private readonly string $fromName,
    ) {}

    public function send(string $to, string $subject, string $htmlContent, string $textContent = ''): bool
    {
        try {
            $payload = [
                'personalizations' => [[
                    'to' => [['email' => $to]],
                    'subject' => $subject,
                ]],
                'from' => [
                    'email' => $this->fromEmail,
                    'name' => $this->fromName,
                ],
                'content' => [
                    ['type' => 'text/html', 'value' => $htmlContent],
                ],
            ];

            if ($textContent) {
                $payload['content'][] = ['type' => 'text/plain', 'value' => $textContent];
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$this->apiKey,
                'Content-Type' => 'application/json',
            ])->post(self::SENDGRID_API_URL, $payload);

            if ($response->successful()) {
                return true;
            }

            Log::error('SendGrid email failed', [
                'to' => $to,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error('SendGrid email exception', ['error' => $e->getMessage()]);

            return false;
        }
    }

    public function sendTemplate(string $to, string $templateId, array $dynamicData = []): bool
    {
        try {
            $payload = [
                'personalizations' => [[
                    'to' => [['email' => $to]],
                    'dynamic_template_data' => $dynamicData,
                ]],
                'from' => [
                    'email' => $this->fromEmail,
                    'name' => $this->fromName,
                ],
                'template_id' => $templateId,
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$this->apiKey,
                'Content-Type' => 'application/json',
            ])->post(self::SENDGRID_API_URL, $payload);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('SendGrid template email exception', ['error' => $e->getMessage()]);

            return false;
        }
    }

    public function sendRideConfirmation(string $to, string $riderName, string $pickup, string $dropoff, string $fare): bool
    {
        $html = $this->renderTemplate('ride-confirmation', [
            'rider_name' => $riderName,
            'pickup' => $pickup,
            'dropoff' => $dropoff,
            'fare' => $fare,
        ]);

        return $this->send($to, 'EasyRyde - Ride Confirmed', $html);
    }

    public function sendPaymentReceipt(string $to, string $riderName, string $rideId, string $amount, string $method): bool
    {
        $html = $this->renderTemplate('payment-receipt', [
            'rider_name' => $riderName,
            'ride_id' => $rideId,
            'amount' => $amount,
            'method' => $method,
        ]);

        return $this->send($to, "EasyRyde - Payment Receipt (R{$amount})", $html);
    }

    public function sendDriverApproval(string $to, string $driverName, bool $approved, string $reason = ''): bool
    {
        $subject = $approved ? 'EasyRyde - Account Approved' : 'EasyRyde - Application Update';
        $html = $this->renderTemplate('driver-approval', [
            'driver_name' => $driverName,
            'approved' => $approved,
            'reason' => $reason,
        ]);

        return $this->send($to, $subject, $html);
    }

    public function sendPasswordReset(string $to, string $name, string $resetUrl): bool
    {
        $html = $this->renderTemplate('password-reset', [
            'name' => $name,
            'reset_url' => $resetUrl,
        ]);

        return $this->send($to, 'EasyRyde - Password Reset', $html);
    }

    public function sendWeeklyEarningsReport(string $to, string $driverName, array $stats): bool
    {
        $html = $this->renderTemplate('weekly-earnings', array_merge($stats, ['driver_name' => $driverName]));

        return $this->send($to, 'EasyRyde - Weekly Earnings Report', $html);
    }

    public function sendSosAlert(string $to, string $userName, string $rideId, string $location): bool
    {
        $html = $this->renderTemplate('sos-alert', [
            'user_name' => $userName,
            'ride_id' => $rideId,
            'location' => $location,
        ]);

        return $this->send($to, 'URGENT: EasyRyde SOS Alert', $html);
    }

    private function renderTemplate(string $template, array $data): string
    {
        $html = "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;'>";
        $html .= "<div style='background:#2563eb;color:white;padding:20px;border-radius:8px 8px 0 0;'>";
        $html .= "<h1 style='margin:0;font-size:24px;'>EasyRyde</h1>";
        $html .= '</div>';
        $html .= "<div style='background:white;padding:20px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;'>";

        match ($template) {
            'ride-confirmation' => $html .= $this->rideConfirmationHtml($data),
            'payment-receipt' => $html .= $this->paymentReceiptHtml($data),
            'driver-approval' => $html .= $this->driverApprovalHtml($data),
            'password-reset' => $html .= $this->passwordResetHtml($data),
            'weekly-earnings' => $html .= $this->weeklyEarningsHtml($data),
            'sos-alert' => $html .= $this->sosAlertHtml($data),
            default => $html .= '<p>'.($data['message'] ?? '').'</p>',
        };

        $html .= '</div>';
        $html .= "<p style='text-align:center;color:#9ca3af;font-size:12px;margin-top:20px;'>EasyRyde - Phalaborwa</p>";
        $html .= '</div>';

        return $html;
    }

    private function rideConfirmationHtml(array $d): string
    {
        return "<h2>Ride Confirmed</h2>
            <p>Hi {$d['rider_name']},</p>
            <p>Your ride has been confirmed:</p>
            <div style='background:#f3f4f6;padding:12px;border-radius:6px;margin:12px 0;'>
                <p><strong>From:</strong> {$d['pickup']}</p>
                <p><strong>To:</strong> {$d['dropoff']}</p>
                <p><strong>Fare:</strong> R{$d['fare']}</p>
            </div>";
    }

    private function paymentReceiptHtml(array $d): string
    {
        return "<h2>Payment Receipt</h2>
            <p>Hi {$d['rider_name']},</p>
            <p>Your payment has been processed:</p>
            <div style='background:#f3f4f6;padding:12px;border-radius:6px;margin:12px 0;'>
                <p><strong>Ride:</strong> #{$d['ride_id']}</p>
                <p><strong>Amount:</strong> R{$d['amount']}</p>
                <p><strong>Method:</strong> {$d['method']}</p>
            </div>";
    }

    private function driverApprovalHtml(array $d): string
    {
        $status = $d['approved'] ? 'approved' : 'not approved';
        $color = $d['approved'] ? '#10B981' : '#EF4444';

        return "<h2>Application {$status}</h2>
            <p>Hi {$d['driver_name']},</p>
            <p>Your driver application has been <strong style='color:{$color}'>{$status}</strong>.</p>".
            ($d['reason'] ? "<p>Reason: {$d['reason']}</p>" : '').
            ($d['approved'] ? '<p>You can now go online and start receiving rides.</p>' : '');
    }

    private function passwordResetHtml(array $d): string
    {
        return "<h2>Password Reset</h2>
            <p>Hi {$d['name']},</p>
            <p>Click the link below to reset your password:</p>
            <p><a href='{$d['reset_url']}' style='display:inline-block;background:#2563eb;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;'>Reset Password</a></p>
            <p style='color:#9ca3af;font-size:12px;'>This link expires in 60 minutes.</p>";
    }

    private function weeklyEarningsHtml(array $d): string
    {
        return "<h2>Weekly Earnings Report</h2>
            <p>Hi {$d['driver_name']},</p>
            <div style='background:#f3f4f6;padding:12px;border-radius:6px;margin:12px 0;'>
                <p><strong>Total Earnings:</strong> R{$d['total_earnings']}</p>
                <p><strong>Total Trips:</strong> {$d['total_trips']}</p>
                <p><strong>Average per Trip:</strong> R{$d['avg_per_trip']}</p>
                <p><strong>Online Hours:</strong> {$d['online_hours']}h</p>
            </div>";
    }

    private function sosAlertHtml(array $d): string
    {
        return "<h2 style='color:#EF4444'>SOS Alert</h2>
            <p><strong>{$d['user_name']}</strong> has triggered an SOS alert.</p>
            <div style='background:#FEF2F2;padding:12px;border-radius:6px;margin:12px 0;border-left:4px solid #EF4444;'>
                <p><strong>Ride ID:</strong> {$d['ride_id']}</p>
                <p><strong>Location:</strong> {$d['location']}</p>
                <p><strong>Time:</strong> ".now()->format('Y-m-d H:i:s').'</p>
            </div>
            <p>Please take immediate action.</p>';
    }
}
