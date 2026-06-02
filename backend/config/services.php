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

    'payfast' => [
        'merchant_id' => env('PAYFAST_MERCHANT_ID', '10000100'),
        'merchant_key' => env('PAYFAST_MERCHANT_KEY', '46f0cd694581a'),
        'passphrase' => env('PAYFAST_PASSPHRASE', ''),
        'sandbox' => env('PAYFAST_SANDBOX', true),
        'return_url' => env('PAYFAST_RETURN_URL', 'https://easyryde.co.za/payments/payfast/return'),
        'cancel_url' => env('PAYFAST_CANCEL_URL', 'https://easyryde.co.za/payments/payfast/cancel'),
        'notify_url' => env('PAYFAST_NOTIFY_URL', 'https://easyryde.co.za/api/v1/payments/payfast/webhook'),
    ],

    'ozow' => [
        'site_code' => env('OZOW_SITE_CODE', ''),
        'api_key' => env('OZOW_API_KEY', ''),
        'private_key' => env('OZOW_PRIVATE_KEY', ''),
        'sandbox' => env('OZOW_SANDBOX', true),
        'notify_url' => env('OZOW_NOTIFY_URL', 'https://easyryde.co.za/api/v1/payments/ozow/webhook'),
        'return_url' => env('OZOW_RETURN_URL', 'https://easyryde.co.za/payments/ozow/return'),
        'cancel_url' => env('OZOW_CANCEL_URL', 'https://easyryde.co.za/payments/ozow/cancel'),
    ],

];
