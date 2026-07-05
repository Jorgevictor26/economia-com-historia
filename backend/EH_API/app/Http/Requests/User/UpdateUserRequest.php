<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($this->user()?->id),
            ],
            'photo' => ['nullable', 'string'],
            'avatar_url' => ['nullable', 'string'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ];
    }

    public function validated($key = null, $default = null)
    {
        $validated = parent::validated($key, $default);
        
        // Map avatar_url to photo for backend compatibility
        if (isset($validated['avatar_url']) && !isset($validated['photo'])) {
            $validated['photo'] = $validated['avatar_url'];
            unset($validated['avatar_url']);
        }
        
        return $validated;
    }
}
