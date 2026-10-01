<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ValidatesJson;
use App\Jobs\ProcessLeadFinderProfile;
use App\Models\LeadFinderProject;
use App\Models\LeadFinderSegment;
use App\Models\LeadFinderStep;
use App\Services\LeadFinder\PrivateIpGuard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeadFinderController extends Controller
{
    use ValidatesJson;

    public function index(Request $request)
    {
        $history = LeadFinderProject::where('user_id', $request->user()->id)
            ->latest()
            ->take(10)
            ->get(['id', 'source_url', 'status', 'failure_reason', 'profile', 'created_at']);

        return Inertia::render('LeadFinder', ['history' => $history]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateJson($request, [
            'source_url' => ['required', 'url', 'max:2048'],
        ]);
        if ($validated instanceof JsonResponse) {
            return $validated;
        }

        $host = parse_url($validated['source_url'], PHP_URL_HOST);

        if (! $host || PrivateIpGuard::hasOnlyPrivateIps($host)) {
            return response()->json([
                'error' => 'That address points to a private or internal network, which we never fetch.',
            ], 422);
        }

        $project = LeadFinderProject::create([
            'user_id' => $request->user()->id,
            'source_url' => $validated['source_url'],
            'status' => LeadFinderProject::STATUS_PENDING,
        ]);

        LeadFinderStep::create([
            'lead_finder_project_id' => $project->id,
            'step' => LeadFinderStep::STEP_FETCH_PROFILE,
            'status' => LeadFinderStep::STATUS_PENDING,
        ]);

        ProcessLeadFinderProfile::dispatch($project->id);

        return response()->json(['id' => $project->id]);
    }

    public function show(LeadFinderProject $project, Request $request)
    {
        abort_unless($project->user_id === $request->user()->id, 404);

        return response()->json([
            'id' => $project->id,
            'source_url' => $project->source_url,
            'status' => $project->status,
            'failure_reason' => $project->failure_reason,
            'profile' => $project->profile,
            'created_at' => $project->created_at,
            'steps' => $project->steps()->get(['step', 'status', 'failure_reason']),
            'segments' => $project->segments()
                ->where('status', LeadFinderSegment::STATUS_ACTIVE)
                ->orderByDesc('fit_score')
                ->get(),
        ]);
    }
}
