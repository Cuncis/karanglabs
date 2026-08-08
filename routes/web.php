<?php

use App\Http\Controllers\Admin\EngineRequestController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\TrafficController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\WhitelabelController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\DorkHunterController;
use App\Http\Controllers\GenerateChangelogController;
use App\Http\Controllers\GenerateDynamicToolController;
use App\Http\Controllers\GenerateJobSeekerController;
use App\Http\Controllers\GenerateMicroCopyController;
use App\Http\Controllers\GeneratePlanController;
use App\Http\Controllers\GenerateQuestionsController;
use App\Http\Controllers\GenerateSocializerController;
use App\Http\Controllers\GenerateStudioBriefController;
use App\Http\Controllers\GenerateWhispererController;
use App\Http\Controllers\MayarNotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ResellerDownloadController;
use App\Http\Controllers\ShortenHrMessageController;
use App\Http\Controllers\StudioController;
use App\Http\Controllers\TerminalSnippetController;
use App\Models\ToolHistory;
use App\Models\User;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Landing');
})->name('landing');

// Terms of Service & Refund Policy (public — required for payment gateway).
Route::get('/terms', function () {
    return Inertia::render('Terms');
})->name('terms');

// Public payment endpoints (Mayar).
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
Route::post('/checkout/finalize', [CheckoutController::class, 'finalize'])->name('checkout.finalize');
Route::get('/checkout/success', [CheckoutController::class, 'success'])->name('checkout.success');
Route::post('/mayar/notification', [MayarNotificationController::class, 'handle'])->name('mayar.notification');

// Whitelabel download — protected by a signed token + license-key validation.
Route::get('/reseller/download', ResellerDownloadController::class)
    ->middleware('signed')
    ->name('reseller.download');

Route::get('/ai-tools', function (Request $request) {
    // The internal tools directory is owner-only; everyone else goes to the Studio.
    if (! $request->user()->isAdmin()) {
        return redirect()->route('studio.index');
    }

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'dynamicTools' => config('karangtools'),
    ]);
})->middleware('auth')->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::get('/planner', function () {
        return Inertia::render('Planner');
    })->name('planner');

    Route::get('/bundler', function () {
        return Inertia::render('ContextBundler');
    })->name('bundler');

    Route::get('/micro-copy', function () {
        return Inertia::render('MicroCopy');
    })->name('micro-copy');

    Route::get('/whisperer', function () {
        return Inertia::render('Whisperer');
    })->name('whisperer');

    Route::get('/changelog', function () {
        return Inertia::render('ChangelogGenerator');
    })->name('changelog');

    Route::get('/socializer', function () {
        return Inertia::render('Socializer');
    })->name('socializer');

    Route::get('/jobseeker', function () {
        return Inertia::render('JobSeeker');
    })->name('jobseeker');

    Route::get('/html-snippet', function () {
        return Inertia::render('ElementorSnippet');
    })->name('html-snippet');

    Route::get('/t/{slug}', function ($slug) {
        $tools = config('karangtools');
        if (! isset($tools[$slug])) {
            abort(404);
        }

        $history = ToolHistory::where('user_id', auth()->id())
            ->where('tool_slug', $slug)
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('DynamicTool', [
            'tool' => $tools[$slug],
            'slug' => $slug,
            'history' => $history,
        ]);
    })->name('dynamic-tool');

    // Karanglabs Studio — the member product (gated by purchase).
    Route::get('/studio/locked', [StudioController::class, 'locked'])->name('studio.locked');

    Route::middleware('studio.access')->group(function () {
        Route::get('/studio', [StudioController::class, 'index'])->name('studio.index');
        Route::get('/studio/guides', [StudioController::class, 'guides'])->name('studio.guides');
        Route::get('/studio/addons', [StudioController::class, 'addons'])->name('studio.addons');
        Route::get('/studio/license', [StudioController::class, 'license'])->name('studio.license');
        Route::get('/studio/license/download', [StudioController::class, 'download'])->name('studio.license.download');
        Route::post('/studio/projects', [StudioController::class, 'store'])->name('studio.projects.store');
        Route::delete('/studio/projects/{project}', [StudioController::class, 'destroy'])->name('studio.projects.destroy');
        Route::post('/studio/engine-requests', [StudioController::class, 'storeEngineRequest'])->name('studio.engine-requests.store');
        Route::post('/studio/{engine}/random-brief', GenerateStudioBriefController::class)
            ->middleware('throttle:studio-random-brief')
            ->name('studio.random-brief');
        Route::get('/studio/{engine}', [StudioController::class, 'engine'])->name('studio.engine');
    });

    // Admin (owner only, gated by ADMIN_EMAILS).
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/traffic', [TrafficController::class, 'index'])->name('admin.traffic');
        Route::get('/orders', [OrderController::class, 'index'])->name('admin.orders');
        Route::post('/orders/{order}/resend', [OrderController::class, 'resend'])->name('admin.orders.resend');
        Route::get('/users', [UserController::class, 'index'])->name('admin.users');
        Route::patch('/users/{user}', [UserController::class, 'update'])->name('admin.users.update');
        Route::patch('/users/{user}/role', [UserController::class, 'updateRole'])->name('admin.users.role');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('admin.users.destroy');
        Route::get('/engine-requests', [EngineRequestController::class, 'index'])->name('admin.engine-requests');
        Route::patch('/engine-requests/{engineRequest}', [EngineRequestController::class, 'update'])->name('admin.engine-requests.update');
        Route::delete('/engine-requests/{engineRequest}', [EngineRequestController::class, 'destroy'])->name('admin.engine-requests.destroy');
        Route::get('/whitelabel/download', WhitelabelController::class)->name('admin.whitelabel.download');
    });

    Route::get('/dork-hunter', [DorkHunterController::class, 'index'])->name('dork-hunter.index');
    Route::post('/dork-hunter', [DorkHunterController::class, 'store'])->name('dork-hunter.store');
    Route::patch('/dork-hunter/{dork}', [DorkHunterController::class, 'update'])->name('dork-hunter.update');
    Route::delete('/dork-hunter/{dork}', [DorkHunterController::class, 'destroy'])->name('dork-hunter.destroy');
    Route::post('/dork-hunter/{dork}/run', [DorkHunterController::class, 'run'])->name('dork-hunter.run');

    Route::get('/terminal-converter', [TerminalSnippetController::class, 'index'])->name('terminal-converter.index');
    Route::post('/terminal-converter', [TerminalSnippetController::class, 'store'])->name('terminal-converter.store');
    Route::get('/terminal-converter/{terminalSnippet}', [TerminalSnippetController::class, 'show'])->name('terminal-converter.show');
    Route::delete('/terminal-converter/{terminalSnippet}', [TerminalSnippetController::class, 'destroy'])->name('terminal-converter.destroy');
});

Route::prefix('api')->middleware('auth')->group(function () {
    Route::post('/generate-questions', GenerateQuestionsController::class);
    Route::post('/generate-plan', GeneratePlanController::class);
    Route::post('/generate-micro-copy', GenerateMicroCopyController::class);
    Route::post('/generate-whisper', GenerateWhispererController::class);
    Route::post('/generate-changelog', GenerateChangelogController::class);
    Route::post('/generate-socializer', GenerateSocializerController::class);
    Route::post('/generate-job-seeker', GenerateJobSeekerController::class);
    Route::post('/shorten-hr-message', ShortenHrMessageController::class);

    Route::post('/save-job-profile', function (Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'background' => 'required|string|max:8000',
        ]);
        $user = $request->user();
        $user->name = $validated['name'];
        if ($user->email !== $validated['email']) {
            $exists = User::where('email', $validated['email'])->exists();
            if (! $exists) {
                $user->email = $validated['email'];
            } else {
                return response()->json(['error' => 'Email already in use.'], 422);
            }
        }
        $user->job_background = $validated['background'];
        $user->save();

        return response()->json(['message' => 'Profile saved successfully']);
    });

    Route::post('/tools/{slug}/generate', GenerateDynamicToolController::class);
});

require __DIR__.'/auth.php';
