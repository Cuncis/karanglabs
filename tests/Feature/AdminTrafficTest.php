<?php

namespace Tests\Feature;

use App\Models\PageVisit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class AdminTrafficTest extends TestCase
{
    use RefreshDatabase;

    private const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

    protected function setUp(): void
    {
        parent::setUp();

        config(['studio.admin_emails' => ['admin@karanglabs.test']]);
    }

    private function admin(): User
    {
        return User::factory()->create(['email' => 'admin@karanglabs.test']);
    }

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get(route('admin.traffic'))->assertRedirect(route('login'));
    }

    public function test_a_non_admin_user_is_forbidden(): void
    {
        $this->actingAs(User::factory()->create(['email' => 'someone@else.com']))
            ->get(route('admin.traffic'))
            ->assertForbidden();
    }

    public function test_an_admin_can_view_the_traffic_stats(): void
    {
        PageVisit::factory()->count(3)->create(['visitor_id' => 'aaa', 'path' => '/']);
        PageVisit::factory()->count(2)->create(['visitor_id' => 'bbb', 'path' => '/terms']);

        $this->actingAs($this->admin())
            ->get(route('admin.traffic'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Traffic')
                ->where('stats.viewsTotal', 5)
                ->where('stats.visitorsTotal', 2)
                ->where('stats.viewsToday', 5)
                ->has('daily', 14)
                ->has('topPages', 2));
    }

    public function test_a_public_page_load_is_recorded(): void
    {
        $this->withHeader('User-Agent', self::BROWSER_UA)
            ->get('/')
            ->assertOk();

        $this->assertDatabaseHas('page_visits', ['path' => '/']);
    }

    public function test_admin_and_api_paths_are_not_recorded(): void
    {
        $this->actingAs($this->admin())
            ->withHeader('User-Agent', self::BROWSER_UA)
            ->get(route('admin.traffic'))
            ->assertOk();

        $this->assertDatabaseMissing('page_visits', ['path' => '/admin/traffic']);
    }

    public function test_bot_traffic_is_ignored(): void
    {
        $this->withHeader('User-Agent', 'Googlebot/2.1 (+http://www.google.com/bot.html)')
            ->get('/')
            ->assertOk();

        $this->assertDatabaseCount('page_visits', 0);
    }
}
