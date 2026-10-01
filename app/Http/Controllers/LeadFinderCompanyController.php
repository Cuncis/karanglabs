<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ValidatesJson;
use App\Jobs\ProcessLeadFinderCompanySearch;
use App\Models\LeadFinderCompany;
use App\Models\LeadFinderProject;
use App\Models\LeadFinderSegment;
use App\Models\LeadFinderStep;
use App\Services\LeadFinder\CompanyImporter;
use App\Services\LeadFinder\CsvCompanyParser;
use App\Services\LeadFinder\PastedCompanyParser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LeadFinderCompanyController extends Controller
{
    use ValidatesJson;

    public function index(LeadFinderProject $project, LeadFinderSegment $segment, Request $request)
    {
        $this->authorizeSegment($project, $segment, $request);

        return response()->json([
            'companies' => $segment->companies()->latest()->get(),
            'step' => $segment->steps()
                ->where('step', LeadFinderStep::STEP_FIND_COMPANIES_MAP)
                ->first(['status', 'failure_reason', 'note']),
        ]);
    }

    public function storeMap(LeadFinderProject $project, LeadFinderSegment $segment, Request $request)
    {
        $this->authorizeSegment($project, $segment, $request);

        $validated = $this->validateJson($request, ['city' => ['required', 'string', 'max:255']]);
        if ($validated instanceof JsonResponse) {
            return $validated;
        }

        ProcessLeadFinderCompanySearch::dispatch($segment->id, $validated['city']);

        return response()->json(['ok' => true]);
    }

    public function storePaste(LeadFinderProject $project, LeadFinderSegment $segment, Request $request, PastedCompanyParser $parser, CompanyImporter $importer)
    {
        $this->authorizeSegment($project, $segment, $request);

        $validated = $this->validateJson($request, ['text' => ['required', 'string', 'max:50000']]);
        if ($validated instanceof JsonResponse) {
            return $validated;
        }

        $parsed = $parser->parse($validated['text']);
        $result = $importer->import($segment, $parsed['companies'], LeadFinderCompany::SOURCE_PASTE);

        return response()->json([...$result, 'errors' => $parsed['errors']]);
    }

    public function storeCsv(LeadFinderProject $project, LeadFinderSegment $segment, Request $request, CsvCompanyParser $parser, CompanyImporter $importer)
    {
        $this->authorizeSegment($project, $segment, $request);

        $validated = $this->validateJson($request, ['file' => ['required', 'file', 'mimes:csv,txt', 'max:5120']]);
        if ($validated instanceof JsonResponse) {
            return $validated;
        }

        $parsed = $parser->parse($validated['file']->getRealPath());
        $result = $importer->import($segment, $parsed['companies'], LeadFinderCompany::SOURCE_CSV);

        return response()->json([...$result, 'errors' => $parsed['errors']]);
    }

    public function export(LeadFinderProject $project, LeadFinderSegment $segment, Request $request): StreamedResponse
    {
        $this->authorizeSegment($project, $segment, $request);

        $filename = 'lead-finder-'.Str::slug($segment->name).'.csv';

        return response()->streamDownload(function () use ($segment) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['name', 'website', 'location', 'country', 'email']);

            $segment->companies()->orderBy('name')->each(function (LeadFinderCompany $company) use ($out) {
                fputcsv($out, [$company->name, $company->website, $company->location, $company->country, $company->email]);
            });

            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    private function authorizeSegment(LeadFinderProject $project, LeadFinderSegment $segment, Request $request): void
    {
        abort_unless($project->user_id === $request->user()->id, 404);
        abort_unless($segment->lead_finder_project_id === $project->id, 404);
    }
}
