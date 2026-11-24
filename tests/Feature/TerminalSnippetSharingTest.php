<?php

namespace Tests\Feature;

use App\Models\TerminalSnippet;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TerminalSnippetSharingTest extends TestCase
{
    use RefreshDatabase;

    private function makeSnippet(): TerminalSnippet
    {
        return User::factory()->create()->terminalSnippets()->create([
            'title' => 'Deploy log',
            'content' => '## Hello',
        ]);
    }

    public function test_guest_can_view_shared_snippet_read_only(): void
    {
        $snippet = $this->makeSnippet();

        $this->get(route('terminal-converter.show', $snippet->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('TerminalSnippets/Show')
                ->where('snippet.title', 'Deploy log')
                ->where('isOwner', false)
                ->missing('snippet.user_id'));
    }

    public function test_other_logged_in_user_is_not_owner(): void
    {
        $snippet = $this->makeSnippet();

        $this->actingAs(User::factory()->create())
            ->get(route('terminal-converter.show', $snippet->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('isOwner', false));
    }

    public function test_owner_is_flagged_as_owner(): void
    {
        $snippet = $this->makeSnippet();

        $this->actingAs($snippet->user ?? User::find($snippet->user_id))
            ->get(route('terminal-converter.show', $snippet->slug))
            ->assertInertia(fn (Assert $page) => $page->where('isOwner', true));
    }

    public function test_unknown_slug_returns_404(): void
    {
        $this->get(route('terminal-converter.show', 'not-a-real-slug'))->assertNotFound();
    }

    public function test_guest_cannot_delete_or_list(): void
    {
        $snippet = $this->makeSnippet();

        $this->delete(route('terminal-converter.destroy', $snippet->slug))->assertRedirect(route('login'));
        $this->get(route('terminal-converter.index'))->assertRedirect(route('login'));
        $this->assertModelExists($snippet);
    }

    public function test_secrets_are_masked_before_ai_call_and_storage_by_default(): void
    {
        Http::fake(['api.anthropic.com/*' => Http::response(['content' => [['text' => '## Env']]], 200)]);
        $user = User::factory()->admin()->create();

        $this->actingAs($user)->post(route('terminal-converter.store'), [
            'content' => "DB_PASSWORD=Fake-Pass-123!\nAPP_ENV=production",
        ])->assertRedirect();

        Http::assertSent(fn ($request) => ! str_contains($request->body(), 'Fake-Pass-123')
            && str_contains($request->body(), 'REDACTED'));
    }

    public function test_masking_can_be_turned_off(): void
    {
        Http::fake(['api.anthropic.com/*' => Http::response(['content' => [['text' => '## Env']]], 200)]);

        $this->actingAs(User::factory()->admin()->create())->post(route('terminal-converter.store'), [
            'content' => 'DB_PASSWORD=Fake-Pass-123!',
            'anonymize' => false,
        ])->assertRedirect();

        Http::assertSent(fn ($request) => str_contains($request->body(), 'Fake-Pass-123'));
    }
}
