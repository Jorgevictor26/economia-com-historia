<?php

namespace App\Services;

use App\DTOs\Question\CreateQuestionDTO;
use App\DTOs\Question\UpdateQuestionDTO;
use App\Models\Question;
use App\Repositories\QuestionRepository;
use App\Repositories\QuizRepository;
use Illuminate\Database\Eloquent\Collection;

class QuestionService
{
    public function __construct(
        private readonly QuestionRepository $questions,
        private readonly QuizRepository $quizzes
    ) {
    }

    public function getByQuiz(int $quizId): Collection
    {
        $this->quizzes->findById($quizId) ?? abort(404, 'Quiz not found');

        return $this->questions->getByQuiz($quizId);
    }

    public function create(CreateQuestionDTO $dto): Question
    {
        $this->quizzes->findById($dto->quizId) ?? abort(404, 'Quiz not found');

        return $this->questions->create($dto->toArray());
    }

    public function update(Question $question, UpdateQuestionDTO $dto): Question
    {
        return $this->questions->update($question, $dto->toArray());
    }

    public function delete(Question $question): bool
    {
        return $this->questions->delete($question);
    }
}
