<?php

namespace App\Jobs;

use App\Models\LeadFinderProject;
use App\Models\LeadFinderStep;
use App\Services\LeadFinder\CompanyProfiler;
use App\Services\LeadFinder\SiteCrawler;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

/**
 * Reads a prospect's website and builds a verified company profile for it.
 * Deterministic outcomes (robots.txt blocked, bot-check, invalid AI JSON
 * after retry) are terminal: they're recorded as a failed step and the job
 * does not retry, since retrying would not change the outcome. Only an
 * unexpected exception (a real infrastructure hiccup) triggers the queue's
 * own retry/backoff.
 */
class ProcessLeadFinderProfile implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public int $projectId) {}

    /**
     * @return array<int, int>
     */
    public function backoff(): array
    {
        return [10, 30, 60];
    }

    public function handle(SiteCrawler $crawler, CompanyProfiler $profiler): void
    {
        $project = LeadFinderProject::findOrFail($this->projectId);
        $step = LeadFinderStep::where('lead_finder_project_id', $project->id)
            ->where('step', LeadFinderStep::STEP_FETCH_PROFILE)
            ->firstOrFail();

        $step->markRunning();
        $project->update(['status' => LeadFinderProject::STATUS_RUNNING]);

        $pages = $crawler->read($project->source_url);
        $result = $profiler->profile($pages, $project->user_id, $project->id);

        if (! $result['ok']) {
            $step->markFailed($result['reason']);
            $project->update(['status' => LeadFinderProject::STATUS_FAILED, 'failure_reason' => $result['reason']]);

            return;
        }

        $project->update(['status' => LeadFinderProject::STATUS_COMPLETED, 'profile' => $result['profile']]);
        $step->markCompleted();
    }

    /**
     * Reached only after an unexpected exception exhausts all retries.
     */
    public function failed(?Throwable $exception): void
    {
        $project = LeadFinderProject::find($this->projectId);
        if (! $project) {
            return;
        }

        $reason = 'Something unexpected went wrong after a few attempts. Please try again.';
        $project->update(['status' => LeadFinderProject::STATUS_FAILED, 'failure_reason' => $reason]);

        LeadFinderStep::where('lead_finder_project_id', $project->id)
            ->where('step', LeadFinderStep::STEP_FETCH_PROFILE)
            ->update(['status' => LeadFinderStep::STATUS_FAILED, 'failure_reason' => $reason, 'completed_at' => now()]);
    }
}
