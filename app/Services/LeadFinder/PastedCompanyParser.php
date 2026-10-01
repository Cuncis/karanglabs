<?php

namespace App\Services\LeadFinder;

/**
 * Parses the "paste website addresses" box: one company per line, either a
 * bare URL, or "Name | site | email". Invalid lines are reported, not
 * silently dropped, so the user knows what didn't make it in.
 */
class PastedCompanyParser
{
    /**
     * @return array{companies: array<int, array<string, mixed>>, errors: array<int, array{line: int, message: string}>}
     */
    public function parse(string $text): array
    {
        $companies = [];
        $errors = [];

        $lines = preg_split('/\r\n|\r|\n/', trim($text));

        foreach ($lines as $i => $rawLine) {
            $line = trim($rawLine);
            if ($line === '') {
                continue;
            }

            $parts = array_map('trim', explode('|', $line));
            $name = null;
            $website = $parts[0];
            $email = null;

            if (count($parts) >= 3) {
                $name = $parts[0] !== '' ? $parts[0] : null;
                $website = $parts[1];
                $email = $parts[2] !== '' ? $parts[2] : null;
            } elseif (count($parts) === 2) {
                $name = $parts[0] !== '' ? $parts[0] : null;
                $website = $parts[1];
            }

            $normalized = $website !== '' ? UrlNormalizer::normalize($website) : null;

            if (! $normalized) {
                $errors[] = ['line' => $i + 1, 'message' => "\"{$line}\" does not look like a valid website address."];

                continue;
            }

            $companies[] = [
                'name' => $name,
                'website' => $normalized,
                'location' => null,
                'country' => null,
                'email' => $email && filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : null,
                'contact_name' => null,
                'contact_title' => null,
            ];
        }

        return ['companies' => $companies, 'errors' => $errors];
    }
}
