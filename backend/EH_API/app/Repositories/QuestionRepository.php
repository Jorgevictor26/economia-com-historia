<?php

namespace App\Repositories;

use App\Models\Question;
use Illuminate\Database\Eloquent\Collection;

class QuestionRepository
{
    public function getByQuiz(int $quizId): Collection
    {
        return Question::where('quiz_id', $quizId)
            ->with('alternatives')
            ->orderBy('order')
            ->oldest()
            ->get();
    }

    public function create(array $data, array $alternatives = []): Question
    {
        $question = Question::create($data);

        foreach ($alternatives as $alternative) {
            $question->alternatives()->create([
                'text' => $alternative['text'],
                'is_correct' => (bool) $alternative['is_correct'],
            ]);
        }

        return $question->load(['quiz', 'alternatives']);
    }

    public function findById(int $id): ?Question
    {
        return Question::with(['quiz', 'alternatives'])->find($id);
    }

    public function update(Question $question, array $data, ?array $alternatives = null): Question
    {
        $question->update($data);

        if ($alternatives !== null) {
            $question->alternatives()->delete();

            foreach ($alternatives as $alternative) {
                $question->alternatives()->create([
                    'text' => $alternative['text'],
                    'is_correct' => (bool) $alternative['is_correct'],
                ]);
            }
        }

        return $question->fresh(['quiz', 'alternatives']);
    }

    public function delete(Question $question): bool
    {
        return (bool) $question->delete();
    }
}
