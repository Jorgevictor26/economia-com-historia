<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Services\AuthService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class PasswordResetController extends Controller
{
    use ApiResponseTrait;

    public function forgot(ForgotPasswordRequest $request, AuthService $authService): JsonResponse
    {
        $authService->sendResetLink($request->toDTO());

        return $this->successResponse(
            null,
            'Se o email existir, enviaremos as instruções para recuperar a senha.'
        );
    }

    public function reset(ResetPasswordRequest $request, AuthService $authService): JsonResponse
    {
        $authService->resetPassword($request->toDTO());

        return $this->successResponse(
            null,
            'Senha alterada com sucesso.'
        );
    }
}
