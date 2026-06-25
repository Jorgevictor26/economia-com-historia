<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ActiveUserMiddleware
{
    public function handle(Request $request, Closure $next): mixed
    {
        if ($request->user()?->status !== 'active') {
            return response()->json([
                'message' => 'Your account is not active',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
