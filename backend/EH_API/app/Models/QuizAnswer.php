<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizAnswer extends Model
{
    use HasFactory;

    public const UPDATED_AT = null;

    protected $fillable = [
        'quiz_result_id',
        'question_id',
        'quiz_alternative_id',
        'user_id',
        'selected_option',
        'is_correct',
        'elapsed_seconds',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'elapsed_seconds' => 'integer',
    ];

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    public function alternative(): BelongsTo
    {
        return $this->belongsTo(QuizAlternative::class, 'quiz_alternative_id');
    }

    public function result(): BelongsTo
    {
        return $this->belongsTo(QuizResult::class, 'quiz_result_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
