<?php

namespace App\Http\Requests\Reaction;

use Illuminate\Foundation\Http\FormRequest;

class StoreReactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content_id' => 'required|exists:contents,id',
            'reaction_type' => 'required|in:like,love,haha,wow,sad,angry'
        ];
    }
}
