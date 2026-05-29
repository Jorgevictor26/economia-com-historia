<?php

namespace App\DTOs\User;

readonly class CreateUserDTO
{
    public function __construct(
        public string $name,
        public string $email,
        public string $password,
        public ?string $photo = null,
        public ?string $bio = null,
        public ?string $status = null,
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            email: $data['email'],
            password: $data['password'],
            photo: $data['photo'] ?? null,
            bio: $data['bio'] ?? null,
            status: $data['status'] ?? null,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'name' => $this->name,
            'email' => $this->email,
            'password' => $this->password,
            'photo' => $this->photo,
            'bio' => $this->bio,
            'status' => $this->status,
        ], fn (mixed $value): bool => $value !== null);
    }
}
