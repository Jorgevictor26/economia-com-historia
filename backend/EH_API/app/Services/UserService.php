<?php

namespace App\Services;

use App\DTOs\User\CreateUserDTO;
use App\DTOs\User\UpdateUserDTO;
use App\Models\Role;
use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UserService
{
    private const ROLE_USER = 'user';
    private const ROLE_WRITER = 'writer';
    private const ROLE_ADMIN = 'admin';
    private const ROLE_SUPER_ADMIN = 'super-admin';

    private const MANAGED_ROLES = [
        self::ROLE_USER,
        self::ROLE_WRITER,
        self::ROLE_ADMIN,
        self::ROLE_SUPER_ADMIN,
        'student',
    ];

    public function __construct(private readonly UserRepository $users)
    {
    }

    public function create(CreateUserDTO $dto): User
    {
        return DB::transaction(function () use ($dto): User {
            $isFirstUser = ! User::query()->exists();
            $user = $this->users->create($dto);

            $this->setExclusiveRole(
                $user,
                $isFirstUser ? self::ROLE_SUPER_ADMIN : self::ROLE_USER
            );

            return $user->fresh(['roles']);
        });
    }

    public function update(User $user, UpdateUserDTO $dto): User
    {
        return $this->users->update($user, $dto);
    }

    public function promoteToWriter(User $target, User $actor): User
    {
        if (! $actor->isAdminOrSuperAdmin()) {
            throw new AuthorizationException('Only Admin and SuperAdmin users can promote writers');
        }

        if ($target->isAdminOrSuperAdmin()) {
            throw ValidationException::withMessages([
                'role' => ['Admin and SuperAdmin users cannot be promoted to writer.'],
            ]);
        }

        return DB::transaction(fn (): User => $this->setExclusiveRole(
            $target,
            self::ROLE_WRITER,
            $actor
        ));
    }

    public function promoteToAdmin(User $target, User $actor): User
    {
        if (! $actor->hasRoleName(self::ROLE_SUPER_ADMIN)) {
            throw new AuthorizationException('Only SuperAdmin users can promote admins');
        }

        if ($target->hasRoleName(self::ROLE_SUPER_ADMIN)) {
            throw ValidationException::withMessages([
                'role' => ['The current SuperAdmin is already above Admin.'],
            ]);
        }

        return DB::transaction(fn (): User => $this->setExclusiveRole(
            $target,
            self::ROLE_ADMIN,
            $actor
        ));
    }

    public function promoteToSuperAdmin(User $target, User $actor): User
    {
        if (! $actor->hasRoleName(self::ROLE_SUPER_ADMIN)) {
            throw new AuthorizationException('Only the current SuperAdmin can transfer the SuperAdmin role');
        }

        if ($target->is($actor)) {
            return $actor->fresh(['roles']);
        }

        return DB::transaction(function () use ($target, $actor): User {
            $this->setExclusiveRole($actor, self::ROLE_ADMIN, $actor);
            $newSuperAdmin = $this->setExclusiveRole($target, self::ROLE_SUPER_ADMIN, $actor);
            $this->ensureSingleSuperAdmin($newSuperAdmin);

            return $newSuperAdmin;
        });
    }

    private function setExclusiveRole(User $user, string $roleName, ?User $assignedBy = null): User
    {
        $role = $this->role($roleName);
        $managedRoleIds = $this->managedRoles()->pluck('id')->all();

        $user->roles()->detach($managedRoleIds);
        $user->roles()->attach($role->id, [
            'assigned_by' => $assignedBy?->id,
            'created_at' => now(),
        ]);

        return $user->fresh(['roles']);
    }

    private function ensureSingleSuperAdmin(User $allowedSuperAdmin): void
    {
        $superAdmin = $this->role(self::ROLE_SUPER_ADMIN);

        User::query()
            ->whereHas('roles', fn ($query) => $query->where('roles.id', $superAdmin->id))
            ->whereKeyNot($allowedSuperAdmin->id)
            ->get()
            ->each(fn (User $user): User => $this->setExclusiveRole($user, self::ROLE_ADMIN, $allowedSuperAdmin));
    }

    private function role(string $name): Role
    {
        $normalizedName = User::normalizeRoleName($name);
        $role = Role::query()
            ->get()
            ->first(fn (Role $role): bool => User::normalizeRoleName($role->name) === $normalizedName);

        return $role ?? Role::query()->create([
            'name' => $name,
            'description' => null,
        ]);
    }

    private function managedRoles(): Collection
    {
        $managedRoles = collect(self::MANAGED_ROLES)
            ->map(fn (string $role): string => User::normalizeRoleName($role));

        return Role::query()
            ->get()
            ->filter(fn (Role $role): bool => $managedRoles->contains(User::normalizeRoleName($role->name)));
    }
}
