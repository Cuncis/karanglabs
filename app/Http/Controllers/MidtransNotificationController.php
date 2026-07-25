<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\MidtransService;
use App\Services\OrderFulfillmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MidtransNotificationController extends Controller
{
    public function __construct(
        private MidtransService $midtrans,
        private OrderFulfillmentService $fulfillment,
    ) {}

    /**
     * Handle Midtrans' server-to-server payment notification (webhook).
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();

        if (! $this->midtrans->isValidSignature($payload)) {
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $order = Order::where('order_id', $payload['order_id'] ?? '')->first();

        if (! $order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        // Already fulfilled — acknowledge without provisioning twice.
        if ($order->isPaid()) {
            return response()->json(['message' => 'Already processed']);
        }

        $transactionStatus = $payload['transaction_status'] ?? '';
        $fraudStatus = $payload['fraud_status'] ?? 'accept';

        $isSettled = in_array($transactionStatus, ['capture', 'settlement'], true)
            && $fraudStatus === 'accept';

        if ($isSettled) {
            $this->fulfillment->fulfill($order);

            return response()->json(['message' => 'Access granted']);
        }

        if (in_array($transactionStatus, ['deny', 'cancel', 'expire'], true)) {
            $order->forceFill(['status' => 'failed'])->save();
        }

        return response()->json(['message' => 'Notification received']);
    }
}
