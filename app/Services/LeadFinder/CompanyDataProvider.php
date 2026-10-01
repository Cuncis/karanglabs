<?php

namespace App\Services\LeadFinder;

use App\Models\LeadFinderSegment;

/**
 * A source that can find real companies matching a segment, searched around
 * a given city. OverpassCompanyProvider (free, OpenStreetMap) is the only
 * implementation today; a paid source (Google Places, a business directory
 * API, etc.) can be added later by writing a new class against this same
 * interface, bound in place of it, without touching the job or controller
 * that consume it.
 */
interface CompanyDataProvider
{
    /**
     * @return array{ok: bool, companies: array<int, array{name: ?string, website: string, location: ?string, country: ?string, email: ?string}>, widened: bool, reason: ?string}
     */
    public function findCompanies(LeadFinderSegment $segment, string $city, int $userId): array;
}
