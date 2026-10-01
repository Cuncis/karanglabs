<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * The Lead Finder routes live outside /api/*, where this app's exception
 * handler (see shouldRenderJsonWhen in bootstrap/app.php) redirects instead
 * of returning JSON on a failed validation, even for a request that sent
 * Accept: application/json. $request->validate() relies on that automatic
 * JSON rendering, so it silently breaks here. Validating manually and
 * returning JSON ourselves sidesteps that without touching the app-wide
 * exception config other tools' /api/* routes still rely on.
 */
trait ValidatesJson
{
    /**
     * @param  array<string, mixed>  $rules
     * @return array<string, mixed>|JsonResponse
     */
    protected function validateJson(Request $request, array $rules): array|JsonResponse
    {
        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        return $validator->validated();
    }
}
