<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use App\Services\CommentService;

use App\DTOs\Comment\CreateCommentDTO;
use App\DTOs\Comment\ReplyCommentDTO;
use App\DTOs\Comment\UpdateCommentDTO;
use App\Http\Requests\Comment\ReplyCommentRequest;
use App\Http\Requests\Comment\UpdateCommentRequest;

class CommentController extends Controller
{
    public function __construct(
        private CommentService $service
    ) {}

    public function store(Request $request)
    {
        $request->validate([
            'content_id' => 'required|exists:contents,id',
            'comment' => 'required'
        ]);

        $dto = new CreateCommentDTO(
            Auth::id(),
            $request->content_id,
            $request->comment
        );

        $comment = $this->service->create($dto);

        return response()->json([
            'message' => 'Comment created successfully',
            'data' => $comment
        ], 201);
    }

    public function indexByContent(Request $request, int $contentId)
    {
        return response()->json(
            $this->service->getByContent($contentId, $request->only('search'))
        );
    }

    public function replyToComment(ReplyCommentRequest $request, int $commentId)
    {
        $dto = new ReplyCommentDTO(
            $request->user()->id,
            $commentId,
            $request->reply
        );

        $reply = $this->service->createReply($dto);

        return response()->json([
            'message' => 'Reply created successfully',
            'data' => $reply
        ], 201);
    }

    public function update(UpdateCommentRequest $request, int $id)
    {
        $comment = $this->service->getById($id);

        if (! $comment) {
            return response()->json([
                'message' => 'Comment not found'
            ], 404);
        }

        try {
            $comment = $this->service->update(
                $comment,
                UpdateCommentDTO::fromArray($request->validated()),
                $request->user()
            );
        } catch (\Illuminate\Auth\Access\AuthorizationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 403);
        }

        return response()->json([
            'message' => 'Comment updated successfully',
            'data' => $comment,
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $comment = $this->service->getById($id);

        if (! $comment) {
            return response()->json([
                'message' => 'Comment not found'
            ], 404);
        }

        try {
            $this->service->delete($comment, $request->user());
        } catch (\Illuminate\Auth\Access\AuthorizationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 403);
        }

        return response()->json([
            'message' => 'Comment deleted successfully',
        ]);
    }
}
