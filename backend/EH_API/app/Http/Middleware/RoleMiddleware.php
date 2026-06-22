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

        $allowedRoles = collect($roles)
            ->map(fn (string $role): string => $this->normalizeRole($role));

        $hasAllowedRole = $user->roles
            ->pluck('name')
            ->map(fn (string $role): string => $this->normalizeRole($role))
            ->intersect($allowedRoles)
            ->isNotEmpty();

        if (! $hasAllowedRole) {
            return response()->json([
                'message' => 'Only Admin and SuperAdmin users can access this resource',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }

    private function normalizeRole(string $role): string
    {
        return strtolower(str_replace(['_', ' ', '-'], '', $role));
    }
}
