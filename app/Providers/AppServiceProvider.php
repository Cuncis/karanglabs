<?php

namespace App\Providers;

use App\Services\LeadFinder\CompanyDataProvider;
use App\Services\LeadFinder\OverpassCompanyProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Swap this binding for a paid source later without touching the job
        // or controller that type-hint CompanyDataProvider.
        $this->app->bind(CompanyDataProvider::class, OverpassCompanyProvider::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // One random-brief generation per user every 2 minutes, across all
        // Studio engines, to keep the Claude API bill predictable on the demo.
        RateLimiter::for('studio-random-brief', function (Request $request) {
            return Limit::perMinutes(2, 1)->by($request->user()->id);
        });
    }
}
