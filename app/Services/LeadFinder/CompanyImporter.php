<?php

namespace App\Services\LeadFinder;

use App\Models\LeadFinderCompany;
use App\Models\LeadFinderSegment;

/**
 * Feeds normalized company records into a segment's shared list, regardless
 * of which of the three sources (map, paste, CSV) found them, skipping any
 * whose domain is already in that segment's list.
 */
class CompanyImporter
{
    /**
     * @param  array<int, array{name: ?string, website: string, location: ?string, country: ?string, email: ?string, contact_name?: ?string, contact_title?: ?string}>  $companies
     * @return array{imported: int, duplicates: int}
     */
    public function import(LeadFinderSegment $segment, array $companies, string $source): array
    {
        $imported = 0;
        $duplicates = 0;

        // Domains already in this segment's list, including any just added in
        // this same batch (CSVs and pasted lists can contain their own dupes).
        $seenDomains = LeadFinderCompany::where('lead_finder_segment_id', $segment->id)
            ->pluck('domain')->all();

        foreach ($companies as $data) {
            $domain = UrlNormalizer::domain($data['website']);
            if (! $domain) {
                continue;
            }

            if (in_array($domain, $seenDomains, true)) {
                $duplicates++;

                continue;
            }

            LeadFinderCompany::create([
                'lead_finder_segment_id' => $segment->id,
                'source' => $source,
                'name' => $data['name'] ?? null,
                'website' => $data['website'],
                'domain' => $domain,
                'location' => $data['location'] ?? null,
                'country' => $data['country'] ?? null,
                'email' => $data['email'] ?? null,
                'contact_name' => $data['contact_name'] ?? null,
                'contact_title' => $data['contact_title'] ?? null,
            ]);
            $seenDomains[] = $domain;
            $imported++;
        }

        if ($imported > 0) {
            $segment->increment('companies_count', $imported);
        }

        return ['imported' => $imported, 'duplicates' => $duplicates];
    }
}
