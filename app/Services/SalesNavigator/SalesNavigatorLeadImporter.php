<?php

namespace App\Services\SalesNavigator;

use App\Models\SalesNavigatorLead;

/**
 * Feeds parsed leads into the tracker, skipping any whose LinkedIn profile
 * URL is already saved so re-pasting the same search (or an overlapping
 * one) never creates duplicates or overwrites a lead's tracked progress.
 */
class SalesNavigatorLeadImporter
{
    /**
     * @param  array<int, array<string, mixed>>  $leads
     * @return array{imported: int, duplicates: array<int, array{name: string, company: ?string}>}
     */
    public function import(array $leads, ?int $addedBy): array
    {
        $imported = 0;
        $duplicates = [];

        $existingUrls = SalesNavigatorLead::pluck('profile_url')->all();

        foreach ($leads as $data) {
            if (in_array($data['profile_url'], $existingUrls, true)) {
                $duplicates[] = ['name' => $data['name'], 'company' => $data['company']];

                continue;
            }

            SalesNavigatorLead::create([
                'name' => $data['name'],
                'title' => $data['title'],
                'company' => $data['company'],
                'company_url' => $data['company_url'],
                'location' => $data['location'],
                'profile_url' => $data['profile_url'],
                'connection_degree' => $data['connection_degree'],
                'about' => $data['about'],
                'added_by' => $addedBy,
            ]);
            $existingUrls[] = $data['profile_url'];
            $imported++;
        }

        return ['imported' => $imported, 'duplicates' => $duplicates];
    }
}
