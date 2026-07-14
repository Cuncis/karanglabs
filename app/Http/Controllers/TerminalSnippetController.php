<?php

namespace App\Http\Controllers;

use App\Models\TerminalSnippet;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TerminalSnippetController extends Controller
{
    public function index()
    {
        $snippets = TerminalSnippet::where('user_id', auth()->id())
            ->latest()
            ->get();

        return Inertia::render('TerminalSnippets/Index', [
            'snippets' => $snippets
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'required|string',
        ]);

        $rawContent = $validated['content'];
        $title = $validated['title'] ?: 'Terminal Archive';

        try {
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'x-api-key' => config('services.anthropic.key'),
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])->post('https://api.anthropic.com/v1/messages', [
                'model' => 'claude-3-5-sonnet-20240620',
                'max_tokens' => 4000,
                'system' => 'You are an expert developer tool. The user will give you a raw terminal output or code snippet. Your job is to convert it into a beautiful, structured Markdown document. Use h2 headings, bullet points, colorful syntax-highlighted code blocks, and structured sections to make it extremely readable and easy to digest. DO NOT wrap the entire response in a markdown code block, just output the markdown directly.',
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => "Please convert this terminal output/snippet into a beautiful markdown document:\n\n" . $rawContent
                    ]
                ]
            ]);

            if ($response->successful()) {
                $formattedContent = $response->json('content.0.text') ?? $rawContent;
                
                // If Anthropic wraps the entire response in a markdown block, strip it
                $formattedContent = preg_replace('/^```[a-zA-Z]*\s*\n/i', "", $formattedContent);
                $formattedContent = preg_replace('/\n```\s*$/i', "", $formattedContent);
                $formattedContent = trim($formattedContent);
            } else {
                \Illuminate\Support\Facades\Log::error('Anthropic API error in Terminal Converter', ['response' => $response->body()]);
                $formattedContent = "```text\n" . $rawContent . "\n```";
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Exception in Terminal Converter', ['error' => $e->getMessage()]);
            $formattedContent = "```text\n" . $rawContent . "\n```";
        }

        $snippet = auth()->user()->terminalSnippets()->create([
            'title' => $title,
            'content' => $formattedContent,
        ]);

        return redirect()->route('terminal-converter.show', $snippet->slug)
            ->with('success', 'Snippet saved successfully.');
    }

    public function show(TerminalSnippet $terminalSnippet)
    {
        // Check if the snippet belongs to the user, or maybe it's public.
        // If we want it to be private to the user:
        if ($terminalSnippet->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('TerminalSnippets/Show', [
            'snippet' => $terminalSnippet
        ]);
    }

    public function destroy(TerminalSnippet $terminalSnippet)
    {
        if ($terminalSnippet->user_id !== auth()->id()) {
            abort(403);
        }

        $terminalSnippet->delete();

        return redirect()->route('terminal-converter.index')
            ->with('success', 'Snippet deleted successfully.');
    }
}
