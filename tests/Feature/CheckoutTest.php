<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.midtrans.server_key' => 'SB-Mid-server-test',
            'services.midtrans.client_key' => 'SB-Mid-client-test',
            'services.midtrans.is_production' => false,
        ]);
    }

    public function test_checkout_creates_an_order_and_returns_a_snap_token(): void
    {
        Http::fake([
            'app.sandbox.midtrans.com/*' => Http::response(['token' => 'snap-token-123', 'redirect_url' => 'https://pay']),
        ]);

        $this->postJson(route('checkout.store'), [
            'email' => 'buyer@example.com',
            'name' => 'Buyer',
            'plan' => 'early-access',
        ])->assertOk()->assertJson(['token' => 'snap-token-123']);

        $this->assertDatabaseHas('orders', [
            'email' => 'buyer@example.com',
            'plan' => 'early-access',
            'amount' => 99000,
            'status' => 'pending',
        ]);
    }

    public function test_checkout_rejects_an_unknown_plan(): void
    {
        $this->postJson(route('checkout.store'), ['email' => 'a@b.com', 'plan' => 'nope'])
            ->assertStatus(422);
    }

    public function test_checkout_requires_an_email(): void
    {
        $this->postJson(route('checkout.store'), ['plan' => 'early-access'])
            ->assertStatus(422);
    }

    public function test_checkout_fails_gracefully_when_midtrans_errors(): void
    {
        Http::fake([
            'app.sandbox.midtrans.com/*' => Http::response(['error_messages' => ['bad key']], 401),
        ]);

        $this->postJson(route('checkout.store'), ['email' => 'a@b.com', 'plan' => 'early-access'])
            ->assertStatus(422)
            ->assertJsonStructure(['message']);
    }
}
