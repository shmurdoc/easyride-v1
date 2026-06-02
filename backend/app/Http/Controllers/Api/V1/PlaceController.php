<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlaceController extends Controller
{
    private const PLACES = [
        ['id' => 'phalaborwa-cbd', 'name' => 'Phalaborwa CBD', 'lat' => -23.9470, 'lng' => 31.0830],
        ['id' => 'kruger-gate', 'name' => 'Kruger National Park Gate', 'lat' => -23.9884, 'lng' => 31.5578],
        ['id' => 'phalaborwa-airport', 'name' => 'Phalaborwa Airport', 'lat' => -23.9370, 'lng' => 31.1553],
        ['id' => 'mall-phalaborwa', 'name' => 'Mall of Phalaborwa', 'lat' => -23.9400, 'lng' => 31.0900],
        ['id' => 'burgersfort', 'name' => 'Burgersfort', 'lat' => -24.0267, 'lng' => 30.9500],
        ['id' => 'hoedspruit', 'name' => 'Hoedspruit', 'lat' => -24.3517, 'lng' => 31.0433],
        ['id' => 'tzaneen', 'name' => 'Tzaneen', 'lat' => -23.8333, 'lng' => 30.1667],
        ['id' => 'mokopane', 'name' => 'Mokopane', 'lat' => -24.1833, 'lng' => 29.0167],
        ['id' => 'polokwane', 'name' => 'Polokwane', 'lat' => -23.9045, 'lng' => 29.4689],
        ['id' => 'giyani', 'name' => 'Giyani', 'lat' => -23.3022, 'lng' => 30.7189],
    ];

    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => 'required|string|min:2|max:100',
            'near' => 'nullable|string',
            'limit' => 'nullable|integer|min:1|max:20',
        ]);

        $query = mb_strtolower(trim($validated['q']));
        $limit = (int) ($validated['limit'] ?? 8);

        $matches = array_values(array_filter(
            self::PLACES,
            fn(array $place) => str_contains(mb_strtolower($place['name']), $query)
        ));

        usort($matches, function (array $a, array $b) use ($query) {
            $scoreA = $this->matchScore($a['name'], $query);
            $scoreB = $this->matchScore($b['name'], $query);
            return $scoreB <=> $scoreA;
        });

        $results = array_slice($matches, 0, $limit);

        return response()->json([
            'data' => $results,
            'meta' => [
                'query' => $validated['q'],
                'count' => count($results),
            ],
        ]);
    }

    private function matchScore(string $name, string $query): int
    {
        $nameLower = mb_strtolower($name);
        if ($nameLower === $query) {
            return 100;
        }
        if (str_starts_with($nameLower, $query)) {
            return 50;
        }
        if (str_contains($nameLower, $query)) {
            return 10;
        }
        return 0;
    }
}
