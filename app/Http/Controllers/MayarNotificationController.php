<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\MayarService;
use App\Services\OrderFulfillmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MayarNotificationController extends Controller
{
    public function __construct(
        private MayarService $mayar,
        private OrderFulfillmentService $fulfillment,
    ) {}

    /**
     * Handle Mayar's payment webhook. Mayar sends the webhook token we set in
     * the dashboard in the `X-Callback-Token` header; we verify it, then
     * confirm the invoice status server-to-server before fulfilling — the
     * webhook body alone is never trusted.
     */
    public function handle(Request $request): JsonResponse
    {
        if (! $this->mayar->isValidWebhookToken($request->header('X-Callback-Token'))) {
            return response()->json(['message' => 'Invalid token'], 403);
        }

        // Mayar's "test webhook" button sends a dummy event — acknowledge it so
        // the dashboard reports the endpoint as reachable.
        if ($request->input('event') === 'testing') {
            return response()->json(['message' => 'ok']);
        }

        $data = $request->input('data', []);
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
}
