<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Services\AuthService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class RegisterController extends Controller
{
    use ApiResponseTrait;

    public function __invoke(RegisterRequest $request, AuthService $authService): JsonResponse
    {
        return $this->successResponse(
            $authService->register($request->toDTO()),
            'Conta criada com sucesso.',
            201
        );
    }
}
