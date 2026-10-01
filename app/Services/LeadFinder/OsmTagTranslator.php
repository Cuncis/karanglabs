<?php

namespace App\Services\LeadFinder;

use App\Models\LeadFinderSegment;
use App\Models\LeadFinderStep;
use App\Services\AiJsonParser;
use App\Services\AnthropicClient;
use App\Services\PromptLoader;

/**
 * Turns a segment into OpenStreetMap search tags using the fast model, then
 * strictly validates the result before it ever reaches a query: only the 8
 * documented OSM keys are allowed, and every value must match a safe
 * lowercase/underscore pattern (or be the literal wildcard "*"). This is the
 * boundary that keeps AI output, and therefore ultimately user-influenced
 * text, out of the Overpass query unsanitized.
 */
class OsmTagTranslator
{
    public const ALLOWED_KEYS = ['shop', 'craft', 'office', 'amenity', 'tourism', 'healthcare', 'leisure', 'industry'];

    private const VALUE_PATTERN = '/^[a-z][a-z0-9_]{0,40}$/';

    private const MAX_PAIRS = 5;

    public function __construct(private AnthropicClient $ai) {}

    /**
     * @return array<int, array{key: string, value: string}>
     */
    public function translate(LeadFinderSegment $segment, int $userId): array
    {
        $systemPrompt = PromptLoader::load('lead-finder/osm-tags.v1.txt');
        $userPrompt = $this->buildUserPrompt($segment);
        $model = config('services.anthropic.fast_model', 'claude-sonnet-4-6');

        $result = $this->ai->send($systemPrompt, $userPrompt, model: $model, maxTokens: 512, userId: $userId, leadFinderProjectId: $segment->lead_finder_project_id, step: LeadFinderStep::STEP_FIND_COMPANIES_MAP);

        $pairs = $result['ok'] ? $this->parseAndValidate($result['text']) : [];

        return $pairs;
    }

    public static function isValidPair(mixed $key, mixed $value): bool
    {
        if (! is_string($key) || ! in_array($key, self::ALLOWED_KEYS, true)) {
            return false;
        }

        if (! is_string($value)) {
            return false;
        }

        return $value === '*' || preg_match(self::VALUE_PATTERN, $value) === 1;
    }

    private function buildUserPrompt(LeadFinderSegment $segment): string
    {
        return json_encode([
            'name' => $segment->name,
            'search_filters' => $segment->search_filters,
            'example_company_types' => $segment->example_company_types,
        ], JSON_PRETTY_PRINT);
    }

    /**
     * @return array<int, array{key: string, value: string}>
     */
    private function parseAndValidate(?string $content): array
    {
        $json = AiJsonParser::parse($content);
        $tags = $json['tags'] ?? null;

        if (! is_array($tags)) {
            return [];
        }

        $valid = [];
        foreach ($tags as $pair) {
            if (! is_array($pair)) {
                continue;
            }
            $key = $pair['key'] ?? null;
            $value = is_string($pair['value'] ?? null) ? strtolower(trim($pair['value'])) : null;

            if (self::isValidPair($key, $value)) {
                $valid[] = ['key' => $key, 'value' => $value];
            }

            if (count($valid) >= self::MAX_PAIRS) {
                break;
            }
        }

        return $valid;
    }
}
