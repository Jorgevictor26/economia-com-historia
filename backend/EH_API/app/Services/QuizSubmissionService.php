<?php

namespace App\Services;

use App\DTOs\Quiz\QuizAnswerDTO;
use App\DTOs\Quiz\QuizResultDTO;
use App\DTOs\Quiz\SubmitQuizDTO;
use App\DTOs\ContentProgress\UpdateContentProgressDTO;
use App\DTOs\QuizProgress\UpdateQuizProgressDTO;
use App\Models\QuizResult;
use App\Models\User;
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

        if ($quiz->status !== 'active') {
            throw new UnprocessableEntityHttpException('Quiz is inactive');
        }

        if ($totalQuestions < 5) {
            throw new UnprocessableEntityHttpException('Quiz must have at least 5 questions');
        }

        if ($totalQuestions > 15) {
            throw new UnprocessableEntityHttpException('Quiz cannot have more than 15 questions');
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
            $score = 0;
            $earnedXp = 0;
            $rules = $this->rulesForDifficulty($quiz->difficulty);

            foreach ($dto->answers as $answer) {
                $question = $questionsById->get((int) $answer['question_id']);
                $alternative = $this->submittedAlternative($question, $answer);

                if (isset($answer['alternative_id']) && ! $alternative) {
                    throw new UnprocessableEntityHttpException('All alternatives must belong to their submitted questions');
                }

                $elapsedSeconds = (int) ($answer['elapsed_seconds'] ?? 0);
                $expired = $elapsedSeconds > 0 && $elapsedSeconds > $rules['time_seconds'];
                $isCorrect = $this->answerIsCorrect($question, $alternative, $answer, $expired);

                if ($isCorrect) {
                    $correctAnswers++;
                    $score += $rules['score'];
                    $earnedXp += $rules['xp'];
                }
            }

            $wrongAnswers = $totalQuestions - $correctAnswers;
            $percentage = round(($correctAnswers / $totalQuestions) * 100, 2);
            $durationSeconds = $this->durationSeconds($dto);
            $result = $this->results->create(
                (new QuizResultDTO(
                    quizId: $dto->quizId,
                    userId: $dto->userId,
                    score: $score,
                    totalQuestions: $totalQuestions,
                    correctAnswers: $correctAnswers,
                    wrongAnswers: $wrongAnswers,
                    percentage: $percentage,
                    earnedXp: $earnedXp,
                    durationSeconds: $durationSeconds,
                    isBest: true,
                ))->toArray()
            );

            foreach ($dto->answers as $answer) {
                $question = $questionsById->get((int) $answer['question_id']);
                $alternative = $this->submittedAlternative($question, $answer);
                $elapsedSeconds = (int) ($answer['elapsed_seconds'] ?? 0);
                $expired = $elapsedSeconds > 0 && $elapsedSeconds > $rules['time_seconds'];
                $legacyOption = $this->legacyOptionForAnswer($question, $alternative, $answer);

                $savedAnswers->push($this->answers->create([
                    ...((new QuizAnswerDTO(
                        questionId: $question->id,
                        alternativeId: $alternative?->id,
                        userId: $dto->userId,
                        selectedOption: $legacyOption,
                        isCorrect: $this->answerIsCorrect($question, $alternative, $answer, $expired),
                        elapsedSeconds: $elapsedSeconds,
                    ))->toArray()),
                    'quiz_result_id' => $result->id,
                ]));
            }

            $this->results->markBestForQuizAndUser($result);
            $ranking = $this->results->upsertRanking($result);
            $result->refresh();

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
                    ->map(fn (array $answer) => array_filter([
                        'question_id' => $answer['question_id'],
                        'alternative_id' => $answer['alternative_id'] ?? null,
                        'selected_option' => $answer['selected_option'] ?? null,
                    ], fn ($value) => $value !== null))
                    ->values()
                    ->all(),
                correctCount: $correctAnswers,
                elapsedSeconds: $durationSeconds,
                questionOrder: collect($dto->answers)->pluck('question_id')->values()->all(),
            ));

            User::query()->whereKey($dto->userId)->increment('total_xp', $earnedXp);
            $this->grantAchievements($dto->userId, $quiz->id);

            return [
                ...$this->formatResult($result, $savedAnswers),
                'ranking_position' => $this->results->rankingPosition($quiz->id, $dto->userId),
                'ranking' => $ranking,
                'user_level' => User::query()->find($dto->userId)?->xpLevel(),
                'user_total_xp' => User::query()->find($dto->userId)?->total_xp,
            ];
        });
    }

    public function start(int $quizId, int $userId): array
    {
        $quiz = $this->quizzes->findById($quizId) ?? abort(404, 'Quiz not found');

        if ($quiz->status !== 'active') {
            throw new UnprocessableEntityHttpException('Quiz is inactive');
        }

        if ($this->results->existsForQuizAndUser($quizId, $userId)) {
            throw new UnprocessableEntityHttpException('You have already answered this quiz');
        }

        $startedAt = now();
        $rules = $this->rulesForDifficulty($quiz->difficulty);

        $this->quizProgress->update(new UpdateQuizProgressDTO(
            userId: $userId,
            quizId: $quizId,
            progressPercent: 1,
            currentQuestionIndex: 0,
            answeredQuestions: [],
            correctCount: 0,
            elapsedSeconds: 0,
            questionOrder: $quiz->questions->pluck('id')->values()->all(),
            startedAt: $startedAt->toDateTimeString(),
        ));

        return [
            'quiz' => $quiz->only(['id', 'title', 'description', 'status', 'created_at', 'updated_at']),
            'category' => $quiz->category ?? $quiz->content?->category,
            'started_at' => $startedAt->toIso8601String(),
            'difficulty' => $quiz->difficulty,
            'time_seconds' => $rules['time_seconds'],
            'score_per_question' => $rules['score'],
            'xp_per_question' => $rules['xp'],
            'questions' => $quiz->questions
                ->sortBy('order')
                ->values()
                ->map(fn ($question): array => [
                    'id' => $question->id,
                    'quiz_id' => $question->quiz_id,
                    'question' => $question->question,
                    'difficulty' => $quiz->difficulty,
                    'time_seconds' => $rules['time_seconds'],
                    'score' => $rules['score'],
                    'xp' => $rules['xp'],
                    'order' => $question->order,
                    'alternatives' => $question->alternatives
                        ->map(fn ($alternative): array => [
                            'id' => $alternative->id,
                            'question_id' => $alternative->question_id,
                            'text' => $alternative->text,
                        ])
                        ->values(),
                ])
                ->values(),
        ];
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
        $stats = $this->results->statsByUser($userId);
        $user = User::query()->find($userId);

        return [
            ...$stats,
            'total_xp' => (int) ($user?->total_xp ?? 0),
            'level' => $user?->xpLevel() ?? 'Iniciante',
        ];
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
            'ranking_position' => $this->results->rankingPosition((int) $result->quiz_id, (int) $result->user_id),
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

    private function rulesForDifficulty(?string $difficulty): array
    {
        return match ($difficulty) {
            'medio', 'media' => ['time_seconds' => 20, 'score' => 20, 'xp' => 20],
            'dificil' => ['time_seconds' => 15, 'score' => 30, 'xp' => 30],
            default => ['time_seconds' => 30, 'score' => 10, 'xp' => 10],
        };
    }

    public function ranking(int $quizId): LengthAwarePaginator
    {
        return $this->results->rankingByQuiz($quizId);
    }

    public function rankingPosition(int $quizId, int $userId): ?int
    {
        return $this->results->rankingPosition($quizId, $userId);
    }

    private function legacyOptionForAlternative($question, int $alternativeId): string
    {
        $index = $question->alternatives
            ->values()
            ->search(fn ($alternative): bool => (int) $alternative->id === $alternativeId);

        return ['a', 'b', 'c', 'd'][(int) $index] ?? 'a';
    }

    private function submittedAlternative($question, array $answer)
    {
        if (isset($answer['alternative_id'])) {
            return $question->alternatives->firstWhere('id', (int) $answer['alternative_id']);
        }

        $selectedOption = $answer['selected_option'] ?? null;
        $index = array_search($selectedOption, ['a', 'b', 'c', 'd'], true);

        return $index === false ? null : $question->alternatives->values()->get($index);
    }

    private function legacyOptionForAnswer($question, $alternative, array $answer): string
    {
        if ($alternative) {
            return $this->legacyOptionForAlternative($question, (int) $alternative->id);
        }

        return $answer['selected_option'] ?? 'a';
    }

    private function answerIsCorrect($question, $alternative, array $answer, bool $expired): bool
    {
        if ($expired) {
            return false;
        }

        if ($alternative) {
            return (bool) $alternative->is_correct;
        }

        return ($answer['selected_option'] ?? null) === $question->correct_option;
    }
}
