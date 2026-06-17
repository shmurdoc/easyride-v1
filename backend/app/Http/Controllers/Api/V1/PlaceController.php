<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Place\PlaceReverseRequest;
use App\Http\Requests\Api\V1\Place\PlaceSearchRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class PlaceController extends Controller
{
    public function search(PlaceSearchRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $query = trim($validated['query']);
        $limit = (int) ($validated['limit'] ?? 8);
        $cacheKey = 'places:search:'.md5($query).':'.$limit;

        $results = Cache::remember($cacheKey, 3600, function () use ($query, $limit) {
            $response = Http::withHeaders(['User-Agent' => 'EasyRyde/1.0'])
                ->timeout(5)
                ->get('https://nominatim.openstreetmap.org/search', [
                    'q' => $query,
                    'format' => 'json',
                    'limit' => $limit,
                ]);

            if (! $response->successful()) {
                return [];
            }

            return collect($response->json())->map(fn (array $place) => [
                'id' => (string) $place['osm_id'],
                'name' => $place['display_name'],
                'lat' => (float) $place['lat'],
                'lng' => (float) $place['lon'],
                'address' => $place['display_name'],
            ])->toArray();
        });

        return response()->json([
            'data' => $results,
            'meta' => [
                'query' => $validated['query'],
                'count' => count($results),
            ],
        ]);
    }

    public function reverse(PlaceReverseRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $response = Http::withHeaders(['User-Agent' => 'EasyRyde/1.0'])
            ->timeout(5)
            ->get('https://nominatim.openstreetmap.org/reverse', [
                'lat' => $validated['lat'],
                'lon' => $validated['lng'],
                'format' => 'json',
            ]);

        if (! $response->successful()) {
            return response()->json(['data' => null], 404);
        }

        $data = $response->json();

        return response()->json([
            'data' => [
                'lat' => (float) $data['lat'],
                'lng' => (float) $data['lon'],
                'address' => $data['display_name'],
            ],
        ]);
    }
}
