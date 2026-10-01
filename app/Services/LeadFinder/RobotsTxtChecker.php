<?php

namespace App\Services\LeadFinder;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * A minimal, hand-rolled robots.txt parser covering the subset the Lead
 * Finder tool needs: User-agent groups with Allow/Disallow rules, matched
 * against our own user agent and the wildcard group. Not a full spec
 * implementation (no crawl-delay, no sitemap parsing), on purpose.
 */
class RobotsTxtChecker
{
    public function isAllowed(string $url): bool
    {
        $parts = parse_url($url);
        $host = $parts['host'] ?? null;
        $path = $parts['path'] ?? '/';

        if (! $host) {
            return false;
        }

        $rules = $this->rulesFor($host, $parts['scheme'] ?? 'https');
        $agentKey = $this->matchingAgentKey($rules, strtolower((string) config('services.fetch.user_agent')));
        $applicable = $agentKey !== null ? $rules[$agentKey] : [];

        $matched = null;
        $matchedLength = -1;

        foreach ($applicable as $rule) {
            if ($rule['prefix'] !== '' && ! str_starts_with($path, $rule['prefix'])) {
                continue;
            }
            if (strlen($rule['prefix']) >= $matchedLength) {
                $matched = $rule;
                $matchedLength = strlen($rule['prefix']);
            }
        }

        return $matched === null || $matched['type'] === 'allow';
    }

    /**
     * @return array<string, array<int, array{type: string, prefix: string}>>
     */
    private function rulesFor(string $host, string $scheme): array
    {
        return Cache::remember('lead-finder:robots:'.$host, now()->addHour(), function () use ($host, $scheme) {
            try {
                $response = Http::withHeaders(['User-Agent' => config('services.fetch.user_agent')])
                    ->connectTimeout(5)->timeout(5)
                    ->get("{$scheme}://{$host}/robots.txt");
            } catch (ConnectionException) {
                return [];
            }

            return $response->failed() ? [] : $this->parse($response->body());
        });
    }

    /**
     * @return array<string, array<int, array{type: string, prefix: string}>>
     */
    private function parse(string $body): array
    {
        $blocks = [];
        $index = -1;
        $expectingNewBlock = true;

        foreach (preg_split('/\r\n|\r|\n/', $body) as $line) {
            $line = trim((string) preg_replace('/#.*/', '', $line));
            if ($line === '' || ! str_contains($line, ':')) {
                continue;
            }

            [$field, $value] = array_pad(explode(':', $line, 2), 2, '');
            $field = strtolower(trim($field));
            $value = trim($value);

            if ($field === 'user-agent') {
                if ($expectingNewBlock) {
                    $blocks[] = ['agents' => [], 'rules' => []];
                    $index = count($blocks) - 1;
                    $expectingNewBlock = false;
                }
                $blocks[$index]['agents'][] = strtolower($value);
            } elseif (in_array($field, ['disallow', 'allow'], true) && $value !== '' && $index >= 0) {
                $blocks[$index]['rules'][] = ['type' => $field, 'prefix' => $value];
                $expectingNewBlock = true;
            } elseif ($index >= 0) {
                // Any other directive (crawl-delay, sitemap, etc.) also closes the group.
                $expectingNewBlock = true;
            }
        }

        $groups = [];
        foreach ($blocks as $block) {
            foreach ($block['agents'] as $agent) {
                $groups[$agent] = array_merge($groups[$agent] ?? [], $block['rules']);
            }
        }

        return $groups;
    }

    /**
     * @param  array<string, mixed>  $rules
     */
    private function matchingAgentKey(array $rules, string $ourAgent): ?string
    {
        foreach (array_keys($rules) as $agent) {
            if ($agent !== '*' && $agent !== '' && str_contains($ourAgent, $agent)) {
                return $agent;
            }
        }

        return array_key_exists('*', $rules) ? '*' : null;
    }
}
