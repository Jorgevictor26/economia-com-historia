<?php

namespace App\Services;

use App\DTOs\Quiz\CreateQuizDTO;
use App\DTOs\Quiz\UpdateQuizDTO;
use App\Models\Quiz;
use App\Repositories\QuizRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class QuizService
{
    public function __construct(
        private readonly QuizRepository $quizzes
    ) {
    }

    public function getAll(): LengthAwarePaginator
    {
        return $this->quizzes->all();
    }

    public function findById(int $id): ?Quiz
    {
        return $this->quizzes->findById($id);
    }

    public function create(CreateQuizDTO $dto): Quiz
    {
        return $this->quizzes->create($dto->toArray());
    }

    public function update(Quiz $quiz, UpdateQuizDTO $dto): Quiz
    {
        return $this->quizzes->update($quiz, $dto->toArray());
    }

    public function delete(Quiz $quiz): bool
    {
        return $this->quizzes->delete($quiz);
    }
}
