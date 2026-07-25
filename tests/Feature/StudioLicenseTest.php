<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class StudioLicenseTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_reseller_can_view_the_license_page(): void
    {
        config(['studio.reseller.download_url' => 'https://files.example.com/whitelabel.zip']);
        $user = User::factory()->reseller()->create();

        $this->actingAs($user)
            ->get(route('studio.license'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Studio/License')
                ->where('licenseKey', $user->license_key)
                ->where('hasDownload', true));
    }

    public function test_the_dashboard_download_redirects_to_a_signed_license_link(): void
    {
        config(['studio.reseller.download_url' => 'https://files.example.com/whitelabel.zip']);
        $user = User::factory()->reseller()->create();

        $response = $this->actingAs($user)->get(route('studio.license.download'));

        $response->assertRedirect();
        $target = $response->headers->get('Location');
        $this->assertStringContainsString('/reseller/download', $target);
        $this->assertStringContainsString('signature=', $target);
        $this->assertStringContainsString(rawurlencode($user->license_key), $target);
    }

    public function test_a_valid_signed_link_serves_the_download(): void
    {
        config(['studio.reseller.download_url' => 'https://files.example.com/whitelabel.zip']);
        $user = User::factory()->reseller()->create();

        $url = URL::temporarySignedRoute('reseller.download', now()->addHour(), ['license' => $user->license_key]);

        $this->get($url)->assertRedirect('https://files.example.com/whitelabel.zip');
    }

    public function test_an_unsigned_download_link_is_rejected(): void
    {
        $user = User::factory()->reseller()->create();

        $this->get(route('reseller.download', ['license' => $user->license_key]))
            ->assertStatus(403);
    }

    public function test_a_signed_link_with_an_invalid_license_is_rejected(): void
    {
        config(['studio.reseller.download_url' => 'https://files.example.com/whitelabel.zip']);

        $url = URL::temporarySignedRoute('reseller.download', now()->addHour(), ['license' => 'KLR-FAKE-FAKE-FAKE']);

        $this->get($url)->assertStatus(403);
    }

    public function test_a_non_reseller_member_cannot_view_the_license_page(): void
    {
        $user = User::factory()->withStudioAccess()->create();

        $this->actingAs($user)
            ->get(route('studio.license'))
            ->assertForbidden();
    }

    public function test_a_user_without_studio_access_is_redirected_to_locked(): void
    {
        $this->actingAs(User::factory()->create())
            ->get(route('studio.license'))
            ->assertRedirect(route('studio.locked'));
    }
}
