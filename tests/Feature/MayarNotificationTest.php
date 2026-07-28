<?php

namespace Tests\Feature;

use App\Mail\StudioAccessMail;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class MayarNotificationTest extends TestCase
{
    use RefreshDatabase;

    private string $webhookToken = 'hook-secret';

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.mayar.api_key' => 'mayar-test-key',
            'services.mayar.webhook_token' => $this->webhookToken,
            'services.mayar.is_production' => false,
        ]);

        Mail::fake();
    }

    private function fakeInvoiceStatus(string $status): void
    {
        Http::fake([
            'api.mayar.club/hl/v2/invoices/*' => Http::response(['data' => ['status' => $status]]),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Order $order, string $event = 'payment.received'): array
    {
        return [
            'event' => $event,
            'data' => [
                'id' => $order->gateway_ref,
                'paymentLinkId' => $order->gateway_ref,
                'status' => true,
                'amount' => $order->amount,
                'extraData' => ['order_id' => $order->order_id],
            ],
        ];
    }

    private function notify(array $payload, ?string $token = null): TestResponse
    {
        return $this->withHeaders(['X-Callback-Token' => $token ?? $this->webhookToken])
            ->postJson(route('mayar.notification'), $payload);
    }

    public function test_a_valid_payment_provisions_a_new_account_with_access(): void
    {
        $this->fakeInvoiceStatus('paid');
        $order = Order::factory()->create(['email' => 'new@buyer.com']);

        $this->notify($this->payload($order))->assertOk();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'paid']);

        $user = User::where('email', 'new@buyer.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->hasStudioAccess());

        Mail::assertSent(StudioAccessMail::class, fn (StudioAccessMail $m) => $m->hasTo('new@buyer.com') && $m->password !== null);
    }

    public function test_a_reseller_order_flags_the_account_and_mints_a_license(): void
    {
        $this->fakeInvoiceStatus('paid');
        $order = Order::factory()->create(['email' => 'reseller@buyer.com', 'plan' => 'reseller', 'amount' => 390000]);

        $this->notify($this->payload($order))->assertOk();

        $user = User::where('email', 'reseller@buyer.com')->first();
        $this->assertTrue($user->isReseller());
        $this->assertNotNull($user->license_key);

        Mail::assertSent(StudioAccessMail::class, fn (StudioAccessMail $m) => $m->licenseKey === $user->license_key);
    }

    public function test_an_early_access_order_does_not_flag_reseller(): void
    {
        $this->fakeInvoiceStatus('paid');
        $order = Order::factory()->create(['email' => 'basic@buyer.com', 'plan' => 'early-access']);

        $this->notify($this->payload($order))->assertOk();

        $user = User::where('email', 'basic@buyer.com')->first();
        $this->assertFalse($user->isReseller());
        $this->assertNull($user->license_key);

        Mail::assertSent(StudioAccessMail::class, fn (StudioAccessMail $m) => $m->licenseKey === null);
    }

    public function test_an_existing_user_gets_access_without_a_new_password(): void
    {
        $this->fakeInvoiceStatus('paid');
        $existing = User::factory()->create(['email' => 'old@buyer.com']);
        $order = Order::factory()->create(['email' => 'old@buyer.com']);

        $this->notify($this->payload($order))->assertOk();

        $this->assertTrue($existing->fresh()->hasStudioAccess());
        Mail::assertSent(StudioAccessMail::class, fn (StudioAccessMail $m) => $m->password === null);
    }

    public function test_an_invalid_webhook_token_is_rejected(): void
    {
        $order = Order::factory()->create();

        $this->notify($this->payload($order), 'wrong-token')->assertStatus(403);

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'pending']);
        Mail::assertNothingSent();
    }

    public function test_a_testing_event_is_acknowledged(): void
    {
        $this->notify(['event' => 'testing', 'data' => []])->assertOk();

        Mail::assertNothingSent();
    }

    public function test_an_unknown_order_returns_404(): void
    {
        $order = Order::factory()->make(['order_id' => 'KL-DOESNOTEXIST', 'gateway_ref' => 'inv-nope']);

        $this->notify($this->payload($order))->assertStatus(404);
    }

    public function test_an_already_paid_order_is_not_processed_twice(): void
    {
        $order = Order::factory()->paid()->create(['email' => 'x@y.com']);

        $this->notify($this->payload($order))->assertOk();

        Mail::assertNothingSent();
    }

    public function test_an_unpaid_invoice_leaves_the_order_pending(): void
    {
        $this->fakeInvoiceStatus('unpaid');
        $order = Order::factory()->create();

        $this->notify($this->payload($order))->assertOk();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'pending']);
        Mail::assertNothingSent();
    }
}
