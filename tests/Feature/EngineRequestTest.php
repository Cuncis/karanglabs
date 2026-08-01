<?php

namespace Tests\Feature;

use App\Models\EngineRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class EngineRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_member_with_studio_access_can_submit_an_engine_request(): void
    {
        $member = User::factory()->withStudioAccess()->create();

        $this->actingAs($member)
            ->post(route('studio.engine-requests.store'), [
                'message' => 'Tolong bikin engine buat katalog properti.',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('engine_requests', [
            'user_id' => $member->id,
            'message' => 'Tolong bikin engine buat katalog properti.',
            'status' => EngineRequest::STATUS_PENDING,
        ]);
    }

    public function test_an_engine_request_requires_a_message(): void
    {
        $member = User::factory()->withStudioAccess()->create();

        $this->actingAs($member)
            ->post(route('studio.engine-requests.store'), ['message' => ''])
            ->assertSessionHasErrors('message');

        $this->assertDatabaseCount('engine_requests', 0);
    }

    public function test_a_guest_cannot_submit_an_engine_request(): void
    {
        $this->post(route('studio.engine-requests.store'), ['message' => 'halo'])
            ->assertRedirect(route('login'));
    }

    public function test_a_non_admin_cannot_view_engine_requests(): void
    {
        $this->actingAs(User::factory()->create())
            ->get(route('admin.engine-requests'))
            ->assertForbidden();
    }

    public function test_an_admin_can_view_the_engine_requests_list(): void
    {
        EngineRequest::factory()->count(2)->create();
        EngineRequest::factory()->done()->create();

        $this->actingAs(User::factory()->admin()->create())
            ->get(route('admin.engine-requests'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/EngineRequests')
                ->where('stats.total', 3)
                ->where('stats.pending', 2)
                ->where('stats.done', 1)
                ->has('requests', 3));
    }

    public function test_an_admin_can_mark_a_request_as_done(): void
    {
        $request = EngineRequest::factory()->create();

        $this->actingAs(User::factory()->admin()->create())
            ->patch(route('admin.engine-requests.update', $request), [
                'status' => EngineRequest::STATUS_DONE,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('engine_requests', [
            'id' => $request->id,
            'status' => EngineRequest::STATUS_DONE,
        ]);
    }

    public function test_an_admin_can_delete_a_request(): void
    {
        $request = EngineRequest::factory()->create();

        $this->actingAs(User::factory()->admin()->create())
            ->delete(route('admin.engine-requests.destroy', $request))
            ->assertRedirect();

        $this->assertDatabaseMissing('engine_requests', ['id' => $request->id]);
    }
}
