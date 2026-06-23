<?php

namespace App\Services;

use App\DTOs\Quiz\QuizAnswerDTO;
use App\DTOs\Quiz\QuizResultDTO;
use App\DTOs\Quiz\SubmitQuizDTO;
use App\Models\QuizResult;
use App\Repositories\QuizAnswerRepository;
use App\Repositories\QuizRepository;
use App\Repositories\QuizResultRepository;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class QuizSubmissionService
{
    public function __construct(
        private readonly QuizRepository $quizzes,
        private readonly QuizAnswerRepository $answers,
        private readonly QuizResultRepository $results,
    ) {
    }

    public function submit(SubmitQuizDTO $dto): array
    {
        $quiz = $this->quizzes->findById($dto->quizId) ?? abort(404, 'Quiz not found');
        $questions = $quiz->questions;
        $totalQuestions = $questions->count();

        if ($totalQuestions === 0) {
            throw new UnprocessableEntityHttpException('Quiz has no questions');
        }

        $this->validateTimeLimit($quiz->time_limit, $dto->startedAt);

        if (count($dto->answers) !== $totalQuestions) {
            throw new UnprocessableEntityHttpException('All quiz questions must be answered');
        }

        $questionsById = $questions->keyBy('id');
        $submittedQuestionIds = collect($dto->answers)->pluck('question_id');

        if ($submittedQuestionIds->duplicates()->isNotEmpty()) {
            throw new UnprocessableEntityHttpException('Duplicate question answers are not allowed');
        }

        if ($submittedQuestionIds->diff($questionsById->keys())->isNotEmpty()) {
            throw new UnprocessableEntityHttpException('All answers must belong to this quiz');
        }

        return DB::transaction(function () use ($dto, $questionsById, $totalQuestions): array {
            $savedAnswers = collect();
            $score = 0;

            foreach ($dto->answers as $answer) {
                $question = $questionsById->get((int) $answer['question_id']);
                $selectedOption = strtolower($answer['selected_option']);
                $isCorrect = $question->correct_option === $selectedOption;

                if ($isCorrect) {
                    $score++;
                }

                $savedAnswers->push($this->answers->create(
                    (new QuizAnswerDTO(
                        questionId: $question->id,
                        userId: $dto->userId,
                        selectedOption: $selectedOption,
                        isCorrect: $isCorrect,
                    ))->toArray()
                ));
            }

            $percentage = round(($score / $totalQuestions) * 100, 2);
            $result = $this->results->create(
                (new QuizResultDTO(
                    quizId: $dto->quizId,
                    userId: $dto->userId,
                    score: $score,
                    totalQuestions: $totalQuestions,
                    percentage: $percentage,
                ))->toArray()
            );

            return $this->formatResult($result, $savedAnswers);
        });
    }

    public function latestResult(int $quizId, int $userId): ?array
    {
        $result = $this->results->latestByQuizAndUser($quizId, $userId);

        if (! $result) {
            return null;
        }

        $answers = $this->answers->latestByQuizAndUser($quizId, $userId, $result->total_questions);

        return $this->formatResult($result, $answers);
    }

    public function myResults(int $userId): LengthAwarePaginator
    {
        return $this->results->byUser($userId);
    }

    private function validateTimeLimit(?int $timeLimit, string $startedAt): void
    {
        if ($timeLimit === null) {
            return;
        }

        $startedAt = Carbon::parse($startedAt);

        if ($startedAt->copy()->addMinutes($timeLimit)->isPast()) {
            throw new UnprocessableEntityHttpException('Quiz time limit exceeded');
        }
    }

    private function formatResult(QuizResult $result, iterable $answers): array
    {
        $answers = collect($answers);
        $correctAnswers = $answers->where('is_correct', true)->count();
        $wrongAnswers = $answers->where('is_correct', false)->count();

        return [
            'result' => $result,
            'score' => $result->score,
            'total_questions' => $result->total_questions,
            'percentage' => (float) $result->percentage,
            'correct_answers' => $correctAnswers,
            'wrong_answers' => $wrongAnswers,
            'answers' => $answers->values(),
        ];
    }
}
