<?php

namespace Tests\Feature;

use App\Mail\AiToolsAccessMail;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AiToolsSubscriptionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.mayar.api_key' => 'mayar-test-key',
            'services.mayar.webhook_token' => 'hook-secret',
            'services.mayar.is_production' => false,
            'aitools.plans.tools.mayar_product_id' => 'prod-tools',
            'aitools.plans.tools.mayar_tier_id' => 'tier-tools',
            'aitools.plans.bundle.mayar_product_id' => 'prod-bundle',
            'aitools.plans.bundle.mayar_tier_id' => 'tier-bundle',
        ]);
    }

    public function test_checkout_registers_a_membership_member_and_creates_a_pending_subscription(): void
    {
        Http::fake([
            'api.mayar.club/hl/v2/memberships/members/create' => Http::response([
                'statusCode' => 201,
                'data' => ['membershipCustomer' => ['memberId' => 'MBR123', 'status' => 'active']],
            ]),
        ]);

        $this->postJson(route('aitools.subscribe'), [
            'email' => 'buyer@example.com',
            'name' => 'Buyer',
            'phone' => '081234567890',
            'tier' => 'tools',
        ])->assertOk();

        $this->assertDatabaseHas('subscriptions', [
            'email' => 'buyer@example.com',
            'tier' => 'tools',
            'status' => 'pending',
            'mayar_member_id' => 'MBR123',
            'mayar_product_id' => 'prod-tools',
        ]);
    }

    public function test_checkout_rejects_an_unknown_tier(): void
    {
        $this->postJson(route('aitools.subscribe'), [
            'email' => 'a@b.com', 'phone' => '0812', 'tier' => 'nope',
        ])->assertStatus(422);
    }

    public function test_checkout_refuses_a_plan_with_no_mayar_ids_configured(): void
    {
        config(['aitools.plans.tools.mayar_product_id' => '', 'aitools.plans.tools.mayar_tier_id' => '']);

        $this->postJson(route('aitools.subscribe'), [
            'email' => 'a@b.com', 'phone' => '0812', 'tier' => 'tools',
        ])->assertStatus(422);

        $this->assertDatabaseCount('subscriptions', 0);
    }

    public function test_checkout_fails_gracefully_when_mayar_errors(): void
    {
        Http::fake([
            'api.mayar.club/hl/v2/memberships/members/create' => Http::response(['messages' => 'bad key'], 401),
        ]);

        $this->postJson(route('aitools.subscribe'), [
            'email' => 'a@b.com', 'phone' => '0812', 'tier' => 'tools',
        ])->assertStatus(422)->assertJsonStructure(['message']);
    }

    public function test_membership_webhook_activates_a_pending_subscription(): void
    {
        Mail::fake();
        Http::fake([
            'api.mayar.club/hl/v2/memberships/members?*' => Http::response([
                'data' => [['memberId' => 'MBR123', 'status' => 'active']],
            ]),
        ]);
        $subscription = Subscription::factory()->create([
            'email' => 'new@buyer.com',
            'mayar_member_id' => 'MBR123',
            'mayar_product_id' => 'prod-tools',
        ]);

        $this->withHeaders(['X-Callback-Token' => 'hook-secret'])
            ->postJson(route('mayar.notification'), [
                'event' => 'membership.newMemberRegistered',
                'data' => ['memberId' => 'MBR123', 'customerEmail' => 'new@buyer.com'],
            ])->assertOk();

        $this->assertDatabaseHas('subscriptions', ['id' => $subscription->id, 'status' => 'active']);
        $user = User::where('email', 'new@buyer.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->hasActiveAiToolsSubscription());
        Mail::assertSent(AiToolsAccessMail::class, fn (AiToolsAccessMail $m) => $m->hasTo('new@buyer.com'));
    }

    public function test_membership_webhook_does_not_activate_when_mayar_disagrees(): void
    {
        Mail::fake();
        Http::fake([
            'api.mayar.club/hl/v2/memberships/members?*' => Http::response([
                'data' => [['memberId' => 'MBR123', 'status' => 'inactive']],
            ]),
        ]);
        $subscription = Subscription::factory()->create(['mayar_member_id' => 'MBR123', 'mayar_product_id' => 'prod-tools']);

        $this->withHeaders(['X-Callback-Token' => 'hook-secret'])
            ->postJson(route('mayar.notification'), [
                'event' => 'membership.newMemberRegistered',
                'data' => ['memberId' => 'MBR123'],
            ])->assertOk();

        $this->assertDatabaseHas('subscriptions', ['id' => $subscription->id, 'status' => 'pending']);
        Mail::assertNothingSent();
    }

    public function test_member_expired_webhook_expires_the_subscription(): void
    {
        $subscription = Subscription::factory()->active()->create(['mayar_member_id' => 'MBR123']);

        $this->withHeaders(['X-Callback-Token' => 'hook-secret'])
            ->postJson(route('mayar.notification'), [
                'event' => 'membership.memberExpired',
                'data' => ['memberId' => 'MBR123'],
            ])->assertOk();

        $this->assertDatabaseHas('subscriptions', ['id' => $subscription->id, 'status' => 'expired']);
    }

    public function test_member_unsubscribed_webhook_stops_the_subscription(): void
    {
        $subscription = Subscription::factory()->active()->create(['mayar_member_id' => 'MBR123']);

        $this->withHeaders(['X-Callback-Token' => 'hook-secret'])
            ->postJson(route('mayar.notification'), [
                'event' => 'membership.memberUnsubscribed',
                'data' => ['memberId' => 'MBR123'],
            ])->assertOk();

        $this->assertDatabaseHas('subscriptions', ['id' => $subscription->id, 'status' => 'stopped']);
    }

    public function test_an_invalid_webhook_token_is_rejected_for_membership_events(): void
    {
        $subscription = Subscription::factory()->create(['mayar_member_id' => 'MBR123']);

        $this->withHeaders(['X-Callback-Token' => 'wrong'])
            ->postJson(route('mayar.notification'), [
                'event' => 'membership.memberExpired',
                'data' => ['memberId' => 'MBR123'],
            ])->assertStatus(403);

        $this->assertDatabaseHas('subscriptions', ['id' => $subscription->id, 'status' => 'pending']);
    }

    public function test_user_can_cancel_their_active_subscription(): void
    {
        Http::fake([
            'api.mayar.club/hl/v2/memberships/members/*/cancel' => Http::response([
                'data' => ['membershipCustomer' => ['status' => 'stopped']],
            ]),
        ]);
        $user = User::factory()->create();
        Subscription::factory()->active()->create(['user_id' => $user->id, 'mayar_member_id' => 'MBR123']);

        $this->actingAs($user)
            ->postJson(route('aitools.subscription.cancel'))
            ->assertOk();
    }

    public function test_cancel_returns_404_when_there_is_no_active_subscription(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('aitools.subscription.cancel'))
            ->assertStatus(404);
    }
}
