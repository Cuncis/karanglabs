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

    public function test_the_ai_tools_directory_lives_at_ai_tools(): void
    {
        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('Welcome'));

        $this->assertSame('/ai-tools', parse_url(route('home'), PHP_URL_PATH));
    }

    public function test_login_redirects_an_authenticated_user_to_the_tools_directory(): void
    {
        $user = User::factory()->create();

        $this->post(route('login'), [
            'email' => $user->email,
            'password' => 'password',
        ])->assertRedirect(route('home'));
    }
}
