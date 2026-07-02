<?php

namespace App\Services;

use App\DTOs\QuizProgress\UpdateQuizProgressDTO;
use App\Models\Quiz;
use App\Models\QuizProgress;
use App\Repositories\QuizProgressRepository;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class QuizProgressService
{
    public function __construct(private QuizProgressRepository $repository)
    {
    }

    public function latestForUser(int $userId, int $limit = 6): Collection
    {
        return $this->repository->latestByUser($userId, max(1, min($limit, 12)));
    }

    public function update(UpdateQuizProgressDTO $dto): QuizProgress
    {
        if (! Quiz::query()->whereKey($dto->quizId)->exists()) {
            throw ValidationException::withMessages([
                'quiz_id' => ['Quiz not found.'],
            ]);
        }

        return $this->repository->updateOrCreate(
            [
                'user_id' => $dto->userId,
                'quiz_id' => $dto->quizId,
            ],
            array_filter([
                'started_at' => $dto->startedAt,
                'progress_percent' => $dto->progressPercent,
                'current_question_index' => $dto->currentQuestionIndex,
                'correct_count' => $dto->correctCount,
                'elapsed_seconds' => $dto->elapsedSeconds,
                'answered_questions' => $dto->answeredQuestions,
                'question_order' => $dto->questionOrder,
                'completed_at' => $dto->progressPercent >= 100 ? now() : null,
            ], fn (mixed $value): bool => $value !== null)
        );
    }
}
