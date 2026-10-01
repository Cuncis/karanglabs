<?php

namespace App\Services\LeadFinder;

use App\Models\LeadFinderSegment;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

/**
 * Finds real companies for a segment via OpenStreetMap's Overpass API: free,
 * no API key, but strict about etiquette (a real User-Agent, an explicit
 * Accept header, and tolerance for being told to back off). Only returns
 * items that have a website tag, since that's what the rest of the pipeline
 * needs to do anything useful with a result.
 */
class OverpassCompanyProvider implements CompanyDataProvider
{
    private const MIRRORS = [
        'https://overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter',
    ];

    /**
     * @var array<int, array{key: string, value: string}>
     */
    private const BROAD_TAGS = [
        ['key' => 'shop', 'value' => '*'],
        ['key' => 'office', 'value' => '*'],
        ['key' => 'craft', 'value' => '*'],
    ];

    public function __construct(
        private NominatimGeocoder $geocoder,
        private OsmTagTranslator $translator,
    ) {}

    /**
     * @return array{ok: bool, companies: array<int, array<string, mixed>>, widened: bool, reason: ?string}
     */
    public function findCompanies(LeadFinderSegment $segment, string $city, int $userId): array
    {
        $location = $this->geocoder->resolve($city);
        if (! $location['ok']) {
            return ['ok' => false, 'companies' => [], 'widened' => false, 'reason' => $location['reason']];
        }

        $tags = $this->translator->translate($segment, $userId);
        if (empty($tags)) {
            return ['ok' => false, 'companies' => [], 'widened' => false, 'reason' => 'Could not turn this segment into a map search. Please try again.'];
        }

        $elements = $this->runQuery(OverpassQueryBuilder::build($tags, $location['bbox']));
        if ($elements === null) {
            return ['ok' => false, 'companies' => [], 'widened' => false, 'reason' => 'The map search service is busy right now. Please try again shortly.'];
        }

        $widened = false;
        if (empty($elements)) {
            $widened = true;
            $elements = $this->runQuery(OverpassQueryBuilder::build(self::BROAD_TAGS, $location['bbox']));
            if ($elements === null) {
                return ['ok' => false, 'companies' => [], 'widened' => false, 'reason' => 'The map search service is busy right now. Please try again shortly.'];
            }
        }

        return ['ok' => true, 'companies' => $this->mapElements($elements), 'widened' => $widened, 'reason' => null];
    }

    /**
     * Tries each mirror in turn; on a "busy" response (429/504) waits briefly
     * and retries that same mirror once before moving to the next one.
     * Returns null only once every mirror has been exhausted.
     *
     * @return ?array<int, array<string, mixed>>
     */
    private function runQuery(string $query): ?array
    {
        foreach (self::MIRRORS as $url) {
            for ($attempt = 0; $attempt < 2; $attempt++) {
                try {
                    $response = Http::withHeaders([
                        'User-Agent' => config('services.fetch.user_agent'),
                        'Accept' => '*/*',
                    ])->asForm()->connectTimeout(15)->timeout(30)->post($url, ['data' => $query]);
                } catch (ConnectionException) {
                    break; // try the next mirror
                }

                if (in_array($response->status(), [429, 504], true)) {
                    if ($attempt === 0) {
                        sleep(2);

                        continue;
                    }

                    break; // still busy after one retry, try the next mirror
                }

                if ($response->failed()) {
                    break; // try the next mirror
                }

                return $response->json('elements') ?? [];
            }
        }

        return null;
    }

    /**
     * @param  array<int, array<string, mixed>>  $elements
     * @return array<int, array<string, mixed>>
     */
    private function mapElements(array $elements): array
    {
        $companies = [];

        foreach ($elements as $element) {
            $tags = $element['tags'] ?? [];
            $rawWebsite = $tags['website'] ?? $tags['contact:website'] ?? null;
            $website = is_string($rawWebsite) ? UrlNormalizer::normalize($rawWebsite) : null;

            if (! $website) {
                continue;
            }

            $locationParts = array_filter([
                $tags['addr:housenumber'] ?? null,
                $tags['addr:street'] ?? null,
                $tags['addr:city'] ?? null,
            ]);

            $companies[] = [
                'name' => $tags['name'] ?? null,
                'website' => $website,
                'location' => $locationParts !== [] ? implode(' ', $locationParts) : null,
                'country' => $tags['addr:country'] ?? null,
                'email' => $tags['email'] ?? $tags['contact:email'] ?? null,
                'contact_name' => null,
                'contact_title' => null,
            ];
        }

        return $companies;
    }
}
