<?php

namespace App\Http\Controllers;

use App\DTOs\ContentType\CreateContentTypeDTO;
use App\Services\ContentTypeService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ContentTypeController extends Controller
{
    public function __construct(
        private ContentTypeService $service
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
            'name' => 'required|max:255',
            'slug' => 'nullable|max:255|unique:content_types,slug',
            'description' => 'nullable|string',
        ]);

        $dto = new CreateContentTypeDTO(
            $request->name,
            $request->slug ?: Str::slug($request->name),
            $request->description
        );

        $contentType = $this->service->create($dto);

        return response()->json([
            'message' => 'Content type created successfully',
            'data' => $contentType,
        ], 201);
    }

    public function show(int $id)
    {
        $contentType = $this->service->findById($id);

        if (!$contentType) {
            return response()->json([
                'message' => 'Content type not found',
            ], 404);
        }

        return response()->json($contentType);
    }
}
