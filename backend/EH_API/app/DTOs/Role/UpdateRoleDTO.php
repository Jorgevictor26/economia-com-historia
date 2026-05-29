<?php

namespace App\DTOs\Role;

readonly class UpdateRoleDTO
{
    public function __construct(public array $data = [])
    {
    }
}
