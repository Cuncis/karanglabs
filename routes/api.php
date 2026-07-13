<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GeneratePlanController;
use App\Http\Controllers\GenerateQuestionsController;
use App\Http\Controllers\GenerateMicroCopyController;
use App\Http\Controllers\GenerateWhispererController;
use App\Http\Controllers\GenerateChangelogController;
use App\Http\Controllers\GenerateDynamicToolController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/generate-questions', GenerateQuestionsController::class);
Route::post('/generate-plan', GeneratePlanController::class);
Route::post('/generate-micro-copy', GenerateMicroCopyController::class);
Route::post('/generate-whisper', GenerateWhispererController::class);
Route::post('/generate-changelog', GenerateChangelogController::class);
Route::post('/tools/{slug}/generate', GenerateDynamicToolController::class);
