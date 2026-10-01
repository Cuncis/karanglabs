<?php

namespace App\Services\LeadFinder;

/**
 * Normalizes a user-supplied or scraped website address so it has a scheme,
 * and extracts the bare domain (lowercase, no "www.") used to dedupe
 * companies within a segment regardless of which source found them.
 */
class UrlNormalizer
{
    public static function normalize(string $url): ?string
    {
        $url = trim($url);
        if ($url === '') {
            return null;
        }
        if (! preg_match('#^https?://#i', $url)) {
            $url = 'https://'.$url;
        }

        return filter_var($url, FILTER_VALIDATE_URL) ? $url : null;
    }

    public static function domain(string $url): ?string
    {
        $host = parse_url($url, PHP_URL_HOST);
        if (! $host) {
            return null;
        }
        $host = strtolower($host);

        return str_starts_with($host, 'www.') ? substr($host, 4) : $host;
    }
}
