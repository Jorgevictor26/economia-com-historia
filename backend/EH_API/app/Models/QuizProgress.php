<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizProgress extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'quiz_id',
        'progress_percent',
        'current_question_index',
        'answered_questions',
        'completed_at',
    ];

    protected $casts = [
        'progress_percent' => 'integer',
        'current_question_index' => 'integer',
        'answered_questions' => 'array',
        'completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }
}
