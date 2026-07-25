<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Throwable;

class CheckoutController extends Controller
{
    public function __construct(private MidtransService $midtrans) {}

    /**
     * Create an order and a Midtrans Snap token for the browser to pay with.
     */
    public function store(Request $request): JsonResponse
    {
        $plans = config('studio.plans');

        // Validate manually so this JSON endpoint always returns JSON errors
        // (the global handler only renders JSON for api/* paths).
        $validator = Validator::make($request->all(), [
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'plan' => ['required', 'string', Rule::in(array_keys($plans))],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();
        $plan = $plans[$validated['plan']];

        $order = Order::create([
            'order_id' => 'KL-'.strtoupper(Str::random(12)),
            'email' => $validated['email'],
            'name' => $validated['name'] ?? null,
            'plan' => $validated['plan'],
            'amount' => $plan['amount'],
            'status' => 'pending',
        ]);

        try {
            $snap = $this->midtrans->createSnapTransaction($order);
        } catch (Throwable $e) {
            Log::error('Midtrans checkout failed', ['order' => $order->order_id, 'error' => $e->getMessage()]);

            return response()->json([
                'message' => 'Pembayaran belum bisa diproses. Coba lagi sebentar lagi.',
            ], 422);
        }

        return response()->json([
            'token' => $snap['token'],
            'order_id' => $order->order_id,
        ]);
    }
}
