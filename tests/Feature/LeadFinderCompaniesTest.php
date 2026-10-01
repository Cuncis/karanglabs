<?php

namespace Tests\Feature;

use App\Models\LeadFinderProject;
use App\Models\LeadFinderSegment;
use App\Models\Subscription;
use App\Models\User;
use App\Services\LeadFinder\OsmTagTranslator;
use App\Services\LeadFinder\OverpassQueryBuilder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class LeadFinderCompaniesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Http::preventStrayRequests();
    }

    private function subscribedUser(): User
    {
        $user = User::factory()->create();
        Subscription::factory()->active()->create(['user_id' => $user->id]);

        return $user;
    }

    private function segmentFor(User $user): LeadFinderSegment
    {
        $project = LeadFinderProject::create([
            'user_id' => $user->id,
            'source_url' => 'https://example-business.test',
            'status' => LeadFinderProject::STATUS_COMPLETED,
            'profile' => ['name' => 'Acme'],
        ]);

        return $project->segments()->create([
            'name' => 'dental clinics',
            'criteria' => [],
            'search_filters' => ['industry' => ['dental clinics'], 'keywords' => ['dentist']],
            'example_company_types' => ['dental clinics'],
            'is_enabled' => true,
            'status' => LeadFinderSegment::STATUS_ACTIVE,
        ]);
    }

    // --- Paste ---

    public function test_pasted_companies_are_imported_and_duplicate_domains_are_skipped(): void
    {
        $user = $this->subscribedUser();
        $segment = $this->segmentFor($user);

        $text = implode("\n", [
            'Bright Smile Dental | https://brightsmile.test | hello@brightsmile.test',
            'https://www.brightsmile.test', // same domain, different scheme/www, must be skipped
            'https://towncenter-dental.test',
        ]);

        $response = $this->actingAs($user)->postJson(
            route('lead-finder.companies.paste', [$segment->project, $segment]),
            ['text' => $text]
        )->assertOk();

        $response->assertJson(['imported' => 2, 'duplicates' => 1, 'errors' => []]);
        $this->assertDatabaseCount('lead_finder_companies', 2);
        $this->assertDatabaseHas('lead_finder_companies', [
            'lead_finder_segment_id' => $segment->id,
            'domain' => 'brightsmile.test',
            'name' => 'Bright Smile Dental',
            'email' => 'hello@brightsmile.test',
        ]);
        $this->assertSame(2, $segment->fresh()->companies_count);
    }

    public function test_an_invalid_pasted_line_is_reported_as_a_row_error_not_silently_dropped(): void
    {
        $user = $this->subscribedUser();
        $segment = $this->segmentFor($user);

        $text = "https://good-dental.test\nnot a url at all\n";

        $response = $this->actingAs($user)->postJson(
            route('lead-finder.companies.paste', [$segment->project, $segment]),
            ['text' => $text]
        )->assertOk();

        $response->assertJson(['imported' => 1, 'duplicates' => 0]);
        $this->assertCount(1, $response->json('errors'));
        $this->assertStringContainsString('not a url at all', $response->json('errors.0.message'));
    }

    // --- CSV ---

    public function test_csv_upload_imports_rows_and_reports_row_level_errors(): void
    {
        $user = $this->subscribedUser();
        $segment = $this->segmentFor($user);

        $csv = "name,site,contact_email\n"
            ."Smile Dental,https://smile-dental.test,owner@smile-dental.test\n"
            .",https://missing-name.test,\n" // missing required name
            ."No Site Co,,\n"; // missing required site

        $file = UploadedFile::fake()->createWithContent('companies.csv', $csv);

        $response = $this->actingAs($user)->postJson(
            route('lead-finder.companies.csv', [$segment->project, $segment]),
            ['file' => $file]
        )->assertOk();

        $response->assertJson(['imported' => 1, 'duplicates' => 0]);
        $this->assertCount(2, $response->json('errors'));
        $this->assertDatabaseHas('lead_finder_companies', [
            'domain' => 'smile-dental.test',
            'email' => 'owner@smile-dental.test',
        ]);
    }

    public function test_csv_missing_a_required_column_is_rejected_with_one_clear_error(): void
    {
        $user = $this->subscribedUser();
        $segment = $this->segmentFor($user);

        $csv = "name,description\nSmile Dental,Great clinic\n";
        $file = UploadedFile::fake()->createWithContent('companies.csv', $csv);

        $response = $this->actingAs($user)->postJson(
            route('lead-finder.companies.csv', [$segment->project, $segment]),
            ['file' => $file]
        )->assertOk();

        $response->assertJson(['imported' => 0]);
        $this->assertStringContainsString('site', $response->json('errors.0.message'));
    }

    public function test_an_oversized_csv_is_rejected_by_validation(): void
    {
        $user = $this->subscribedUser();
        $segment = $this->segmentFor($user);

        $file = UploadedFile::fake()->create('huge.csv', 5121); // just over the 5MB limit

        $this->actingAs($user)->postJson(
            route('lead-finder.companies.csv', [$segment->project, $segment]),
            ['file' => $file]
        )->assertStatus(422);
    }

    public function test_a_company_already_found_via_one_source_is_not_duplicated_by_another(): void
    {
        $user = $this->subscribedUser();
        $segment = $this->segmentFor($user);

        $this->actingAs($user)->postJson(
            route('lead-finder.companies.paste', [$segment->project, $segment]),
            ['text' => 'https://shared-dental.test']
        )->assertOk();

        $csv = "name,site\nShared Dental,https://shared-dental.test\n";
        $response = $this->actingAs($user)->postJson(
            route('lead-finder.companies.csv', [$segment->project, $segment]),
            ['file' => UploadedFile::fake()->createWithContent('companies.csv', $csv)]
        )->assertOk();

        $response->assertJson(['imported' => 0, 'duplicates' => 1]);
        $this->assertDatabaseCount('lead_finder_companies', 1);
    }

    // --- OSM tag whitelisting ---

    public function test_osm_tag_validation_rejects_disallowed_keys_and_unsafe_values(): void
    {
        $this->assertTrue(OsmTagTranslator::isValidPair('amenity', 'dentist'));
        $this->assertTrue(OsmTagTranslator::isValidPair('shop', '*'));

        $this->assertFalse(OsmTagTranslator::isValidPair('building', 'yes')); // key not on the whitelist
        $this->assertFalse(OsmTagTranslator::isValidPair('amenity', 'dentist"]; node["amenity"="bank')); // injection attempt
        $this->assertFalse(OsmTagTranslator::isValidPair('amenity', 'has spaces'));
        $this->assertFalse(OsmTagTranslator::isValidPair('amenity', '')); // empty
        $this->assertFalse(OsmTagTranslator::isValidPair(123, 'dentist')); // non-string key
    }

    public function test_the_overpass_query_builder_only_emits_whitelisted_pairs(): void
    {
        $bbox = ['south' => 30.1, 'north' => 30.5, 'west' => -97.9, 'east' => -97.5];

        $query = OverpassQueryBuilder::build([
            ['key' => 'amenity', 'value' => 'dentist'],
            ['key' => 'building', 'value' => 'yes'], // not whitelisted, must be silently excluded
        ], $bbox);

        $this->assertStringContainsString('node["amenity"="dentist"]["website"]', $query);
        $this->assertStringContainsString('way["amenity"="dentist"]["website"]', $query);
        $this->assertStringNotContainsString('building', $query);
        $this->assertStringContainsString('out:json', $query);
    }

    // --- Map search (full job flow) ---

    private function fakeNominatim(string $city, array $box): void
    {
        Http::fake([
            'nominatim.openstreetmap.org/*' => Http::response([
                ['boundingbox' => $box],
            ]),
        ]);
    }

    public function test_map_search_finds_and_imports_companies(): void
    {
        $user = $this->subscribedUser();
        $segment = $this->segmentFor($user);

        Http::fake([
            'nominatim.openstreetmap.org/*' => Http::response([
                ['boundingbox' => ['30.1', '30.3', '-97.9', '-97.6']],
            ]),
            'api.anthropic.com/*' => Http::response([
                'content' => [['text' => json_encode(['tags' => [['key' => 'amenity', 'value' => 'dentist']]])]],
            ]),
            'overpass-api.de/*' => Http::response(['elements' => [
                ['tags' => ['name' => 'Austin Dental', 'website' => 'austindental.test', 'addr:city' => 'Austin']],
            ]]),
        ]);

        $this->actingAs($user)->postJson(
            route('lead-finder.companies.map', [$segment->project, $segment]),
            ['city' => 'Austin, TX']
        )->assertOk();

        $this->assertDatabaseHas('lead_finder_companies', [
            'lead_finder_segment_id' => $segment->id,
            'name' => 'Austin Dental',
            'domain' => 'austindental.test',
            'source' => 'map',
        ]);
        $this->assertDatabaseHas('lead_finder_steps', [
            'lead_finder_segment_id' => $segment->id,
            'step' => 'find_companies_map',
            'status' => 'completed',
        ]);
        $this->assertSame(1, $segment->fresh()->companies_count);
    }

    public function test_map_search_refuses_an_area_larger_than_1point5_degrees(): void
    {
        $user = $this->subscribedUser();
        $segment = $this->segmentFor($user);

        // A whole-country-sized bounding box.
        $this->fakeNominatim('France', ['41.0', '51.5', '-5.5', '9.8']);

        $this->actingAs($user)->postJson(
            route('lead-finder.companies.map', [$segment->project, $segment]),
            ['city' => 'France']
        )->assertOk();

        $step = $segment->steps()->where('step', 'find_companies_map')->firstOrFail();
        $this->assertSame('failed', $step->status);
        $this->assertStringContainsString('too large', $step->failure_reason);
        Http::assertNotSent(fn ($request) => str_contains($request->url(), 'overpass'));
    }

    public function test_map_search_widens_the_search_when_the_specific_one_finds_nothing(): void
    {
        $user = $this->subscribedUser();
        $segment = $this->segmentFor($user);

        Http::fake([
            'nominatim.openstreetmap.org/*' => Http::response([
                ['boundingbox' => ['30.1', '30.3', '-97.9', '-97.6']],
            ]),
            'api.anthropic.com/*' => Http::response([
                'content' => [['text' => json_encode(['tags' => [['key' => 'amenity', 'value' => 'dentist']]])]],
            ]),
            'overpass-api.de/*' => Http::sequence()
                ->push(['elements' => []]) // specific search: nothing
                ->push(['elements' => [ // broadened search: one result
                    ['tags' => ['name' => 'Some Shop', 'website' => 'someshop.test']],
                ]]),
        ]);

        $this->actingAs($user)->postJson(
            route('lead-finder.companies.map', [$segment->project, $segment]),
            ['city' => 'Austin, TX']
        )->assertOk();

        $step = $segment->steps()->where('step', 'find_companies_map')->firstOrFail();
        $this->assertSame('completed', $step->status);
        $this->assertStringContainsString('broadened', $step->note);
        $this->assertDatabaseHas('lead_finder_companies', ['domain' => 'someshop.test']);
    }

    public function test_map_search_falls_back_to_a_second_mirror_when_the_first_is_busy(): void
    {
        $user = $this->subscribedUser();
        $segment = $this->segmentFor($user);

        Http::fake([
            'nominatim.openstreetmap.org/*' => Http::response([
                ['boundingbox' => ['30.1', '30.3', '-97.9', '-97.6']],
            ]),
            'api.anthropic.com/*' => Http::response([
                'content' => [['text' => json_encode(['tags' => [['key' => 'amenity', 'value' => 'dentist']]])]],
            ]),
            'overpass-api.de/*' => Http::response('busy', 429),
            'overpass.kumi.systems/*' => Http::response(['elements' => [
                ['tags' => ['name' => 'Mirror Dental', 'website' => 'mirrordental.test']],
            ]]),
        ]);

        $this->actingAs($user)->postJson(
            route('lead-finder.companies.map', [$segment->project, $segment]),
            ['city' => 'Austin, TX']
        )->assertOk();

        $this->assertDatabaseHas('lead_finder_companies', ['domain' => 'mirrordental.test']);
    }

    // --- Export & authorization ---

    public function test_companies_can_be_exported_as_csv(): void
    {
        $user = $this->subscribedUser();
        $segment = $this->segmentFor($user);
        $segment->companies()->create([
            'source' => 'paste', 'name' => 'Bright Smile', 'website' => 'https://brightsmile.test',
            'domain' => 'brightsmile.test', 'email' => 'hi@brightsmile.test',
        ]);

        $response = $this->actingAs($user)->get(route('lead-finder.companies.export', [$segment->project, $segment]));

        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString('Bright Smile', $response->streamedContent());
        $this->assertStringContainsString('brightsmile.test', $response->streamedContent());
    }

    public function test_a_user_cannot_see_another_users_segment_companies(): void
    {
        $owner = $this->subscribedUser();
        $segment = $this->segmentFor($owner);

        $stranger = $this->subscribedUser();
        $this->actingAs($stranger)->getJson(route('lead-finder.companies.index', [$segment->project, $segment]))
            ->assertStatus(404);
    }
}
