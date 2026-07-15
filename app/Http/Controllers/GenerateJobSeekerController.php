<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\ConnectionException;

class GenerateJobSeekerController extends Controller
{
    public function __invoke(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'background' => 'required|string|max:8000',
            'job_context' => 'nullable|string|max:4000',
        ]);

        // Save profile to user model
        if ($user = $request->user()) {
            $user->name = $validated['name'];
            
            // Only update email if it doesn't conflict
            if ($user->email !== $validated['email']) {
                $exists = \App\Models\User::where('email', $validated['email'])->exists();
                if (!$exists) {
                    $user->email = $validated['email'];
                }
            }
            
            $user->job_background = $validated['background'];
            $user->save();
        }

        $userContext = "Name: " . $validated['name'] . "\n";
        $userContext .= "Email: " . $validated['email'] . "\n";
        $userContext .= "Personal Background / Experience: \n" . $validated['background'] . "\n\n";

        $jobContextStr = "Target Job Context:\n";
        if (!empty($validated['job_context'])) {
            $jobContextStr .= $validated['job_context'] . "\n";
        }

        $prompt = $userContext . $jobContextStr;

        $systemPrompt = <<<EOT
You are an expert Career Coach and Professional Resume Writer. The user will provide their personal background, skills, and work experience, along with details about a specific target company and role. Your job is to convert their raw background information into two perfect formats to help them land their dream job, precisely aligned with the target role context if provided:
1. A highly professional, impactful Resume summary and bullet points.
2. A compelling, personalized email message (cover letter style) meant to be sent directly to HR or a hiring manager.

CRITICAL RULES:
1. Make it sound extremely natural and human-written. Do NOT sound like an AI.
2. NEVER use the "—" (em dash) symbol, as it strongly implies AI generation. Use normal commas, hyphens (-), or separate sentences.
3. Structure the Resume to highlight key achievements, metrics, and core skills that match the target role's requirements.
4. Structure the Message to be polite, confident, engaging, and directly showing value without sounding desperate. Tailor it to the company context.
5. Do not use robotic buzzwords where simpler language works better.
6. Fill only what the user has. Do not invent experience they do not have, but frame what they do have in the best possible light for the target role.
7. KEEP IT CONCISE. Do not make the resume or message too long. Only include the most important, high-impact information. Avoid fluff and keep the HR message short and punchy.

Return your response as a JSON object with exactly these keys: "resume", "message".
Each key should contain a string which is the fully formatted content. Use line breaks (\\n) for formatting.

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
            return response()->json(['error' => 'Failed to generate job seeker content.', 'details' => $response->json()], 500);
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
