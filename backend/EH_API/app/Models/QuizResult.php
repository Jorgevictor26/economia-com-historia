<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizResult extends Model
{
    use HasFactory;

    public const CREATED_AT = 'completed_at';
    public const UPDATED_AT = null;

    protected $fillable = [
        'quiz_id',
        'user_id',
        'score',
        'total_questions',
        'percentage',
        'earned_xp',
        'completed_at',
    ];

    protected $casts = [
        'score' => 'integer',
        'total_questions' => 'integer',
        'percentage' => 'decimal:2',
        'earned_xp' => 'integer',
        'completed_at' => 'datetime',
    ];

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
