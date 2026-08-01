<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EngineRequest;
use App\Support\WhitelabelPackage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EngineRequestController extends Controller
{
    /**
     * List every engine/tool request submitted by members & resellers.
     */
    public function index(): Response
    {
        $requests = EngineRequest::with('user:id,name,email,role')
            ->latest()
            ->limit(200)
            ->get()
            ->map(fn (EngineRequest $request): array => [
                'id' => $request->id,
                'message' => $request->message,
                'status' => $request->status,
                'created_at' => $request->created_at,
                'user' => $request->user ? [
                    'name' => $request->user->name,
                    'email' => $request->user->email,
                    'role' => $request->user->roleLabel(),
                ] : null,
            ]);

        return Inertia::render('Admin/EngineRequests', [
            'requests' => $requests,
            'stats' => [
                'total' => EngineRequest::count(),
                'pending' => EngineRequest::where('status', EngineRequest::STATUS_PENDING)->count(),
                'done' => EngineRequest::where('status', EngineRequest::STATUS_DONE)->count(),
            ],
            'hasPackage' => WhitelabelPackage::configured(),
        ]);
    }

    /**
     * Toggle a request between pending and done.
     */
    public function update(Request $request, EngineRequest $engineRequest): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in([EngineRequest::STATUS_PENDING, EngineRequest::STATUS_DONE])],
        ]);

        $engineRequest->update($validated);

        return back()->with('success', 'Status request diperbarui.');
    }

    /**
     * Remove a request.
     */
    public function destroy(EngineRequest $engineRequest): RedirectResponse
    {
        $engineRequest->delete();

        return back()->with('success', 'Request dihapus.');
    }
}
