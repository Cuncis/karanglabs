<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\MayarService;
use App\Services\OrderFulfillmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class CheckoutController extends Controller
{
    public function __construct(
        private MayarService $mayar,
        private OrderFulfillmentService $fulfillment,
    ) {}

    /**
     * Create an order and a Mayar invoice, returning the hosted payment link
     * the browser redirects to.
     */
    public function store(Request $request): JsonResponse
    {
        $plans = config('studio.plans');

        // Validate manually so this JSON endpoint always returns JSON errors
        // (the global handler only renders JSON for api/* paths). Mayar requires
        // a mobile number on every invoice, so phone is mandatory here.
        $validator = Validator::make($request->all(), [
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:32'],
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
            'phone' => $validated['phone'],
            'plan' => $validated['plan'],
            'amount' => $plan['amount'],
            'status' => 'pending',
        ]);

        try {
            $invoice = $this->mayar->createInvoice($order);
        } catch (Throwable $e) {
            Log::error('Mayar checkout failed', ['order' => $order->order_id, 'error' => $e->getMessage()]);

            return response()->json([
                'message' => 'Pembayaran belum bisa diproses. Coba lagi sebentar lagi.',
            ], 422);
        }

        $order->forceFill(['gateway_ref' => $invoice['id']])->save();

        return response()->json([
            'link' => $invoice['link'],
            'order_id' => $order->order_id,
        ]);
    }

    /**
     * Confirm a payment on demand by asking Mayar for the invoice status
     * server-side and fulfilling it if paid. Idempotent and safe to call
     * alongside the webhook — a harmless no-op once already fulfilled.
     */
    public function finalize(Request $request): JsonResponse
    {
        $validated = $request->validate(['order_id' => ['required', 'string']]);

        $order = Order::where('order_id', $validated['order_id'])->first();

        if (! $order) {
            return response()->json(['status' => 'not_found'], 404);
        }

        if ($order->isPaid()) {
            return response()->json(['status' => 'paid']);
        }

        if ($order->gateway_ref && $this->mayar->isPaidInvoice($order->gateway_ref)) {
            $this->fulfillment->fulfill($order);

            return response()->json(['status' => 'paid']);
        }

        return response()->json(['status' => 'pending']);
    }

    /**
     * Full-page confirmation shown after Mayar redirects the buyer back. We
     * confirm the payment server-side and fulfill on the spot (webhook is the
     * backup), and look the email up from the order reference so no personal
     * data ever rides in the URL.
     */
    public function success(Request $request): Response
    {
        $order = Order::where('order_id', $request->query('order'))->first();

        if ($order && ! $order->isPaid() && $order->gateway_ref && $this->mayar->isPaidInvoice($order->gateway_ref)) {
            $this->fulfillment->fulfill($order);
        }

        return Inertia::render('CheckoutSuccess', [
            'email' => $order?->email,
            'planTitle' => $order ? config("studio.plans.{$order->plan}.name") : null,
        ]);
    }
}
