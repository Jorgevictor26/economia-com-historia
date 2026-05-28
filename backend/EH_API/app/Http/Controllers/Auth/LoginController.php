<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\AuthService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class LoginController extends Controller
{
    use ApiResponseTrait;

    public function __invoke(LoginRequest $request, AuthService $authService): JsonResponse
    {
        return $this->successResponse(
            $authService->login($request->toDTO()),
            'Login feito com sucesso.'
        );
    }
}
