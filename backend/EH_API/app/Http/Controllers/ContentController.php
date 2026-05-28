<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;

use App\Services\ContentService;

use App\DTOs\Content\CreateContentDTO;

class ContentController extends Controller
{
    public function __construct(
        private ContentService $service
    ) {}

    public function index()
    {
        return response()->json(
            $this->service->getAll()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|max:255',
            'content' => 'required',
            'visibility' => 'required|in:public,private,followers'
        ]);

        $dto = new CreateContentDTO(
            auth()->id(),
            $request->category_id,
            $request->title,
            $request->summary,
            $request->content,
            $request->image,
            $request->video,
            $request->visibility
        );

        $content = $this->service->create($dto);

        return response()->json([
            'message' => 'Content created successfully',
            'data' => $content
        ], 201);
    }

    public function show(int $id)
    {
        $content = $this->service->findById($id);

        if (!$content) {
            return response()->json([
                'message' => 'Content not found'
            ], 404);
        }

        return response()->json($content);
    }
}