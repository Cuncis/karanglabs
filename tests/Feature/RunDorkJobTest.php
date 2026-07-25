<?php

namespace Tests\Feature;

use App\Jobs\RunDorkJob;
use App\Models\Dork;
use App\Models\DorkResult;
use App\Services\BraveSearchService;
use App\Services\TelegramService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class RunDorkJobTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.brave.key' => 'test-brave-key',
            'services.telegram.bot_token' => 'test-token',
            'services.telegram.chat_id' => '12345',
        ]);
    }

    private function fakeBrave(array $urls): void
    {
        Http::fake([
            'api.search.brave.com/*' => Http::response([
                'web' => [
                    'results' => array_map(fn (string $url): array => [
                        'url' => $url,
                        'title' => 'Result for '.$url,
                        'description' => 'desc',
                    ], $urls),
                ],
            ]),
            'api.telegram.org/*' => Http::response(['ok' => true]),
        ]);
    }

    public function test_new_results_are_stored_and_last_run_is_updated(): void
    {
        $this->fakeBrave(['https://example.co.id/admin', 'https://foo.id/login']);
        $dork = Dork::factory()->create();

        (new RunDorkJob($dork))->handle(app(BraveSearchService::class), app(TelegramService::class));

        $this->assertDatabaseCount('dork_results', 2);
        $this->assertNotNull($dork->fresh()->last_run_at);
    }

    public function test_duplicate_urls_are_not_stored_twice(): void
    {
        $dork = Dork::factory()->create();
        DorkResult::factory()->create([
            'dork_id' => $dork->id,
            'url' => 'https://example.co.id/admin',
            'url_hash' => md5('https://example.co.id/admin'),
        ]);

        $this->fakeBrave(['https://example.co.id/admin', 'https://new.id/panel']);

        (new RunDorkJob($dork))->handle(app(BraveSearchService::class), app(TelegramService::class));

        $this->assertDatabaseCount('dork_results', 2);
        $this->assertDatabaseHas('dork_results', ['url' => 'https://new.id/panel']);
    }

    public function test_telegram_is_notified_only_when_new_results_exist(): void
    {
        $dork = Dork::factory()->create();
        DorkResult::factory()->create([
            'dork_id' => $dork->id,
            'url' => 'https://example.co.id/admin',
            'url_hash' => md5('https://example.co.id/admin'),
        ]);

        $this->fakeBrave(['https://example.co.id/admin']);

        (new RunDorkJob($dork))->handle(app(BraveSearchService::class), app(TelegramService::class));

        Http::assertNotSent(fn ($request) => str_contains($request->url(), 'api.telegram.org'));
    }

    public function test_every_query_line_is_searched_and_merged_into_one_dork(): void
    {
        // Each keyword line returns a distinct result keyed off the query.
        Http::fake(function ($request) {
            if (str_contains($request->url(), 'api.telegram.org')) {
                return Http::response(['ok' => true]);
            }

            parse_str((string) parse_url($request->url(), PHP_URL_QUERY), $params);
            $query = $params['q'] ?? '';

            return Http::response([
                'web' => [
                    'results' => [[
                        'url' => 'https://hit.test/'.md5($query),
                        'title' => $query,
                        'description' => 'desc',
                    ]],
                ],
            ]);
        });

        $dork = Dork::factory()->create(['query' => "alpha\nbeta\ngamma"]);

        (new RunDorkJob($dork))->handle(app(BraveSearchService::class), app(TelegramService::class));

        // Three lines => three distinct results, all under the one dork.
        $this->assertSame(3, $dork->results()->count());

        // A single Telegram notification is sent for the whole run.
        $telegramCalls = collect(Http::recorded())
            ->filter(fn ($pair) => str_contains($pair[0]->url(), 'api.telegram.org'));
        $this->assertCount(1, $telegramCalls);
    }

    public function test_a_duplicate_url_across_lines_is_stored_once(): void
    {
        // Every line returns the same URL.
        Http::fake([
            'api.search.brave.com/*' => Http::response([
                'web' => [
                    'results' => [[
                        'url' => 'https://same.test/page',
                        'title' => 'Same',
                        'description' => 'desc',
                    ]],
                ],
            ]),
            'api.telegram.org/*' => Http::response(['ok' => true]),
        ]);

        $dork = Dork::factory()->create(['query' => "alpha\nbeta"]);

        (new RunDorkJob($dork))->handle(app(BraveSearchService::class), app(TelegramService::class));

        $this->assertSame(1, $dork->results()->count());
    }
}
