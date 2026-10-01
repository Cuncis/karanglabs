<?php

namespace App\Services;

use RuntimeException;

/**
 * Loads AI system prompts from editable text files in resources/prompts, so
 * prompts can be tweaked without a deploy. Each file's first line must be a
 * "VERSION: n" marker (stripped before use, kept so anyone editing the file
 * can see/bump which version they're looking at).
 */
class PromptLoader
{
    public static function load(string $path): string
    {
        $fullPath = resource_path('prompts/'.$path);

        if (! is_file($fullPath)) {
            throw new RuntimeException("Prompt file not found: {$path}");
        }

        $contents = file_get_contents($fullPath);
        [$firstLine, $rest] = array_pad(explode("\n", $contents, 2), 2, '');

        if (! str_starts_with(trim($firstLine), 'VERSION:')) {
            throw new RuntimeException("Prompt file is missing its VERSION line: {$path}");
        }

        return trim($rest);
    }
}
