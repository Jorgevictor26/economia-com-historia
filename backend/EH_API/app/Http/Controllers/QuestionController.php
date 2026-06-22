<?php

namespace App\Http\Controllers;

use App\DTOs\Question\CreateQuestionDTO;
use App\Http\Requests\Quiz\StoreQuestionRequest;
use App\Services\QuestionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function __construct(
        private readonly QuestionService $questions
    ) {
    }

    public function index(int $quizId): JsonResponse
    {
        return response()->json(
            $this->questions->getByQuiz($quizId)
        );
    }

    public function store(StoreQuestionRequest $request, int $quizId): JsonResponse
    {
        if (! $this->canManageQuizzes($request)) {
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
