<?php

namespace App\Services\LeadFinder;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

/**
 * Fetches a single URL on behalf of the Lead Finder tool, politely and
 * safely: blocks private/internal IPs (SSRF), respects robots.txt, never
 * touches login/admin paths, rate-limits to 1 request/second per domain, and
 * times out after 10 seconds. Every failure comes back with a human-readable
 * reason instead of a generic exception, so the UI can explain what happened.
 */
class SafeUrlFetcher
{
    private const BLOCKED_PATH_SEGMENTS = ['login', 'admin', 'wp-admin', 'wp-login'];

    public function __construct(private RobotsTxtChecker $robots) {}

    /**
     * @return array{ok: bool, html: ?string, reason: ?string}
     */
    public function fetch(string $url): array
    {
        $parts = parse_url($url);
        $scheme = strtolower($parts['scheme'] ?? '');
        $host = $parts['host'] ?? null;
        $path = $parts['path'] ?? '/';

        if (! $host || ! in_array($scheme, ['http', 'https'], true)) {
            return ['ok' => false, 'html' => null, 'reason' => 'That does not look like a valid website address.'];
        }

        foreach (self::BLOCKED_PATH_SEGMENTS as $segment) {
            if (str_contains(strtolower($path), $segment)) {
                return ['ok' => false, 'html' => null, 'reason' => 'This page looks like a login or admin page, which we never fetch.'];
            }
        }

        $ip = PrivateIpGuard::resolveSafeIp($host);
        if ($ip === null) {
            return ['ok' => false, 'html' => null, 'reason' => 'This address points to a private or internal network, which we never fetch.'];
        }

        if (! $this->robots->isAllowed($url)) {
            return ['ok' => false, 'html' => null, 'reason' => "This page is blocked by {$host}'s robots.txt."];
        }

        DomainRateLimiter::wait($host);

        $port = $parts['port'] ?? ($scheme === 'https' ? 443 : 80);

        try {
            $response = Http::withHeaders([
                'User-Agent' => config('services.fetch.user_agent'),
                'Accept' => 'text/html,application/xhtml+xml',
            ])
                // Pin the connection to the IP we already validated, so a DNS answer
                // that changes between the check above and the actual connect can't
                // route us into a private network (DNS rebinding).
                ->withOptions(['curl' => [CURLOPT_RESOLVE => ["{$host}:{$port}:{$ip}"]]])
                ->connectTimeout(10)->timeout(10)
                ->get($url);
        } catch (ConnectionException) {
            return ['ok' => false, 'html' => null, 'reason' => 'This page could not be reached.'];
        }

        if ($response->failed()) {
            return ['ok' => false, 'html' => null, 'reason' => "This page returned an error (HTTP {$response->status()})."];
        }

        return ['ok' => true, 'html' => $response->body(), 'reason' => null];
    }
}
