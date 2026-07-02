<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContentProgress extends Model
{
    use HasFactory;

    protected $table = 'content_progresses';

    protected $fillable = [
        'user_id',
        'content_id',
        'progress_percent',
        'last_position_seconds',
        'completed_at',
    ];

    protected $casts = [
        'progress_percent' => 'integer',
        'last_position_seconds' => 'integer',
        'completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function content(): BelongsTo
    {
        return $this->belongsTo(Content::class);
    }
}
