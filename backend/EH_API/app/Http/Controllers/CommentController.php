<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use App\Services\CommentService;

use App\DTOs\Comment\CreateCommentDTO;

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
}