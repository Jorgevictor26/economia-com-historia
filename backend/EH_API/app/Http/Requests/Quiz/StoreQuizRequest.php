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
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:active,inactive,ativo,inativo'],
            'difficulty' => ['required', 'string', 'in:Fácil,Facil,facil,fácil,Média,Media,medio,médio,Difícil,Dificil,dificil,difícil'],
            'xp_per_question' => ['prohibited'],
            'time_limit' => ['prohibited'],
        ];
    }
}
