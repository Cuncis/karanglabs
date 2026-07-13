<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\ConnectionException;

class GenerateQuestionsController extends Controller
{
    public function __invoke(Request $request)
    {
        $validated = $request->validate([
            'idea' => 'required|string|min:5',
        ]);

        $systemPrompt = <<<EOT
You are an expert product manager. The user has described a software project idea. Generate exactly 5 clarifying questions that will help you deeply understand their requirements and build a better product plan.

Return your response as a JSON object with exactly one key:
- "questions": An array of exactly 5 question objects.

Each question object must have:
- "id": A unique string identifier (e.g. "q1", "q2", etc.)
- "question": The question text
- "type": Either "single" (radio select, pick one) or "multi" (multi-select, pick several) or "text" (free text input only)
- "options": An array of 4-6 short answer options (strings). Always include "Other" as the last option. For "text" type, set this to an empty array [].

Guidelines for questions:
1. First question should be about the target audience / who needs this
2. Second question should be about the single most important user action
3. Third question should ask which core features are must-haves (use "multi" type)
4. Fourth question should explore the key advantage or differentiator
5. Fifth question should focus on user retention / what brings users back

Make the options highly specific and relevant to the project idea described. Do NOT use generic options.

Return ONLY valid JSON. No markdown fences, no preamble.
EOT;

        try {
            $response = Http::withHeaders([
                'x-api-key' => config('services.anthropic.key'),
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])->connectTimeout(15)->timeout(60)->retry(2, 3000, function ($exception) {
                return $exception instanceof ConnectionException;
            })->post('https://api.anthropic.com/v1/messages', [
                'model' => 'claude-sonnet-4-6',
                'max_tokens' => 1024,
                'system' => $systemPrompt,
                'messages' => [
                    ['role' => 'user', 'content' => 'Project idea: ' . $validated['idea']]
                ]
            ]);
        } catch (ConnectionException $e) {
            return response()->json([
                'error' => 'Could not connect to AI service. Please check your internet connection and try again.',
            ], 503);
        }

        if ($response->failed()) {
            return response()->json(['error' => 'Failed to generate questions.', 'details' => $response->json()], 500);
        }

        $content = $response->json('content.0.text');

        // Clean up markdown code blocks
        $content = trim($content);
        if (str_starts_with($content, '```json')) {
            $content = substr($content, 7);
        } elseif (str_starts_with($content, '```')) {
            $content = substr($content, 3);
        }
        if (str_ends_with($content, '```')) {
            $content = substr($content, 0, -3);
        }
        $content = trim($content);

        $content = mb_convert_encoding($content, 'UTF-8', 'UTF-8');
        $content = preg_replace('/[\x00-\x1F\x7F]/', '', $content);

        $json = json_decode($content, true);

        if (!$json || !isset($json['questions'])) {
            return response()->json(['error' => 'Invalid response from AI.'], 500);
        }

        return response()->json($json);
    }
}
