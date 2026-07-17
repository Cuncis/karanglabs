<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BraveSearchService
{
    private const ENDPOINT = 'https://api.search.brave.com/res/v1/web/search';

    /**
     * Run a web search for the given dork query.
     *
     * @return array<int, array{url: string, title: ?string, description: ?string}>
     */
    public function search(string $query, int $count = 10): array
    {
        $key = config('services.brave.key');

        if (empty($key)) {
            Log::warning('Brave Search API key is not configured.');

            return [];
        }

        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'X-Subscription-Token' => $key,
            ])->get(self::ENDPOINT, [
                'q' => $query,
                'count' => $count,
            ]);

            if (! $response->successful()) {
                Log::error('Brave Search API error', [
                    'query' => $query,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return [];
            }

            $results = $response->json('web.results') ?? [];

            return collect($results)
                ->filter(fn ($result): bool => ! empty($result['url']))
                ->map(fn ($result): array => [
                    'url' => $result['url'],
                    'title' => $result['title'] ?? null,
                    'description' => $result['description'] ?? null,
                ])
                ->values()
                ->all();
        } catch (\Throwable $e) {
            Log::error('Brave Search API exception', [
                'query' => $query,
                'error' => $e->getMessage(),
            ]);

            return [];
        }
    }
}
