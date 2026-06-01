<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use App\Services\CommentService;

use App\DTOs\Comment\CreateCommentDTO;
use App\DTOs\Comment\CreateReplyCommentDTO;

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

    public function indexByContent(int $contentId)
    {
        return response()->json(
            $this->service->getByContent($contentId)
        );
    }

    public function replyToComment(Request $request)
    {
        $request->validate([
            'comment_id' => 'required|exists:comments,id',
            'reply' => 'required|string|min:1'
        ]);

        $dto = new CreateReplyCommentDTO(
            Auth::id(),
            $request->comment_id,
            $request->reply
        );

        $reply = $this->service->createReply($dto);

        return response()->json([
            'message' => 'Reply created successfully',
            'data' => $reply
        ], 201);
    }
}
