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

    public function index(): JsonResponse
    {
        return response()->json($this->quizzes->getAll());
    }

    public function store(StoreQuizRequest $request): JsonResponse
    {
        if (! $this->canManageQuizzes($request)) {
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
        if (! $this->canManageQuizzes($request)) {
            return $this->forbiddenResponse();
        }

        $quiz = $this->quizzes->findById($id);

        if (! $quiz) {
            return response()->json([
                'message' => 'Quiz not found',
            ], 404);
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
        if (! $this->canManageQuizzes($request)) {
            return $this->forbiddenResponse();
        }

        $quiz = $this->quizzes->findById($id);

        if (! $quiz) {
            return response()->json([
                'message' => 'Quiz not found',
            ], 404);
        }

        $this->quizzes->delete($quiz);

        return response()->json([
            'message' => 'Quiz deleted successfully',
        ]);
    }

    private function canManageQuizzes(Request $request): bool
    {
        $user = $request->user()?->loadMissing('roles');

        if (! $user) {
            return false;
        }

        return $user->roles
            ->pluck('name')
            ->map(fn (string $role): string => strtolower(str_replace(['_', ' '], '-', $role)))
            ->intersect(['admin', 'superadmin', 'super-admin'])
            ->isNotEmpty();
    }

    private function forbiddenResponse(): JsonResponse
    {
        return response()->json([
            'message' => 'Only Admin and SuperAdmin users can manage quizzes',
        ], 403);
    }
}
