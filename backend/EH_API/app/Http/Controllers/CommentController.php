<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use App\Services\CommentService;

use App\DTOs\Comment\CreateCommentDTO;
use App\DTOs\Comment\ReplyCommentDTO;
use App\Http\Requests\Comment\ReplyCommentRequest;

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
}
