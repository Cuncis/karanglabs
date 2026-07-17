<?php

namespace App\Console\Commands;

use App\Jobs\RunDorkJob;
use App\Models\Dork;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('dorks:run')]
#[Description('Dispatch a search job for every active dork.')]
class RunDorksCommand extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dorks = Dork::where('is_active', true)->get();

        if ($dorks->isEmpty()) {
            $this->info('No active dorks to run.');

            return self::SUCCESS;
        }

        foreach ($dorks as $dork) {
            RunDorkJob::dispatch($dork);
        }

        $this->info("Dispatched {$dorks->count()} dork job(s).");

        return self::SUCCESS;
    }
}
