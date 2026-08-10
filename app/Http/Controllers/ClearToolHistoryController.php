<?php

namespace App\Http\Controllers;

use App\Models\ToolHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClearToolHistoryController extends Controller
{
    /**
     * Delete all of the authenticated user's history rows for one tool.
     */
    public function __invoke(Request $request, string $slug): JsonResponse
    {
        ToolHistory::where('user_id', $request->user()->id)
            ->where('tool_slug', $slug)
            ->delete();

        return response()->json(['message' => 'History cleared.']);
    }
}
