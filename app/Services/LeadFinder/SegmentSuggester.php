<?php

namespace App\Services\LeadFinder;

use App\Models\LeadFinderStep;
use App\Services\AiJsonParser;
use App\Services\AnthropicClient;
use App\Services\PromptLoader;

/**
 * Turns a verified company profile into 4-6 concrete, searchable target
 * segments. Validates the segment count in code (retrying once on an
 * invalid response) and normalizes each segment's shape so every key is
 * always present, per the spec's "missing values are null, never omitted".
 */
class SegmentSuggester
{
    private const MIN_SEGMENTS = 4;

    private const MAX_SEGMENTS = 6;

    public function __construct(private AnthropicClient $ai) {}

    /**
     * @param  array<int, string>  $existingNames  active segment names from a previous run, so the AI can reuse them
     * @return array{ok: bool, segments: ?array, reason: ?string}
     */
    public function suggest(array $profile, array $existingNames, int $userId, int $projectId): array
    {
        $systemPrompt = PromptLoader::load('lead-finder/segments.v1.txt');
        $userPrompt = $this->buildUserPrompt($profile, $existingNames);

        $result = $this->ai->send($systemPrompt, $userPrompt, userId: $userId, leadFinderProjectId: $projectId, step: LeadFinderStep::STEP_SEGMENTS);
        $segments = $result['ok'] ? $this->parseAndValidate($result['text']) : null;

        if ($segments === null) {
            // Retry once with a stricter reminder, per the spec.
            $retryPrompt = $userPrompt."\n\nYour previous response was invalid: it must be a single JSON object with a \"segments\" array of exactly 4 to 6 items, each with a non-empty \"name\". Return ONLY that JSON object, no markdown fences, no preamble.";
            $result = $this->ai->send($systemPrompt, $retryPrompt, userId: $userId, leadFinderProjectId: $projectId, step: LeadFinderStep::STEP_SEGMENTS);
            $segments = $result['ok'] ? $this->parseAndValidate($result['text']) : null;
        }

        if ($segments === null) {
            return ['ok' => false, 'segments' => null, 'reason' => $result['error'] ?? 'The AI did not return a valid list of segments after two attempts.'];
        }

        return ['ok' => true, 'segments' => $segments, 'reason' => null];
    }

    /**
     * @param  array<int, string>  $existingNames
     */
    private function buildUserPrompt(array $profile, array $existingNames): string
    {
        $parts = ["Company profile:\n".json_encode($profile, JSON_PRETTY_PRINT)];

        if (! empty($existingNames)) {
            $parts[] = "Segments already generated for this company (reuse these exact names when the same idea still fits):\n- ".implode("\n- ", $existingNames);
        }

        return implode("\n\n", $parts);
    }

    /**
     * @return ?array<int, array<string, mixed>>
     */
    private function parseAndValidate(?string $content): ?array
    {
        $json = AiJsonParser::parse($content);
        $segments = $json['segments'] ?? null;

        if (! is_array($segments) || count($segments) < self::MIN_SEGMENTS || count($segments) > self::MAX_SEGMENTS) {
            return null;
        }

        foreach ($segments as $segment) {
            if (! is_array($segment) || empty($segment['name']) || ! is_string($segment['name'])) {
                return null;
            }
        }

        return array_map(fn ($segment) => $this->normalize($segment), array_values($segments));
    }

    /**
     * @return array<string, mixed>
     */
    private function normalize(array $segment): array
    {
        $filters = is_array($segment['search_filters'] ?? null) ? $segment['search_filters'] : [];

        return [
            'name' => trim($segment['name']),
            'pain' => is_string($segment['pain'] ?? null) ? $segment['pain'] : null,
            'offer_angle' => is_string($segment['offer_angle'] ?? null) ? $segment['offer_angle'] : null,
            'criteria' => array_slice($this->stringList($segment['criteria'] ?? []), 0, 3),
            'search_filters' => [
                'industry' => $this->stringList($filters['industry'] ?? []),
                'keywords' => $this->stringList($filters['keywords'] ?? []),
            ],
            'example_company_types' => $this->stringList($segment['example_company_types'] ?? []),
            'fit_score' => is_numeric($segment['fit_score'] ?? null) ? max(0, min(100, (int) $segment['fit_score'])) : null,
            'fit_reason' => is_string($segment['fit_reason'] ?? null) ? $segment['fit_reason'] : null,
            'estimated_size' => is_string($segment['estimated_size'] ?? null) ? $segment['estimated_size'] : null,
        ];
    }

    /**
     * @return array<int, string>
     */
    private function stringList(mixed $value): array
    {
        return array_values(array_filter((array) $value, 'is_string'));
    }
}
