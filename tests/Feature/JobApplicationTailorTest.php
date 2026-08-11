<?php

namespace Tests\Feature;

use App\Models\ToolHistory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class JobApplicationTailorTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_tool_is_registered_with_the_expected_shape(): void
    {
        $tool = config('karangtools.job-application-tailor');

        $this->assertNotNull($tool);
        $this->assertSame('Job Application Tailor', $tool['title']);
        // Background must sit above the job posting in the form.
        $this->assertSame(['background', 'job_context'], array_column($tool['inputs'], 'name'));
        $this->assertSame(
            ['fit_analysis', 'resume_bullets', 'cover_letter', 'interview_prep'],
            array_column($tool['outputs'], 'key'),
        );
    }

    public function test_an_authenticated_user_can_view_the_tool_page(): void
    {
        $this->actingAs(User::factory()->create())
            ->get(route('dynamic-tool', ['slug' => 'job-application-tailor']))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('DynamicTool')
                ->where('slug', 'job-application-tailor')
                ->where('tool.title', 'Job Application Tailor'));
    }

    public function test_it_generates_tailored_output_from_background_and_job_posting(): void
    {
        $payload = [
            'fit_analysis' => '**Fit score: 82/100.** Strong match.',
            'resume_bullets' => '- Built X that did Y.',
            'cover_letter' => 'Dear hiring team, ...',
            'interview_prep' => '**Tell me about X?** Draw on your Y experience.',
        ];

        Http::fake([
            'api.anthropic.com/*' => Http::response([
                'content' => [['text' => json_encode($payload)]],
            ], 200),
        ]);

        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/tools/job-application-tailor/generate', [
                'background' => 'Senior Laravel developer, 6 years, led payments platform.',
                'job_context' => 'We are hiring a Backend Engineer. Requirements: PHP, Laravel, queues.',
            ])
            ->assertOk()
            ->assertJson($payload);

        $this->assertDatabaseHas('tool_histories', [
            'user_id' => $user->id,
            'tool_slug' => 'job-application-tailor',
        ]);

        $this->assertSame(1, ToolHistory::count());
    }
}
