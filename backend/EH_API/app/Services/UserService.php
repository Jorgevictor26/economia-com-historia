<?php

namespace App\Services;

use App\DTOs\User\CreateUserDTO;
use App\Models\User;
use App\Repositories\UserRepository;

class UserService
{
    public function __construct(private readonly UserRepository $users)
    {
    }

    public function create(CreateUserDTO $dto): User
    {
        return $this->users->create($dto);
    }
}
