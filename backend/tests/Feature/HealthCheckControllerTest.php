<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthCheckControllerTest extends TestCase
{
    public function test_health_endpoint_returns_response(): void
    {
        $response = $this->get('/api/v1/health');

        $this->assertContains($response->getStatusCode(), [200, 503]);
    }

    public function test_health_returns_correct_json_structure(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertJsonStructure([
            'status',
            'timestamp',
            'checks' => [
                'database' => ['status', 'message'],
                'redis' => ['status', 'message'],
                'cache' => ['status', 'message'],
                'queue' => ['status', 'message'],
                'disk' => ['status', 'message', 'free_gb'],
            ],
        ]);
    }

    public function test_health_checks_database_is_accessible(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertJsonPath('checks.database.status', true);
    }

    public function test_health_checks_cache_is_accessible(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertJsonPath('checks.cache.status', true);
    }

    public function test_health_checks_disk_is_accessible(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertJsonPath('checks.disk.status', true);
    }
}
