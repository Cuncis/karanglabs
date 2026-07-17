<?php

namespace App\Jobs;

use App\Models\Dork;
use App\Models\DorkResult;
use App\Services\BraveSearchService;
use App\Services\TelegramService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Str;

class RunDorkJob implements ShouldQueue
{
    use Queueable;

    /**
     * Number of results to request from Brave per dork.
     */
    private const RESULT_COUNT = 10;

    /**
     * Create a new job instance.
     */
    public function __construct(public Dork $dork) {}

    /**
     * Execute the job: search, store new results, and notify.
     */
    public function handle(BraveSearchService $brave, TelegramService $telegram): void
    {
        $results = $brave->search($this->dork->query, self::RESULT_COUNT);

        $this->dork->forceFill(['last_run_at' => now()])->save();

        $newResults = [];

        foreach ($results as $result) {
            $hash = md5($result['url']);

            $created = DorkResult::firstOrCreate(
                [
                    'dork_id' => $this->dork->id,
                    'url_hash' => $hash,
                ],
                [
                    'url' => $result['url'],
                    'title' => $result['title'],
                    'description' => $result['description'],
                ]
            );

            if ($created->wasRecentlyCreated) {
                $newResults[] = $created;
            }
        }

        if (! empty($newResults)) {
            $telegram->sendMessage($this->buildNotification($newResults));
        }
    }

    /**
     * Build the Telegram notification body for newly found results.
     *
     * @param  array<int, DorkResult>  $results
     */
    private function buildNotification(array $results): string
    {
        $heading = $this->dork->label ?: Str::limit($this->dork->query, 60);

        $lines = [
            '🎯 *Dork Hunter* — '.count($results).' new hit(s)',
            '*'.$heading.'*',
            '`'.$this->dork->query.'`',
            '',
        ];

        foreach ($results as $result) {
            $title = $result->title ?: $result->url;
            $lines[] = '• '.$title;
            $lines[] = $result->url;
        }

        return implode("\n", $lines);
    }
}
