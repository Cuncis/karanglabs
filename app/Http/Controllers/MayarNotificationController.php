<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Subscription;
use App\Services\MayarService;
use App\Services\OrderFulfillmentService;
use App\Services\SubscriptionFulfillmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MayarNotificationController extends Controller
{
    /**
     * Membership event names Mayar sends, mapped to the handler method below.
     *
     * @var array<string, string>
     */
    private const MEMBERSHIP_EVENTS = [
        'membership.newMemberRegistered' => 'handleMemberActivated',
        'membership.changeTierMemberRegistered' => 'handleMemberActivated',
        'membership.memberUnsubscribed' => 'handleMemberUnsubscribed',
        'membership.memberExpired' => 'handleMemberExpired',
    ];

    public function __construct(
        private MayarService $mayar,
        private OrderFulfillmentService $fulfillment,
        private SubscriptionFulfillmentService $subscriptions,
    ) {}

    /**
     * Handle Mayar's webhook. Mayar sends the webhook token we set in the
     * dashboard in the `X-Callback-Token` header; we verify it, then confirm
     * state server-to-server before fulfilling — the webhook body alone is
     * never trusted. One-time invoices (Studio) and Membership subscriptions
     * (AI Tools) share this single endpoint, since Mayar only lets you
     * register one webhook URL per account.
     */
    public function handle(Request $request): JsonResponse
    {
        if (! $this->mayar->isValidWebhookToken($request->header('X-Callback-Token'))) {
            return response()->json(['message' => 'Invalid token'], 403);
        }

        $event = $request->input('event');

        // Mayar's "test webhook" button sends a dummy event — acknowledge it so
        // the dashboard reports the endpoint as reachable.
        if ($event === 'testing') {
            return response()->json(['message' => 'ok']);
        }

        if (isset(self::MEMBERSHIP_EVENTS[$event])) {
            return $this->{self::MEMBERSHIP_EVENTS[$event]}($request->input('data', []));
        }

        return $this->handleInvoicePayment($request->input('data', []));
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function handleInvoicePayment(array $data): JsonResponse
    {
        $orderId = $data['extraData']['order_id'] ?? null;
        $invoiceId = $data['id'] ?? $data['paymentLinkId'] ?? null;

        $order = $orderId ? Order::where('order_id', $orderId)->first() : null;

        if (! $order && $invoiceId) {
            $order = Order::where('gateway_ref', $invoiceId)->first();
        }

        if (! $order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        if ($order->isPaid()) {
            return response()->json(['message' => 'Already processed']);
        }

        if ($order->gateway_ref && $this->mayar->isPaidInvoice($order->gateway_ref)) {
            $this->fulfillment->fulfill($order);

            return response()->json(['message' => 'Access granted']);
        }

        return response()->json(['message' => 'Notification received']);
    }

    /**
     * A member enrolled or switched tiers. We independently re-check the
     * member's status against Mayar before granting access, the webhook body
     * alone is never trusted.
     *
     * @param  array<string, mixed>  $data
     */
    private function handleMemberActivated(array $data): JsonResponse
    {
        $subscription = $this->findSubscription($data);

        if (! $subscription) {
            return response()->json(['message' => 'Subscription not found'], 404);
        }

        if (isset($data['membershipTierId']) && $tier = $this->tierFromMayarTierId($data['membershipTierId'])) {
            $this->subscriptions->changeTier($subscription, $tier);
        }

        $member = $this->mayar->membershipMemberStatus($subscription->mayar_product_id, $subscription->mayar_member_id);

        if (! $member || ($member['status'] ?? null) !== 'active') {
            return response()->json(['message' => 'Notification received']);
        }

        $this->subscriptions->activate($subscription->fresh(), $member);

        return response()->json(['message' => 'Access granted']);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function handleMemberUnsubscribed(array $data): JsonResponse
    {
        $subscription = $this->findSubscription($data);

        if (! $subscription) {
            return response()->json(['message' => 'Subscription not found'], 404);
        }

        $this->subscriptions->markStopped($subscription, $data['expiredAt'] ?? null);

        return response()->json(['message' => 'Subscription stopped']);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function handleMemberExpired(array $data): JsonResponse
    {
        $subscription = $this->findSubscription($data);

        if (! $subscription) {
            return response()->json(['message' => 'Subscription not found'], 404);
        }

        $this->subscriptions->markExpired($subscription);

        return response()->json(['message' => 'Subscription expired']);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function findSubscription(array $data): ?Subscription
    {
        $memberId = $data['memberId'] ?? $data['id'] ?? null;

        if ($memberId && $subscription = Subscription::where('mayar_member_id', $memberId)->first()) {
            return $subscription;
        }

        $email = $data['customerEmail'] ?? $data['customer']['email'] ?? null;

        return $email ? Subscription::where('email', $email)->latest()->first() : null;
    }

    private function tierFromMayarTierId(string $mayarTierId): ?string
    {
        foreach (config('aitools.plans') as $tier => $plan) {
            if ($plan['mayar_tier_id'] === $mayarTierId) {
                return $tier;
            }
        }

        return null;
    }
}
