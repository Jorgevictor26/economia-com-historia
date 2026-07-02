<?php

namespace App\Http\Controllers;

use App\DTOs\Question\CreateQuestionDTO;
use App\DTOs\Question\UpdateQuestionDTO;
use App\Http\Requests\Quiz\StoreQuestionRequest;
use App\Http\Requests\Quiz\UpdateQuestionRequest;
use App\Repositories\QuestionRepository;
use App\Services\QuizService;
use App\Services\QuestionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function __construct(
        private readonly QuestionService $questions,
        private readonly QuizService $quizzes,
        private readonly QuestionRepository $questionRepository,
    ) {
    }

    public function index(Request $request, int $quizId): JsonResponse
    {
        $quiz = $this->quizzes->findById($quizId);

        if (! $quiz) {
            return response()->json([
                'message' => 'Quiz not found',
            ], 404);
        }

        $questions = $this->questions->getByQuiz($quizId);

        if (! $request->user('sanctum') || ! $this->canManageQuiz($request, (int) $quiz->user_id)) {
            $questions->each(fn ($question) => $question->alternatives->makeHidden('is_correct'));
        }

        return response()->json($questions);
    }

    public function store(StoreQuestionRequest $request, int $quizId): JsonResponse
    {
        $quiz = $this->quizzes->findById($quizId);

        if (! $quiz) {
            return response()->json([
                'message' => 'Quiz not found',
            ], 404);
        }

        if (! $this->canManageQuiz($request, $quiz->user_id)) {
            return $this->forbiddenResponse();
        }

        $question = $this->questions->create(
            CreateQuestionDTO::fromArray($request->validated(), $quizId)
        );

        return response()->json([
            'message' => 'Question created successfully',
            'data' => $question,
        ], 201);
    }

    public function update(UpdateQuestionRequest $request, int $id): JsonResponse
    {
        $question = $this->questionRepository->findById($id);

        if (! $question) {
            return response()->json([
                'message' => 'Question not found',
            ], 404);
        }

        if (! $this->canManageQuiz($request, (int) $question->quiz->user_id)) {
            return $this->forbiddenResponse();
        }

        return response()->json([
            'message' => 'Question updated successfully',
            'data' => $this->questions->update($question, UpdateQuestionDTO::fromArray($request->validated())),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $question = $this->questionRepository->findById($id);

        if (! $question) {
            return response()->json([
                'message' => 'Question not found',
            ], 404);
        }

        if (! $this->canManageQuiz($request, (int) $question->quiz->user_id)) {
            return $this->forbiddenResponse();
        }

        $this->questions->delete($question);

        return response()->json([
            'message' => 'Question deleted successfully',
        ]);
    }

    private function canManageQuiz(Request $request, int $ownerId): bool
    {
        $user = $request->user();

        if (! $user) {
            return false;
        }

        return $user->isAdminOrSuperAdmin()
            || ($user->isWriter() && (int) $user->id === $ownerId);
    }

    private function forbiddenResponse(): JsonResponse
    {
        return response()->json([
            'message' => 'You are not allowed to manage this quiz',
        ], 403);
    }
}
