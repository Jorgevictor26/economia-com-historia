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
            'category_id' => ['sometimes', 'required', 'integer', 'exists:categories,id'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'cover_url' => ['nullable', 'string'],
            'status' => ['sometimes', 'required', 'string', 'in:active,inactive,ativo,inativo'],
            'difficulty' => ['sometimes', 'required', 'string', 'in:Fácil,Facil,facil,fácil,Média,Media,medio,médio,Difícil,Dificil,dificil,difícil'],
            'xp_per_question' => ['prohibited'],
            'time_limit' => ['prohibited'],
        ];
    }
}
