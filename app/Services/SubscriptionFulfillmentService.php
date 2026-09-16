<?php

namespace App\Services;

use App\Mail\AiToolsAccessMail;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Throwable;

class SubscriptionFulfillmentService
{
    /**
     * Activate a subscription: mark it active, provision the buyer's account,
     * and email their login details. Idempotent, safe to call from both the
     * Mayar webhook and a manual admin resend.
     *
     * @param  array<string, mixed>  $memberData  the Mayar `membershipCustomer` payload, if available
     */
    public function activate(Subscription $subscription, array $memberData = []): void
    {
        if ($subscription->isActive()) {
            return;
        }

        $user = User::where('email', $subscription->email)->first();
        $plainPassword = null;

        if (! $user) {
            $plainPassword = Str::password(12);
            $user = User::create([
                'name' => $subscription->name ?: Str::before($subscription->email, '@'),
                'email' => $subscription->email,
                'password' => Hash::make($plainPassword),
            ]);
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        $subscription->forceFill([
            'status' => Subscription::STATUS_ACTIVE,
            'user_id' => $user->id,
            'next_payment_at' => $memberData['nextPayment'] ?? $subscription->next_payment_at,
            'expires_at' => null,
        ])->save();

        try {
            Mail::to($subscription->email)->send(new AiToolsAccessMail($user, $subscription, $plainPassword));
        } catch (Throwable $e) {
            Log::error('Subscription activated but access email failed to send', [
                'subscription' => $subscription->id,
                'email' => $subscription->email,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * The buyer (or we) canceled — Mayar keeps their access until the current
     * period's `expiredAt`, so we don't cut access off here, only stop
     * treating it as a renewing subscription.
     */
    public function markStopped(Subscription $subscription, ?string $expiresAt = null): void
    {
        $subscription->forceFill([
            'status' => Subscription::STATUS_STOPPED,
            'expires_at' => $expiresAt ?? $subscription->expires_at,
        ])->save();
    }

    /**
     * A renewal charge failed and Mayar's grace period ran out — access ends.
     */
    public function markExpired(Subscription $subscription): void
    {
        $subscription->forceFill(['status' => Subscription::STATUS_EXPIRED])->save();
    }

    /**
     * The buyer switched tiers (e.g. Tools -> Bundle) inside Mayar's own
     * membership portal.
     */
    public function changeTier(Subscription $subscription, string $tier): void
    {
        $subscription->forceFill(['tier' => $tier])->save();
    }
}
