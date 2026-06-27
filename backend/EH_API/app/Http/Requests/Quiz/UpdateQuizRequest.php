<?php

namespace App\Http\Requests\Quiz;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQuizRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content_id' => ['sometimes', 'required', 'integer', 'exists:contents,id'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'cover_url' => ['nullable', 'string'],
            'difficulty' => ['sometimes', 'required', 'string', 'in:facil,medio,dificil'],
            'xp_per_question' => ['sometimes', 'required', 'integer', 'in:10,15,20'],
            'time_limit' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
