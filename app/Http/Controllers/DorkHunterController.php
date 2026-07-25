<?php

namespace App\Http\Controllers;

use App\Jobs\RunDorkJob;
use App\Models\Dork;
use App\Models\DorkResult;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class DorkHunterController extends Controller
{
    /**
     * Maximum number of keyword lines allowed across all active dorks.
     *
     * Each line is one Brave query per run. Running every 2 hours means
     * 12 runs/day * 30 days = 360 runs/month, so 5 lines keeps usage at
     * 5 * 360 = 1800 queries/month, within the 2000/month free tier.
     */
    private const MAX_ACTIVE_QUERIES = 5;

    public function index(): Response
    {
        $dorks = Dork::withCount('results')
            ->orderByDesc('is_active')
            ->latest()
            ->get();

        $results = DorkResult::with('dork:id,label,query')
            ->latest()
            ->take(50)
            ->get();

        return Inertia::render('DorkHunter', [
            'dorks' => $dorks,
            'results' => $results,
            'activeCount' => $this->activeQueryCount(),
            'maxActive' => self::MAX_ACTIVE_QUERIES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'label' => 'nullable|string|max:255',
            'query' => 'required|string|max:1000',
            'is_active' => 'boolean',
        ]);

        $isActive = $validated['is_active'] ?? true;

        if ($isActive) {
            $this->guardQueryLimit(count(Dork::splitQuery($validated['query'])));
        }

        Dork::create([
            'label' => $validated['label'] ?? null,
            'query' => $validated['query'],
            'is_active' => $isActive,
        ]);

        return back()->with('success', 'Dork added.');
    }

    public function update(Request $request, Dork $dork): RedirectResponse
    {
        $validated = $request->validate([
            'label' => 'nullable|string|max:255',
            'query' => 'required|string|max:1000',
            'is_active' => 'boolean',
        ]);

        $isActive = $validated['is_active'] ?? $dork->is_active;

        if ($isActive) {
            $this->guardQueryLimit(count(Dork::splitQuery($validated['query'])), $dork->id);
        }

        $dork->update([
            'label' => $validated['label'] ?? null,
            'query' => $validated['query'],
            'is_active' => $isActive,
        ]);

        return back()->with('success', 'Dork updated.');
    }

    public function destroy(Dork $dork): RedirectResponse
    {
        $dork->delete();

        return back()->with('success', 'Dork deleted.');
    }

    public function run(Dork $dork): RedirectResponse
    {
        RunDorkJob::dispatch($dork);

        return back()->with('success', 'Dork queued to run now.');
    }

    /**
     * Total number of keyword lines across every active dork.
     */
    private function activeQueryCount(?int $ignoreDorkId = null): int
    {
        return Dork::where('is_active', true)
            ->when($ignoreDorkId, fn ($query) => $query->where('id', '!=', $ignoreDorkId))
            ->get()
            ->sum(fn (Dork $dork): int => count($dork->queryLines()));
    }

    /**
     * Prevent activating more keyword lines than the Brave free tier can sustain.
     *
     * @throws ValidationException
     */
    private function guardQueryLimit(int $incomingLines, ?int $ignoreDorkId = null): void
    {
        $existing = $this->activeQueryCount($ignoreDorkId);

        if ($existing + $incomingLines > self::MAX_ACTIVE_QUERIES) {
            throw ValidationException::withMessages([
                'query' => 'Active dorks can use at most '.self::MAX_ACTIVE_QUERIES." search lines in total (Brave free tier limit). You already have {$existing} active, and this dork adds {$incomingLines}.",
            ]);
        }
    }
}
