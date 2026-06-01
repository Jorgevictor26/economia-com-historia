<?php

namespace App\Repositories;

use App\DTOs\User\CreateUserDTO;
use App\DTOs\User\UpdateUserDTO;
use App\Models\User;

class UserRepository
{
    public function create(CreateUserDTO $dto): User
    {
        return User::create($dto->toArray());
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function update(User $user, UpdateUserDTO $dto): User
    {
        $user->update($dto->toArray());

        return $user->fresh(['roles']);
    }
}
