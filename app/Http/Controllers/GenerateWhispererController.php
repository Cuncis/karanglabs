<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\ConnectionException;

class GenerateWhispererController extends Controller
{
    public function __invoke(Request $request)
    {
        $validated = $request->validate([
            'prompt' => 'required|string',
            'type' => 'required|string|in:regex,query,schema'
        ]);

        $userPrompt = "Task Type: " . $validated['type'] . "\n";
        $userPrompt .= "Description: " . $validated['prompt'] . "\n";

        $systemPrompt = <<<EOT
You are an expert senior developer specializing in Regular Expressions, Database Queries (SQL, Laravel Eloquent, MongoDB, etc), and Data Schemas.
The user will provide a "Task Type" (regex, query, or schema) and a plain English description of what they need.
Your job is to generate the precise code and explain it.

Return your response as a JSON object with exactly these keys:
- "code_snippet": The exact code snippet (just the raw code or regex pattern, without markdown code fences).
- "language": The programming language or format for syntax highlighting (e.g., "regex", "php", "sql", "json").
- "explanation": A concise, step-by-step explanation of how the code works. Use markdown for formatting.
- "test_cases": A markdown formatted string showing examples of what matches/works and what doesn't, or example input/output data.

Return ONLY valid JSON. No markdown fences, no preamble, no explanation outside the JSON object. Ensure all newlines inside strings are properly escaped as \\n.
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
                'max_tokens' => 4096,
                'system' => $systemPrompt,
                'messages' => [
                    ['role' => 'user', 'content' => $userPrompt]
                ]
            ]);
        } catch (ConnectionException $e) {
            return response()->json([
                'error' => 'Could not connect to AI service. Please check your internet connection.',
            ], 503);
        }

        if ($response->failed()) {
            return response()->json(['error' => 'Failed to generate code from AI.', 'details' => $response->json()], 500);
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

        // Fix invalid UTF-8 sequences
        $content = mb_convert_encoding($content, 'UTF-8', 'UTF-8');
        // Remove control characters safely without breaking multibyte
        $content = preg_replace('/[\x00-\x1F\x7F]/', '', $content);

        $json = json_decode($content, true);

        if (!$json && json_last_error() !== JSON_ERROR_NONE) {
            $error_msg = json_last_error_msg();
            return response()->json(['error' => 'Invalid JSON from AI. ('.$error_msg.')', 'raw' => $content], 500);
        }

        return response()->json($json);
    }
}
