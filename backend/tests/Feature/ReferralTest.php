<?php

namespace Tests\Feature;

use App\Models\ReferralCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ReferralTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'rider', 'guard_name' => 'web']);
    }

    public function test_user_can_view_their_referral_code(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->getJson('/api/v1/referrals/my-code');

        $response->assertOk()
            ->assertJsonStructure(['code', 'usage_count', 'max_uses']);
    }

    public function test_user_can_apply_referral_code(): void
    {
        $referrer = User::factory()->create();
        $referrer->assignRole('rider');
        $referralCode = ReferralCode::create([
            'user_id' => $referrer->id,
            'code' => 'TESTCODE',
        ]);

        $referred = User::factory()->create();
        $referred->assignRole('rider');
        Sanctum::actingAs($referred);

        $response = $this->postJson('/api/v1/referrals/apply', [
            'code' => 'TESTCODE',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_referral_code_validates_invalid_code(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->postJson('/api/v1/referrals/apply', [
            'code' => 'INVALID',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_user_can_view_referral_stats(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->getJson('/api/v1/referrals/stats');

        $response->assertOk()
            ->assertJsonStructure(['total_referrals', 'total_bonus']);
    }

    public function test_unauthenticated_cannot_view_referral_code(): void
    {
        $response = $this->getJson('/api/v1/referrals/my-code');

        $response->assertStatus(401);
    }
}
