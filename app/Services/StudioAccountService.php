<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
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

        return [
            'user' => $user,
            'password' => $plainPassword,
            'created' => $created,
        ];
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
