<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAiToolsSubscription
{
    /**
     * Only subscribers (either tier) may use a token-metered AI tool. Admins
     * always pass through. Everyone else is bounced to the AI Tools landing
     * page to subscribe.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || (! $user->isAdmin() && ! $user->hasActiveAiToolsSubscription())) {
            return redirect()->route('aitools.landing')->with('error', 'Kamu butuh langganan AI Tools aktif untuk memakai tool ini.');
        }

        return $next($request);
    }
}
