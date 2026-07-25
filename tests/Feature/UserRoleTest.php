<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRoleTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_users_default_to_the_member_role(): void
    {
        $user = User::factory()->create();

        $this->assertSame('member', $user->role);
        $this->assertFalse($user->isAdmin());
        $this->assertFalse($user->isReseller());
        $this->assertSame('Member', $user->roleLabel());
    }

    public function test_the_role_command_promotes_a_reseller_with_access_and_license(): void
    {
        $user = User::factory()->create();

        $this->artisan('studio:role', ['email' => $user->email, 'role' => 'reseller'])->assertSuccessful();

        $user->refresh();
        $this->assertTrue($user->isReseller());
        $this->assertTrue($user->hasStudioAccess());
        $this->assertNotNull($user->license_key);
        $this->assertSame('Reseller', $user->roleLabel());
    }

    public function test_the_role_command_can_promote_to_admin(): void
    {
        $user = User::factory()->create();

        $this->artisan('studio:role', ['email' => $user->email, 'role' => 'admin'])->assertSuccessful();

        $this->assertTrue($user->fresh()->isAdmin());
    }

    public function test_the_role_command_rejects_an_unknown_role(): void
    {
        $user = User::factory()->create();

        $this->artisan('studio:role', ['email' => $user->email, 'role' => 'superuser'])->assertFailed();
    }

    public function test_admin_email_override_still_grants_admin(): void
    {
        config(['studio.admin_emails' => ['owner@karanglabs.test']]);
        $user = User::factory()->create(['email' => 'owner@karanglabs.test']);

        $this->assertTrue($user->isAdmin());
    }

    public function test_role_hierarchy(): void
    {
        $admin = User::factory()->admin()->create();
        $reseller = User::factory()->reseller()->create();
        $member = User::factory()->create();

        $this->assertTrue($admin->hasRoleLevel(User::ROLE_RESELLER));
        $this->assertTrue($reseller->hasRoleLevel(User::ROLE_MEMBER));
        $this->assertFalse($member->hasRoleLevel(User::ROLE_RESELLER));
    }
}
