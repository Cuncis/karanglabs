<?php

namespace Tests\Feature;

use App\Models\SalesNavigatorLead;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class AdminSalesNavigatorLeadsTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A minimal synthetic snippet that mirrors the real Sales Navigator
     * markup structure (data-x-search-result="LEAD", the data-anonymize
     * attributes, the profile-link anchor, the degree badge) without
     * embedding a full multi-thousand-line page capture. Two leads: one
     * with a linked company, one with a plain-text company (no link),
     * matching both cases seen in real exports.
     */
    private function sampleHtml(): string
    {
        return <<<'HTML'
<ol>
  <li class="artdeco-list__item">
    <div data-x-search-result="LEAD">
      <div class="artdeco-entity-lockup__content">
        <a data-lead-search-result="profile-link-st1" href="/sales/lead/ACwAA111,NAME_SEARCH,abcd?_ntb=xyz">
          <span data-anonymize="person-name">Jane Example</span>
        </a>
        <span class="artdeco-entity-lockup__degree">&nbsp;&middot;&nbsp;2nd</span>
        <div class="artdeco-entity-lockup__subtitle">
          <span data-anonymize="title">Founder</span>
          <span class="separator--middot"></span>
          <a data-anonymize="company-name" href="/sales/company/999?_ntb=xyz">Acme Co.</a>
        </div>
        <span data-anonymize="location">Austin, Texas, United States</span>
      </div>
      <div data-anonymize="person-blurb" data-truncated="" title="Full untruncated bio about Jane and her work in detail.">Full untruncated bio about Jane...</div>
    </div>
  </li>
  <li class="artdeco-list__item">
    <div data-x-search-result="LEAD">
      <div class="artdeco-entity-lockup__content">
        <a data-lead-search-result="profile-link-st2" href="/sales/lead/ACwAA222,NAME_SEARCH,efgh?_ntb=xyz">
          <span data-anonymize="person-name">Bob Sample</span>
        </a>
        <span class="artdeco-entity-lockup__degree">&nbsp;&middot;&nbsp;3rd</span>
        <div class="artdeco-entity-lockup__subtitle">
          <span data-anonymize="title">Owner</span>
          <span class="separator--middot"></span>
          Plain Text Co.
        </div>
        <span data-anonymize="location">Remote</span>
      </div>
    </div>
  </li>
</ol>
HTML;
    }

    public function test_a_non_admin_cannot_view_the_leads_list(): void
    {
        $this->actingAs(User::factory()->create())
            ->get(route('admin.sales-navigator-leads'))
            ->assertForbidden();
    }

    public function test_a_guest_is_redirected_to_login(): void
    {
        $this->get(route('admin.sales-navigator-leads'))->assertRedirect(route('login'));
    }

    public function test_an_admin_can_view_the_leads_list(): void
    {
        SalesNavigatorLead::factory()->count(2)->create();
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.sales-navigator-leads'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/SalesNavigatorLeads')
                ->has('leads.data', 2)
                ->where('leads.per_page', 25)
                ->where('filters.per_page', 25)
                ->where('perPageOptions', [10, 25, 50])
                ->where('stats.total', 2));
    }

    public function test_the_leads_list_paginates_with_a_default_of_25_per_page(): void
    {
        SalesNavigatorLead::factory()->count(30)->create();
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.sales-navigator-leads'))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('leads.data', 25)
                ->where('leads.total', 30)
                ->where('leads.last_page', 2));
    }

    public function test_the_per_page_option_can_be_customized_to_10_or_50(): void
    {
        SalesNavigatorLead::factory()->count(30)->create();
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.sales-navigator-leads', ['per_page' => 10]))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('leads.data', 10)
                ->where('filters.per_page', 10));
    }

    public function test_an_invalid_per_page_value_falls_back_to_the_default(): void
    {
        SalesNavigatorLead::factory()->count(5)->create();
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.sales-navigator-leads', ['per_page' => 999]))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('filters.per_page', 25));
    }

    public function test_the_status_filter_only_returns_matching_leads_but_stats_stay_global(): void
    {
        SalesNavigatorLead::factory()->count(2)->create(['status' => 'not_contacted']);
        SalesNavigatorLead::factory()->count(3)->create(['status' => 'replied']);
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('admin.sales-navigator-leads', ['status' => 'replied']))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('leads.data', 3)
                ->where('leads.total', 3)
                ->where('stats.total', 5)
                ->where('stats.replied', 3));
    }

    public function test_an_admin_can_import_leads_from_pasted_html(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('admin.sales-navigator-leads.import'), ['html' => $this->sampleHtml()])
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $this->assertDatabaseCount('sales_navigator_leads', 2);
        $this->assertDatabaseHas('sales_navigator_leads', [
            'name' => 'Jane Example',
            'title' => 'Founder',
            'company' => 'Acme Co.',
            'company_url' => 'https://www.linkedin.com/sales/company/999',
            'location' => 'Austin, Texas, United States',
            'profile_url' => 'https://www.linkedin.com/sales/lead/ACwAA111,NAME_SEARCH,abcd',
            'connection_degree' => '2nd',
            'about' => 'Full untruncated bio about Jane and her work in detail.',
            'status' => 'not_contacted',
            'added_by' => $admin->id,
        ]);
        $this->assertDatabaseHas('sales_navigator_leads', [
            'name' => 'Bob Sample',
            'company' => 'Plain Text Co.',
            'company_url' => null,
            'connection_degree' => '3rd',
        ]);
    }

    public function test_reimporting_the_same_html_does_not_create_duplicates(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post(route('admin.sales-navigator-leads.import'), ['html' => $this->sampleHtml()]);
        $this->actingAs($admin)->post(route('admin.sales-navigator-leads.import'), ['html' => $this->sampleHtml()])
            ->assertSessionHas('success', fn ($message) => str_contains($message, 'Added 0 new leads.') && str_contains($message, '2 already tracked'));

        $this->assertDatabaseCount('sales_navigator_leads', 2);
    }

    public function test_reimporting_the_same_html_reports_exactly_which_leads_were_duplicates(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post(route('admin.sales-navigator-leads.import'), ['html' => $this->sampleHtml()]);
        $this->actingAs($admin)->post(route('admin.sales-navigator-leads.import'), ['html' => $this->sampleHtml()])
            ->assertSessionHas('duplicateLeads', [
                ['name' => 'Jane Example', 'company' => 'Acme Co.'],
                ['name' => 'Bob Sample', 'company' => 'Plain Text Co.'],
            ]);
    }

    public function test_reimporting_partially_overlapping_html_only_imports_the_new_unique_ones(): void
    {
        $admin = User::factory()->admin()->create();
        $this->actingAs($admin)->post(route('admin.sales-navigator-leads.import'), ['html' => $this->sampleHtml()]);

        // A third, brand-new lead alongside the same two from before.
        $mixedHtml = str_replace(
            '</ol>',
            '<li class="artdeco-list__item"><div data-x-search-result="LEAD"><a data-lead-search-result="profile-link-st3" href="/sales/lead/ACwAA333,NAME_SEARCH,ijkl"><span data-anonymize="person-name">New Person</span></a></div></li></ol>',
            $this->sampleHtml()
        );

        $this->actingAs($admin)->post(route('admin.sales-navigator-leads.import'), ['html' => $mixedHtml])
            ->assertSessionHas('success', fn ($message) => str_contains($message, 'Added 1 new lead.'))
            ->assertSessionHas('duplicateLeads', [
                ['name' => 'Jane Example', 'company' => 'Acme Co.'],
                ['name' => 'Bob Sample', 'company' => 'Plain Text Co.'],
            ]);

        $this->assertDatabaseCount('sales_navigator_leads', 3);
        $this->assertDatabaseHas('sales_navigator_leads', ['name' => 'New Person']);
    }

    public function test_pasting_html_with_no_leads_shows_a_friendly_error(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('admin.sales-navigator-leads.import'), ['html' => '<p>nothing here</p>'])
            ->assertSessionHas('error');

        $this->assertDatabaseCount('sales_navigator_leads', 0);
    }

    public function test_a_non_admin_cannot_import_leads(): void
    {
        $this->actingAs(User::factory()->create())
            ->post(route('admin.sales-navigator-leads.import'), ['html' => $this->sampleHtml()])
            ->assertForbidden();

        $this->assertDatabaseCount('sales_navigator_leads', 0);
    }

    public function test_an_admin_can_update_a_leads_status_and_it_stamps_last_contacted_at(): void
    {
        $admin = User::factory()->admin()->create();
        $lead = SalesNavigatorLead::factory()->create(['status' => 'not_contacted', 'last_contacted_at' => null]);

        $this->actingAs($admin)
            ->patch(route('admin.sales-navigator-leads.update', $lead), ['status' => 'message_1_sent'])
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $lead->refresh();
        $this->assertSame('message_1_sent', $lead->status);
        $this->assertNotNull($lead->last_contacted_at);
    }

    public function test_an_unknown_status_is_rejected(): void
    {
        $admin = User::factory()->admin()->create();
        $lead = SalesNavigatorLead::factory()->create();

        $this->actingAs($admin)
            ->patch(route('admin.sales-navigator-leads.update', $lead), ['status' => 'ghosted'])
            ->assertSessionHasErrors('status');
    }

    public function test_a_non_admin_cannot_update_a_lead(): void
    {
        $lead = SalesNavigatorLead::factory()->create(['status' => 'not_contacted']);

        $this->actingAs(User::factory()->create())
            ->patch(route('admin.sales-navigator-leads.update', $lead), ['status' => 'replied'])
            ->assertForbidden();

        $this->assertSame('not_contacted', $lead->fresh()->status);
    }

    public function test_an_admin_can_delete_a_lead(): void
    {
        $admin = User::factory()->admin()->create();
        $lead = SalesNavigatorLead::factory()->create();

        $this->actingAs($admin)
            ->delete(route('admin.sales-navigator-leads.destroy', $lead))
            ->assertRedirect();

        $this->assertNull($lead->fresh());
    }

    public function test_a_non_admin_cannot_delete_a_lead(): void
    {
        $lead = SalesNavigatorLead::factory()->create();

        $this->actingAs(User::factory()->create())
            ->delete(route('admin.sales-navigator-leads.destroy', $lead))
            ->assertForbidden();

        $this->assertNotNull($lead->fresh());
    }
}
