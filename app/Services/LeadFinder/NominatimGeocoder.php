<?php

namespace App\Services\LeadFinder;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * Resolves a city name to a search bounding box via OpenStreetMap's
 * Nominatim, caching the result (good or bad) so repeat searches for the
 * same city don't hit the service again. Refuses areas larger than ~1.5
 * degrees in either dimension, since a whole country or large region would
 * make the follow-up Overpass query far too broad and slow.
 */
class NominatimGeocoder
{
    private const MAX_DEGREES = 1.5;

    /**
     * @return array{ok: bool, bbox: ?array{south: float, north: float, west: float, east: float}, reason: ?string}
     */
    public function resolve(string $city): array
    {
        $city = trim($city);
        $cacheKey = 'lead-finder:nominatim:'.strtolower($city);

        $cached = Cache::get($cacheKey);
        if ($cached !== null) {
            return $cached;
        }

        $result = $this->lookup($city);

        // Cache both good and bad outcomes, Nominatim's usage policy asks
        // callers not to repeat the same lookup.
        Cache::put($cacheKey, $result, now()->addDay());

        return $result;
    }

    /**
     * @return array{ok: bool, bbox: ?array, reason: ?string}
     */
    private function lookup(string $city): array
    {
        if ($city === '') {
            return ['ok' => false, 'bbox' => null, 'reason' => 'Enter a city name to search.'];
        }

        DomainRateLimiter::wait('nominatim.openstreetmap.org');

        try {
            $response = Http::withHeaders(['User-Agent' => config('services.fetch.user_agent')])
                ->connectTimeout(10)->timeout(10)
                ->get('https://nominatim.openstreetmap.org/search', [
                    'q' => $city,
                    'format' => 'json',
                    'limit' => 1,
                ]);
        } catch (ConnectionException) {
            return ['ok' => false, 'bbox' => null, 'reason' => 'Could not reach the map service. Please try again.'];
        }

        $places = $response->ok() ? $response->json() : null;

        if (! is_array($places) || empty($places)) {
            return ['ok' => false, 'bbox' => null, 'reason' => "We could not find \"{$city}\" on the map. Try a more specific city name."];
        }

        $box = $places[0]['boundingbox'] ?? null;
        if (! is_array($box) || count($box) !== 4) {
            return ['ok' => false, 'bbox' => null, 'reason' => "We could not find \"{$city}\" on the map. Try a more specific city name."];
        }

        [$south, $north, $west, $east] = array_map('floatval', $box);

        if (($north - $south) > self::MAX_DEGREES || ($east - $west) > self::MAX_DEGREES) {
            return ['ok' => false, 'bbox' => null, 'reason' => "\"{$city}\" is too large an area to search. Try a specific city instead of a whole state, province, or country."];
        }

        return ['ok' => true, 'bbox' => compact('south', 'north', 'west', 'east'), 'reason' => null];
    }
}
