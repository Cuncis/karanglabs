<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\ConnectionException;

class GenerateMicroCopyController extends Controller
{
    public function __invoke(Request $request)
    {
        $validated = $request->validate([
            'component_name' => 'required|string',
            'context' => 'nullable|string'
        ]);

        $prompt = "Component/Screen Name: " . $validated['component_name'] . "\n";
        if (!empty($validated['context'])) {
            $prompt .= "Additional Context: " . $validated['context'] . "\n";
        }

        $systemPrompt = <<<EOT
You are an expert UX Writer and Micro-Copy Specialist. The user will provide a UI component name or screen description (e.g., "Empty Shopping Cart" or "Reset Password Form") and possibly some context. Your job is to generate perfect micro-copy for this UI in three different tones.

Return your response as a JSON object with exactly these keys: "professional", "playful", and "direct".
Each of these keys must contain an object with exactly these keys (you can leave values empty if not applicable, but always include the keys):
- "title": The main heading text.
- "description": The subtitle or helper text.
- "primary_button": Text for the main call to action button.
- "secondary_button": Text for a secondary action or cancel button.
- "success_message": A toast or inline success message (e.g. after submission).
- "error_message": A generic error message for this context.
- "placeholder": An example placeholder for an input field (if applicable).

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
                'model' => 'claude-sonnet-4-6', // standard mapping for claude 3.5 sonnet
                'max_tokens' => 4096,
                'system' => $systemPrompt,
                'messages' => [
                    ['role' => 'user', 'content' => $prompt]
                ]
            ]);
        } catch (ConnectionException $e) {
            return response()->json([
                'error' => 'Could not connect to AI service. Please check your internet connection.',
            ], 503);
        }

        if ($response->failed()) {
            return response()->json(['error' => 'Failed to generate micro-copy from AI.', 'details' => $response->json()], 500);
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
