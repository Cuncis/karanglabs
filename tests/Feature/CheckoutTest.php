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
            'services.mayar.api_key' => 'mayar-test-key',
            'services.mayar.webhook_token' => 'hook-secret',
            'services.mayar.is_production' => false,
        ]);
    }

    public function test_checkout_creates_an_order_and_returns_a_payment_link(): void
    {
        Http::fake([
            'api.mayar.club/hl/v2/invoices/create' => Http::response([
                'statusCode' => 200,
                'messages' => 'success',
                'data' => [
                    'id' => 'inv-abc-123',
                    'transactionId' => 'txn-abc-123',
                    'link' => 'https://testing.myr.id/invoices/abc123',
                ],
            ]),
        ]);

        $this->postJson(route('checkout.store'), [
            'email' => 'buyer@example.com',
            'name' => 'Buyer',
            'phone' => '081234567890',
            'plan' => 'early-access',
        ])->assertOk()->assertJson(['link' => 'https://testing.myr.id/invoices/abc123']);

        $this->assertDatabaseHas('orders', [
            'email' => 'buyer@example.com',
            'name' => 'Buyer',
            'phone' => '081234567890',
            'plan' => 'early-access',
            'amount' => 149000,
            'status' => 'pending',
            'gateway_ref' => 'inv-abc-123',
        ]);
    }

    public function test_checkout_rejects_an_unknown_plan(): void
    {
        $this->postJson(route('checkout.store'), ['email' => 'a@b.com', 'phone' => '0812', 'plan' => 'nope'])
            ->assertStatus(422);
    }

    public function test_checkout_requires_an_email(): void
    {
        $this->postJson(route('checkout.store'), ['phone' => '0812', 'plan' => 'early-access'])
            ->assertStatus(422);
    }

    public function test_checkout_requires_a_phone(): void
    {
        $this->postJson(route('checkout.store'), ['email' => 'a@b.com', 'plan' => 'early-access'])
            ->assertStatus(422);
    }

    public function test_checkout_fails_gracefully_when_mayar_errors(): void
    {
        Http::fake([
            'api.mayar.club/hl/v2/invoices/create' => Http::response(['messages' => 'bad key'], 401),
        ]);

        $this->postJson(route('checkout.store'), ['email' => 'a@b.com', 'phone' => '0812', 'plan' => 'early-access'])
            ->assertStatus(422)
            ->assertJsonStructure(['message']);
    }

    public function test_finalize_provisions_a_paid_order(): void
    {
        Mail::fake();
        Http::fake([
            'api.mayar.club/hl/v2/invoices/*' => Http::response(['data' => ['status' => 'paid']]),
        ]);
        $order = Order::factory()->create(['email' => 'finalize@buyer.com', 'gateway_ref' => 'inv-paid']);

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
            'api.mayar.club/hl/v2/invoices/*' => Http::response(['data' => ['status' => 'unpaid']]),
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

    public function test_the_success_page_renders_and_provisions_a_paid_order(): void
    {
        Mail::fake();
        Http::fake([
            'api.mayar.club/hl/v2/invoices/*' => Http::response(['data' => ['status' => 'paid']]),
        ]);
        $order = Order::factory()->create(['email' => 'done@buyer.com', 'gateway_ref' => 'inv-done']);

        $this->get(route('checkout.success', ['order' => $order->order_id]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('CheckoutSuccess')
                ->where('email', 'done@buyer.com'));

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'paid']);
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
