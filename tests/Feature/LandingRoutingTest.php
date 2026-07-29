<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class LandingRoutingTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_homepage_renders_the_landing_page(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('Landing'));
    }

    public function test_the_ai_tools_directory_lives_at_ai_tools_and_is_admin_only(): void
    {
        $this->assertSame('/ai-tools', parse_url(route('home'), PHP_URL_PATH));

        config(['studio.admin_emails' => ['owner@karanglabs.test']]);
        $admin = User::factory()->create(['email' => 'owner@karanglabs.test']);

        $this->actingAs($admin)
            ->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('Welcome'));
    }

    public function test_a_non_admin_is_redirected_from_the_directory_to_the_studio(): void
    {
        config(['studio.admin_emails' => []]);

        $this->actingAs(User::factory()->create())
            ->get(route('home'))
            ->assertRedirect(route('studio.index'));
    }

    public function test_a_guest_cannot_reach_the_directory(): void
    {
        $this->get(route('home'))->assertRedirect(route('login'));
    }

    public function test_login_redirects_an_authenticated_user_to_the_studio(): void
    {
        $user = User::factory()->create();

        $this->post(route('login'), [
            'email' => $user->email,
            'password' => 'password',
        ])->assertRedirect(route('studio.index'));
    }

    public function test_login_redirects_an_admin_to_the_studio_too(): void
    {
        $admin = User::factory()->admin()->create();

        $this->post(route('login'), [
            'email' => $admin->email,
            'password' => 'password',
        ])->assertRedirect(route('studio.index'));
    }
}
