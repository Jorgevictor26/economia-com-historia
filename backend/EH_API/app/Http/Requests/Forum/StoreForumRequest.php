<?php

namespace App\Http\Requests\Forum;

use Illuminate\Foundation\Http\FormRequest;

class StoreForumRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'rules' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'string'],
            'visibility' => ['nullable', 'string', 'in:public,private'],
            'access_code' => ['nullable', 'string', 'min:4', 'max:24'],
            'join_approval_required' => ['nullable', 'boolean'],
            'content_permission' => ['nullable', 'string', 'in:public,subscribers'],
            'allow_attachments' => ['nullable', 'boolean'],
            'content_ids' => ['nullable', 'array'],
            'content_ids.*' => ['integer', 'exists:contents,id'],
        ];
    }
}
