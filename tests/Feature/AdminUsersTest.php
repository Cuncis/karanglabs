<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class AdminUsersTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_non_admin_cannot_view_users(): void
    {
        $this->actingAs(User::factory()->create())
            ->get(route('admin.users'))
            ->assertForbidden();
    }

    public function test_a_guest_is_redirected_to_login(): void
    {
        $this->get(route('admin.users'))->assertRedirect(route('login'));
    }

    public function test_an_admin_can_view_the_users_list(): void
    {
        User::factory()->count(3)->create();
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.users'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Users')
                ->where('stats.total', 4)
                ->where('stats.admin', 1)
                ->has('users', 4));
    }

    public function test_an_admin_can_promote_a_user_to_reseller(): void
    {
        $admin = User::factory()->admin()->create();
        $member = User::factory()->create();

        $this->actingAs($admin)
            ->patch(route('admin.users.role', $member), ['role' => 'reseller'])
            ->assertRedirect();

        $member->refresh();
        $this->assertTrue($member->isReseller());
        $this->assertTrue($member->hasStudioAccess());
        $this->assertNotNull($member->license_key);
    }

    public function test_an_admin_cannot_change_their_own_role(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->patch(route('admin.users.role', $admin), ['role' => 'member'])
            ->assertForbidden();
    }

    public function test_an_unknown_role_is_rejected(): void
    {
        $admin = User::factory()->admin()->create();
        $member = User::factory()->create();

        $this->actingAs($admin)
            ->patch(route('admin.users.role', $member), ['role' => 'superuser'])
            ->assertSessionHasErrors('role');
    }

    public function test_an_admin_can_download_the_whitelabel_package(): void
    {
        config(['studio.reseller.download_url' => 'https://files.example.com/whitelabel.zip']);
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.whitelabel.download'))
            ->assertRedirect('https://files.example.com/whitelabel.zip');
    }

    public function test_the_whitelabel_download_is_404_when_not_configured(): void
    {
        config(['studio.reseller.download_url' => '', 'studio.reseller.file' => '']);
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.whitelabel.download'))
            ->assertNotFound();
    }

    public function test_a_non_admin_cannot_download_the_whitelabel_package(): void
    {
        config(['studio.reseller.download_url' => 'https://files.example.com/whitelabel.zip']);

        $this->actingAs(User::factory()->create())
            ->get(route('admin.whitelabel.download'))
            ->assertForbidden();
    }
}
