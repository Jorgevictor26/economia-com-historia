<?php

namespace App\Repositories;

use App\Models\QuizProgress;
use Illuminate\Support\Collection;

class QuizProgressRepository
{
    public function latestByUser(int $userId, int $limit = 6): Collection
    {
        return QuizProgress::with(['quiz.user', 'quiz.content.category'])
            ->where('user_id', $userId)
            ->where('progress_percent', '>', 0)
            ->latest('updated_at')
            ->limit($limit)
            ->get();
    }

    public function findByUserAndQuiz(int $userId, int $quizId): ?QuizProgress
    {
        return QuizProgress::with(['quiz.user', 'quiz.content.category'])
            ->where('user_id', $userId)
            ->where('quiz_id', $quizId)
            ->first();
    }

    public function updateOrCreate(array $keys, array $data): QuizProgress
    {
        return QuizProgress::updateOrCreate($keys, $data)
            ->fresh(['quiz.user', 'quiz.content.category']);
    }
}
