<?php

namespace App\Jobs;

use App\Models\LeadFinderCompany;
use App\Models\LeadFinderSegment;
use App\Models\LeadFinderStep;
use App\Services\LeadFinder\CompanyDataProvider;
use App\Services\LeadFinder\CompanyImporter;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

/**
 * Searches a map (via whichever CompanyDataProvider is bound) for companies
 * matching one segment around a given city, then imports the results into
 * that segment's shared, deduped company list. A deterministic outcome (city
 * not found, area too large, map service busy) is terminal: it's recorded on
 * the step and the job does not retry, since retrying wouldn't change it.
 */
class ProcessLeadFinderCompanySearch implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public int $segmentId, public string $city) {}

    /**
     * @return array<int, int>
     */
    public function backoff(): array
    {
        return [10, 30, 60];
    }

    public function handle(CompanyDataProvider $provider, CompanyImporter $importer): void
    {
        $segment = LeadFinderSegment::findOrFail($this->segmentId);
        $step = LeadFinderStep::firstOrCreate(
            [
                'lead_finder_project_id' => $segment->lead_finder_project_id,
                'lead_finder_segment_id' => $segment->id,
                'step' => LeadFinderStep::STEP_FIND_COMPANIES_MAP,
            ],
            ['status' => LeadFinderStep::STATUS_PENDING]
        );

        $step->markRunning();

        $result = $provider->findCompanies($segment, $this->city, $segment->project->user_id);

        if (! $result['ok']) {
            $step->markFailed($result['reason']);

            return;
        }

        $importResult = $importer->import($segment, $result['companies'], LeadFinderCompany::SOURCE_MAP);

        $note = ($result['widened'] ? 'No exact matches, so we broadened the search. ' : '')
            ."Found {$importResult['imported']} new ".($importResult['imported'] === 1 ? 'company' : 'companies')
            .", {$importResult['duplicates']} already in your list.";

        $step->markCompleted($note);
    }

    /**
     * Reached only after an unexpected exception exhausts all retries.
     */
    public function failed(?Throwable $exception): void
    {
        $reason = 'Something unexpected went wrong after a few attempts. Please try again.';

        LeadFinderStep::where('lead_finder_segment_id', $this->segmentId)
            ->where('step', LeadFinderStep::STEP_FIND_COMPANIES_MAP)
            ->update(['status' => LeadFinderStep::STATUS_FAILED, 'failure_reason' => $reason, 'completed_at' => now()]);
    }
}
