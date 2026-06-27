<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quiz extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'content_id',
        'title',
        'description',
        'cover_url',
        'difficulty',
        'xp_per_question',
        'time_limit',
    ];

    protected $casts = [
        'xp_per_question' => 'integer',
        'time_limit' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function content(): BelongsTo
    {
        return $this->belongsTo(Content::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }

    public function results(): HasMany
    {
        return $this->hasMany(QuizResult::class);
    }
}
