<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Notifications\ResetPasswordNotification;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'google_id',
        'firebase_uid',
        'password',
        'photo',
        'bio',
        'status',
        'total_xp',
        'jindungo_subscription_expires_at',
        'jindungo_subscription_requested_at',
    ];

    protected $hidden = [
        'password',
        'google_id',
        'firebase_uid',
        'remember_token',
    ];

    protected $appends = [
        'avatar_url',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'total_xp' => 'integer',
            'jindungo_subscription_expires_at' => 'datetime',
            'jindungo_subscription_requested_at' => 'datetime',
        ];
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_role')
            ->withPivot('id', 'assigned_by', 'created_at');
    }

    protected function avatarUrl(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            get: fn () => $this->photo ?? null,
        );
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

    public function quizRankings(): HasMany
    {
        return $this->hasMany(QuizRanking::class);
    }

    public function xpLevel(): string
    {
        $xp = (int) ($this->total_xp ?? 0);

        return match (true) {
            $xp <= 100 => 'Iniciante',
            $xp <= 300 => 'Estudante',
            $xp <= 600 => 'Especialista',
            default => 'Mestre da Economia',
        };
    }

    public function achievements(): HasMany
    {
        return $this->hasMany(UserAchievement::class);
    }

    public function commentReports(): HasMany
    {
        return $this->hasMany(CommentReport::class);
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

    public function reviewedCommentReports(): HasMany
    {
        return $this->hasMany(CommentReport::class, 'reviewed_by');
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

    public function hasActiveJindungoSubscription(): bool
    {
        return $this->jindungo_subscription_expires_at !== null
            && $this->jindungo_subscription_expires_at->isFuture();
    }

    public static function normalizeRoleName(string $role): string
    {
        return strtolower(str_replace(['_', ' ', '-'], '', $role));
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }
}
