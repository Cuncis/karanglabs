<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class StudioAccountService
{
    /**
     * Provision Studio access for a paid order.
     *
     * Creates the buyer's account from the email they entered (generating a
     * random password) if it doesn't exist, otherwise just grants access to
     * their existing account. Returns the user plus the plain-text password
     * when one was generated (null for an existing account).
     *
     * @return array{user: User, password: ?string, created: bool}
     */
    public function provisionFromOrder(Order $order): array
    {
        $user = User::where('email', $order->email)->first();
        $plainPassword = null;
        $created = false;

        if (! $user) {
            $plainPassword = Str::password(12);
            $user = User::create([
                'name' => $order->name ?: Str::before($order->email, '@'),
                'email' => $order->email,
                'password' => Hash::make($plainPassword),
            ]);
            $user->forceFill(['email_verified_at' => now()])->save();
            $created = true;
        }

        $user->forceFill([
            'has_studio_access' => true,
            'studio_access_granted_at' => now(),
        ])->save();

        // The reseller plan upgrades the account's role and mints a license key.
        if ($order->plan === 'reseller') {
            $updates = ['license_key' => $user->license_key ?: $this->generateLicenseKey()];

            // Never downgrade an admin to reseller.
            if ($user->role !== User::ROLE_ADMIN) {
                $updates['role'] = User::ROLE_RESELLER;
            }

            $user->forceFill($updates)->save();
        }

        return [
            'user' => $user,
            'password' => $plainPassword,
            'created' => $created,
        ];
    }

    /**
     * A signed, expiring download link bound to the reseller's license key, or
     * null if the user isn't a reseller or no package is configured.
     */
    public function resellerDownloadUrl(User $user, int $days = 14): ?string
    {
        if (! $user->isReseller() || ! self::packageConfigured()) {
            return null;
        }

        return URL::temporarySignedRoute(
            'reseller.download',
            now()->addDays($days),
            ['license' => $user->license_key],
        );
    }

    /**
     * Whether a downloadable whitelabel package is configured (file or URL).
     */
    public static function packageConfigured(): bool
    {
        return (bool) (config('studio.reseller.file') || config('studio.reseller.download_url'));
    }

    /**
     * Generate a unique whitelabel license key, e.g. KLR-A1B2-C3D4-E5F6.
     */
    private function generateLicenseKey(): string
    {
        do {
            $key = 'KLR-'.implode('-', [
                Str::upper(Str::random(4)),
                Str::upper(Str::random(4)),
                Str::upper(Str::random(4)),
            ]);
        } while (User::where('license_key', $key)->exists());

        return $key;
    }

    /**
     * Generate a fresh password for a user, ensure they have access, and return
     * the plain-text password (used when re-sending login details).
     */
    public function resetPassword(User $user): string
    {
        $plainPassword = Str::password(12);

        $user->forceFill([
            'password' => Hash::make($plainPassword),
            'has_studio_access' => true,
            'studio_access_granted_at' => $user->studio_access_granted_at ?? now(),
        ])->save();

        return $plainPassword;
    }
}
