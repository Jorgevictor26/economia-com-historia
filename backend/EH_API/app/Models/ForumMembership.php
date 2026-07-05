<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ForumMembership extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_INVITED = 'invited';
    public const STATUS_MEMBER = 'member';
    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'forum_id',
        'user_id',
        'email',
        'status',
        'invited_by',
        'responded_at',
    ];

    protected $casts = [
        'responded_at' => 'datetime',
    ];

    public function forum(): BelongsTo
    {
        return $this->belongsTo(Forum::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }
}
