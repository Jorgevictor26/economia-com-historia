<?php

namespace App\Http\Controllers;

use App\DTOs\QuizProgress\UpdateQuizProgressDTO;
use App\Http\Requests\QuizProgress\UpdateQuizProgressRequest;
use App\Services\QuizProgressService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class QuizProgressController extends Controller
{
    public function __construct(private QuizProgressService $service)
    {
    }

    public function mine(Request $request): JsonResponse
    {
        $limit = min(max((int) $request->integer('limit', 6), 1), 12);

        return response()->json($this->service->latestForUser($request->user()->id, $limit));
    }

    public function update(UpdateQuizProgressRequest $request, int $quizId): JsonResponse
    {
        try {
            $progress = $this->service->update(new UpdateQuizProgressDTO(
                userId: $request->user()->id,
                quizId: $quizId,
                progressPercent: $request->integer('progress_percent'),
                currentQuestionIndex: $request->has('current_question_index') ? $request->integer('current_question_index') : null,
                answeredQuestions: $request->input('answered_questions'),
                correctCount: $request->integer('correct_count', 0),
                elapsedSeconds: $request->integer('elapsed_seconds', 0),
                questionOrder: $request->input('question_order'),
            ));
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => 'Unable to update quiz progress',
                'errors' => $exception->errors(),
            ], 404);
        }

        return response()->json([
            'message' => 'Quiz progress updated successfully',
            'data' => $progress,
        ]);
    }
}
