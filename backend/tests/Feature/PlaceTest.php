<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_search_places(): void
    {
        $response = $this->getJson('/api/v1/places/search?q=Phalaborwa');

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'meta'])
            ->assertJsonCount(3, 'data');
    }

    public function test_search_places_partial_match(): void
    {
        $response = $this->getJson('/api/v1/places/search?q=kruger');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_search_places_no_match(): void
    {
        $response = $this->getJson('/api/v1/places/search?q=NonExistentPlace');

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }

    public function test_search_places_requires_min_length(): void
    {
        $response = $this->getJson('/api/v1/places/search?q=a');

        $response->assertStatus(422);
    }

    public function test_search_places_requires_query(): void
    {
        $response = $this->getJson('/api/v1/places/search');

        $response->assertStatus(422);
    }

    public function test_search_places_respects_limit(): void
    {
        $response = $this->getJson('/api/v1/places/search?q=Ph&limit=2');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_search_places_returns_correct_structure(): void
    {
        $response = $this->getJson('/api/v1/places/search?q=Mokopane');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [['id', 'name', 'lat', 'lng']],
                'meta' => ['query', 'count'],
            ]);
    }
}
