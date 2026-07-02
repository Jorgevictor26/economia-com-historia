<?php

namespace App\Services;

use App\DTOs\Quiz\QuizAnswerDTO;
use App\DTOs\Quiz\QuizResultDTO;
use App\DTOs\Quiz\SubmitQuizDTO;
use App\DTOs\ContentProgress\UpdateContentProgressDTO;
use App\DTOs\QuizProgress\UpdateQuizProgressDTO;
use App\Models\QuizResult;
use App\Models\UserAchievement;
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
        private readonly ContentProgressService $contentProgress,
        private readonly QuizProgressService $quizProgress,
    ) {
    }

    public function submit(SubmitQuizDTO $dto): array
    {
        $quiz = $this->quizzes->findById($dto->quizId) ?? abort(404, 'Quiz not found');
        $questions = $quiz->questions;
        $totalQuestions = $questions->count();

        if ($totalQuestions !== 10) {
            throw new UnprocessableEntityHttpException('Quiz must have exactly 10 questions');
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

        return DB::transaction(function () use ($dto, $questionsById, $totalQuestions, $quiz): array {
            $savedAnswers = collect();
            $correctAnswers = 0;

            foreach ($dto->answers as $answer) {
                $question = $questionsById->get((int) $answer['question_id']);
                $selectedOption = strtolower($answer['selected_option']);
                $isCorrect = $question->correct_option === $selectedOption;

                if ($isCorrect) {
                    $correctAnswers++;
                }
            }

            $wrongAnswers = $totalQuestions - $correctAnswers;
            $percentage = round(($correctAnswers / $totalQuestions) * 100, 2);
            $score = ($correctAnswers * 10) + ($correctAnswers === $totalQuestions ? 10 : 0);
            $durationSeconds = $this->durationSeconds($dto);
            $previousBest = $this->results->bestByQuizAndUser($dto->quizId, $dto->userId);
            $isBest = ! $previousBest
                || $score > $previousBest->score
                || ($score === $previousBest->score && $durationSeconds > 0 && $durationSeconds < $previousBest->duration_seconds);
            $result = $this->results->create(
                (new QuizResultDTO(
                    quizId: $dto->quizId,
                    userId: $dto->userId,
                    score: $score,
                    totalQuestions: $totalQuestions,
                    correctAnswers: $correctAnswers,
                    wrongAnswers: $wrongAnswers,
                    percentage: $percentage,
                    earnedXp: $score,
                    durationSeconds: $durationSeconds,
                    isBest: $isBest,
                ))->toArray()
            );

            foreach ($dto->answers as $answer) {
                $question = $questionsById->get((int) $answer['question_id']);
                $selectedOption = strtolower($answer['selected_option']);

                $savedAnswers->push($this->answers->create([
                    ...((new QuizAnswerDTO(
                        questionId: $question->id,
                        userId: $dto->userId,
                        selectedOption: $selectedOption,
                        isCorrect: $question->correct_option === $selectedOption,
                    ))->toArray()),
                    'quiz_result_id' => $result->id,
                ]));
            }

            if ($isBest) {
                $this->results->markBestForQuizAndUser($result);
                $result->refresh();
            }

            if ($quiz->content_id !== null) {
                $this->contentProgress->update(new UpdateContentProgressDTO(
                    userId: $dto->userId,
                    contentId: (int) $quiz->content_id,
                    progressPercent: 100,
                ));
            }

            $this->quizProgress->update(new UpdateQuizProgressDTO(
                userId: $dto->userId,
                quizId: $dto->quizId,
                progressPercent: 100,
                currentQuestionIndex: max($totalQuestions - 1, 0),
                answeredQuestions: collect($dto->answers)
                    ->map(fn (array $answer) => [
                        'question_id' => $answer['question_id'],
                        'selected_option' => $answer['selected_option'],
                    ])
                    ->values()
                    ->all(),
                correctCount: $correctAnswers,
                elapsedSeconds: $durationSeconds,
                questionOrder: collect($dto->answers)->pluck('question_id')->values()->all(),
            ));

            $this->grantAchievements($dto->userId, $quiz->id);

            return $this->formatResult($result, $savedAnswers);
        });
    }

    public function latestResult(int $quizId, int $userId): ?array
    {
        $result = $this->results->latestByQuizAndUser($quizId, $userId);

        if (! $result) {
            return null;
        }

        $answers = $this->answers->byResult($result->id);

        return $this->formatResult($result, $answers);
    }

    public function myResults(int $userId): LengthAwarePaginator
    {
        return $this->results->byUser($userId);
    }

    public function myStats(int $userId): array
    {
        return $this->results->statsByUser($userId);
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
            'earned_xp' => $result->earned_xp,
            'correct_answers' => $result->correct_answers ?: $correctAnswers,
            'wrong_answers' => $result->wrong_answers ?: $wrongAnswers,
            'duration_seconds' => $result->duration_seconds,
            'best_score' => $this->results->bestByQuizAndUser((int) $result->quiz_id, (int) $result->user_id)?->score ?? $result->score,
            'is_best' => $result->is_best,
            'answers' => $answers->values(),
        ];
    }

    private function durationSeconds(SubmitQuizDTO $dto): int
    {
        if ($dto->elapsedSeconds > 0) {
            return $dto->elapsedSeconds;
        }

        return max(0, Carbon::parse($dto->startedAt)->diffInSeconds(now()));
    }

    private function grantAchievements(int $userId, int $quizId): void
    {
        $bestResults = $this->results->bestResultsByUser($userId);
        $completedCount = $bestResults->count();
        $currentBest = $bestResults->firstWhere('quiz_id', $quizId);

        $this->grantAchievement($userId, 'primeiro_quiz', 'Primeiro Quiz', 'bronze', $completedCount >= 1);
        $this->grantAchievement($userId, 'estudioso', 'Estudioso', 'silver', $completedCount >= 10);
        $this->grantAchievement($userId, 'mestre', 'Mestre', 'gold', (float) ($currentBest?->percentage ?? 0) >= 100);

        $theme = $currentBest?->quiz?->content?->category?->name;
        if ($theme) {
            $themeQuizzes = $this->quizzes->allByTheme($theme);
            $perfectThemeQuizIds = $bestResults
                ->filter(fn (QuizResult $result) => $result->quiz?->content?->category?->name === $theme && (float) $result->percentage >= 100)
                ->pluck('quiz_id')
                ->unique();

            $this->grantAchievement(
                $userId,
                'especialista_'.strtolower(preg_replace('/[^a-z0-9]+/i', '_', $theme)),
                'Especialista',
                'trophy',
                $themeQuizzes->isNotEmpty() && $perfectThemeQuizIds->count() === $themeQuizzes->count()
            );
        }
    }

    private function grantAchievement(int $userId, string $code, string $name, string $level, bool $condition): void
    {
        if (! $condition) {
            return;
        }

        UserAchievement::firstOrCreate(
            ['user_id' => $userId, 'code' => $code],
            ['name' => $name, 'level' => $level, 'earned_at' => now()]
        );
    }
}
