<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PlaceTest extends TestCase
{
    use RefreshDatabase;

    private function mockNominatim(array $results): void
    {
        Http::fake([
            'nominatim.openstreetmap.org/*' => Http::response($results, 200),
        ]);
    }

    private function makePlace(string $osmId, string $name, string $lat, string $lon): array
    {
        return [
            'osm_id' => $osmId,
            'display_name' => $name,
            'lat' => $lat,
            'lon' => $lon,
            'category' => 'place',
            'type' => 'city',
        ];
    }

    public function test_can_search_places(): void
    {
        $this->mockNominatim([
            $this->makePlace('1', 'Phalaborwa, South Africa', '-23.94', '29.47'),
            $this->makePlace('2', 'Phalaborwa Mall, South Africa', '-23.95', '29.46'),
            $this->makePlace('3', 'Phalaborwa, Limpopo, South Africa', '-23.93', '29.48'),
        ]);

        $response = $this->getJson('/api/v1/places/search?query=Phalaborwa');

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'meta'])
            ->assertJsonCount(3, 'data');
    }

    public function test_search_places_partial_match(): void
    {
        $this->mockNominatim([
            $this->makePlace('4', 'Kruger National Park, South Africa', '-24.0', '31.5'),
        ]);

        $response = $this->getJson('/api/v1/places/search?query=kruger');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_search_places_no_match(): void
    {
        $this->mockNominatim([]);

        $response = $this->getJson('/api/v1/places/search?query=NonExistentPlace');

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }

    public function test_search_places_requires_min_length(): void
    {
        $response = $this->getJson('/api/v1/places/search?query=a');

        $response->assertStatus(422);
    }

    public function test_search_places_requires_query(): void
    {
        $response = $this->getJson('/api/v1/places/search');

        $response->assertStatus(422);
    }

    public function test_search_places_respects_limit(): void
    {
        $this->mockNominatim([
            $this->makePlace('5', 'Phalaborwa, South Africa', '-23.94', '29.47'),
            $this->makePlace('6', 'Philadelphia, South Africa', '-33.0', '18.0'),
        ]);

        $response = $this->getJson('/api/v1/places/search?query=Ph&limit=2');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_search_places_returns_correct_structure(): void
    {
        $this->mockNominatim([
            $this->makePlace('8', 'Mokopane, South Africa', '-24.18', '29.01'),
        ]);

        $response = $this->getJson('/api/v1/places/search?query=Mokopane');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [['id', 'name', 'lat', 'lng']],
                'meta' => ['query', 'count'],
            ]);
    }
}
