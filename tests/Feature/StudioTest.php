<?php

namespace Tests\Feature;

use App\Models\StudioProject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class StudioTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get(route('studio.index'))->assertRedirect(route('login'));
    }

    public function test_a_user_without_access_is_sent_to_the_locked_screen(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('studio.index'))
            ->assertRedirect(route('studio.locked'));
    }

    public function test_an_admin_can_open_the_studio_dashboard_without_studio_access_flag(): void
    {
        $admin = User::factory()->admin()->create(['has_studio_access' => false]);

        $this->actingAs($admin)
            ->get(route('studio.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('Studio/Dashboard'));
    }

    public function test_the_locked_screen_renders_for_a_user_without_access(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('studio.locked'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('Studio/Locked'));
    }

    public function test_a_member_can_open_the_studio_dashboard(): void
    {
        $user = User::factory()->withStudioAccess()->create();

        $this->actingAs($user)
            ->get(route('studio.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('Studio/Dashboard')
                ->where('engineCount', 8));
    }

    public function test_a_member_can_open_a_valid_engine(): void
    {
        $user = User::factory()->withStudioAccess()->create();

        $this->actingAs($user)
            ->get(route('studio.engine', ['engine' => 'undangan']))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('Studio/Engine')
                ->where('engine', 'undangan'));
    }

    public function test_an_unknown_engine_slug_returns_404(): void
    {
        $user = User::factory()->withStudioAccess()->create();

        $this->actingAs($user)
            ->get(route('studio.engine', ['engine' => 'does-not-exist']))
            ->assertNotFound();
    }

    public function test_a_member_can_save_a_project(): void
    {
        $user = User::factory()->withStudioAccess()->create();

        $this->actingAs($user)
            ->post(route('studio.projects.store'), [
                'engine' => 'landing-page',
                'title' => 'Kopi Senja',
                'brief' => ['brand' => 'Kopi Senja', 'style' => 'Minimalis Modern'],
                'prompt' => 'Kamu adalah web designer senior...',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('studio_projects', [
            'user_id' => $user->id,
            'engine' => 'landing-page',
            'title' => 'Kopi Senja',
        ]);
    }

    public function test_saving_rejects_an_unknown_engine(): void
    {
        $user = User::factory()->withStudioAccess()->create();

        $this->actingAs($user)
            ->post(route('studio.projects.store'), [
                'engine' => 'nope',
                'title' => 'x',
                'brief' => ['a' => 'b'],
                'prompt' => 'x',
            ])
            ->assertSessionHasErrors('engine');
    }

    public function test_a_user_can_delete_their_own_project(): void
    {
        $user = User::factory()->withStudioAccess()->create();
        $project = StudioProject::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->delete(route('studio.projects.destroy', $project))
            ->assertRedirect();

        $this->assertDatabaseMissing('studio_projects', ['id' => $project->id]);
    }

    public function test_a_user_cannot_delete_another_users_project(): void
    {
        $owner = User::factory()->withStudioAccess()->create();
        $intruder = User::factory()->withStudioAccess()->create();
        $project = StudioProject::factory()->create(['user_id' => $owner->id]);

        $this->actingAs($intruder)
            ->delete(route('studio.projects.destroy', $project))
            ->assertForbidden();

        $this->assertDatabaseHas('studio_projects', ['id' => $project->id]);
    }

    public function test_the_grant_command_grants_and_revokes_access(): void
    {
        $user = User::factory()->create();

        $this->artisan('studio:grant', ['email' => $user->email])->assertSuccessful();
        $this->assertTrue($user->fresh()->hasStudioAccess());

        $this->artisan('studio:grant', ['email' => $user->email, '--revoke' => true])->assertSuccessful();
        $this->assertFalse($user->fresh()->hasStudioAccess());
    }

    public function test_the_grant_command_fails_for_an_unknown_email(): void
    {
        $this->artisan('studio:grant', ['email' => 'ghost@example.com'])->assertFailed();
    }
}
