<?php

namespace Tests\Unit\Traits;

use App\Traits\HasTotp;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class HasTotpTest extends TestCase
{
    private object $model;

    protected function setUp(): void
    {
        parent::setUp();

        $this->model = new class
        {
            use HasTotp;

            public $id = 1;

            public $email = 'test@example.com';

            public $totp_secret;

            public function save(): void {}
        };
    }

    public function test_generate_totp_secret_generates_and_saves_secret(): void
    {
        $google2fa = \Mockery::mock('overload:PragmaRX\Google2FA\Google2FA');
        $google2fa->shouldReceive('generateSecretKey')->once()->andReturn('MOCK_SECRET');

        $result = $this->model->generateTotpSecret();

        $this->assertEquals('MOCK_SECRET', $result);
        $this->assertEquals('MOCK_SECRET', $this->model->totp_secret);
    }

    public function test_verify_totp_returns_false_when_no_secret_set(): void
    {
        $this->model->totp_secret = null;

        $result = $this->model->verifyTotp('123456');

        $this->assertFalse($result);
    }

    public function test_verify_totp_returns_false_when_code_already_used(): void
    {
        $this->model->totp_secret = 'SOME_SECRET';

        Cache::shouldReceive('has')
            ->once()
            ->with('totp_used_1_123456')
            ->andReturn(true);

        $result = $this->model->verifyTotp('123456');

        $this->assertFalse($result);
    }

    public function test_verify_totp_verifies_valid_code(): void
    {
        $this->model->totp_secret = 'SOME_SECRET';

        Cache::shouldReceive('has')
            ->once()
            ->with('totp_used_1_123456')
            ->andReturn(false);

        Cache::shouldReceive('put')
            ->once()
            ->with('totp_used_1_123456', true, 60);

        $google2fa = \Mockery::mock('overload:PragmaRX\Google2FA\Google2FA');
        $google2fa->shouldReceive('verifyKey')
            ->once()
            ->with('SOME_SECRET', '123456')
            ->andReturn(true);

        $result = $this->model->verifyTotp('123456');

        $this->assertTrue($result);
    }

    public function test_get_totp_qr_url_returns_empty_string_when_no_secret(): void
    {
        $this->model->totp_secret = null;

        $result = $this->model->getTotpQrUrl('TestApp');

        $this->assertEquals('', $result);
    }

    public function test_get_totp_qr_url_returns_url_when_secret_exists(): void
    {
        $this->model->totp_secret = 'SOME_SECRET';

        $google2fa = \Mockery::mock('overload:PragmaRX\Google2FA\Google2FA');
        $google2fa->shouldReceive('getQRCodeUrl')
            ->once()
            ->with('TestApp', 'test@example.com', 'SOME_SECRET')
            ->andReturn('otpauth://totp/TestApp:test@example.com?secret=SOME_SECRET');

        $result = $this->model->getTotpQrUrl('TestApp');

        $this->assertEquals('otpauth://totp/TestApp:test@example.com?secret=SOME_SECRET', $result);
    }
}
