<?php

namespace App\Http\Controllers;

use App\DTOs\User\UpdateUserDTO;
use App\Http\Requests\User\UpdateUserRequest;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\UserService;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function __construct(private readonly UserService $users)
    {
    }

    public function me(Request $request)
    {
        return response()->json([
            'data' => $request->user()->load('roles'),
        ]);
    }

    public function updateProfile(UpdateUserRequest $request)
    {
        $user = $this->users->update(
            $request->user(),
            UpdateUserDTO::fromArray($request->validated())
        );

        return response()->json([
            'message' => 'Perfil atualizado com sucesso',
            'data' => $user,
        ]);
    }

    public function promoteToWriter(Request $request, User $user): JsonResponse
    {
        return $this->promote(
            fn () => $this->users->promoteToWriter($user, $request->user()),
            'Utilizador promovido a writer com sucesso'
        );
    }

    public function promoteToAdmin(Request $request, User $user): JsonResponse
    {
        return $this->promote(
            fn () => $this->users->promoteToAdmin($user, $request->user()),
            'Utilizador promovido a admin com sucesso'
        );
    }

    public function promoteToSuperAdmin(Request $request, User $user): JsonResponse
    {
        return $this->promote(
            fn () => $this->users->promoteToSuperAdmin($user, $request->user()),
            'SuperAdmin transferido com sucesso'
        );
    }

    private function promote(callable $callback, string $message): JsonResponse
    {
        try {
            $user = $callback();
        } catch (AuthorizationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 403);
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => 'Role promotion failed',
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'message' => $message,
            'data' => $user,
        ]);
    }
}
