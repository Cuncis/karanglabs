<?php

namespace App\Services\LeadFinder;

use App\Models\LeadFinderStep;
use App\Services\AiJsonParser;
use App\Services\AnthropicClient;
use App\Services\PromptLoader;

/**
 * Turns the text fetched by SiteCrawler into a verified JSON company
 * profile: asks Claude for a profile with verbatim supporting quotes, then
 * checks each quote actually appears in the fetched text, nulling out any
 * field whose evidence could not be verified rather than trusting the AI.
 */
class CompanyProfiler
{
    /**
     * Keys in the AI's "evidence" object, one per profile field that needs a
     * verbatim quote. "keywords" has no single supporting quote by design.
     */
    private const EVIDENCE_FIELDS = [
        'name', 'country', 'language', 'one_liner',
        'offers', 'target_customers', 'differentiators', 'proof_points', 'tone',
    ];

    public function __construct(private AnthropicClient $ai) {}

    /**
     * @param  array<int, array{type: string, url: string, ok: bool, text: ?string, reason: ?string}>  $pages
     * @return array{ok: bool, profile: ?array, reason: ?string}
     */
    public function profile(array $pages, int $userId, int $projectId): array
    {
        $readablePages = array_values(array_filter($pages, fn ($page) => $page['ok']));

        if (empty($readablePages)) {
            $reasons = implode(' ', array_column($pages, 'reason'));

            return ['ok' => false, 'profile' => null, 'reason' => "None of this site's pages could be read. {$reasons}"];
        }

        $sourceText = implode("\n\n", array_map(fn ($page) => $page['text'], $readablePages));
        $systemPrompt = PromptLoader::load('lead-finder/company-profile.v1.txt');
        $userPrompt = $this->buildUserPrompt($readablePages);

        $result = $this->ai->send($systemPrompt, $userPrompt, userId: $userId, leadFinderProjectId: $projectId, step: LeadFinderStep::STEP_FETCH_PROFILE);
        $parsed = $result['ok'] ? AiJsonParser::parse($result['text']) : null;

        if (! $parsed) {
            // Retry once with a stricter reminder, per the spec.
            $retryPrompt = $userPrompt."\n\nYour previous response was not valid JSON. Return ONLY a single valid JSON object, nothing else, no markdown fences, no preamble.";
            $result = $this->ai->send($systemPrompt, $retryPrompt, userId: $userId, leadFinderProjectId: $projectId, step: LeadFinderStep::STEP_FETCH_PROFILE);
            $parsed = $result['ok'] ? AiJsonParser::parse($result['text']) : null;
        }

        if (! $parsed) {
            return ['ok' => false, 'profile' => null, 'reason' => $result['error'] ?? 'The AI did not return a valid profile after two attempts.'];
        }

        return ['ok' => true, 'profile' => $this->verifyEvidence($parsed, $sourceText), 'reason' => null];
    }

    /**
     * @param  array<int, array{type: string, url: string, ok: bool, text: ?string, reason: ?string}>  $readablePages
     */
    private function buildUserPrompt(array $readablePages): string
    {
        $parts = array_map(
            fn ($page) => "=== {$page['type']} page ({$page['url']}) ===\n{$page['text']}",
            $readablePages
        );

        return implode("\n\n", $parts);
    }

    /**
     * Nulls out any field whose claimed evidence quote does not appear
     * verbatim (after trimming/whitespace-normalizing) in the fetched text.
     */
    private function verifyEvidence(array $profile, string $sourceText): array
    {
        $normalizedSource = $this->normalize($sourceText);
        $evidence = is_array($profile['evidence'] ?? null) ? $profile['evidence'] : [];

        foreach (self::EVIDENCE_FIELDS as $field) {
            $quote = $evidence[$field] ?? null;

            if (! is_string($quote) || trim($quote) === '' || ! str_contains($normalizedSource, $this->normalize($quote))) {
                $profile[$field] = null;
                $evidence[$field] = null;
            }
        }

        $profile['evidence'] = $evidence;

        return $profile;
    }

    private function normalize(string $text): string
    {
        return trim((string) preg_replace('/\s+/', ' ', strtolower($text)));
    }
}
