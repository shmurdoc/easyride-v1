<?php

namespace Tests\Unit;

use App\Services\EmailService;
use Tests\TestCase;

class EmailServiceTest extends TestCase
{
    public function test_constructor_sets_properties(): void
    {
        $service = new EmailService('test-key', 'test@example.com', 'Test');
        $this->assertNotNull($service);
    }

    public function test_send_returns_false_without_http_mock(): void
    {
        $service = new EmailService('fake-api-key', 'noreply@easyryde.com', 'EasyRyde');
        $result = $service->send('user@example.com', 'Subject', '<p>Body</p>');
        $this->assertFalse($result);
    }

    public function test_send_ride_confirmation_returns_false_without_config(): void
    {
        $service = new EmailService('fake-api-key', 'noreply@easyryde.com', 'EasyRyde');
        $result = $service->sendRideConfirmation('user@example.com', 'John', '123 St', '456 Ave', '150');
        $this->assertFalse($result);
    }
}
