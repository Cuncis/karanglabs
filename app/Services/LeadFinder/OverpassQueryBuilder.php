<?php

namespace App\Services\LeadFinder;

/**
 * Builds an Overpass QL query string from already-validated tag pairs and a
 * bounding box. Re-validates every pair itself (belt and suspenders: this
 * class has no way of knowing whether its caller already checked), so no
 * caller can accidentally interpolate unsanitized text into the query.
 */
class OverpassQueryBuilder
{
    /**
     * @param  array<int, array{key: string, value: string}>  $tagPairs
     * @param  array{south: float, north: float, west: float, east: float}  $bbox
     */
    public static function build(array $tagPairs, array $bbox): string
    {
        $bboxStr = sprintf('%F,%F,%F,%F', $bbox['south'], $bbox['west'], $bbox['north'], $bbox['east']);

        $clauses = [];
        foreach ($tagPairs as $pair) {
            if (! OsmTagTranslator::isValidPair($pair['key'] ?? null, $pair['value'] ?? null)) {
                continue;
            }

            $filter = $pair['value'] === '*'
                ? "[\"{$pair['key']}\"]"
                : "[\"{$pair['key']}\"=\"{$pair['value']}\"]";

            $clauses[] = "node{$filter}[\"website\"]({$bboxStr});";
            $clauses[] = "way{$filter}[\"website\"]({$bboxStr});";
        }

        $body = implode("\n  ", $clauses);

        return "[out:json][timeout:25];\n(\n  {$body}\n);\nout center 60;";
    }
}
