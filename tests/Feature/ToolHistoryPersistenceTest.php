<?php

namespace Tests\Feature;

use App\Models\ToolHistory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class ToolHistoryPersistenceTest extends TestCase
{
    use RefreshDatabase;

    private function fakeAnthropicResponse(array $outputs): void
    {
        Http::fake([
            'api.anthropic.com/*' => Http::response([
                'content' => [
                    ['text' => json_encode($outputs)],
                ],
            ]),
        ]);
    }

    public function test_micro_copy_generation_is_saved_to_history_and_visible_on_any_device(): void
    {
        $user = User::factory()->create();
        $outputs = [
            'professional' => ['title' => 'Are you sure?'],
            'playful' => ['title' => 'Whoa, hold up!'],
            'direct' => ['title' => 'Confirm delete'],
        ];
        $this->fakeAnthropicResponse($outputs);

        $this->actingAs($user)->postJson('/api/generate-micro-copy', [
            'component_name' => 'Delete Confirmation Modal',
        ])->assertOk();

        $this->assertDatabaseHas('tool_histories', [
            'user_id' => $user->id,
            'tool_slug' => 'micro-copy',
        ]);

        // A second, unrelated "device" is just a fresh request from the same authenticated
        // account — history must come back from the server, not from that device's browser storage.
        $this->actingAs($user)->get(route('micro-copy'))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('MicroCopy')
                ->has('history', 1)
                ->where('history.0.original_prompt', 'Delete Confirmation Modal')
                ->where('history.0.professional.title', 'Are you sure?')
            );
    }

    public function test_whisperer_generation_is_saved_to_history(): void
    {
        $user = User::factory()->create();
        $this->fakeAnthropicResponse([
            'code_snippet' => '/^\\+\\d+$/',
            'language' => 'regex',
            'explanation' => 'Matches a plus sign followed by digits.',
            'test_cases' => '+1234 matches, 1234 does not.',
        ]);

        $this->actingAs($user)->postJson('/api/generate-whisper', [
            'prompt' => 'A regex for phone numbers with a country code',
            'type' => 'regex',
        ])->assertOk();

        $this->assertDatabaseHas('tool_histories', [
            'user_id' => $user->id,
            'tool_slug' => 'whisperer',
        ]);

        $this->actingAs($user)->get(route('whisperer'))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Whisperer')
                ->has('history', 1)
                ->where('history.0.type', 'regex')
                ->where('history.0.code_snippet', '/^\\+\\d+$/')
            );
    }

    public function test_changelog_generation_is_saved_to_history(): void
    {
        $user = User::factory()->create();
        $this->fakeAnthropicResponse([
            'changelog' => '## v1.1.0\n- Fixed auth bug',
            'tweet' => 'We just shipped a fix! #buildinpublic',
        ]);

        $this->actingAs($user)->postJson('/api/generate-changelog', [
            'commits' => 'fixed the nasty auth bug',
            'audience' => 'technical',
        ])->assertOk();

        $this->assertDatabaseHas('tool_histories', [
            'user_id' => $user->id,
            'tool_slug' => 'changelog',
        ]);

        $this->actingAs($user)->get(route('changelog'))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('ChangelogGenerator')
                ->has('history', 1)
                ->where('history.0.audience', 'technical')
            );
    }

    public function test_socializer_generation_is_saved_to_history(): void
    {
        $user = User::factory()->create();
        $this->fakeAnthropicResponse([
            'instagram' => 'Big news! We shipped PDF export.',
            'twitter' => 'PDF export is live.',
            'facebook' => 'PDF export is live.',
            'youtube' => 'PDF export is live.',
            'tiktok' => 'PDF export is live.',
            'linkedin' => 'PDF export is live.',
        ]);

        $this->actingAs($user)->postJson('/api/generate-socializer', [
            'content' => 'We just launched PDF export.',
        ])->assertOk();

        $this->assertDatabaseHas('tool_histories', [
            'user_id' => $user->id,
            'tool_slug' => 'socializer',
        ]);

        $this->actingAs($user)->get(route('socializer'))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Socializer')
                ->has('history', 1)
                ->where('history.0.instagram', 'Big news! We shipped PDF export.')
            );
    }

    public function test_job_seeker_generation_is_saved_to_history(): void
    {
        $user = User::factory()->create();
        $this->fakeAnthropicResponse([
            'resume' => 'Frontend Developer with 3 years of React experience.',
            'message' => 'Hi, I would love to join your team.',
        ]);

        $this->actingAs($user)->postJson('/api/generate-job-seeker', [
            'name' => $user->name,
            'email' => $user->email,
            'background' => 'I worked at TechCorp for 3 years as a frontend dev.',
        ])->assertOk();

        $this->assertDatabaseHas('tool_histories', [
            'user_id' => $user->id,
            'tool_slug' => 'jobseeker',
        ]);

        $this->actingAs($user)->get(route('jobseeker'))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('JobSeeker')
                ->has('history', 1)
                ->where('history.0.resume', 'Frontend Developer with 3 years of React experience.')
            );
    }

    public function test_planner_generation_is_saved_to_history(): void
    {
        $user = User::factory()->create();
        $this->fakeAnthropicResponse([
            'summary' => 'A productivity app for freelancers.',
            'feature_map' => '## Phase 1\n- Invoicing',
            'prd' => '# PRD',
            'ai_prompt' => 'Build this step by step.',
        ]);

        $this->actingAs($user)->postJson('/api/generate-plan', [
            'idea' => 'A productivity app for freelance writers',
            'tech_preference' => 'no-preference',
        ])->assertOk();

        $this->assertDatabaseHas('tool_histories', [
            'user_id' => $user->id,
            'tool_slug' => 'planner',
        ]);

        $this->actingAs($user)->get(route('planner'))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Planner')
                ->has('history', 1)
                ->where('history.0.title', 'A productivity app for freelance writers')
            );
    }

    public function test_history_does_not_leak_between_different_users(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();

        ToolHistory::create([
            'user_id' => $owner->id,
            'tool_slug' => 'micro-copy',
            'inputs' => ['component_name' => 'Owner only'],
            'outputs' => ['professional' => ['title' => 'Secret']],
        ]);

        $this->actingAs($other)->get(route('micro-copy'))
            ->assertInertia(fn (AssertableInertia $page) => $page->has('history', 0));

        $this->actingAs($owner)->get(route('micro-copy'))
            ->assertInertia(fn (AssertableInertia $page) => $page->has('history', 1));
    }

    public function test_clearing_history_only_deletes_that_users_rows_for_that_tool(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        ToolHistory::create(['user_id' => $user->id, 'tool_slug' => 'micro-copy', 'inputs' => [], 'outputs' => []]);
        ToolHistory::create(['user_id' => $user->id, 'tool_slug' => 'whisperer', 'inputs' => [], 'outputs' => []]);
        ToolHistory::create(['user_id' => $otherUser->id, 'tool_slug' => 'micro-copy', 'inputs' => [], 'outputs' => []]);

        $this->actingAs($user)->deleteJson('/api/tool-history/micro-copy')->assertOk();

        $this->assertDatabaseCount('tool_histories', 2);
        $this->assertDatabaseHas('tool_histories', ['user_id' => $user->id, 'tool_slug' => 'whisperer']);
        $this->assertDatabaseHas('tool_histories', ['user_id' => $otherUser->id, 'tool_slug' => 'micro-copy']);
        $this->assertDatabaseMissing('tool_histories', ['user_id' => $user->id, 'tool_slug' => 'micro-copy']);
    }
}
