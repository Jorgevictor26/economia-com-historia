<?php

namespace App\Http\Requests\Quiz;

use Illuminate\Foundation\Http\FormRequest;

class SubmitQuizRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'started_at' => ['required', 'date', 'before_or_equal:now'],
            'elapsed_seconds' => ['nullable', 'integer', 'min:0', 'max:86400'],
            'answers' => ['required', 'array', 'min:1'],
            'answers.*.question_id' => ['required', 'integer', 'distinct', 'exists:questions,id'],
            'answers.*.selected_option' => ['required', 'string', 'in:a,b,c,d'],
        ];
    }
}
