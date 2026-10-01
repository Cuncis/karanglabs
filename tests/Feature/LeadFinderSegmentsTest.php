<?php

namespace Tests\Feature;

use App\Models\LeadFinderProject;
use App\Models\LeadFinderSegment;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class LeadFinderSegmentsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Http::preventStrayRequests();
    }

    private function subscribedUser(): User
    {
        $user = User::factory()->create();
        Subscription::factory()->active()->create(['user_id' => $user->id]);

        return $user;
    }

    private function completedProject(User $user): LeadFinderProject
    {
        return LeadFinderProject::create([
            'user_id' => $user->id,
            'source_url' => 'https://example-business.test',
            'status' => LeadFinderProject::STATUS_COMPLETED,
            'profile' => ['name' => 'Acme Budgeting', 'one_liner' => 'Budgeting software for freelancers.'],
        ]);
    }

    private function segmentPayload(string $name, int $fitScore = 70): array
    {
        return [
            'name' => $name,
            'pain' => "Typical {$name} pain point.",
            'offer_angle' => 'A free trial.',
            'criteria' => ['Has no online booking?', 'Has no pricing page?', 'Has an outdated design?'],
            'search_filters' => ['industry' => [$name], 'keywords' => [$name]],
            'example_company_types' => [$name],
            'fit_score' => $fitScore,
            'fit_reason' => 'Good fit reason.',
            'estimated_size' => '50-200 per city',
        ];
    }

    private function fakeSegments(array $segments): void
    {
        Http::fake([
            'api.anthropic.com/*' => Http::response([
                'content' => [['text' => json_encode(['segments' => $segments])]],
            ]),
        ]);
    }

    public function test_segments_cannot_be_generated_before_the_profile_is_completed(): void
    {
        $user = $this->subscribedUser();
        $project = LeadFinderProject::create([
            'user_id' => $user->id,
            'source_url' => 'https://example-business.test',
            'status' => LeadFinderProject::STATUS_RUNNING,
        ]);

        $this->actingAs($user)->postJson(route('lead-finder.segments.store', $project))
            ->assertStatus(422);

        $this->assertDatabaseCount('lead_finder_segments', 0);
    }

    public function test_four_to_six_segments_are_generated_and_saved(): void
    {
        $user = $this->subscribedUser();
        $project = $this->completedProject($user);
        $this->fakeSegments([
            $this->segmentPayload('dental clinics', 85),
            $this->segmentPayload('furniture shops', 70),
            $this->segmentPayload('law firms', 60),
            $this->segmentPayload('veterinary clinics', 55),
        ]);

        $this->actingAs($user)->postJson(route('lead-finder.segments.store', $project))->assertOk();

        $this->assertDatabaseCount('lead_finder_segments', 4);
        $this->assertDatabaseHas('lead_finder_segments', [
            'lead_finder_project_id' => $project->id,
            'name' => 'dental clinics',
            'fit_score' => 85,
            'status' => 'active',
            'is_enabled' => 1,
        ]);
        $segment = LeadFinderSegment::where('name', 'dental clinics')->firstOrFail();
        $this->assertCount(3, $segment->criteria);
        $this->assertSame(['dental clinics'], $segment->search_filters['industry']);

        $this->assertDatabaseHas('lead_finder_steps', [
            'lead_finder_project_id' => $project->id,
            'step' => 'segments',
            'status' => 'completed',
        ]);
    }

    public function test_an_invalid_segment_count_is_retried_once_then_fails(): void
    {
        $user = $this->subscribedUser();
        $project = $this->completedProject($user);

        Http::fake([
            'api.anthropic.com/*' => Http::sequence()
                ->push(['content' => [['text' => json_encode(['segments' => [$this->segmentPayload('too few')]])]]])
                ->push(['content' => [['text' => json_encode(['segments' => [$this->segmentPayload('still too few')]])]]]),
        ]);

        $this->actingAs($user)->postJson(route('lead-finder.segments.store', $project))->assertOk();

        $this->assertDatabaseCount('lead_finder_segments', 0);
        $this->assertDatabaseHas('lead_finder_steps', [
            'lead_finder_project_id' => $project->id,
            'step' => 'segments',
            'status' => 'failed',
        ]);
        $this->assertDatabaseCount('ai_call_logs', 2);
    }

    public function test_rerunning_reuses_matching_names_and_retires_dropped_segments_with_no_companies(): void
    {
        $user = $this->subscribedUser();
        $project = $this->completedProject($user);

        $firstRunResponse = ['content' => [['text' => json_encode(['segments' => [
            $this->segmentPayload('dental clinics', 80),
            $this->segmentPayload('furniture shops', 70),
            $this->segmentPayload('law firms', 60),
            $this->segmentPayload('veterinary clinics', 55),
        ]])]]];

        // Second run: keeps "dental clinics" (new fit score, same name) and
        // "furniture shops", drops "law firms" and "veterinary clinics", adds "gyms".
        $secondRunResponse = ['content' => [['text' => json_encode(['segments' => [
            $this->segmentPayload('dental clinics', 90),
            $this->segmentPayload('furniture shops', 72),
            $this->segmentPayload('gyms', 65),
            $this->segmentPayload('pet groomers', 50),
        ]])]]];

        // A single sequence spanning both runs: Http::fake() calls don't replace
        // previously registered stubs within a test, the first matching one wins,
        // so a second run's fake must be queued up front via one sequence.
        Http::fake([
            'api.anthropic.com/*' => Http::sequence()
                ->push($firstRunResponse)
                ->push($secondRunResponse),
        ]);

        $this->actingAs($user)->postJson(route('lead-finder.segments.store', $project))->assertOk();

        $originalDentalId = LeadFinderSegment::where('name', 'dental clinics')->value('id');
        $this->assertDatabaseCount('lead_finder_segments', 4);

        $this->actingAs($user)->postJson(route('lead-finder.segments.store', $project))->assertOk();

        // Reused name updates the existing row in place, not a duplicate.
        $this->assertDatabaseCount('lead_finder_segments', 6);
        $dental = LeadFinderSegment::find($originalDentalId);
        $this->assertSame(90, $dental->fit_score);
        $this->assertSame('active', $dental->status);

        $this->assertSame('active', LeadFinderSegment::where('name', 'furniture shops')->value('status'));
        $this->assertSame('active', LeadFinderSegment::where('name', 'gyms')->value('status'));
        $this->assertSame('active', LeadFinderSegment::where('name', 'pet groomers')->value('status'));

        // Dropped segments with zero companies are retired, not deleted or duplicated.
        $this->assertSame('retired', LeadFinderSegment::where('name', 'law firms')->value('status'));
        $this->assertSame('retired', LeadFinderSegment::where('name', 'veterinary clinics')->value('status'));

        $activeCount = LeadFinderSegment::where('lead_finder_project_id', $project->id)
            ->where('status', 'active')->count();
        $this->assertSame(4, $activeCount);
    }

    public function test_a_user_can_toggle_a_segment_on_and_off(): void
    {
        $user = $this->subscribedUser();
        $project = $this->completedProject($user);
        $this->fakeSegments([
            $this->segmentPayload('dental clinics'),
            $this->segmentPayload('furniture shops'),
            $this->segmentPayload('law firms'),
            $this->segmentPayload('veterinary clinics'),
        ]);
        $this->actingAs($user)->postJson(route('lead-finder.segments.store', $project))->assertOk();
        $segment = LeadFinderSegment::where('name', 'dental clinics')->firstOrFail();

        $this->actingAs($user)->patchJson(route('lead-finder.segments.update', [$project, $segment]), [
            'is_enabled' => false,
        ])->assertOk()->assertJson(['is_enabled' => false]);

        $this->assertDatabaseHas('lead_finder_segments', ['id' => $segment->id, 'is_enabled' => 0]);
    }

    public function test_an_invalid_toggle_value_returns_a_json_422_not_a_redirect(): void
    {
        // Same regression guard as LeadFinderProfileTest: this route is
        // outside /api/*, so a failed validate() silently redirects unless
        // the controller handles it manually.
        $user = $this->subscribedUser();
        $project = $this->completedProject($user);
        $this->fakeSegments([
            $this->segmentPayload('dental clinics'),
            $this->segmentPayload('furniture shops'),
            $this->segmentPayload('law firms'),
            $this->segmentPayload('veterinary clinics'),
        ]);
        $this->actingAs($user)->postJson(route('lead-finder.segments.store', $project))->assertOk();
        $segment = LeadFinderSegment::where('name', 'dental clinics')->firstOrFail();

        $this->actingAs($user)->patchJson(route('lead-finder.segments.update', [$project, $segment]), [
            'is_enabled' => 'not-a-boolean',
        ])->assertStatus(422)->assertJsonStructure(['error']);
    }

    public function test_a_user_cannot_toggle_another_users_segment(): void
    {
        $owner = $this->subscribedUser();
        $project = $this->completedProject($owner);
        $this->fakeSegments([
            $this->segmentPayload('dental clinics'),
            $this->segmentPayload('furniture shops'),
            $this->segmentPayload('law firms'),
            $this->segmentPayload('veterinary clinics'),
        ]);
        $this->actingAs($owner)->postJson(route('lead-finder.segments.store', $project))->assertOk();
        $segment = LeadFinderSegment::where('name', 'dental clinics')->firstOrFail();

        $stranger = $this->subscribedUser();
        $this->actingAs($stranger)->patchJson(route('lead-finder.segments.update', [$project, $segment]), [
            'is_enabled' => false,
        ])->assertStatus(404);
    }
}
