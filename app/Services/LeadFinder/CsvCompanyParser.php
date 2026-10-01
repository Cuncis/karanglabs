<?php

namespace App\Services\LeadFinder;

/**
 * Parses an uploaded CSV of companies: required columns name and site, plus
 * optional description, location, country, contact_name, contact_title, and
 * contact_email. Row-level problems are reported rather than failing the
 * whole file, matching the "show row-level errors" requirement.
 */
class CsvCompanyParser
{
    private const REQUIRED_COLUMNS = ['name', 'site'];

    /**
     * @return array{companies: array<int, array<string, mixed>>, errors: array<int, array{row: int, message: string}>}
     */
    public function parse(string $filePath): array
    {
        $handle = fopen($filePath, 'r');
        if (! $handle) {
            return ['companies' => [], 'errors' => [['row' => 0, 'message' => 'Could not read this file.']]];
        }

        $header = fgetcsv($handle);
        if (! $header) {
            fclose($handle);

            return ['companies' => [], 'errors' => [['row' => 0, 'message' => 'This file has no header row.']]];
        }
        $header = array_map(fn ($column) => strtolower(trim((string) $column)), $header);

        foreach (self::REQUIRED_COLUMNS as $required) {
            if (! in_array($required, $header, true)) {
                fclose($handle);

                return ['companies' => [], 'errors' => [['row' => 0, 'message' => "Missing required column \"{$required}\"."]]];
            }
        }

        $companies = [];
        $errors = [];
        $rowNumber = 1;

        while (($row = fgetcsv($handle)) !== false) {
            $rowNumber++;

            if (count(array_filter($row, fn ($value) => $value !== null && $value !== '')) === 0) {
                continue; // skip fully blank rows
            }

            $data = [];
            foreach ($header as $i => $column) {
                $data[$column] = isset($row[$i]) ? trim((string) $row[$i]) : null;
            }

            $name = $data['name'] ?: null;
            $site = $data['site'] ?: null;

            if (! $name) {
                $errors[] = ['row' => $rowNumber, 'message' => 'Missing "name".'];

                continue;
            }
            if (! $site) {
                $errors[] = ['row' => $rowNumber, 'message' => 'Missing "site".'];

                continue;
            }

            $normalized = UrlNormalizer::normalize($site);
            if (! $normalized) {
                $errors[] = ['row' => $rowNumber, 'message' => "\"{$site}\" does not look like a valid website address."];

                continue;
            }

            $email = $data['contact_email'] ?? null;

            $companies[] = [
                'name' => $name,
                'website' => $normalized,
                'location' => $data['location'] ?? null,
                'country' => $data['country'] ?? null,
                'email' => $email && filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : null,
                'contact_name' => $data['contact_name'] ?? null,
                'contact_title' => $data['contact_title'] ?? null,
            ];
        }

        fclose($handle);

        return ['companies' => $companies, 'errors' => $errors];
    }
}
