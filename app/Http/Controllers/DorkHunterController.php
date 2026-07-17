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
     * Maximum number of active dorks allowed to stay within the Brave free tier.
     */
    private const MAX_ACTIVE_DORKS = 5;

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
            'activeCount' => $dorks->where('is_active', true)->count(),
            'maxActive' => self::MAX_ACTIVE_DORKS,
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
            $this->guardActiveLimit();
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

        if ($isActive && ! $dork->is_active) {
            $this->guardActiveLimit();
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
     * Prevent activating more dorks than the Brave free tier can sustain.
     *
     * @throws ValidationException
     */
    private function guardActiveLimit(): void
    {
        $activeCount = Dork::where('is_active', true)->count();

        if ($activeCount >= self::MAX_ACTIVE_DORKS) {
            throw ValidationException::withMessages([
                'query' => 'You can only keep '.self::MAX_ACTIVE_DORKS.' dorks active at once (Brave free tier limit).',
            ]);
        }
    }
}
