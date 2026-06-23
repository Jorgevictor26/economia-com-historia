<?php

namespace App\Http\Controllers;

use App\DTOs\Quiz\SubmitQuizDTO;
use App\Http\Requests\Quiz\SubmitQuizRequest;
use App\Services\QuizSubmissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuizAnswerController extends Controller
{
    public function __construct(
        private readonly QuizSubmissionService $submissions
    ) {
    }

    public function submit(SubmitQuizRequest $request, int $id): JsonResponse
    {
        $result = $this->submissions->submit(
            SubmitQuizDTO::fromArray($request->validated(), $id, $request->user()->id)
        );

        return response()->json([
            'message' => 'Quiz submitted successfully',
            'data' => $result,
        ], 201);
    }

    public function result(Request $request, int $id): JsonResponse
    {
        $result = $this->submissions->latestResult($id, $request->user()->id);

        if (! $result) {
            return response()->json([
                'message' => 'Quiz result not found',
            ], 404);
        }

        return response()->json([
            'data' => $result,
        ]);
    }

    public function myResults(Request $request): JsonResponse
    {
        return response()->json(
            $this->submissions->myResults($request->user()->id)
        );
    }
}
