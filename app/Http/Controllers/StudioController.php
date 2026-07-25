<?php

namespace App\Http\Controllers;

use App\Models\StudioProject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StudioController extends Controller
{
    /**
     * Studio dashboard: overview, saved projects and quick stats.
     */
    public function index(): Response
    {
        $user = Auth::user();

        return Inertia::render('Studio/Dashboard', [
            'recentProjects' => $this->recentProjects(),
            'projectCount' => $user->studioProjects()->count(),
            'engineCount' => count($this->engineSlugs()),
        ]);
    }

    /**
     * The generator screen for a single engine.
     */
    public function engine(string $engine): Response
    {
        abort_unless(in_array($engine, $this->engineSlugs(), true), 404);

        return Inertia::render('Studio/Engine', [
            'engine' => $engine,
            'recentProjects' => $this->recentProjects($engine),
        ]);
    }

    /**
     * Save a generated brief + prompt as a project.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'engine' => ['required', 'string', Rule::in($this->engineSlugs())],
            'title' => ['required', 'string', 'max:255'],
            'brief' => ['required', 'array'],
            'prompt' => ['required', 'string', 'max:20000'],
        ]);

        $request->user()->studioProjects()->create($validated);

        return back()->with('success', 'Project tersimpan.');
    }

    /**
     * Delete one of the current user's projects.
     */
    public function destroy(StudioProject $project): RedirectResponse
    {
        abort_unless($project->user_id === Auth::id(), 403);

        $project->delete();

        return back()->with('success', 'Project dihapus.');
    }

    /**
     * Static step-by-step guide: deploy → domain → connect.
     */
    public function guides(): Response
    {
        return Inertia::render('Studio/Guides');
    }

    /**
     * Static add-on catalog.
     */
    public function addons(): Response
    {
        return Inertia::render('Studio/Addons');
    }

    /**
     * Shown to authenticated users who have not purchased Studio access.
     */
    public function locked(): Response
    {
        return Inertia::render('Studio/Locked');
    }

    /**
     * The current user's most recent projects, optionally filtered by engine.
     *
     * @return Collection<int, StudioProject>
     */
    private function recentProjects(?string $engine = null)
    {
        return Auth::user()->studioProjects()
            ->when($engine, fn ($query) => $query->where('engine', $engine))
            ->latest()
            ->take(20)
            ->get(['id', 'engine', 'title', 'prompt', 'created_at']);
    }

    /**
     * @return array<int, string>
     */
    private function engineSlugs(): array
    {
        return array_keys(config('studio.engines'));
    }
}
