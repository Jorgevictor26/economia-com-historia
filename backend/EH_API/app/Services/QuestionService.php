<?php

namespace App\Services;

use App\DTOs\Question\CreateQuestionDTO;
use App\DTOs\Question\UpdateQuestionDTO;
use App\Models\Question;
use App\Repositories\QuestionRepository;
use App\Repositories\QuizRepository;
use Illuminate\Database\Eloquent\Collection;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

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
        $quiz = $this->quizzes->findById($dto->quizId) ?? abort(404, 'Quiz not found');

        if ($quiz->questions()->count() >= 15) {
            throw new UnprocessableEntityHttpException('Quiz already has 15 questions');
        }

        return $this->questions->create($dto->toArray(), $dto->alternatives);
    }

    public function update(Question $question, UpdateQuestionDTO $dto): Question
    {
        return $this->questions->update($question, $dto->toArray(), $dto->alternatives);
    }

    public function delete(Question $question): bool
    {
        return $this->questions->delete($question);
    }
}
