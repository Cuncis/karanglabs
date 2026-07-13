<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\ConnectionException;

class GenerateChangelogController extends Controller
{
    public function __invoke(Request $request)
    {
        $validated = $request->validate([
            'commits' => 'required|string',
            'audience' => 'required|string|in:technical,users,mixed'
        ]);

        $userPrompt = "Target Audience: " . $validated['audience'] . "\n";
        $userPrompt .= "Raw Notes / Commits:\n" . $validated['commits'] . "\n";

        $systemPrompt = <<<EOT
You are an expert Developer Advocate and Technical Writer.
The user will provide messy technical notes, git commit messages, or a list of tasks they finished. They will also specify the target audience (technical, users, or mixed).
Your job is to translate these raw technical notes into a polished, user-facing changelog and a promotional social media post (like a Tweet or LinkedIn post).

Return your response as a JSON object with exactly these keys:
- "changelog": A markdown formatted changelog. It should have an exciting release title, and categorize the updates (e.g., ✨ New Features, 🐛 Bug Fixes, 🛠 Under the Hood) based on the notes. Tailor the language to the requested target audience.
- "tweet": A promotional, engaging social media post (around 200-280 characters) summarizing the update, using appropriate emojis and 2-3 relevant hashtags. Make it sound exciting!

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
            return response()->json(['error' => 'Failed to generate changelog from AI.', 'details' => $response->json()], 500);
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
