<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizRanking extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_result_id',
        'quiz_id',
        'user_id',
        'score',
        'earned_xp',
        'duration_seconds',
        'completed_at',
    ];

    protected $casts = [
        'score' => 'integer',
        'earned_xp' => 'integer',
        'duration_seconds' => 'integer',
        'completed_at' => 'datetime',
    ];

    public function result(): BelongsTo
    {
        return $this->belongsTo(QuizResult::class, 'quiz_result_id');
    }

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
