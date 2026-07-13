<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\ConnectionException;

class GeneratePlanController extends Controller
{
    public function __invoke(Request $request)
    {
        $validated = $request->validate([
            'idea' => 'required|string',
            'tech_preference' => 'required|string',
            'tech_stack' => 'nullable|string',
            'answers' => 'nullable|array',
        ]);

        $prompt = "User Idea: " . $validated['idea'] . "\n\n";
        $prompt .= "Tech Preference: " . $validated['tech_preference'] . "\n";
        if (!empty($validated['tech_stack'])) {
            $prompt .= "Tech Stack: " . $validated['tech_stack'] . "\n";
        }
        if (!empty($validated['answers'])) {
            $prompt .= "Answers to Clarifying Questions:\n";
            foreach ($validated['answers'] as $index => $answer) {
                $prompt .= "- Q" . ($index + 1) . ": " . $answer . "\n";
            }
        }

        $systemPrompt = <<<EOT
You are an expert product manager and software architect. The user has described a software project idea and answered some clarifying questions. Your job is to turn their input into a structured product plan.

Return your response as a JSON object with exactly these four keys:
- "summary": A 2-3 sentence plain-language summary of the project and its core value.
- "feature_map": A markdown string listing features grouped by phase. Format: ## Phase 1\\n- Feature name: description\\n## Phase 2\\n...
- "prd": A full Product Requirements Document in markdown. Include: Executive Summary, Product Overview table, Target Users, Goals & KPIs table, Feature Breakdown (each feature with sub-features, user stories, acceptance criteria), Technical Requirements, Out of Scope, Risks & Mitigations table, Timeline Summary.
- "ai_prompt": A ready-to-paste prompt the user can give to Claude Code or another AI coding tool to start building the app. It should include the tech stack, all core features with acceptance criteria, folder structure guidance, and the instruction to "build this step by step starting with the data model and authentication."

Return ONLY valid JSON. No markdown fences, no preamble, no explanation outside the JSON object. Ensure all newlines inside strings are properly escaped as \\n. Do not include literal newlines or control characters inside JSON strings.

IMPORTANT: When recommending a tech stack or writing the AI prompt, you MUST use the latest technologies, specifically Laravel 13 and PHP 8.4. Be concise where possible to avoid truncation.
EOT;

        try {
            $response = Http::withHeaders([
                'x-api-key' => config('services.anthropic.key'),
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
                'anthropic-beta' => 'max-tokens-3-5-sonnet-2024-07-15',
            ])->connectTimeout(15)->timeout(180)->retry(2, 3000, function ($exception) {
                return $exception instanceof ConnectionException;
            })->post('https://api.anthropic.com/v1/messages', [
                'model' => 'claude-sonnet-4-6',
                'max_tokens' => 8192,
                'system' => $systemPrompt,
                'messages' => [
                    ['role' => 'user', 'content' => $prompt]
                ]
            ]);
        } catch (ConnectionException $e) {
            return response()->json([
                'error' => 'Could not connect to AI service. Please check your internet connection and try again.',
            ], 503);
        }

        if ($response->failed()) {
            return response()->json(['error' => 'Failed to generate plan from AI.', 'details' => $response->json()], 500);
        }

        $content = $response->json('content.0.text');

        // Clean up markdown code blocks if the model included them
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

        // Fix invalid UTF-8 sequences (happens if truncated in the middle of a multi-byte character)
        $content = mb_convert_encoding($content, 'UTF-8', 'UTF-8');

        // Remove control characters safely without breaking multibyte
        $content = preg_replace('/[\x00-\x1F\x7F]/', '', $content);

        $json = json_decode($content, true);

        // If standard decode fails, try appending missing quotes/braces
        if (!$json && json_last_error() !== JSON_ERROR_NONE) {
            $fallbacks = [
                $content . '"}',
                $content . '}',
                $content . '"]}',
                $content . ']',
                rtrim($content, '\\') . '"}',
            ];

            foreach ($fallbacks as $fallback) {
                $json = json_decode($fallback, true);
                if ($json && json_last_error() === JSON_ERROR_NONE) {
                    break;
                }
            }

            if (!$json) {
                $error_msg = json_last_error_msg();

                return response()->json(['error' => 'Invalid JSON from AI. ('.$error_msg.')', 'raw' => $content], 500);
            }
        }

        return response()->json($json);
    }
}
