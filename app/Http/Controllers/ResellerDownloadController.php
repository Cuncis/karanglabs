<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class ResellerDownloadController extends Controller
{
    /**
     * Serve the whitelabel package via a signed, license-validated link.
     *
     * The `signed` middleware guarantees the link was minted by us and hasn't
     * expired; here we additionally confirm the license still belongs to an
     * active reseller before serving the file.
     */
    public function __invoke(Request $request): Response
    {
        $user = User::where('role', User::ROLE_RESELLER)
            ->where('license_key', $request->query('license'))
            ->first();

        abort_unless($user, 403, 'Lisensi tidak valid.');

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
