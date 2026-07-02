<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\GoogleLoginRequest;
use App\Services\AuthService;
use App\Services\GoogleAuthService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class GoogleLoginController extends Controller
{
    use ApiResponseTrait;

    public function __invoke(
        GoogleLoginRequest $request,
        GoogleAuthService $googleAuthService,
        AuthService $authService
    ): JsonResponse {
        $user = $googleAuthService->authenticate($request->validated('id_token'));

        return $this->successResponse(
            $authService->issueToken($user),
            'Login com Google feito com sucesso.'
        );
    }
}
