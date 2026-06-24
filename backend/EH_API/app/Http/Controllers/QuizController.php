<?php

namespace App\Http\Controllers;

use App\DTOs\Quiz\CreateQuizDTO;
use App\DTOs\Quiz\UpdateQuizDTO;
use App\Http\Requests\Quiz\StoreQuizRequest;
use App\Http\Requests\Quiz\UpdateQuizRequest;
use App\Services\QuizService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    public function __construct(
        private readonly QuizService $quizzes
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $this->quizzes->getAll($request->only('search'))
        );
    }

    public function store(StoreQuizRequest $request): JsonResponse
    {
        if (! $this->canCreateQuiz($request)) {
            return $this->forbiddenResponse();
        }

        $quiz = $this->quizzes->create(
            CreateQuizDTO::fromArray($request->validated(), $request->user()->id)
        );

        return response()->json([
            'message' => 'Quiz created successfully',
            'data' => $quiz,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $quiz = $this->quizzes->findById($id);

        if (! $quiz) {
            return response()->json([
                'message' => 'Quiz not found',
            ], 404);
        }

        return response()->json($quiz);
    }

    public function update(UpdateQuizRequest $request, int $id): JsonResponse
    {
        $quiz = $this->quizzes->findById($id);

        if (! $quiz) {
            return response()->json([
                'message' => 'Quiz not found',
            ], 404);
        }

        if (! $this->canManageQuiz($request, $quiz->user_id)) {
            return $this->forbiddenResponse();
        }

        return response()->json([
            'message' => 'Quiz updated successfully',
            'data' => $this->quizzes->update(
                $quiz,
                UpdateQuizDTO::fromArray($request->validated())
            ),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $quiz = $this->quizzes->findById($id);

        if (! $quiz) {
            return response()->json([
                'message' => 'Quiz not found',
            ], 404);
        }

        if (! $this->canManageQuiz($request, $quiz->user_id)) {
            return $this->forbiddenResponse();
        }

        $this->quizzes->delete($quiz);

        return response()->json([
            'message' => 'Quiz deleted successfully',
        ]);
    }

    private function canCreateQuiz(Request $request): bool
    {
        $user = $request->user();

        if (! $user) {
            return false;
        }

        return $user->isAdminOrSuperAdmin() || $user->isWriter();
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
