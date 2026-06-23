<?php

namespace App\Http\Requests\Content;

use Illuminate\Foundation\Http\FormRequest;

class StoreContentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'summary' => ['nullable', 'string'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'content_type_id' => ['required', 'integer', 'exists:content_types,id'],
            'content' => ['required', 'string'],
            'image' => ['nullable', 'string'],
            'video' => ['nullable', 'string'],
            'visibility' => ['required', 'string', 'in:public,private,followers'],
        ];
    }
}
