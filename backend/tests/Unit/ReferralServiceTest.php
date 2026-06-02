<?php

namespace Tests\Unit;

use App\Services\ReferralService;
use App\Services\WalletService;
use App\Models\User;
use App\Models\ReferralCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ReferralServiceTest extends TestCase
{
    use RefreshDatabase;

    private ReferralService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ReferralService();
        Role::create(['name' => 'rider', 'guard_name' => 'web']);
    }

    public function test_generate_code_creates_unique_code(): void
    {
        $user = User::factory()->create();

        $code = $this->service->generateCode($user);

        $this->assertNotNull($code);
        $this->assertDatabaseHas('referral_codes', [
            'user_id' => $user->id,
            'code' => $code->code,
        ]);
    }

    public function test_generate_code_returns_existing_if_exists(): void
    {
        $user = User::factory()->create();
        $code1 = $this->service->generateCode($user);
        $code2 = $this->service->generateCode($user);

        $this->assertEquals($code1->id, $code2->id);
    }

    public function test_apply_referral_succeeds(): void
    {
        $referrer = User::factory()->create();
        $referee = User::factory()->create();

        $code = $this->service->generateCode($referrer);
        $result = $this->service->applyReferral($referee, $code->code);

        $this->assertTrue($result['success']);
        $this->assertDatabaseHas('referral_redemptions', [
            'referrer_id' => $referrer->id,
            'referred_id' => $referee->id,
        ]);
    }

    public function test_apply_referral_fails_for_invalid_code(): void
    {
        $user = User::factory()->create();

        $result = $this->service->applyReferral($user, 'NONEXISTENT');

        $this->assertFalse($result['success']);
        $this->assertArrayHasKey('error', $result);
    }

    public function test_apply_referral_fails_for_self_referral(): void
    {
        $user = User::factory()->create();
        $code = $this->service->generateCode($user);

        $result = $this->service->applyReferral($user, $code->code);

        $this->assertFalse($result['success']);
    }

    public function test_apply_referral_fails_for_duplicate_referee(): void
    {
        $referrer = User::factory()->create();
        $referee = User::factory()->create();
        $code = $this->service->generateCode($referrer);

        $this->service->applyReferral($referee, $code->code);
        $result = $this->service->applyReferral($referee, $code->code);

        $this->assertFalse($result['success']);
    }

    public function test_get_referral_stats(): void
    {
        $referrer = User::factory()->create();
        $code = $this->service->generateCode($referrer);

        $referee = User::factory()->create();
        $this->service->applyReferral($referee, $code->code);

        $stats = $this->service->getReferralStats($referrer);

        $this->assertEquals(1, $stats['total_referrals']);
        $this->assertEquals(25.0, $stats['total_bonus']);
    }

    public function test_code_is_eight_characters(): void
    {
        $user = User::factory()->create();
        $code = $this->service->generateCode($user);

        $this->assertEquals(8, strlen($code->code));
    }

    public function test_get_user_code(): void
    {
        $user = User::factory()->create();
        $code = $this->service->generateCode($user);

        $fetched = $this->service->getUserCode($user);

        $this->assertNotNull($fetched);
        $this->assertEquals($code->code, $fetched->code);
    }

    public function test_get_user_code_returns_null_for_no_code(): void
    {
        $user = User::factory()->create();

        $fetched = $this->service->getUserCode($user);

        $this->assertNull($fetched);
    }
}
