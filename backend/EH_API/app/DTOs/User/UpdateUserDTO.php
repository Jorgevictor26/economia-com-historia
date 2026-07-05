<?php

namespace App\DTOs\User;

use Illuminate\Support\Facades\Hash;

readonly class UpdateUserDTO
{
    public function __construct(
        public ?string $name = null,
        public ?string $email = null,
        public ?string $password = null,
        public ?string $photo = null,
        public ?string $bio = null,
        public ?string $status = null,
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'] ?? null,
            email: $data['email'] ?? null,
            password: $data['password'] ?? null,
            photo: $data['photo'] ?? null,
            bio: $data['bio'] ?? null,
            status: $data['status'] ?? null,
        );
    }

    public function toArray(): array
    {
        $result = [];

        if ($this->name !== null) {
            $result['name'] = $this->name;
        }

        if ($this->email !== null) {
            $result['email'] = $this->email;
        }

        if ($this->password !== null) {
            $result['password'] = Hash::make($this->password);
        }

        if ($this->photo !== null) {
            $result['photo'] = $this->photo;
        }

        if ($this->bio !== null) {
            $result['bio'] = $this->bio;
        }

        if ($this->status !== null) {
            $result['status'] = $this->status;
        }

        return $result;
    }
}
