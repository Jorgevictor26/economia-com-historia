<?php

namespace App\Repositories;

use App\Models\Question;
use Illuminate\Database\Eloquent\Collection;

class QuestionRepository
{
    public function getByQuiz(int $quizId): Collection
    {
        return Question::where('quiz_id', $quizId)
            ->latest()
            ->get();
    }

    public function create(array $data): Question
    {
        return Question::create($data)->load('quiz');
    }

    public function findById(int $id): ?Question
    {
        return Question::with('quiz')->find($id);
    }

    public function update(Question $question, array $data): Question
    {
        $question->update($data);

        return $question->fresh('quiz');
    }

    public function delete(Question $question): bool
    {
        return (bool) $question->delete();
    }
}
