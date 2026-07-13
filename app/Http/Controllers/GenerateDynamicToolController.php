<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\ConnectionException;

class GenerateDynamicToolController extends Controller
{
    public function __invoke(Request $request, $slug)
    {
        $tools = config('karangtools');
        if (!isset($tools[$slug])) {
            return response()->json(['error' => 'Tool not found.'], 404);
        }
        
        $tool = $tools[$slug];

        // Gather all inputs from request based on config
        $inputData = [];
        $rules = [];
        foreach ($tool['inputs'] as $input) {
            $isOptional = $input['optional'] ?? false;
            $rules[$input['name']] = $isOptional ? 'nullable|string' : 'required|string';
            if ($request->has($input['name'])) {
                $inputData[$input['name']] = $request->input($input['name']);
            }
        }
        
        $validated = $request->validate($rules);

        $userPrompt = "";
        foreach ($tool['inputs'] as $input) {
            $val = $validated[$input['name']] ?? '';
            if ($val !== '') {
                $userPrompt .= $input['label'] . ":\n" . $val . "\n\n";
            }
        }

        $systemPrompt = $tool['system_prompt'] . "\n\nReturn ONLY valid JSON with exactly these keys: " . implode(', ', array_column($tool['outputs'], 'key')) . ". No markdown fences, no preamble. Ensure all newlines inside strings are escaped.";

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
            return response()->json(['error' => 'Failed to generate output from AI.', 'details' => $response->json()], 500);
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

        \App\Models\ToolHistory::create([
            'user_id' => $request->user()->id,
            'tool_slug' => $slug,
            'inputs' => $validated,
            'outputs' => $json,
        ]);

        return response()->json($json);
    }
}
