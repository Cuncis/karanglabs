<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'anthropic' => [
        'key' => env('ANTHROPIC_API_KEY'),

        // A cheaper/faster model for small, high-volume calls (like turning a
        // segment into OpenStreetMap search tags). Defaults to the same model
        // as everything else until a real fast-model id and its pricing below
        // are set, so this stays safe to use out of the box.
        'fast_model' => env('ANTHROPIC_FAST_MODEL', 'claude-sonnet-4-6'),

        // Price per token in USD, by model, for cost_usd calculation on logged AI calls.
        // See https://docs.anthropic.com/en/docs/about-claude/pricing for current rates.
        'pricing' => [
            'claude-sonnet-4-6' => [
                'input_per_token' => 3 / 1_000_000,
                'output_per_token' => 15 / 1_000_000,
            ],
        ],
    ],

    // Outbound fetches the Lead Finder tool makes against a user-supplied website.
    'fetch' => [
        'user_agent' => env('FETCH_USER_AGENT', 'KarangLabsLeadFinder/1.0 (+https://karanglabs.cloud)'),
    ],

    'telegram' => [
        'bot_token' => env('TELEGRAM_BOT_TOKEN'),
        'chat_id' => env('TELEGRAM_CHAT_ID'),
    ],

    'mayar' => [
        'api_key' => env('MAYAR_API_KEY'),
        'webhook_token' => env('MAYAR_WEBHOOK_TOKEN'),
        'is_production' => env('MAYAR_IS_PRODUCTION', false),
    ],

];
