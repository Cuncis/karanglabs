<?php

return [

    /*
    |--------------------------------------------------------------------------
    | AI Tools Subdomain
    |--------------------------------------------------------------------------
    |
    | The host that serves the AI Tools product as its own site, separate from
    | the main Studio domain. Locally this is aitools.localhost; in production
    | it's aitools.karanglabs.cloud. Route::domain() matches the host only
    | (never the port), so a port suffix here would never match.
    |
    */

    'domain' => env('AITOOLS_DOMAIN', 'aitools.localhost'),

    /*
    |--------------------------------------------------------------------------
    | Subscription Plans
    |--------------------------------------------------------------------------
    |
    | Monthly recurring plans, billed through Mayar's Membership product
    | (separate from Studio's one-time invoice). `mayar_product_id` and
    | `mayar_tier_id` come from the Membership product/tiers you create in the
    | Mayar dashboard — there is no API to create them, only to enroll members
    | against tiers that already exist. Leave blank until that's set up.
    |
    */

    'plans' => [
        'tools' => [
            'name' => 'AI Tools',
            'amount' => (int) env('PLAN_AITOOLS_AMOUNT', 49000),
            'mayar_product_id' => env('MAYAR_AITOOLS_PRODUCT_ID', ''),
            'mayar_tier_id' => env('MAYAR_AITOOLS_TIER_ID', ''),
        ],
        'bundle' => [
            'name' => 'AI Tools + Studio',
            'amount' => (int) env('PLAN_AITOOLS_BUNDLE_AMOUNT', 69000),
            'mayar_product_id' => env('MAYAR_BUNDLE_PRODUCT_ID', ''),
            'mayar_tier_id' => env('MAYAR_BUNDLE_TIER_ID', ''),
        ],
    ],

];
