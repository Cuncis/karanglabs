<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Services\MayarService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Throwable;

class AiToolsCheckoutController extends Controller
{
    public function __construct(private MayarService $mayar) {}

    /**
     * Enroll a buyer in a Mayar Membership tier. Unlike Studio's one-time
     * invoice, this doesn't return a hosted payment link — Mayar takes it
     * from here and notifies us via webhook once the subscription is
     * actually paid, which is the only place access gets granted.
     */
    public function store(Request $request): JsonResponse
    {
        $plans = config('aitools.plans');

        $validator = Validator::make($request->all(), [
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:32'],
            'tier' => ['required', 'string', Rule::in(array_keys($plans))],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();
        $plan = $plans[$validated['tier']];

        if (! $plan['mayar_product_id'] || ! $plan['mayar_tier_id']) {
            return response()->json([
                'message' => 'Langganan ini belum bisa diaktifkan. Coba lagi nanti.',
            ], 422);
        }

        $subscription = Subscription::create([
            'email' => $validated['email'],
            'name' => $validated['name'] ?? null,
            'phone' => $validated['phone'],
            'tier' => $validated['tier'],
            'status' => Subscription::STATUS_PENDING,
            'mayar_product_id' => $plan['mayar_product_id'],
        ]);

        try {
            $member = $this->mayar->registerMembershipMember(
                $plan['mayar_product_id'],
                $plan['mayar_tier_id'],
                $validated['name'] ?? '',
                $validated['email'],
                $validated['phone'],
            );
        } catch (Throwable $e) {
            Log::error('Mayar membership registration failed', ['subscription' => $subscription->id, 'error' => $e->getMessage()]);

            return response()->json([
                'message' => 'Pendaftaran langganan belum bisa diproses. Coba lagi sebentar lagi.',
            ], 422);
        }

        $subscription->forceFill(['mayar_member_id' => $member['memberId'] ?? null])->save();

        return response()->json([
            'subscription_id' => $subscription->id,
        ]);
    }

    /**
     * Cancel the current user's active subscription. Access continues until
     * the current period's `expiredAt` — Mayar handles that, we just stop
     * treating it as renewing once the `membership.memberUnsubscribed`
     * webhook confirms it.
     */
    public function cancel(Request $request): JsonResponse
    {
        $subscription = $request->user()->subscriptions()
            ->where('status', Subscription::STATUS_ACTIVE)
            ->latest()
            ->first();

        if (! $subscription) {
            return response()->json(['message' => 'Kamu tidak punya langganan aktif.'], 404);
        }

        try {
            $this->mayar->cancelMembershipMember($subscription->mayar_member_id, $subscription->mayar_product_id);
        } catch (Throwable $e) {
            Log::error('Mayar membership cancellation failed', ['subscription' => $subscription->id, 'error' => $e->getMessage()]);

            return response()->json(['message' => 'Pembatalan belum bisa diproses. Coba lagi sebentar lagi.'], 422);
        }

        return response()->json(['message' => 'Langganan dibatalkan. Akses tetap aktif sampai akhir periode berjalan.']);
    }
}
