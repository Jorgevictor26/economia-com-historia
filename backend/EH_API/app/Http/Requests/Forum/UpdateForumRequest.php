<?php

namespace App\Http\Requests\Forum;

use Illuminate\Foundation\Http\FormRequest;

class UpdateForumRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'artifacts' => ['sometimes', 'array', 'max:8'],
            'artifacts.*.id' => ['required_with:artifacts', 'string', 'max:255'],
            'artifacts.*.name' => ['required_with:artifacts', 'string', 'max:255'],
            'artifacts.*.type' => ['required_with:artifacts', 'string', 'max:160'],
            'artifacts.*.size' => ['required_with:artifacts', 'integer', 'max:8388608'],
            'artifacts.*.data_url' => ['required_with:artifacts', 'string'],
        ];
    }
}
