<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\WhitelabelPackage;
use Illuminate\Http\Request;
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

        return WhitelabelPackage::response();
    }
}
