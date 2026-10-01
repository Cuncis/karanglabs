<?php

namespace App\Services;

/**
 * Parses a JSON object out of a Claude text response: strips markdown code
 * fences the model sometimes adds despite instructions not to, fixes
 * truncated multibyte sequences, and strips stray control characters before
 * decoding. Returns null (never throws) when the result still isn't valid
 * JSON, so callers can retry or fail gracefully.
 */
class AiJsonParser
{
    public static function parse(?string $content): ?array
    {
        if (! $content) {
            return null;
        }

        $content = trim($content);
        if (str_starts_with($content, '```json')) {
            $content = substr($content, 7);
        } elseif (str_starts_with($content, '```')) {
            $content = substr($content, 3);
        }
        if (str_ends_with($content, '```')) {
            $content = substr($content, 0, -3);
        }
        $content = trim($content);
        $content = mb_convert_encoding($content, 'UTF-8', 'UTF-8');
        $content = preg_replace('/[\x00-\x1F\x7F]/', '', $content);

        $json = json_decode($content, true);

        return json_last_error() === JSON_ERROR_NONE && is_array($json) ? $json : null;
    }
}
