<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class MayarService
{
    /**
     * Create a Mayar invoice and return its hosted payment link + references.
     * The customer is redirected to `link` to pay; Mayar then redirects them
     * back to our `redirectUrl` and calls our webhook.
     *
     * @return array{link: string, id: string, transaction_id: string}
     */
    public function createInvoice(Order $order): array
    {
        $name = config("studio.plans.{$order->plan}.name", 'Karanglabs Studio');

        $response = Http::withToken($this->apiKey())
            ->acceptJson()
            ->post($this->baseUrl().'/hl/v2/invoices/create', [
                'name' => $order->name ?: 'Pelanggan',
                'email' => $order->email,
                'mobile' => $order->phone,
                'description' => $name,
                'expiredAt' => now()->addDay()->toIso8601ZuluString(),
                'redirectUrl' => route('checkout.success', ['order' => $order->order_id]),
                'items' => [[
                    'quantity' => 1,
                    'rate' => $order->amount,
                    'description' => $name,
                ]],
                'extraData' => [
                    'order_id' => $order->order_id,
                ],
            ]);

        $link = $response->json('data.link');
        $id = $response->json('data.id');

        if (! $response->successful() || ! $link || ! $id) {
            throw new RuntimeException('Failed to create Mayar invoice: '.$response->body());
        }

        return [
            'link' => $link,
            'id' => $id,
            'transaction_id' => (string) $response->json('data.transactionId'),
        ];
    }

    /**
     * Fetch an invoice's current data from Mayar (server-to-server). Used to
     * confirm a payment before fulfilling — we never trust the webhook body or
     * the browser alone.
     *
     * @return array<string, mixed>
     */
    public function invoiceStatus(string $invoiceId): array
    {
        $response = Http::withToken($this->apiKey())
            ->acceptJson()
            ->get($this->baseUrl().'/hl/v2/invoices/'.$invoiceId);

        return $response->json('data') ?? [];
    }

    /**
     * Whether Mayar reports the invoice as paid.
     */
    public function isPaidInvoice(string $invoiceId): bool
    {
        return ($this->invoiceStatus($invoiceId)['status'] ?? null) === 'paid';
    }

    /**
     * Verify the webhook token Mayar includes (in the `X-Callback-Token`
     * header) when calling our endpoint. Compared in constant time.
     * Fulfillment additionally re-checks the invoice status server-side, so
     * this is defence in depth.
     */
    public function isValidWebhookToken(?string $token): bool
    {
        $expected = (string) config('services.mayar.webhook_token');

        return $expected !== '' && hash_equals($expected, (string) $token);
    }

    private function apiKey(): string
    {
        $key = (string) config('services.mayar.api_key');

        if ($key === '') {
            throw new RuntimeException('Mayar API key is not configured.');
        }

        return $key;
    }

    private function baseUrl(): string
    {
        return (bool) config('services.mayar.is_production', false)
            ? 'https://api.mayar.id'
            : 'https://api.mayar.club';
    }
}
