<?php

namespace Tests\Unit;

use App\Models\SalesNavigatorLead;
use PHPUnit\Framework\TestCase;

class SalesNavigatorLeadTest extends TestCase
{
    public function test_it_derives_the_regular_linkedin_profile_url_from_the_sales_navigator_lead_link(): void
    {
        $lead = new SalesNavigatorLead([
            'profile_url' => 'https://www.linkedin.com/sales/lead/ACwAA111,NAME_SEARCH,abcd',
        ]);

        $this->assertSame('https://www.linkedin.com/in/ACwAA111', $lead->linkedin_profile_url);
    }

    public function test_it_falls_back_to_the_original_url_when_the_format_is_unrecognized(): void
    {
        $lead = new SalesNavigatorLead([
            'profile_url' => 'https://www.linkedin.com/in/already-a-public-profile',
        ]);

        $this->assertSame('https://www.linkedin.com/in/already-a-public-profile', $lead->linkedin_profile_url);
    }

    public function test_it_returns_null_when_there_is_no_profile_url(): void
    {
        $lead = new SalesNavigatorLead;

        $this->assertNull($lead->linkedin_profile_url);
    }
}
