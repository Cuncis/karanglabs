<?php

namespace App\Services\SalesNavigator;

use DOMDocument;
use DOMElement;
use DOMXPath;

/**
 * Parses raw HTML pasted from a LinkedIn Sales Navigator "search results"
 * page into lead records. Keyed off the data-anonymize attributes and
 * data-x-search-result="LEAD" markers LinkedIn's markup consistently uses,
 * not off generated class names (those are hashed per build and will churn).
 */
class LinkedInSalesNavigatorParser
{
    private const LINKEDIN_ORIGIN = 'https://www.linkedin.com';

    /**
     * @return array{leads: array<int, array<string, mixed>>, errors: array<int, array{index: int, message: string}>}
     */
    public function parse(string $html): array
    {
        $dom = new DOMDocument;
        @$dom->loadHTML('<?xml encoding="utf-8" ?>'.$html, LIBXML_NOERROR | LIBXML_NOWARNING);
        $xpath = new DOMXPath($dom);

        $leadNodes = $xpath->query('//*[@data-x-search-result="LEAD"]');

        $leads = [];
        $errors = [];

        foreach ($leadNodes as $index => $leadNode) {
            $name = $this->text($xpath, './/*[@data-anonymize="person-name"]', $leadNode);
            $profileUrl = $this->profileUrl($xpath, $leadNode);

            if (! $name || ! $profileUrl) {
                $errors[] = ['index' => $index + 1, 'message' => 'Could not find a name and profile link for this entry, skipped.'];

                continue;
            }

            [$company, $companyUrl] = $this->company($xpath, $leadNode);

            $leads[] = [
                'name' => $name,
                'title' => $this->text($xpath, './/*[@data-anonymize="title"]', $leadNode),
                'company' => $company,
                'company_url' => $companyUrl,
                'location' => $this->text($xpath, './/*[@data-anonymize="location"]', $leadNode),
                'profile_url' => $profileUrl,
                'connection_degree' => $this->connectionDegree($xpath, $leadNode),
                'about' => $this->about($xpath, $leadNode),
            ];
        }

        return ['leads' => $leads, 'errors' => $errors];
    }

    private function text(DOMXPath $xpath, string $query, DOMElement $context): ?string
    {
        $node = $xpath->query($query, $context)->item(0);
        if (! $node) {
            return null;
        }

        $text = trim(preg_replace('/\s+/', ' ', $node->textContent));

        return $text !== '' ? $text : null;
    }

    private function profileUrl(DOMXPath $xpath, DOMElement $context): ?string
    {
        $node = $xpath->query('.//a[starts-with(@data-lead-search-result, "profile-link")]', $context)->item(0);
        if (! $node instanceof DOMElement) {
            return null;
        }

        $href = $node->getAttribute('href');
        if ($href === '') {
            return null;
        }

        $path = parse_url($href, PHP_URL_PATH);
        if (! $path) {
            return null;
        }

        return self::LINKEDIN_ORIGIN.$path;
    }

    /**
     * @return array{0: ?string, 1: ?string}
     */
    private function company(DOMXPath $xpath, DOMElement $context): array
    {
        $subtitle = $xpath->query('.//*[contains(concat(" ", normalize-space(@class), " "), " artdeco-entity-lockup__subtitle ")]', $context)->item(0);
        if (! $subtitle) {
            return [null, null];
        }

        $anchor = $xpath->query('.//a[@data-anonymize="company-name"]', $subtitle)->item(0);
        if ($anchor instanceof DOMElement) {
            $href = $anchor->getAttribute('href');
            $path = $href !== '' ? parse_url($href, PHP_URL_PATH) : null;

            return [
                trim(preg_replace('/\s+/', ' ', $anchor->textContent)) ?: null,
                $path ? self::LINKEDIN_ORIGIN.$path : null,
            ];
        }

        // Some leads show a plain-text company name with no link.
        $parts = [];
        foreach ($xpath->query('./text()', $subtitle) as $textNode) {
            $value = trim(preg_replace('/\s+/', ' ', $textNode->textContent));
            if ($value !== '') {
                $parts[] = $value;
            }
        }

        return [$parts[0] ?? null, null];
    }

    private function connectionDegree(DOMXPath $xpath, DOMElement $context): ?string
    {
        $node = $xpath->query('.//*[contains(concat(" ", normalize-space(@class), " "), " artdeco-entity-lockup__degree ")]', $context)->item(0);
        if (! $node) {
            return null;
        }

        $text = preg_replace('/[^a-zA-Z0-9]/', '', $node->textContent);

        return $text !== '' ? $text : null;
    }

    private function about(DOMXPath $xpath, DOMElement $context): ?string
    {
        $node = $xpath->query('.//*[@data-anonymize="person-blurb"]', $context)->item(0);
        if (! $node instanceof DOMElement) {
            return null;
        }

        // LinkedIn puts the full, untruncated bio in the title attribute and
        // only a clipped version in the visible text.
        $full = $node->getAttribute('title');
        if ($full !== '') {
            return trim($full);
        }

        $text = trim(preg_replace('/\s+/', ' ', $node->textContent));

        return $text !== '' ? $text : null;
    }
}
