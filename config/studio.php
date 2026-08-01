<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Studio Engines
    |--------------------------------------------------------------------------
    |
    | Authoritative list of the website-generator engines. The rich field
    | schema and prompt templates live in the front-end module
    | resources/js/studioEngines.js — this list is what the server uses to
    | validate an incoming engine slug and to label saved projects.
    |
    */

    'engines' => [
        'landing-page' => 'Landing Page',
        'toko-online' => 'Toko Online / Katalog',
        'company-profile' => 'Company Profile',
        'portfolio' => 'Portfolio / CV Online',
        'undangan' => 'Undangan Digital',
        'link-in-bio' => 'Link-in-Bio',
        'menu-fb' => 'Menu F&B',
        'jasa' => 'Halaman Jasa',
    ],

    /*
    |--------------------------------------------------------------------------
    | Purchasable Plans
    |--------------------------------------------------------------------------
    |
    | Amounts are in whole Rupiah. A successful payment for any plan provisions
    | Studio access for the buyer's email.
    |
    */

    'plans' => [
        'early-access' => ['name' => 'Karanglabs Studio - Early Access', 'amount' => (int) env('PLAN_EARLY_ACCESS_AMOUNT', 149000)],
        'reseller' => ['name' => 'Karanglabs Studio - Lisensi Reseller', 'amount' => (int) env('PLAN_RESELLER_AMOUNT', 490000)],
    ],

    /*
    |--------------------------------------------------------------------------
    | Reseller / Whitelabel
    |--------------------------------------------------------------------------
    |
    | Download URL for the whitelabel package delivered to reseller-license
    | buyers. Leave empty to show a "coming soon" placeholder in the dashboard.
    |
    */

    'reseller' => [
        // A private file on the local disk (storage/app/...) streamed only through
        // a valid, license-checked signed link. Preferred — the file is never public.
        'file' => env('RESELLER_PACKAGE_PATH', ''),

        // Fallback: redirect to an external URL if no private file is set.
        'download_url' => env('RESELLER_DOWNLOAD_URL', ''),
    ],

    /*
    |--------------------------------------------------------------------------
    | Admin Emails
    |--------------------------------------------------------------------------
    |
    | Comma-separated list of emails allowed into the admin area (order list,
    | resend credentials). Set ADMIN_EMAILS in your .env.
    |
    */

    'admin_emails' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('ADMIN_EMAILS', ''))
    ))),

];
