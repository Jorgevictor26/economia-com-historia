<?php

namespace App\Http\Controllers;

use App\DTOs\User\UpdateUserDTO;
use App\Http\Requests\User\UpdateUserRequest;
use App\Services\UserService;

class UserController extends Controller
{
    public function __construct(private readonly UserService $users)
    {
    }

    public function me(UpdateUserRequest $request)
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
}
