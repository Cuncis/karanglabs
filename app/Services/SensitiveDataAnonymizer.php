<?php

namespace App\Services;

/**
 * Masks credentials and personal identifiers in free-form text (.env files,
 * JSON, YAML, CLI commands, logs) so they never reach the AI provider or a
 * publicly shared page. Works on any text, not just JSON.
 */
class SensitiveDataAnonymizer
{
    private const REDACTED = '[REDACTED]';

    /** Key name segments (split on _ - . and camelCase) that mark a value as sensitive. */
    private const SENSITIVE_SEGMENTS = [
        'password', 'passwd', 'pwd', 'pass', 'secret', 'token', 'key', 'apikey',
        'credential', 'credentials', 'auth', 'private', 'salt', 'signature',
        'dsn', 'username', 'login', 'cookie', 'session', 'bearer', 'jwt',
    ];

    /** Values that carry no secret and are left readable. */
    private const HARMLESS_VALUES = ['', 'null', 'true', 'false', 'none', '~'];

    public function anonymize(string $text): string
    {
        $text = $this->redactPrivateKeys($text);
        $text = $this->redactAuthorizationHeaders($text);
        $text = $this->redactEnvAssignments($text);
        $text = $this->redactStructuredPairs($text);
        $text = $this->redactCliFlags($text);
        $text = $this->redactUrlCredentials($text);

        return $this->redactKnownPatterns($text);
    }

    private function isSensitiveKey(string $key): bool
    {
        $spaced = preg_replace('/([a-z0-9])([A-Z])/', '$1 $2', $key);
        $segments = preg_split('/[^A-Za-z0-9]+/', strtolower((string) $spaced), -1, PREG_SPLIT_NO_EMPTY);

        return count(array_intersect($segments, self::SENSITIVE_SEGMENTS)) > 0;
    }

    private function isHarmless(string $value): bool
    {
        $trimmed = trim($value);

        return in_array(strtolower($trimmed), self::HARMLESS_VALUES, true)
            || str_starts_with($trimmed, '${')
            || str_contains($trimmed, self::REDACTED);
    }

    private function redactPrivateKeys(string $text): string
    {
        return preg_replace(
            '/-----BEGIN [A-Z ]*PRIVATE KEY-----.*?-----END [A-Z ]*PRIVATE KEY-----/s',
            '[REDACTED PRIVATE KEY]',
            $text
        );
    }

    private function redactAuthorizationHeaders(string $text): string
    {
        return preg_replace('/\b(Bearer|Basic|Token)\s+[A-Za-z0-9._~+\/=-]{8,}/i', '$1 '.self::REDACTED, $text);
    }

    /** KEY=value lines, with or without `export`, quotes and trailing comments. */
    private function redactEnvAssignments(string $text): string
    {
        return preg_replace_callback(
            '/^([ \t]*(?:export[ \t]+)?)([A-Za-z_][A-Za-z0-9_.\-]*)([ \t]*=[ \t]*)(.*?)([ \t]+#.*)?$/m',
            function (array $m): string {
                if (! $this->isSensitiveKey($m[2]) || $this->isHarmless($m[4])) {
                    return $m[0];
                }

                $value = $m[4];
                if (preg_match('/^(["\'])(.*)\1$/s', $value, $quoted)) {
                    $value = $quoted[1].self::REDACTED.$quoted[1];
                } else {
                    $value = self::REDACTED;
                }

                return $m[1].$m[2].$m[3].$value.($m[5] ?? '');
            },
            $text
        );
    }

    /** `"key": "value"` (JSON) and `key: value` (YAML, headers). */
    private function redactStructuredPairs(string $text): string
    {
        return preg_replace_callback(
            '/(["\']?)([A-Za-z_][A-Za-z0-9_.\-]*)\1([ \t]*:[ \t]*)("(?:[^"\\\\\r\n]|\\\\.)*"|\'[^\'\r\n]*\'|[^\s,}\]]+)/',
            function (array $m): string {
                $key = strtolower($m[2]);
                if ($key === 'authorization' || ! $this->isSensitiveKey($m[2]) || $this->isHarmless(trim($m[4], '"\''))) {
                    return $m[0];
                }

                $quote = in_array($m[4][0], ['"', "'"], true) ? $m[4][0] : '';

                return $m[1].$m[2].$m[1].$m[3].$quote.self::REDACTED.$quote;
            },
            $text
        );
    }

    private function redactCliFlags(string $text): string
    {
        return preg_replace(
            '/(--?[\w-]*(?:password|passwd|secret|token|api-?key)[\w-]*)([=\s]+)(?!\[REDACTED)(\S+)/i',
            '$1$2'.self::REDACTED,
            $text
        );
    }

    private function redactUrlCredentials(string $text): string
    {
        return preg_replace('/([a-z][a-z0-9+.\-]*:\/\/)([^\s:\/@]+):([^\s@\/]+)@/i', '$1[USER]:'.self::REDACTED.'@', $text);
    }

    private function redactKnownPatterns(string $text): string
    {
        $patterns = [
            '/\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]*/' => '[REDACTED_JWT]',
            '/\bAKIA[0-9A-Z]{16}\b/' => '[REDACTED_AWS_KEY]',
            '/\b(?:sk|pk|rk)[_-](?:live|test|proj|ant)[A-Za-z0-9_-]{16,}/' => '[REDACTED_API_KEY]',
            '/\bsk-[A-Za-z0-9_-]{20,}/' => '[REDACTED_API_KEY]',
            '/\bgh[pousr]_[A-Za-z0-9]{30,}/' => '[REDACTED_GITHUB_TOKEN]',
            '/\bxox[abprs]-[A-Za-z0-9-]{10,}/' => '[REDACTED_SLACK_TOKEN]',
            '/\b[0-9a-f]{32}(?=\.[a-z0-9-]+\.[a-z]{2,})/i' => '[ACCOUNT_ID]',
            '/[A-Za-z0-9._%+\-]+@[A-Za-z0-9\-]+(?:\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,}/' => '[EMAIL]',
        ];

        $text = preg_replace(array_keys($patterns), array_values($patterns), $text);

        return preg_replace_callback('/\b(?:\d{1,3}\.){3}\d{1,3}\b/', function (array $m): string {
            $octets = array_map('intval', explode('.', $m[0]));
            $valid = max($octets) <= 255;
            $loopback = in_array($m[0], ['127.0.0.1', '0.0.0.0'], true);

            return $valid && ! $loopback ? '[IP]' : $m[0];
        }, $text);
    }
}
