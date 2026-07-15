<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\ConnectionException;

class ShortenHrMessageController extends Controller
{
    public function __invoke(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:4000',
        ]);

        $prompt = "Original Message:\n" . $validated['message'];

        $systemPrompt = <<<EOT
You are an expert Career Coach. The user will provide a draft HR / hiring manager email.
Your task is to rewrite it to be significantly shorter, punchier, and more concise.

CRITICAL RULES:
1. Make it sound extremely natural and human-written.
2. NEVER use the "—" (em dash) symbol.
3. Keep the core value proposition but remove fluff. 
4. Return ONLY the shortened message text. Do NOT wrap it in JSON. Do NOT include markdown quotes. Just the raw text.
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
                'max_tokens' => 2048,
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
            return response()->json(['error' => 'Failed to shorten message.', 'details' => $response->json()], 500);
        }

        $content = $response->json('content.0.text');
        $content = trim($content);

        return response()->json(['message' => $content]);
    }
}
