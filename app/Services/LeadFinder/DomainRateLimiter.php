<?php

namespace App\Services\LeadFinder;

use Illuminate\Support\Facades\Cache;

/**
 * Enforces at most one request per second to a given external host (keyed
 * however the caller likes, usually the hostname) by blocking until the
 * previous request to that key was at least a second ago. Shared by
 * SafeUrlFetcher (per prospect domain) and NominatimGeocoder (per the
 * Nominatim service itself), both of which have their own "be polite"
 * requirements to the services they call.
 */
class DomainRateLimiter
{
    public static function wait(string $key, float $minIntervalSeconds = 1.0): void
    {
        $cacheKey = 'lead-finder:rate-limit:'.$key;
        $lastRequestAt = Cache::get($cacheKey);

        if ($lastRequestAt !== null) {
            $elapsed = microtime(true) - $lastRequestAt;
            if ($elapsed < $minIntervalSeconds) {
                usleep((int) (($minIntervalSeconds - $elapsed) * 1_000_000));
            }
        }

        Cache::put($cacheKey, microtime(true), now()->addSeconds(5));
    }
}
