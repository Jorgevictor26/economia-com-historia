<?php

namespace App\Http\Requests\Quiz;

use Illuminate\Foundation\Http\FormRequest;

class StoreQuizRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content_id' => ['required', 'integer', 'exists:contents,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'difficulty' => ['required', 'string', 'in:facil,medio,dificil'],
            'xp_per_question' => ['nullable', 'integer', 'in:10'],
            'time_limit' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
