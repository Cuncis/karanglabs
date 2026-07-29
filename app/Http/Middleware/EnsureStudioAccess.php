<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStudioAccess
{
    /**
     * Handle an incoming request.
     *
     * Only buyers who have been granted Studio access may enter. Admins always
     * pass through. Everyone else is sent to the "locked" screen explaining how
     * to unlock the Studio.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || (! $user->isAdmin() && ! $user->hasStudioAccess())) {
            return redirect()->route('studio.locked');
        }

        return $next($request);
    }
}
