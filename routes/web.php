<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\GeneratePlanController;
use App\Http\Controllers\GenerateQuestionsController;
use App\Http\Controllers\GenerateMicroCopyController;
use App\Http\Controllers\GenerateWhispererController;
use App\Http\Controllers\GenerateChangelogController;
use App\Http\Controllers\GenerateDynamicToolController;
use App\Http\Controllers\GenerateSocializerController;
use App\Http\Controllers\GenerateJobSeekerController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'dynamicTools' => config('karangtools'),
    ]);
})->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

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

    Route::get('/t/{slug}', function ($slug) {
        $tools = config('karangtools');
        if (!isset($tools[$slug])) abort(404);
        
        $history = \App\Models\ToolHistory::where('user_id', auth()->id())
            ->where('tool_slug', $slug)
            ->latest()
            ->take(10)
            ->get();
            
        return Inertia::render('DynamicTool', [
            'tool' => $tools[$slug],
            'slug' => $slug,
            'history' => $history
        ]);
    })->name('dynamic-tool');

    Route::get('/terminal-converter', [\App\Http\Controllers\TerminalSnippetController::class, 'index'])->name('terminal-converter.index');
    Route::post('/terminal-converter', [\App\Http\Controllers\TerminalSnippetController::class, 'store'])->name('terminal-converter.store');
    Route::get('/terminal-converter/{terminalSnippet}', [\App\Http\Controllers\TerminalSnippetController::class, 'show'])->name('terminal-converter.show');
    Route::delete('/terminal-converter/{terminalSnippet}', [\App\Http\Controllers\TerminalSnippetController::class, 'destroy'])->name('terminal-converter.destroy');
});

Route::prefix('api')->middleware('auth')->group(function () {
    Route::post('/generate-questions', GenerateQuestionsController::class);
    Route::post('/generate-plan', GeneratePlanController::class);
    Route::post('/generate-micro-copy', GenerateMicroCopyController::class);
    Route::post('/generate-whisper', GenerateWhispererController::class);
    Route::post('/generate-changelog', GenerateChangelogController::class);
    Route::post('/generate-socializer', GenerateSocializerController::class);
    Route::post('/generate-job-seeker', GenerateJobSeekerController::class);
    
    Route::post('/save-job-profile', function (\Illuminate\Http\Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'background' => 'required|string|max:8000',
        ]);
        $user = $request->user();
        $user->name = $validated['name'];
        if ($user->email !== $validated['email']) {
            $exists = \App\Models\User::where('email', $validated['email'])->exists();
            if (!$exists) {
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
