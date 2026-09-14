<?php

namespace Tests\Feature;

use App\Models\ToolHistory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class DynamicToolTest extends TestCase
{
    use RefreshDatabase;

    private function fakeAnthropicResponse(array $outputs): void
    {
        Http::fake([
            'api.anthropic.com/*' => Http::response([
                'content' => [
                    ['text' => json_encode($outputs)],
                ],
            ]),
        ]);
    }

    public function test_sql_to_eloquent_tool_was_removed(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get(route('dynamic-tool', ['slug' => 'sql-to-eloquent']))
            ->assertNotFound();
    }

    public function test_text_simplifier_page_renders_with_its_radio_input(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get(route('dynamic-tool', ['slug' => 'text-simplifier']))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('DynamicTool')
                ->where('slug', 'text-simplifier')
                ->where('tool.title', 'Text Simplifier')
                ->where('tool.inputs.1.type', 'radio')
                ->where('tool.inputs.1.options', ['Keep the Same Length', 'A Bit Shorter', 'Much Shorter'])
            );
    }

    public function test_text_simplifier_generation_saves_the_chosen_shorten_level_to_history(): void
    {
        $user = User::factory()->create();
        $outputs = [
            'simplified' => 'This is easy to read now.',
            'changes' => '- Shortened it a lot\n- Simpler words',
        ];
        $this->fakeAnthropicResponse($outputs);

        $this->actingAs($user)->postJson('/api/tools/text-simplifier/generate', [
            'text' => 'Pursuant to the aforementioned circumstances, we shall proceed accordingly.',
            'shorten_level' => 'Much Shorter',
        ])->assertOk()->assertJson($outputs);

        $this->assertDatabaseHas('tool_histories', [
            'user_id' => $user->id,
            'tool_slug' => 'text-simplifier',
        ]);

        $history = ToolHistory::where('user_id', $user->id)->where('tool_slug', 'text-simplifier')->first();
        $this->assertSame('Much Shorter', $history->inputs['shorten_level']);
        $this->assertSame('This is easy to read now.', $history->outputs['simplified']);
    }
}
