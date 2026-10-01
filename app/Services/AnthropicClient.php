<?php

namespace App\Services;

use App\Models\AiCallLog;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

/**
 * Thin wrapper around the Anthropic Messages API that times every call,
 * estimates its cost from config('services.anthropic.pricing'), and writes
 * one ai_call_logs row per call (success or failure) so every AI call made
 * by the Lead Finder tool is auditable. New code only, existing tool
 * controllers keep calling the API directly and are left untouched.
 */
class AnthropicClient
{
    /**
     * @return array{ok: bool, text: ?string, error: ?string}
     */
    public function send(
        string $systemPrompt,
        string $userPrompt,
        string $model = 'claude-sonnet-4-6',
        int $maxTokens = 4096,
        ?int $userId = null,
        ?int $leadFinderProjectId = null,
        ?string $step = null,
    ): array {
        $startedAt = microtime(true);

        try {
            $response = Http::withHeaders([
                'x-api-key' => config('services.anthropic.key'),
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
                'anthropic-beta' => 'max-tokens-3-5-sonnet-2024-07-15',
            ])->connectTimeout(15)->timeout(180)->retry(2, 3000, fn ($exception) => $exception instanceof ConnectionException)
                ->post('https://api.anthropic.com/v1/messages', [
                    'model' => $model,
                    'max_tokens' => $maxTokens,
                    'system' => $systemPrompt,
                    'messages' => [
                        ['role' => 'user', 'content' => $userPrompt],
                    ],
                ]);
        } catch (ConnectionException) {
            $this->logCall($userId, $leadFinderProjectId, $step, $model, $userPrompt, null, null, null, null, null, AiCallLog::STATUS_FAILED, 'Could not connect to AI service.');

            return ['ok' => false, 'text' => null, 'error' => 'Could not connect to AI service. Please check your internet connection and try again.'];
        }

        $latencyMs = (int) round((microtime(true) - $startedAt) * 1000);

        if ($response->failed()) {
            $this->logCall($userId, $leadFinderProjectId, $step, $model, $userPrompt, $response->body(), null, null, null, $latencyMs, AiCallLog::STATUS_FAILED, 'AI service returned an error response.');

            return ['ok' => false, 'text' => null, 'error' => 'Failed to generate a response from AI.'];
        }

        $text = $response->json('content.0.text');
        $inputTokens = $response->json('usage.input_tokens');
        $outputTokens = $response->json('usage.output_tokens');
        $costUsd = $this->costFor($model, $inputTokens, $outputTokens);

        $this->logCall($userId, $leadFinderProjectId, $step, $model, $userPrompt, $text, $inputTokens, $outputTokens, $costUsd, $latencyMs, AiCallLog::STATUS_SUCCEEDED, null);

        return ['ok' => true, 'text' => $text, 'error' => null];
    }

    private function costFor(string $model, ?int $inputTokens, ?int $outputTokens): ?float
    {
        $pricing = config("services.anthropic.pricing.{$model}");

        if (! $pricing || $inputTokens === null || $outputTokens === null) {
            return null;
        }

        return round($inputTokens * $pricing['input_per_token'] + $outputTokens * $pricing['output_per_token'], 4);
    }

    private function logCall(
        ?int $userId,
        ?int $leadFinderProjectId,
        ?string $step,
        string $model,
        string $prompt,
        ?string $response,
        ?int $inputTokens,
        ?int $outputTokens,
        ?float $costUsd,
        ?int $latencyMs,
        string $status,
        ?string $errorMessage,
    ): void {
        AiCallLog::create([
            'user_id' => $userId,
            'lead_finder_project_id' => $leadFinderProjectId,
            'step' => $step,
            'model' => $model,
            'prompt' => $prompt,
            'response' => $response,
            'input_tokens' => $inputTokens,
            'output_tokens' => $outputTokens,
            'cost_usd' => $costUsd,
            'latency_ms' => $latencyMs,
            'status' => $status,
            'error_message' => $errorMessage,
        ]);
    }
}
