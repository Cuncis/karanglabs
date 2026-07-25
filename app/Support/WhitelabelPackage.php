<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class WhitelabelPackage
{
    /**
     * Whether a downloadable whitelabel package is configured (file or URL).
     */
    public static function configured(): bool
    {
        return (bool) (config('studio.reseller.file') || config('studio.reseller.download_url'));
    }

    /**
     * Serve the whitelabel package: stream the private file if set, otherwise
     * redirect to the external URL.
     */
    public static function response(): Response
    {
        $file = config('studio.reseller.file');
        if ($file && Storage::exists($file)) {
            return Storage::download($file, 'karanglabs-whitelabel.zip');
        }

        $url = config('studio.reseller.download_url');
        if ($url) {
            return redirect()->away($url);
        }

        abort(404, 'Paket whitelabel belum tersedia.');
    }
}
