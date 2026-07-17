<?php

namespace Tests\Feature;

use App\Jobs\RunDorkJob;
use App\Models\Dork;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class DorkHunterTest extends TestCase
{
    use RefreshDatabase;

    public function test_page_requires_authentication(): void
    {
        $this->get(route('dork-hunter.index'))->assertRedirect(route('login'));
    }

    public function test_page_is_displayed_for_authenticated_user(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('dork-hunter.index'))
            ->assertOk();
    }

    public function test_a_dork_can_be_created(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('dork-hunter.store'), [
                'label' => 'Admin panels',
                'query' => 'site:*.id inurl:admin',
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('dorks', [
            'label' => 'Admin panels',
            'query' => 'site:*.id inurl:admin',
            'is_active' => true,
        ]);
    }

    public function test_query_is_required_when_creating_a_dork(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('dork-hunter.store'), ['query' => ''])
            ->assertSessionHasErrors('query');
    }

    public function test_cannot_activate_more_than_five_dorks(): void
    {
        $user = User::factory()->create();
        Dork::factory()->count(5)->create(['is_active' => true]);

        $this->actingAs($user)
            ->post(route('dork-hunter.store'), [
                'query' => 'site:*.id inurl:login',
                'is_active' => true,
            ])
            ->assertSessionHasErrors('query');

        $this->assertDatabaseCount('dorks', 5);
    }

    public function test_an_inactive_dork_can_be_created_beyond_the_limit(): void
    {
        $user = User::factory()->create();
        Dork::factory()->count(5)->create(['is_active' => true]);

        $this->actingAs($user)
            ->post(route('dork-hunter.store'), [
                'query' => 'site:*.id inurl:login',
                'is_active' => false,
            ])
            ->assertSessionDoesntHaveErrors('query');

        $this->assertDatabaseCount('dorks', 6);
    }

    public function test_a_dork_can_be_updated(): void
    {
        $user = User::factory()->create();
        $dork = Dork::factory()->create(['query' => 'old']);

        $this->actingAs($user)
            ->patch(route('dork-hunter.update', $dork), [
                'query' => 'new',
                'is_active' => false,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('dorks', [
            'id' => $dork->id,
            'query' => 'new',
            'is_active' => false,
        ]);
    }

    public function test_a_dork_can_be_deleted(): void
    {
        $user = User::factory()->create();
        $dork = Dork::factory()->create();

        $this->actingAs($user)
            ->delete(route('dork-hunter.destroy', $dork))
            ->assertRedirect();

        $this->assertDatabaseMissing('dorks', ['id' => $dork->id]);
    }

    public function test_run_now_dispatches_a_job(): void
    {
        Queue::fake();
        $user = User::factory()->create();
        $dork = Dork::factory()->create();

        $this->actingAs($user)
            ->post(route('dork-hunter.run', $dork))
            ->assertRedirect();

        Queue::assertPushed(RunDorkJob::class, function (RunDorkJob $job) use ($dork): bool {
            return $job->dork->is($dork);
        });
    }
}
