<?php

namespace Tests\Feature;

use App\Models\IncidentReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class IncidentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'rider', 'guard_name' => 'web']);
        Role::create(['name' => 'admin', 'guard_name' => 'web']);
    }

    public function test_user_can_report_incident(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->postJson('/api/v1/incidents', [
            'incident_type' => 'safety_concern',
            'severity' => 'medium',
            'title' => 'Safety concern',
            'description' => 'There was a safety issue during the ride.',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['message', 'incident']);
    }

    public function test_report_incident_validates_required_fields(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->postJson('/api/v1/incidents', []);

        $response->assertStatus(422);
    }

    public function test_user_can_view_their_incidents(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->getJson('/api/v1/incidents/my');

        $response->assertOk()
            ->assertJsonStructure(['incidents']);
    }

    public function test_user_can_view_single_incident(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');

        $incident = IncidentReport::create([
            'reporter_id' => $rider->id,
            'incident_type' => 'safety_concern',
            'severity' => 'medium',
            'title' => 'Test incident',
            'description' => 'Description text',
            'status' => 'open',
        ]);

        Sanctum::actingAs($rider);
        $response = $this->getJson("/api/v1/incidents/{$incident->id}");

        $response->assertOk()
            ->assertJsonPath('incident.id', $incident->id);
    }

    public function test_admin_can_view_all_incidents(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/compliance/incidents');

        $response->assertOk()
            ->assertJsonStructure(['incidents']);
    }

    public function test_admin_can_view_open_incidents(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/compliance/incidents/open');

        $response->assertOk()
            ->assertJsonStructure(['incidents']);
    }

    public function test_admin_can_view_incident_stats(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/compliance/incidents/stats');

        $response->assertOk()
            ->assertJsonStructure(['stats']);
    }

    public function test_admin_can_resolve_incident(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $rider = User::factory()->create();
        $incident = IncidentReport::create([
            'reporter_id' => $rider->id,
            'incident_type' => 'safety_concern',
            'severity' => 'low',
            'title' => 'Test incident',
            'description' => 'Description text',
            'status' => 'investigating',
        ]);

        Sanctum::actingAs($admin);
        $response = $this->postJson("/api/v1/admin/compliance/incidents/{$incident->id}/resolve", [
            'resolution' => 'Issue resolved',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Incident resolved');
    }

    public function test_admin_can_close_incident(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $rider = User::factory()->create();
        $incident = IncidentReport::create([
            'reporter_id' => $rider->id,
            'incident_type' => 'safety_concern',
            'severity' => 'low',
            'title' => 'Test incident',
            'description' => 'Description text',
            'status' => 'resolved',
        ]);

        Sanctum::actingAs($admin);
        $response = $this->postJson("/api/v1/admin/compliance/incidents/{$incident->id}/close");

        $response->assertOk()
            ->assertJsonPath('message', 'Incident closed');
    }

    public function test_non_admin_cannot_access_incident_admin(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->getJson('/api/v1/admin/compliance/incidents');

        $response->assertStatus(403);
    }

    public function test_unauthenticated_cannot_report_incident(): void
    {
        $response = $this->postJson('/api/v1/incidents', [
            'incident_type' => 'safety_concern',
            'severity' => 'medium',
            'title' => 'Test',
            'description' => 'Test description',
        ]);

        $response->assertStatus(401);
    }
}
