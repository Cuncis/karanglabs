<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\WhitelabelPackage;
use Symfony\Component\HttpFoundation\Response;

class WhitelabelController extends Controller
{
    /**
     * Download the whitelabel package directly from the admin area (any admin,
     * regardless of Studio access).
     */
    public function __invoke(): Response
    {
        abort_unless(WhitelabelPackage::configured(), 404, 'Paket whitelabel belum tersedia.');

        return WhitelabelPackage::response();
    }
}
