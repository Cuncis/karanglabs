<?php

namespace Tests\Feature;

use App\Mail\StudioAccessMail;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
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
            'phone' => '081234567890',
            'plan' => 'early-access',
        ])->assertOk()->assertJson(['token' => 'snap-token-123']);

        $this->assertDatabaseHas('orders', [
            'email' => 'buyer@example.com',
            'name' => 'Buyer',
            'phone' => '081234567890',
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

    public function test_finalize_provisions_a_paid_order(): void
    {
        Mail::fake();
        Http::fake([
            'api.sandbox.midtrans.com/*' => Http::response(['transaction_status' => 'settlement', 'fraud_status' => 'accept']),
        ]);
        $order = Order::factory()->create(['email' => 'finalize@buyer.com']);

        $this->postJson(route('checkout.finalize'), ['order_id' => $order->order_id])
            ->assertOk()
            ->assertJson(['status' => 'paid']);

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'paid']);
        $this->assertNotNull(User::where('email', 'finalize@buyer.com')->first());
        Mail::assertSent(StudioAccessMail::class, fn (StudioAccessMail $m) => $m->hasTo('finalize@buyer.com'));
    }

    public function test_finalize_leaves_an_unpaid_order_pending(): void
    {
        Mail::fake();
        Http::fake([
            'api.sandbox.midtrans.com/*' => Http::response(['transaction_status' => 'pending']),
        ]);
        $order = Order::factory()->create();

        $this->postJson(route('checkout.finalize'), ['order_id' => $order->order_id])
            ->assertOk()
            ->assertJson(['status' => 'pending']);

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'pending']);
        Mail::assertNothingSent();
    }

    public function test_finalize_is_idempotent_for_an_already_paid_order(): void
    {
        Mail::fake();
        $order = Order::factory()->paid()->create();

        $this->postJson(route('checkout.finalize'), ['order_id' => $order->order_id])
            ->assertOk()
            ->assertJson(['status' => 'paid']);

        Mail::assertNothingSent();
    }

    public function test_finalize_returns_404_for_an_unknown_order(): void
    {
        $this->postJson(route('checkout.finalize'), ['order_id' => 'KL-DOESNOTEXIST'])
            ->assertStatus(404);
    }

    public function test_the_success_page_renders_with_the_order_email(): void
    {
        $order = Order::factory()->paid()->create(['email' => 'done@buyer.com']);

        $this->get(route('checkout.success', ['order' => $order->order_id]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('CheckoutSuccess')
                ->where('email', 'done@buyer.com'));
    }

    public function test_the_success_page_renders_without_a_known_order(): void
    {
        $this->get(route('checkout.success', ['order' => 'KL-NOPE']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('CheckoutSuccess')
                ->where('email', null));
    }
}
