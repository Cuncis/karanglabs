<?php

namespace Tests\Feature;

use App\Models\AiCallLog;
use App\Models\LeadFinderProject;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class LeadFinderProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Nothing in this suite should ever reach the real network: DNS
        // resolution uses IP-literal hosts (see subscribedUser()'s callers),
        // and every HTTP call must be explicitly faked.
        Http::preventStrayRequests();
    }

    private function subscribedUser(): User
    {
        $user = User::factory()->create();
        Subscription::factory()->active()->create(['user_id' => $user->id]);

        return $user;
    }

    /**
     * Fakes robots.txt (allow-all by default) plus the homepage/about/services
     * paths on an IP-literal host, so no real DNS lookup ever happens.
     */
    private function fakeSite(string $host, array $paths, ?string $robotsTxt = null): void
    {
        $fakes = ["http://{$host}/robots.txt" => Http::response($robotsTxt ?? '', $robotsTxt ? 200 : 404)];

        foreach ($paths as $path => $response) {
            $fakes["http://{$host}{$path}"] = $response;
        }

        Http::fake($fakes);
    }

    private function validProfileJson(): array
    {
        return [
            'name' => 'Acme Budgeting',
            'country' => 'United States',
            'language' => 'English',
            'one_liner' => 'Acme Budgeting builds simple budgeting software for freelancers.',
            'offers' => ['Budgeting software'],
            'target_customers' => ['Freelancers'],
            'differentiators' => ['Built specifically for freelancers'],
            'proof_points' => ['Trusted by freelancers worldwide'],
            'keywords' => ['budgeting', 'freelancers', 'invoicing'],
            'tone' => 'friendly and direct',
            'evidence' => [
                'name' => 'Acme Budgeting',
                'country' => null,
                'language' => null,
                'one_liner' => 'Acme Budgeting builds simple budgeting software for freelancers.',
                'offers' => 'Budgeting software for freelancers',
                'target_customers' => 'made for freelancers',
                'differentiators' => 'Built specifically for freelancers',
                'proof_points' => 'Trusted by freelancers worldwide',
                'tone' => null,
            ],
        ];
    }

    private function homepageHtml(): string
    {
        return '<html><body><h1>Acme Budgeting</h1>'
            .'<p>Acme Budgeting builds simple budgeting software for freelancers. '
            .'Our budgeting software for freelancers is made for freelancers who hate spreadsheets. '
            .'Built specifically for freelancers, with real support. Trusted by freelancers worldwide.</p>'
            .'</body></html>';
    }

    public function test_a_url_resolving_to_a_private_ip_is_rejected_without_starting_a_job(): void
    {
        $user = $this->subscribedUser();

        $response = $this->actingAs($user)->postJson(route('lead-finder.store'), [
            'source_url' => 'http://127.0.0.1/internal-dashboard',
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseCount('lead_finder_projects', 0);
    }

    public function test_a_malformed_url_returns_a_json_422_not_a_redirect(): void
    {
        // Lead Finder's routes live outside /api/*, where this app only
        // auto-renders JSON for a failed validation (see shouldRenderJsonWhen
        // in bootstrap/app.php), so this guards against regressing back to a
        // silent redirect on a plain validation failure.
        $user = $this->subscribedUser();

        $response = $this->actingAs($user)->postJson(route('lead-finder.store'), [
            'source_url' => 'not a url',
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['error']);
    }

    public function test_a_page_blocked_by_robots_txt_fails_the_step_with_a_readable_reason(): void
    {
        $user = $this->subscribedUser();
        $this->fakeSite('8.8.8.1', [], "User-agent: *\nDisallow: /");

        $this->actingAs($user)->postJson(route('lead-finder.store'), [
            'source_url' => 'http://8.8.8.1/',
        ])->assertOk();

        $this->assertDatabaseHas('lead_finder_projects', ['source_url' => 'http://8.8.8.1/', 'status' => 'failed']);
        $this->assertDatabaseHas('lead_finder_steps', ['step' => 'fetch_profile', 'status' => 'failed']);
        $project = LeadFinderProject::where('source_url', 'http://8.8.8.1/')->firstOrFail();
        $this->assertStringContainsString('robots.txt', $project->failure_reason);
        Http::assertNotSent(fn ($request) => str_contains($request->url(), 'api.anthropic.com'));
    }

    public function test_a_bot_check_page_is_detected_and_never_bypassed(): void
    {
        $user = $this->subscribedUser();
        $botCheck = '<html><body>Just a moment... Please wait while we check your browser.</body></html>';
        $this->fakeSite('8.8.8.2', [
            '/' => Http::response($botCheck),
            '/about' => Http::response($botCheck, 404),
            '/services' => Http::response($botCheck, 404),
        ]);

        $this->actingAs($user)->postJson(route('lead-finder.store'), [
            'source_url' => 'http://8.8.8.2/',
        ])->assertOk();

        $project = LeadFinderProject::where('source_url', 'http://8.8.8.2/')->firstOrFail();
        $this->assertSame('failed', $project->status);
        $this->assertStringContainsString('bot-check', $project->failure_reason);
        Http::assertNotSent(fn ($request) => str_contains($request->url(), 'api.anthropic.com'));
    }

    public function test_a_page_with_almost_no_text_is_classified_as_unreadable(): void
    {
        $user = $this->subscribedUser();
        $this->fakeSite('8.8.8.3', [
            '/' => Http::response('<html><body>Hi</body></html>'),
            '/about' => Http::response('', 404),
            '/services' => Http::response('', 404),
        ]);

        $this->actingAs($user)->postJson(route('lead-finder.store'), [
            'source_url' => 'http://8.8.8.3/',
        ])->assertOk();

        $project = LeadFinderProject::where('source_url', 'http://8.8.8.3/')->firstOrFail();
        $this->assertSame('failed', $project->status);
        $this->assertStringContainsString('readable text', $project->failure_reason);
    }

    public function test_invalid_ai_json_is_retried_once_before_failing(): void
    {
        $user = $this->subscribedUser();
        Http::fake([
            'http://8.8.8.4/robots.txt' => Http::response('', 404),
            'http://8.8.8.4/' => Http::response($this->homepageHtml()),
            'http://8.8.8.4/about' => Http::response('', 404),
            'http://8.8.8.4/services' => Http::response('', 404),
            'api.anthropic.com/*' => Http::sequence()
                ->push(['content' => [['text' => 'not valid json at all']]])
                ->push(['content' => [['text' => 'still not valid json']]]),
        ]);

        $this->actingAs($user)->postJson(route('lead-finder.store'), [
            'source_url' => 'http://8.8.8.4/',
        ])->assertOk();

        $project = LeadFinderProject::where('source_url', 'http://8.8.8.4/')->firstOrFail();
        $this->assertSame('failed', $project->status);

        $anthropicCalls = 0;
        Http::assertSent(function ($request) use (&$anthropicCalls) {
            if (str_contains($request->url(), 'api.anthropic.com')) {
                $anthropicCalls++;
            }

            return true;
        });
        $this->assertSame(2, $anthropicCalls);
        $this->assertDatabaseCount('ai_call_logs', 2);
    }

    public function test_successful_profile_is_saved_with_tokens_cost_and_step_status(): void
    {
        $user = $this->subscribedUser();
        Http::fake([
            'http://8.8.8.5/robots.txt' => Http::response('', 404),
            'http://8.8.8.5/' => Http::response($this->homepageHtml()),
            'http://8.8.8.5/about' => Http::response('', 404),
            'http://8.8.8.5/services' => Http::response('', 404),
            'api.anthropic.com/*' => Http::response([
                'content' => [['text' => json_encode($this->validProfileJson())]],
                'usage' => ['input_tokens' => 500, 'output_tokens' => 200],
            ]),
        ]);

        $this->actingAs($user)->postJson(route('lead-finder.store'), [
            'source_url' => 'http://8.8.8.5/',
        ])->assertOk();

        $project = LeadFinderProject::where('source_url', 'http://8.8.8.5/')->firstOrFail();
        $this->assertSame('completed', $project->status);
        $this->assertSame('Acme Budgeting', $project->profile['name']);
        $this->assertSame('Acme Budgeting builds simple budgeting software for freelancers.', $project->profile['one_liner']);

        $this->assertDatabaseHas('lead_finder_steps', [
            'lead_finder_project_id' => $project->id,
            'step' => 'fetch_profile',
            'status' => 'completed',
        ]);

        $this->assertDatabaseHas('ai_call_logs', [
            'lead_finder_project_id' => $project->id,
            'model' => 'claude-sonnet-4-6',
            'status' => 'succeeded',
            'input_tokens' => 500,
            'output_tokens' => 200,
        ]);
        $log = AiCallLog::where('lead_finder_project_id', $project->id)->firstOrFail();
        $this->assertNotNull($log->cost_usd);
        $this->assertNotNull($log->latency_ms);

        $this->actingAs($user)->get(route('lead-finder'))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('LeadFinder')
                ->has('history', 1)
                ->where('history.0.status', 'completed')
            );
    }

    public function test_an_unverifiable_evidence_quote_is_discarded_instead_of_trusted(): void
    {
        $user = $this->subscribedUser();
        $profile = $this->validProfileJson();
        // The AI claims a one_liner whose "evidence" quote never actually appears on the page.
        $profile['one_liner'] = 'Acme Budgeting is the number one choice for Fortune 500 companies.';
        $profile['evidence']['one_liner'] = 'the number one choice for Fortune 500 companies';

        Http::fake([
            'http://8.8.8.6/robots.txt' => Http::response('', 404),
            'http://8.8.8.6/' => Http::response($this->homepageHtml()),
            'http://8.8.8.6/about' => Http::response('', 404),
            'http://8.8.8.6/services' => Http::response('', 404),
            'api.anthropic.com/*' => Http::response([
                'content' => [['text' => json_encode($profile)]],
                'usage' => ['input_tokens' => 400, 'output_tokens' => 150],
            ]),
        ]);

        $this->actingAs($user)->postJson(route('lead-finder.store'), [
            'source_url' => 'http://8.8.8.6/',
        ])->assertOk();

        $project = LeadFinderProject::where('source_url', 'http://8.8.8.6/')->firstOrFail();
        $this->assertSame('completed', $project->status);
        $this->assertNull($project->profile['one_liner']);
        $this->assertNull($project->profile['evidence']['one_liner']);
        // A verifiable field on the same response is kept.
        $this->assertSame('Acme Budgeting', $project->profile['name']);
    }
}
