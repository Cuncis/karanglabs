<?php

namespace Tests\Feature;

use App\Mail\StudioAccessMail;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class AdminOrdersTest extends TestCase
{
    use RefreshDatabase;

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
        $this->get(route('admin.orders'))->assertRedirect(route('login'));
    }

    public function test_a_non_admin_user_is_forbidden(): void
    {
        $this->actingAs(User::factory()->create(['email' => 'someone@else.com']))
            ->get(route('admin.orders'))
            ->assertForbidden();
    }

    public function test_an_admin_can_view_the_orders_list(): void
    {
        Order::factory()->count(3)->create();
        Order::factory()->paid()->create(['amount' => 99000]);

        $this->actingAs($this->admin())
            ->get(route('admin.orders'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Orders')
                ->where('stats.total', 4)
                ->where('stats.paid', 1)
                ->where('stats.revenue', 99000)
                ->has('orders', 4));
    }

    public function test_an_admin_can_resend_credentials_for_a_paid_order(): void
    {
        Mail::fake();
        $order = Order::factory()->paid()->create(['email' => 'buyer@paid.com']);

        $this->actingAs($this->admin())
            ->post(route('admin.orders.resend', $order))
            ->assertRedirect();

        $user = User::where('email', 'buyer@paid.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->hasStudioAccess());

        Mail::assertSent(StudioAccessMail::class, fn (StudioAccessMail $m) => $m->hasTo('buyer@paid.com') && $m->password !== null);
    }

    public function test_resend_is_blocked_for_an_unpaid_order(): void
    {
        Mail::fake();
        $order = Order::factory()->create(['status' => 'pending']);

        $this->actingAs($this->admin())
            ->post(route('admin.orders.resend', $order))
            ->assertStatus(422);

        Mail::assertNothingSent();
    }
}
