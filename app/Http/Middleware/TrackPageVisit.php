<?php

namespace App\Http\Middleware;

use App\Models\PageVisit;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class TrackPageVisit
{
    /**
     * Paths that should never count as a page visit (admin panel, APIs,
     * webhooks, health checks and asset requests).
     *
     * @var list<string>
     */
    private array $ignoredPaths = [
        'admin', 'admin/*',
        'api', 'api/*',
        'mayar/*', 'checkout', 'checkout/*',
        'reseller/*', 'up',
        'build/*', 'storage/*',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($this->shouldTrack($request, $response)) {
            $this->record($request);
        }

        return $response;
    }

    /**
     * Only log successful GET page loads made by real (non-bot) visitors.
     */
    private function shouldTrack(Request $request, Response $response): bool
    {
        if (! $request->isMethod('GET')) {
            return false;
        }

        // Skip Inertia partial reloads — they are not full page views.
        if ($request->headers->has('X-Inertia-Partial-Data')) {
            return false;
        }

        if ($response->getStatusCode() >= 300) {
            return false;
        }

        if ($request->is(...$this->ignoredPaths)) {
            return false;
        }

        return ! $this->isBot((string) $request->userAgent());
    }

    /**
     * Persist a single page view. Failures must never break the response.
     */
    private function record(Request $request): void
    {
        try {
            PageVisit::create([
                'visitor_id' => $this->visitorId($request),
                'path' => Str::limit('/'.ltrim($request->path(), '/'), 255, ''),
                'referrer' => $request->headers->get('referer')
                    ? Str::limit($request->headers->get('referer'), 255, '')
                    : null,
                'user_agent' => Str::limit((string) $request->userAgent(), 512, ''),
                'user_id' => $request->user()?->id,
                'visited_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Failed to record page visit: '.$e->getMessage());
        }
    }

    /**
     * A stable, privacy-preserving visitor fingerprint (no raw IP stored).
     */
    private function visitorId(Request $request): string
    {
        return hash('sha256', implode('|', [
            $request->ip(),
            $request->userAgent(),
            config('app.key'),
        ]));
    }

    private function isBot(string $userAgent): bool
    {
        if ($userAgent === '') {
            return true;
        }

        return (bool) preg_match(
            '/bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|headless|lighthouse|pingdom|uptimerobot|curl|wget|python-requests|axios|monitor/i',
            $userAgent,
        );
    }
}
