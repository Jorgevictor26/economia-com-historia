<?php

namespace App\Services;

use App\DTOs\Auth\ForgotPasswordDTO;
use App\DTOs\Auth\LoginDTO;
use App\DTOs\Auth\RegisterDTO;
use App\DTOs\Auth\ResetPasswordDTO;
use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(
        private readonly UserRepository $users,
        private readonly UserService $userService,
    ) {
    }

    public function register(RegisterDTO $dto): array
    {
        $user = $this->userService->create($dto->toCreateUserDTO());

        return $this->authPayload($user);
    }

    public function login(LoginDTO $dto): array
    {
        $user = $this->users->findByEmail($dto->email);

        if (! $user || ! Hash::check($dto->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Credenciais inválidas.'],
            ]);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => ['Esta conta não está ativa.'],
            ]);
        }

        return $this->authPayload($user);
    }

    public function sendResetLink(ForgotPasswordDTO $dto): void
    {
        $status = Password::sendResetLink(['email' => $dto->email]);

        if ($status === Password::RESET_THROTTLED) {
            throw ValidationException::withMessages([
                'email' => ['Aguarde antes de pedir outro email de recuperação.'],
            ]);
        }
    }

    public function resetPassword(ResetPasswordDTO $dto): void
    {
        $status = Password::reset(
            $dto->toPasswordBrokerPayload(),
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                $user->tokens()->delete();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => ['Token inválido ou expirado.'],
            ]);
        }
    }

    private function authPayload(User $user): array
    {
        $user->loadMissing('roles');

        return [
            'user' => $user,
            'token' => $user->createToken('auth_token')->plainTextToken,
            'token_type' => 'Bearer',
        ];
    }
}
