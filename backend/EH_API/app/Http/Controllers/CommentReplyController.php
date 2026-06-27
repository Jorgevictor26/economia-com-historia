<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\CommentService;
use App\DTOs\Comment\UpdateReplyCommentDTO;
use App\Http\Requests\Comment\UpdateReplyCommentRequest;

class CommentReplyController extends Controller
{
    public function __construct(
        private CommentService $service
    ) {}

    public function update(UpdateReplyCommentRequest $request, int $id)
    {
        $reply = $this->service->getReplyById($id);

        if (! $reply) {
            return response()->json([
                'message' => 'Comment reply not found'
            ], 404);
        }

        try {
            $reply = $this->service->updateReply(
                $reply,
                UpdateReplyCommentDTO::fromArray($request->validated()),
                $request->user()
            );
        } catch (\Illuminate\Auth\Access\AuthorizationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 403);
        }

        return response()->json([
            'message' => 'Comment reply updated successfully',
            'data' => $reply,
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $reply = $this->service->getReplyById($id);

        if (! $reply) {
            return response()->json([
                'message' => 'Comment reply not found'
            ], 404);
        }

        try {
            $this->service->deleteReply($reply, $request->user());
        } catch (\Illuminate\Auth\Access\AuthorizationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 403);
        }

        return response()->json([
            'message' => 'Comment reply deleted successfully',
        ]);
    }
}
