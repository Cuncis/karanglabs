<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class MidtransService
{
    /**
     * Create a Snap transaction and return its token + redirect URL.
     *
     * @return array{token: string, redirect_url: string}
     */
    public function createSnapTransaction(Order $order): array
    {
        $serverKey = (string) config('services.midtrans.server_key');

        if ($serverKey === '') {
            throw new RuntimeException('Midtrans server key is not configured.');
        }

        $response = Http::withBasicAuth($serverKey, '')
            ->acceptJson()
            ->post($this->baseUrl().'/snap/v1/transactions', [
                'transaction_details' => [
                    'order_id' => $order->order_id,
                    'gross_amount' => $order->amount,
                ],
                'item_details' => [[
                    'id' => $order->plan,
                    'name' => config("studio.plans.{$order->plan}.name", 'Karanglabs Studio'),
                    'price' => $order->amount,
                    'quantity' => 1,
                ]],
                'customer_details' => array_filter([
                    'first_name' => $order->name ?: 'Pelanggan',
                    'email' => $order->email,
                    'phone' => $order->phone,
                ]),
            ]);

        if (! $response->successful() || ! $response->json('token')) {
            throw new RuntimeException('Failed to create Midtrans transaction: '.$response->body());
        }

        return [
            'token' => $response->json('token'),
            'redirect_url' => $response->json('redirect_url'),
        ];
    }

    /**
     * Fetch a transaction's current status from Midtrans (server-to-server),
     * used to confirm a payment when the async webhook can't reach us.
     *
     * @return array<string, mixed>
     */
    public function transactionStatus(string $orderId): array
    {
        $serverKey = (string) config('services.midtrans.server_key');

        $host = $this->isProduction()
            ? 'https://api.midtrans.com'
            : 'https://api.sandbox.midtrans.com';

        $response = Http::withBasicAuth($serverKey, '')
            ->acceptJson()
            ->get("{$host}/v2/{$orderId}/status");

        return $response->json() ?? [];
    }

    /**
     * Verify the SHA-512 signature Midtrans sends with its notification.
     *
     * @param  array<string, mixed>  $payload
     */
    public function isValidSignature(array $payload): bool
    {
        $serverKey = (string) config('services.midtrans.server_key');

        $expected = hash('sha512',
            ($payload['order_id'] ?? '').
            ($payload['status_code'] ?? '').
            ($payload['gross_amount'] ?? '').
            $serverKey
        );

        return hash_equals($expected, (string) ($payload['signature_key'] ?? ''));
    }

    /**
     * The Snap.js embed URL for the current environment (client-side).
     */
    public function snapJsUrl(): string
    {
        return $this->isProduction()
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';
    }

    private function baseUrl(): string
    {
        return $this->isProduction()
            ? 'https://app.midtrans.com'
            : 'https://app.sandbox.midtrans.com';
    }

    private function isProduction(): bool
    {
        return (bool) config('services.midtrans.is_production', false);
    }
}
