<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;

use App\Services\CategoryService;

use App\DTOs\Category\CreateCategoryDTO;

class CategoryController extends Controller
{
    public function __construct(
        private CategoryService $service
    ) {}

    public function index(Request $request)
    {
        return response()->json(
            $this->service->getAll($request->only('search'))
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|max:255'
        ]);

        $dto = new CreateCategoryDTO(
            $request->name,
            $request->description
        );

        $category = $this->service->create($dto);

        return response()->json([
            'message' => 'Category created successfully',
            'data' => $category
        ], 201);
    }

    public function show(int $id)
    {
        $category = $this->service->findById($id);

        if (!$category) {
            return response()->json([
                'message' => 'Category not found'
            ], 404);
        }

        return response()->json($category);
    }
}
