<?php

namespace App\Http\Requests\QuizProgress;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQuizProgressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'progress_percent' => ['required', 'integer', 'min:0', 'max:100'],
            'current_question_index' => ['nullable', 'integer', 'min:0'],
            'answered_questions' => ['nullable', 'array'],
        ];
    }
}
