<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): mixed
    {
        $user = $request->user()?->loadMissing('roles');

        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], Response::HTTP_UNAUTHORIZED);
        }

        if (! $user->hasAnyRoleName($roles)) {
            return response()->json([
                'message' => 'You do not have permission to access this resource',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
