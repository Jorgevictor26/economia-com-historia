<?php

namespace App\Http\Requests\Auth;

use App\DTOs\Auth\ForgotPasswordDTO;
use Illuminate\Foundation\Http\FormRequest;

class ForgotPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:255'],
        ];
    }

    public function toDTO(): ForgotPasswordDTO
    {
        return ForgotPasswordDTO::fromArray($this->validated());
    }
}
