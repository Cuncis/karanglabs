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
}
