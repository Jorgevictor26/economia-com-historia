<?php

namespace App\Http\Controllers;

use App\DTOs\Question\CreateQuestionDTO;
use App\Http\Requests\Quiz\StoreQuestionRequest;
use App\Services\QuizService;
use App\Services\QuestionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function __construct(
        private readonly QuestionService $questions,
        private readonly QuizService $quizzes
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
