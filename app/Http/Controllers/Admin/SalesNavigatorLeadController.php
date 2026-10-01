<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SalesNavigatorLead;
use App\Services\SalesNavigator\LinkedInSalesNavigatorParser;
use App\Services\SalesNavigator\SalesNavigatorLeadImporter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SalesNavigatorLeadController extends Controller
{
    /**
     * List every tracked LinkedIn Sales Navigator lead.
     */
    public function index(): Response
    {
        $leads = SalesNavigatorLead::latest()->get();

        return Inertia::render('Admin/SalesNavigatorLeads', [
            'leads' => $leads,
            'stats' => [
                'total' => $leads->count(),
                'not_contacted' => $leads->where('status', SalesNavigatorLead::STATUS_NOT_CONTACTED)->count(),
                'in_progress' => $leads->whereIn('status', [
                    SalesNavigatorLead::STATUS_MESSAGE_1_SENT,
                    SalesNavigatorLead::STATUS_MESSAGE_2_SENT,
                    SalesNavigatorLead::STATUS_MESSAGE_3_SENT,
                    SalesNavigatorLead::STATUS_CONNECTED_NO_RESPONSE,
                ])->count(),
                'replied' => $leads->where('status', SalesNavigatorLead::STATUS_REPLIED)->count(),
            ],
        ]);
    }

    /**
     * Parse pasted Sales Navigator search-result HTML and import new leads.
     */
    public function import(Request $request, LinkedInSalesNavigatorParser $parser, SalesNavigatorLeadImporter $importer): RedirectResponse
    {
        $validated = $request->validate(['html' => ['required', 'string']]);

        $parsed = $parser->parse($validated['html']);

        if (empty($parsed['leads'])) {
            return back()->with('error', 'No leads were found in that paste. Make sure you copied the full search results page.');
        }

        $result = $importer->import($parsed['leads'], $request->user()->id);
        $duplicateCount = count($result['duplicates']);

        $message = "Added {$result['imported']} new lead".($result['imported'] === 1 ? '' : 's').'.';
        if ($duplicateCount > 0) {
            $message .= " {$duplicateCount} already tracked (skipped, not overwritten), see the list below.";
        }
        if (! empty($parsed['errors'])) {
            $message .= ' '.count($parsed['errors']).' entr'.(count($parsed['errors']) === 1 ? 'y' : 'ies').' could not be read.';
        }

        return back()
            ->with('success', $message)
            ->with('duplicateLeads', $result['duplicates']);
    }

    /**
     * Update a lead's outreach status and/or notes.
     */
    public function update(Request $request, SalesNavigatorLead $salesNavigatorLead): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['sometimes', Rule::in(SalesNavigatorLead::STATUSES)],
            'notes' => ['sometimes', 'nullable', 'string', 'max:5000'],
        ]);

        if (array_key_exists('status', $validated) && $validated['status'] !== $salesNavigatorLead->status) {
            $validated['last_contacted_at'] = now();
        }

        $salesNavigatorLead->update($validated);

        return back()->with('success', 'Lead updated.');
    }

    /**
     * Remove a lead from the tracker.
     */
    public function destroy(SalesNavigatorLead $salesNavigatorLead): RedirectResponse
    {
        $salesNavigatorLead->delete();

        return back()->with('success', 'Lead removed.');
    }
}
