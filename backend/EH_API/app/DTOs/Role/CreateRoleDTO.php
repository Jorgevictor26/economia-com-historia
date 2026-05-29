<?php

namespace App\DTOs\Role;

readonly class CreateRoleDTO
{
    public function __construct(public array $data = [])
    {
    }
}
