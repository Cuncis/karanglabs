<?php

namespace App\Jobs;

use App\Models\LeadFinderProject;
use App\Models\LeadFinderSegment;
use App\Models\LeadFinderStep;
use App\Services\LeadFinder\SegmentSuggester;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

/**
 * Suggests target segments from the project's company profile, then
 * reconciles them against any segments from a previous run: a returned name
 * that matches an existing one updates that row instead of duplicating it,
 * and an existing segment the AI no longer proposes is retired, but only if
 * no companies have been found for it yet (companies_count stays 0 until
 * the company-finding feature exists).
 */
class ProcessLeadFinderSegments implements ShouldQueue
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

    public function handle(SegmentSuggester $suggester): void
    {
        $project = LeadFinderProject::findOrFail($this->projectId);
        $step = LeadFinderStep::firstOrCreate(
            ['lead_finder_project_id' => $project->id, 'step' => LeadFinderStep::STEP_SEGMENTS],
            ['status' => LeadFinderStep::STATUS_PENDING]
        );

        $step->markRunning();

        $existingNames = $project->segments()
            ->where('status', LeadFinderSegment::STATUS_ACTIVE)
            ->pluck('name')
            ->all();

        $result = $suggester->suggest($project->profile ?? [], $existingNames, $project->user_id, $project->id);

        if (! $result['ok']) {
            $step->markFailed($result['reason']);

            return;
        }

        $this->reconcile($project, $result['segments']);
        $step->markCompleted();
    }

    /**
     * @param  array<int, array<string, mixed>>  $newSegments
     */
    private function reconcile(LeadFinderProject $project, array $newSegments): void
    {
        $existing = $project->segments()->get()->keyBy(fn ($segment) => strtolower(trim($segment->name)));
        $seenKeys = [];

        foreach ($newSegments as $data) {
            $key = strtolower($data['name']);
            $seenKeys[] = $key;

            $attributes = [
                'pain' => $data['pain'],
                'offer_angle' => $data['offer_angle'],
                'criteria' => $data['criteria'],
                'search_filters' => $data['search_filters'],
                'example_company_types' => $data['example_company_types'],
                'fit_score' => $data['fit_score'],
                'fit_reason' => $data['fit_reason'],
                'estimated_size' => $data['estimated_size'],
                'status' => LeadFinderSegment::STATUS_ACTIVE,
            ];

            if ($existing->has($key)) {
                $existing[$key]->update($attributes);
            } else {
                $project->segments()->create(array_merge(['name' => $data['name'], 'is_enabled' => true], $attributes));
            }
        }

        foreach ($existing as $key => $segment) {
            if (! in_array($key, $seenKeys, true) && $segment->companies_count === 0) {
                $segment->update(['status' => LeadFinderSegment::STATUS_RETIRED]);
            }
        }
    }

    /**
     * Reached only after an unexpected exception exhausts all retries.
     */
    public function failed(?Throwable $exception): void
    {
        $reason = 'Something unexpected went wrong after a few attempts. Please try again.';

        LeadFinderStep::where('lead_finder_project_id', $this->projectId)
            ->where('step', LeadFinderStep::STEP_SEGMENTS)
            ->update(['status' => LeadFinderStep::STATUS_FAILED, 'failure_reason' => $reason, 'completed_at' => now()]);
    }
}
