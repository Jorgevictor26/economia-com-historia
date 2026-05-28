<?php

namespace App\DTOs\User;

readonly class AssignRoleDTO
{
    public function __construct(
        public int $userId,
        public int $roleId,
        public ?int $assignedBy = null,
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            userId: (int) $data['user_id'],
            roleId: (int) $data['role_id'],
            assignedBy: isset($data['assigned_by']) ? (int) $data['assigned_by'] : null,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'user_id' => $this->userId,
            'role_id' => $this->roleId,
            'assigned_by' => $this->assignedBy,
        ], fn (mixed $value): bool => $value !== null);
    }
}
