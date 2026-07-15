<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\ConnectionException;

class GenerateSocializerController extends Controller
{
    public function __invoke(Request $request)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:5000',
        ]);

        $prompt = "Source Content: " . $validated['content'] . "\n";

        $systemPrompt = <<<EOT
You are an expert Social Media Manager and Content Creator. The user will provide a paragraph or rough draft of content. Your job is to convert and repurpose this content into 6 distinct styles tailored for different platforms: Instagram, Twitter/X, Facebook, YouTube (Shorts/Community), TikTok, and LinkedIn.

CRITICAL RULES:
1. Make it sound extremely natural and human-written. Do NOT sound like an AI.
2. Minimize the use of raw emojis. Use them sparingly and only where a real human would.
3. NEVER use the "—" (em dash) symbol, as it strongly implies AI generation. Use normal commas or separate sentences.
4. Include appropriate hashtags for each platform at the end of the post.
5. Adapt the tone correctly:
   - Instagram: Visually descriptive, lifestyle-focused, engaging.
   - Twitter/X: Punchy, concise, thread-friendly or single impact tweet.
   - Facebook: Conversational, community-focused, encourages comments.
   - YouTube: Hook-driven, refers to a video/short, asks viewers to subscribe/comment.
   - TikTok: Trendy, fast-paced, very human, Gen-Z friendly phrasing.
   - LinkedIn: Professional but authentic, story-driven, networking-focused.

Return your response as a JSON object with exactly these keys: "instagram", "twitter", "facebook", "youtube", "tiktok", "linkedin".
Each key should contain a string which is the fully formatted post for that platform.

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
                    ['role' => 'user', 'content' => $prompt]
                ]
            ]);
        } catch (ConnectionException $e) {
            return response()->json([
                'error' => 'Could not connect to AI service. Please check your internet connection.',
            ], 503);
        }

        if ($response->failed()) {
            return response()->json(['error' => 'Failed to generate social media content.', 'details' => $response->json()], 500);
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
