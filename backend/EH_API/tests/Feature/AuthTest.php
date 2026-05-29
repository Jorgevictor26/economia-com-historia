<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'name' => 'Jorge Victor',
            'email' => 'jorge@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Conta criada com sucesso.')
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'email', 'created_at', 'updated_at'],
                    'token',
                    'token_type',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'jorge@example.com',
            'status' => 'active',
        ]);
    }

    public function test_user_can_login(): void
    {
        $this->postJson('/api/v1/register', [
            'name' => 'Jorge Victor',
            'email' => 'jorge@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertCreated();

        $response = $this->postJson('/api/v1/login', [
            'email' => 'jorge@example.com',
            'password' => 'password123',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Login feito com sucesso.')
            ->assertJsonPath('data.token_type', 'Bearer')
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'email'],
                    'token',
                    'token_type',
                ],
            ]);
    }

    public function test_user_can_logout(): void
    {
        $registerResponse = $this->postJson('/api/v1/register', [
            'name' => 'Jorge Victor',
            'email' => 'jorge@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertCreated();

        $token = $registerResponse->json('data.token');

        $response = $this
            ->withToken($token)
            ->postJson('/api/v1/logout');

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Logout feito com sucesso.');
    }

    public function test_user_cannot_login_with_invalid_credentials(): void
    {
        $this->postJson('/api/v1/register', [
            'name' => 'Jorge Victor',
            'email' => 'jorge@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertCreated();

        $response = $this->postJson('/api/v1/login', [
            'email' => 'jorge@example.com',
            'password' => 'wrong-password',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }
}
