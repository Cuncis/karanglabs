<?php

namespace Tests\Feature;

use App\Mail\StudioAccessMail;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class MidtransNotificationTest extends TestCase
{
    use RefreshDatabase;

    private string $serverKey = 'SB-Mid-server-test';

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.midtrans.server_key' => $this->serverKey]);
        Mail::fake();
    }

    /**
     * Build a signed Midtrans notification payload for an order.
     *
     * @return array<string, string>
     */
    private function payload(Order $order, string $status = 'settlement', string $fraud = 'accept'): array
    {
        $statusCode = '200';
        $gross = number_format($order->amount, 2, '.', '');
        $signature = hash('sha512', $order->order_id.$statusCode.$gross.$this->serverKey);

        return [
            'order_id' => $order->order_id,
            'status_code' => $statusCode,
            'gross_amount' => $gross,
            'signature_key' => $signature,
            'transaction_status' => $status,
            'fraud_status' => $fraud,
        ];
    }

    public function test_a_valid_settlement_provisions_a_new_account_with_access(): void
    {
        $order = Order::factory()->create(['email' => 'new@buyer.com']);

        $this->postJson(route('midtrans.notification'), $this->payload($order))->assertOk();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'paid']);

        $user = User::where('email', 'new@buyer.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->hasStudioAccess());

        Mail::assertSent(StudioAccessMail::class, fn (StudioAccessMail $m) => $m->hasTo('new@buyer.com') && $m->password !== null);
    }

    public function test_a_reseller_order_flags_the_account_and_mints_a_license(): void
    {
        $order = Order::factory()->create(['email' => 'reseller@buyer.com', 'plan' => 'reseller', 'amount' => 390000]);

        $this->postJson(route('midtrans.notification'), $this->payload($order))->assertOk();

        $user = User::where('email', 'reseller@buyer.com')->first();
        $this->assertTrue($user->isReseller());
        $this->assertNotNull($user->license_key);

        Mail::assertSent(StudioAccessMail::class, fn (StudioAccessMail $m) => $m->licenseKey === $user->license_key);
    }

    public function test_an_early_access_order_does_not_flag_reseller(): void
    {
        $order = Order::factory()->create(['email' => 'basic@buyer.com', 'plan' => 'early-access']);

        $this->postJson(route('midtrans.notification'), $this->payload($order))->assertOk();

        $user = User::where('email', 'basic@buyer.com')->first();
        $this->assertFalse($user->isReseller());
        $this->assertNull($user->license_key);

        Mail::assertSent(StudioAccessMail::class, fn (StudioAccessMail $m) => $m->licenseKey === null);
    }

    public function test_an_existing_user_gets_access_without_a_new_password(): void
    {
        $existing = User::factory()->create(['email' => 'old@buyer.com']);
        $order = Order::factory()->create(['email' => 'old@buyer.com']);

        $this->postJson(route('midtrans.notification'), $this->payload($order))->assertOk();

        $this->assertTrue($existing->fresh()->hasStudioAccess());
        Mail::assertSent(StudioAccessMail::class, fn (StudioAccessMail $m) => $m->password === null);
    }

    public function test_an_invalid_signature_is_rejected(): void
    {
        $order = Order::factory()->create();
        $payload = $this->payload($order);
        $payload['signature_key'] = 'bogus';

        $this->postJson(route('midtrans.notification'), $payload)->assertStatus(403);

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'pending']);
        Mail::assertNothingSent();
    }

    public function test_an_unknown_order_returns_404(): void
    {
        $order = Order::factory()->make(['order_id' => 'KL-DOESNOTEXIST']);

        $this->postJson(route('midtrans.notification'), $this->payload($order))->assertStatus(404);
    }

    public function test_an_already_paid_order_is_not_processed_twice(): void
    {
        $order = Order::factory()->paid()->create(['email' => 'x@y.com']);

        $this->postJson(route('midtrans.notification'), $this->payload($order))->assertOk();

        Mail::assertNothingSent();
    }

    public function test_a_failed_status_marks_the_order_failed(): void
    {
        $order = Order::factory()->create();

        $this->postJson(route('midtrans.notification'), $this->payload($order, 'expire'))->assertOk();

        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'failed']);
        Mail::assertNothingSent();
    }
}
