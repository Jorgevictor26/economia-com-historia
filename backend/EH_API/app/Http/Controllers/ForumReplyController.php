<?php

namespace App\Http\Controllers;

use App\DTOs\Forum\ReplyTopicDTO;
use App\DTOs\Forum\UpdateReplyDTO;
use App\Http\Requests\Forum\ReplyTopicRequest;
use App\Http\Requests\Forum\UpdateReplyRequest;
use App\Services\ForumReplyService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ForumReplyController extends Controller
{
    public function __construct(
        private ForumReplyService $service
    ) {}

    public function index(Request $request, int $topicId): JsonResponse
    {
        try {
            $replies = $this->service->getByTopic($topicId, $request->only('search'), $request->user('sanctum'));
        } catch (AuthorizationException $exception) {
            return response()->json(['message' => $exception->getMessage()], 403);
        }

        if (is_null($replies)) {
            return response()->json(['message' => 'Topic not found'], 404);
        }

        return response()->json($replies);
    }

    public function store(ReplyTopicRequest $request, int $topicId): JsonResponse
    {
        try {
            $reply = $this->service->create(new ReplyTopicDTO(
                $topicId,
                $request->user()->id,
                $request->string('reply')->toString()
            ));
        } catch (AuthorizationException $exception) {
            return response()->json(['message' => $exception->getMessage()], 403);
        }

        if (! $reply) {
            return response()->json(['message' => 'Topic not found'], 404);
        }

        return response()->json([
            'message' => 'Reply created successfully',
            'data' => $reply,
        ], 201);
    }

    public function update(UpdateReplyRequest $request, int $id): JsonResponse
    {
        try {
            $reply = $this->service->update($id, new UpdateReplyDTO(
                $request->string('reply')->toString()
            ), $request->user());
        } catch (AuthorizationException $exception) {
            return response()->json(['message' => $exception->getMessage()], 403);
        }

        if (! $reply) {
            return response()->json(['message' => 'Reply not found'], 404);
        }

        return response()->json([
            'message' => 'Reply updated successfully',
            'data' => $reply,
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $deleted = $this->service->delete($id, $request->user());
        } catch (AuthorizationException $exception) {
            return response()->json(['message' => $exception->getMessage()], 403);
        }

        if (! $deleted) {
            return response()->json(['message' => 'Reply not found'], 404);
        }

        return response()->json(['message' => 'Reply deleted successfully']);
    }
}
