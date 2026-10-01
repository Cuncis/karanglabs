<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ValidatesJson;
use App\Jobs\ProcessLeadFinderSegments;
use App\Models\LeadFinderProject;
use App\Models\LeadFinderSegment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeadFinderSegmentController extends Controller
{
    use ValidatesJson;

    public function store(LeadFinderProject $project, Request $request)
    {
        abort_unless($project->user_id === $request->user()->id, 404);

        if ($project->status !== LeadFinderProject::STATUS_COMPLETED) {
            return response()->json(['error' => 'Build your company profile first.'], 422);
        }

        ProcessLeadFinderSegments::dispatch($project->id);

        return response()->json(['ok' => true]);
    }

    public function update(LeadFinderProject $project, LeadFinderSegment $segment, Request $request)
    {
        abort_unless($project->user_id === $request->user()->id, 404);
        abort_unless($segment->lead_finder_project_id === $project->id, 404);

        $validated = $this->validateJson($request, ['is_enabled' => ['required', 'boolean']]);
        if ($validated instanceof JsonResponse) {
            return $validated;
        }
        $segment->update(['is_enabled' => $validated['is_enabled']]);

        return response()->json(['id' => $segment->id, 'is_enabled' => $segment->is_enabled]);
    }
}
