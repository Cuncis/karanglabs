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
     * Execute the job: search every keyword line, merge the results into this
     * dork, store only URLs not seen before, and send a single notification
     * if any new hit was found across all lines.
     */
    public function handle(BraveSearchService $brave, TelegramService $telegram): void
    {
        $newResults = [];
        $seen = [];

        foreach ($this->dork->queryLines() as $line) {
            foreach ($brave->search($line, self::RESULT_COUNT) as $result) {
                $hash = md5($result['url']);

                if (isset($seen[$hash])) {
                    continue;
                }
                $seen[$hash] = true;

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
        }

        $this->dork->forceFill(['last_run_at' => now()])->save();

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
        $heading = $this->dork->label ?: Str::limit($this->dork->queryLines()[0] ?? $this->dork->query, 60);

        $lines = [
            '🎯 *Dork Hunter* — '.count($results).' new hit(s)',
            '*'.$heading.'*',
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
