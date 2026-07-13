<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'dynamicTools' => config('karangtools'),
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

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

Route::get('/t/{slug}', function ($slug) {
    $tools = config('karangtools');
    if (!isset($tools[$slug])) abort(404);
    return Inertia::render('DynamicTool', [
        'tool' => $tools[$slug],
        'slug' => $slug
    ]);
})->name('dynamic-tool');

require __DIR__.'/auth.php';
