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
        'early-access' => ['name' => 'Karanglabs Studio - Early Access', 'amount' => 99000],
        'reseller' => ['name' => 'Karanglabs Studio - Lisensi Reseller', 'amount' => 390000],
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
