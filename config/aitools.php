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

];
