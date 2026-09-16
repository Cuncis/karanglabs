<?php

namespace Tests\Feature;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AiToolsAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_metered_tool_redirects_a_user_without_a_subscription(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('planner'))
            ->assertRedirect(route('aitools.landing'));
    }

    public function test_a_metered_tool_is_reachable_with_an_active_subscription(): void
    {
        $user = User::factory()->create();
        Subscription::factory()->active()->create(['user_id' => $user->id]);

        $this->actingAs($user)->get(route('planner'))->assertOk();
    }

    public function test_a_metered_tool_is_reachable_by_an_admin_without_a_subscription(): void
    {
        config(['studio.admin_emails' => ['owner@karanglabs.cloud']]);
        $admin = User::factory()->create(['email' => 'owner@karanglabs.cloud']);

        $this->actingAs($admin)->get(route('planner'))->assertOk();
    }

    public function test_a_token_free_tool_needs_no_subscription(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get(route('bundler'))->assertOk();
    }

    public function test_studio_is_locked_without_a_bundle_subscription_or_purchase(): void
    {
        $user = User::factory()->create();
        Subscription::factory()->active()->create(['user_id' => $user->id]); // 'tools' tier, not 'bundle'

        $this->actingAs($user)->get(route('studio.index'))->assertRedirect(route('studio.locked'));
    }

    public function test_studio_is_unlocked_by_an_active_bundle_subscription(): void
    {
        $user = User::factory()->create();
        Subscription::factory()->bundle()->active()->create(['user_id' => $user->id]);

        $this->actingAs($user)->get(route('studio.index'))->assertOk();
    }
}
