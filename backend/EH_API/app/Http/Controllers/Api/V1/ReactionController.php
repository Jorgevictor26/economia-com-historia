<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use App\Services\ReactionService;
use App\DTOs\Reaction\CreateReactionDTO;

class ReactionController extends Controller
{
    public function __construct(
        private ReactionService $service
    ) {}

    public function store(Request $request)
    {
        $request->validate([
            'content_id' => 'required|exists:contents,id',
            'reaction_type' => 'required|in:like,love,haha,wow,sad,angry'
        ]);

        $dto = new CreateReactionDTO(
            Auth::id(),
            $request->content_id,
            $request->reaction_type
        );

        $reaction = $this->service->create($dto);

        return response()->json([
            'message' => 'Reaction added successfully',
            'data' => $reaction
        ], 201);
    }

    public function getByContent(int $contentId)
    {
        return response()->json(
            $this->service->getByContent($contentId)
        );
    }

    public function getCountByType(int $contentId)
    {
        return response()->json(
            $this->service->getCountByType($contentId)
        );
    }
}
