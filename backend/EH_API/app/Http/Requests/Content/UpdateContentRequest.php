<?php

namespace App\Http\Requests\Content;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'summary' => ['nullable', 'string'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'content_type_id' => ['sometimes', 'required', 'integer', 'exists:content_types,id'],
            'content' => ['sometimes', 'required', 'string'],
            'image_url' => ['nullable', 'string'],
            'video_url' => ['nullable', 'string'],
            'visibility' => ['sometimes', 'required', 'string', 'in:public,private,followers'],
        ];
    }
}
