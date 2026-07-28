<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class GenerateStudioBriefController extends Controller
{
    /** @var array<int, string> */
    private const CATEGORIES = [
        'kuliner rumahan / catering', 'kedai kopi & minuman kekinian', 'fashion & aksesoris',
        'kecantikan & skincare lokal', 'barbershop / salon pria', 'jasa renovasi & tukang',
        'bengkel & servis motor/mobil', 'klinik & layanan kesehatan', 'kursus & bimbingan belajar',
        'startup teknologi / SaaS', 'pertanian & agribisnis', 'event organizer & wedding',
        'fotografi & videografi', 'travel & open trip wisata', 'gym & personal trainer',
        'kerajinan tangan / handmade', 'ekspedisi & logistik', 'konsultan keuangan / investasi',
        'firma hukum & konsultan', 'agen properti & real estate', 'pet shop & pet grooming',
        'percetakan & merchandise custom', 'komunitas game & esports', 'studio musik & event hiburan',
        'laundry kiloan', 'coworking space', 'toko oleh-oleh khas daerah', 'peternakan & budidaya ikan',
        'jasa cleaning service', 'les privat musik/bahasa',
    ];

    /** @var array<int, string> */
    private const CITIES = [
        'Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang', 'Medan', 'Makassar',
        'Denpasar', 'Malang', 'Palembang', 'Balikpapan', 'Pontianak', 'Manado', 'Solo',
        'Bogor', 'Bekasi', 'Tangerang', 'Batam', 'Pekanbaru', 'Banjarmasin',
    ];

    /** @var array<int, string> */
    private const VIBES = [
        'modern minimalis', 'tradisional autentik', 'playful & colorful', 'elegan premium',
        'ramah keluarga', 'edgy & bold', 'earthy natural', 'kekinian anak muda',
        'profesional korporat', 'homey & cozy', 'industrial', 'girly & pastel',
    ];

    public function __invoke(Request $request, string $engine)
    {
        abort_unless(array_key_exists($engine, config('studio.engines')), 404);

        $validated = $request->validate([
            'fields' => ['required', 'array', 'min:1', 'max:30'],
            'fields.*.name' => ['required', 'string', 'max:60'],
            'fields.*.type' => ['required', 'string', 'max:30'],
            'fields.*.label' => ['nullable', 'string', 'max:120'],
            'fields.*.hint' => ['nullable', 'string', 'max:300'],
            'fields.*.placeholder' => ['nullable', 'string', 'max:300'],
            'fields.*.options' => ['nullable', 'array', 'max:20'],
        ]);

        $engineLabel = config('studio.engines')[$engine];
        $schema = json_encode($validated['fields'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        $category = Arr::random(self::CATEGORIES);
        $city = Arr::random(self::CITIES);
        $vibe = Arr::random(self::VIBES);

        $userPrompt = "Engine: {$engineLabel}\n\nSkema field (JSON):\n{$schema}\n\n"
            ."Batasan acak yang WAJIB dipakai untuk brief kali ini (jangan diganti dengan ide lain):\n"
            ."- Kategori bisnis/topik: {$category}\n"
            ."- Kota/daerah asal: {$city}\n"
            ."- Vibe/gaya brand: {$vibe}\n\n"
            .'Random seed: '.Str::random(8);

        $systemPrompt = <<<'EOT'
You are a creative Indonesian copywriter demoing a random-brief generator for a website builder tool. Given a JSON schema describing form fields, invent a completely random, realistic, creative brief to fill those fields, as if a real (but different every time) Indonesian business or person requested this website.

Return your response as a JSON object whose keys are EXACTLY the "name" values from the schema, and nothing else. For each field, follow its "type":
- "text" / "textarea": a short realistic value fitting the field's label/hint, in Indonesian.
- "tags": a single string with 3-5 short items separated by commas.
- "lines": a single string with multiple lines separated by \n, following the format described in the hint if present.
- "multitext": a single short value.
- "color": 1-2 color names or hex codes as a string.
- "choice" / "select": pick exactly one value from the field's "options" (use the option's "value", not its "label").
- "addons": always return an empty string.

CRITICAL RULES:
1. Strictly follow the "Batasan acak" (category, city, vibe) given in the user message for this brief. Invent the actual brand name, product names, and copy yourself, they must fit those constraints but be a completely new idea you have not used before.
2. Never reuse a brand name, business idea, or wording from a previous generation. Avoid generic/cliche Indonesian business-name patterns entirely (e.g. anything with "Nusantara", "Dapur ...", "Kedai ..." as a lazy default) unless the random category genuinely calls for it, and even then invent a distinctive, specific name, not a textbook example.
3. NEVER use the em dash symbol; use commas, hyphens (-), or separate sentences instead.
4. NEVER use raw emoji characters anywhere in the output.
5. Keep every value realistic, concise, and directly usable as-is (no placeholders like "[isi di sini]").

Return ONLY valid JSON. No markdown fences, no preamble, no explanation outside the JSON object.
EOT;

        try {
            $response = Http::withHeaders([
                'x-api-key' => config('services.anthropic.key'),
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
                'anthropic-beta' => 'max-tokens-3-5-sonnet-2024-07-15',
            ])->connectTimeout(15)->timeout(60)->retry(2, 3000, function ($exception) {
                return $exception instanceof ConnectionException;
            })->post('https://api.anthropic.com/v1/messages', [
                'model' => 'claude-sonnet-4-6',
                'max_tokens' => 2048,
                'temperature' => 1,
                'system' => $systemPrompt,
                'messages' => [
                    ['role' => 'user', 'content' => $userPrompt],
                ],
            ]);
        } catch (ConnectionException $e) {
            return response()->json([
                'error' => 'Could not connect to AI service. Please check your internet connection.',
            ], 503);
        }

        if ($response->failed()) {
            return response()->json(['error' => 'Failed to generate a random brief.', 'details' => $response->json()], 500);
        }

        $content = $response->json('content.0.text');

        $content = trim($content);
        if (str_starts_with($content, '```json')) {
            $content = substr($content, 7);
        } elseif (str_starts_with($content, '```')) {
            $content = substr($content, 3);
        }
        if (str_ends_with($content, '```')) {
            $content = substr($content, 0, -3);
        }
        $content = trim($content);

        $content = mb_convert_encoding($content, 'UTF-8', 'UTF-8');
        $content = preg_replace('/[\x00-\x1F\x7F]/', '', $content);

        $json = json_decode($content, true);

        if (! $json && json_last_error() !== JSON_ERROR_NONE) {
            $error_msg = json_last_error_msg();

            return response()->json(['error' => 'Invalid JSON from AI. ('.$error_msg.')', 'raw' => $content], 500);
        }

        return response()->json($json);
    }
}
