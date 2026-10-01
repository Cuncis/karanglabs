<?php

namespace App\Services\LeadFinder;

use DOMDocument;
use DOMXPath;

/**
 * Fetches a company's homepage plus its About/Services/Contact/Team pages
 * (found by following likely links, or guessing /about and /services when
 * none are found), and classifies each page as readable or not with a
 * human-readable reason instead of silently skipping it.
 */
class SiteCrawler
{
    private const LINK_KEYWORDS = ['about', 'services', 'contact', 'team', 'tentang', 'layanan'];

    private const BOT_CHECK_PHRASES = [
        'one moment, please',
        'one moment please',
        'just a moment',
        'checking your browser',
        'enable javascript and cookies',
    ];

    private const MIN_READABLE_CHARS = 150;

    private const MAX_EXTRA_PAGES = 3;

    public function __construct(private SafeUrlFetcher $fetcher) {}

    /**
     * @return array<int, array{type: string, url: string, ok: bool, text: ?string, reason: ?string}>
     */
    public function read(string $baseUrl): array
    {
        $pages = [];

        $homepage = $this->fetcher->fetch($baseUrl);
        $pages[] = $this->classify('homepage', $baseUrl, $homepage);

        $links = $homepage['ok'] ? $this->findCandidateLinks($baseUrl, $homepage['html']) : [];

        if (empty($links)) {
            $links = [
                'about' => rtrim($baseUrl, '/').'/about',
                'services' => rtrim($baseUrl, '/').'/services',
            ];
        }

        foreach (array_slice($links, 0, self::MAX_EXTRA_PAGES, true) as $type => $url) {
            $pages[] = $this->classify($type, $url, $this->fetcher->fetch($url));
        }

        return $pages;
    }

    /**
     * @return array<string, string> keyword => absolute URL
     */
    private function findCandidateLinks(string $baseUrl, ?string $html): array
    {
        if (! $html) {
            return [];
        }

        $dom = new DOMDocument;
        @$dom->loadHTML($html, LIBXML_NOERROR | LIBXML_NOWARNING);

        $found = [];
        foreach ($dom->getElementsByTagName('a') as $anchor) {
            $href = $anchor->getAttribute('href');
            if ($href === '') {
                continue;
            }

            $haystack = strtolower($href.' '.trim($anchor->textContent));
            foreach (self::LINK_KEYWORDS as $keyword) {
                if (! isset($found[$keyword]) && str_contains($haystack, $keyword)) {
                    $absolute = $this->resolveUrl($baseUrl, $href);
                    if ($absolute) {
                        $found[$keyword] = $absolute;
                    }
                }
            }
        }

        return $found;
    }

    private function resolveUrl(string $baseUrl, string $href): ?string
    {
        if (str_starts_with($href, 'http://') || str_starts_with($href, 'https://')) {
            return $href;
        }
        if (str_starts_with($href, '#') || str_starts_with($href, 'javascript:') || str_starts_with($href, 'mailto:') || str_starts_with($href, 'tel:')) {
            return null;
        }

        $base = parse_url($baseUrl);
        if (! isset($base['host'])) {
            return null;
        }
        $origin = ($base['scheme'] ?? 'https').'://'.$base['host'].(isset($base['port']) ? ':'.$base['port'] : '');

        return str_starts_with($href, '/') ? $origin.$href : $origin.'/'.ltrim($href, '/');
    }

    /**
     * @param  array{ok: bool, html: ?string, reason: ?string}  $result
     * @return array{type: string, url: string, ok: bool, text: ?string, reason: ?string}
     */
    private function classify(string $type, string $url, array $result): array
    {
        if (! $result['ok']) {
            return ['type' => $type, 'url' => $url, 'ok' => false, 'text' => null, 'reason' => $result['reason']];
        }

        $text = $this->extractVisibleText($result['html']);

        foreach (self::BOT_CHECK_PHRASES as $phrase) {
            if (str_contains(strtolower($text), $phrase)) {
                return ['type' => $type, 'url' => $url, 'ok' => false, 'text' => null, 'reason' => 'This page looks like a bot-check page, not real content, so we did not try to get past it.'];
            }
        }

        if (mb_strlen(trim($text)) < self::MIN_READABLE_CHARS) {
            return ['type' => $type, 'url' => $url, 'ok' => false, 'text' => null, 'reason' => 'This page has almost no readable text, it may be a JavaScript-only page.'];
        }

        return ['type' => $type, 'url' => $url, 'ok' => true, 'text' => $text, 'reason' => null];
    }

    private function extractVisibleText(string $html): string
    {
        $dom = new DOMDocument;
        @$dom->loadHTML('<?xml encoding="utf-8" ?>'.$html, LIBXML_NOERROR | LIBXML_NOWARNING);
        $xpath = new DOMXPath($dom);

        foreach ($xpath->query('//script|//style|//nav|//footer|//noscript') ?: [] as $node) {
            $node->parentNode?->removeChild($node);
        }

        $text = $dom->textContent ?? '';

        return trim((string) preg_replace('/\s+/', ' ', $text));
    }
}
