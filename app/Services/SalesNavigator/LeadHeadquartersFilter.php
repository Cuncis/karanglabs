<?php

namespace App\Services\SalesNavigator;

use App\Models\SalesNavigatorLead;
use Illuminate\Database\Eloquent\Builder;

/**
 * Buckets a lead's free-text `location` field (the only location data the
 * Sales Navigator parser captures, used here as a stand-in for company
 * headquarters) into a fixed set of mutually exclusive regions.
 *
 * Buckets are checked most-specific-first so a lead lands in exactly one:
 * California, United States and England, United Kingdom are carved out
 * before the broader United States / North America / APAC groups, and
 * anything left over falls into "Others".
 */
class LeadHeadquartersFilter
{
    public const CALIFORNIA_US = 'california_us';

    public const ENGLAND_UK = 'england_uk';

    public const UNITED_STATES = 'united_states';

    public const NORTH_AMERICA = 'north_america';

    public const APAC = 'apac';

    public const OTHERS = 'others';

    /** @var array<int, string> */
    public const BUCKETS = [
        self::UNITED_STATES,
        self::NORTH_AMERICA,
        self::APAC,
        self::ENGLAND_UK,
        self::CALIFORNIA_US,
        self::OTHERS,
    ];

    /** @var array<string, string> */
    public const LABELS = [
        self::UNITED_STATES => 'United States',
        self::NORTH_AMERICA => 'North America',
        self::APAC => 'APAC',
        self::ENGLAND_UK => 'England, United Kingdom',
        self::CALIFORNIA_US => 'California, United States',
        self::OTHERS => 'Others',
    ];

    /** Countries (besides the United States) that make up the North America bucket. */
    private const NORTH_AMERICA_KEYWORDS = ['Canada', 'Mexico', 'North America'];

    /** Countries/regions that make up the APAC bucket. */
    private const APAC_KEYWORDS = [
        'Australia', 'New Zealand', 'Japan', 'China', 'Hong Kong', 'Taiwan',
        'South Korea', 'Korea', 'Singapore', 'Malaysia', 'Indonesia', 'Thailand',
        'Vietnam', 'Philippines', 'India', 'Pakistan', 'Bangladesh',
        'APAC', 'Asia Pacific', 'Asia-Pacific',
    ];

    /**
     * Scope a leads query down to the given headquarters bucket.
     *
     * @param  Builder<SalesNavigatorLead>  $query
     * @return Builder<SalesNavigatorLead>
     */
    public static function apply(Builder $query, string $bucket): Builder
    {
        return match ($bucket) {
            self::CALIFORNIA_US => $query
                ->where('location', 'like', '%California%')
                ->where('location', 'like', '%United States%'),

            self::ENGLAND_UK => $query
                ->where('location', 'like', '%England%')
                ->where('location', 'like', '%United Kingdom%'),

            self::UNITED_STATES => $query
                ->where('location', 'like', '%United States%')
                ->where('location', 'not like', '%California%'),

            self::NORTH_AMERICA => $query->where(
                fn ($q) => self::whereAnyKeyword($q, self::NORTH_AMERICA_KEYWORDS)
            ),

            self::APAC => $query->where(
                fn ($q) => self::whereAnyKeyword($q, self::APAC_KEYWORDS)
            ),

            self::OTHERS => $query->where(fn ($q) => $q
                ->whereNull('location')
                ->orWhere('location', '')
                ->orWhere(fn ($q2) => $q2
                    ->where('location', 'not like', '%United States%')
                    ->where(fn ($q3) => self::whereNoneOfKeyword($q3, ['England', 'United Kingdom']))
                    ->where(fn ($q3) => self::whereNoneOfKeyword($q3, self::NORTH_AMERICA_KEYWORDS))
                    ->where(fn ($q3) => self::whereNoneOfKeyword($q3, self::APAC_KEYWORDS)))),

            default => $query,
        };
    }

    /**
     * @param  Builder<SalesNavigatorLead>  $query
     * @param  array<int, string>  $keywords
     * @return Builder<SalesNavigatorLead>
     */
    private static function whereAnyKeyword(Builder $query, array $keywords): Builder
    {
        foreach ($keywords as $keyword) {
            $query->orWhere('location', 'like', "%{$keyword}%");
        }

        return $query;
    }

    /**
     * @param  Builder<SalesNavigatorLead>  $query
     * @param  array<int, string>  $keywords
     * @return Builder<SalesNavigatorLead>
     */
    private static function whereNoneOfKeyword(Builder $query, array $keywords): Builder
    {
        foreach ($keywords as $keyword) {
            $query->where('location', 'not like', "%{$keyword}%");
        }

        return $query;
    }
}
