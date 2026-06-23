<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'photo',
        'bio',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_role')
            ->withPivot('id', 'assigned_by', 'created_at');
    }

    public function userRoles(): HasMany
    {
        return $this->hasMany(UserRole::class);
    }

    public function assignedRoles(): HasMany
    {
        return $this->hasMany(UserRole::class, 'assigned_by');
    }

    public function quizzes(): HasMany
    {
        return $this->hasMany(Quiz::class);
    }

    public function quizAnswers(): HasMany
    {
        return $this->hasMany(QuizAnswer::class);
    }

    public function quizResults(): HasMany
    {
        return $this->hasMany(QuizResult::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }

    public function forumTopics(): HasMany
    {
        return $this->hasMany(ForumTopic::class);
    }

    public function forumReplies(): HasMany
    {
        return $this->hasMany(ForumReply::class);
    }

    public function savedContents(): HasMany
    {
        return $this->hasMany(SavedContent::class);
    }

    public function reviewedReports(): HasMany
    {
        return $this->hasMany(Report::class, 'reviewed_by');
    }

    public function normalizedRoleNames()
    {
        return $this->loadMissing('roles')
            ->roles
            ->pluck('name')
            ->map(fn (string $role): string => self::normalizeRoleName($role));
    }

    public function hasRoleName(string $role): bool
    {
        return $this->normalizedRoleNames()
            ->contains(self::normalizeRoleName($role));
    }

    public function hasAnyRoleName(array $roles): bool
    {
        $roles = collect($roles)
            ->map(fn (string $role): string => self::normalizeRoleName($role));

        return $this->normalizedRoleNames()
            ->intersect($roles)
            ->isNotEmpty();
    }

    public function isAdminOrSuperAdmin(): bool
    {
        return $this->hasAnyRoleName(['admin', 'superadmin']);
    }

    public function isWriter(): bool
    {
        return $this->hasRoleName('writer');
    }

    public static function normalizeRoleName(string $role): string
    {
        return strtolower(str_replace(['_', ' ', '-'], '', $role));
    }
}
