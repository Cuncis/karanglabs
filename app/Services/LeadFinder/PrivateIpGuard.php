<?php

namespace App\Services\LeadFinder;

/**
 * Shared private/internal IP check (SSRF protection), used both for the fast
 * pre-check at submission time and the defense-in-depth check right before
 * the actual fetch, to guard against DNS rebinding between the two.
 */
class PrivateIpGuard
{
    /**
     * Resolves the host and returns a safe public IP to connect to, or null
     * if the host could not be resolved or every resolved address is
     * private/loopback/link-local/reserved.
     */
    public static function resolveSafeIp(string $host): ?string
    {
        foreach (self::resolve($host) as $ip) {
            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return $ip;
            }
        }

        return null;
    }

    /**
     * True only when the host resolves to at least one address and every
     * address it resolves to is private/loopback/link-local/reserved. An
     * unresolvable host returns false here, the actual fetch will report a
     * clearer "unreachable" reason.
     */
    public static function hasOnlyPrivateIps(string $host): bool
    {
        $ips = self::resolve($host);

        if (empty($ips)) {
            return false;
        }

        foreach ($ips as $ip) {
            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return false;
            }
        }

        return true;
    }

    /**
     * @return array<int, string>
     */
    private static function resolve(string $host): array
    {
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return [$host];
        }

        return @gethostbynamel($host) ?: [];
    }
}
