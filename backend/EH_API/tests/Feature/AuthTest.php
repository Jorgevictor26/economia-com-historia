<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
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

    public function test_user_can_request_password_reset_link(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'jorge@example.com',
        ]);

        $response = $this->postJson('/api/v1/forgot-password', [
            'email' => 'jorge@example.com',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Se o email existir, enviaremos as instruções para recuperar a senha.');

        Notification::assertSentTo($user, ResetPasswordNotification::class);
        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => 'jorge@example.com',
        ]);
    }

    public function test_password_reset_request_does_not_expose_unknown_email(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/v1/forgot-password', [
            'email' => 'missing@example.com',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Se o email existir, enviaremos as instruções para recuperar a senha.');

        Notification::assertNothingSent();
    }

    public function test_user_can_reset_password_with_valid_token(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'jorge@example.com',
            'password' => Hash::make('old-password'),
        ]);

        $this->postJson('/api/v1/forgot-password', [
            'email' => 'jorge@example.com',
        ])->assertOk();

        $token = null;

        Notification::assertSentTo(
            $user,
            ResetPasswordNotification::class,
            function (ResetPasswordNotification $notification) use (&$token) {
                $token = $notification->token();

                return true;
            }
        );

        $response = $this->postJson('/api/v1/reset-password', [
            'email' => 'jorge@example.com',
            'token' => $token,
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Senha alterada com sucesso.');

        $this->assertTrue(Hash::check('new-password', $user->fresh()->password));
        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => 'jorge@example.com',
        ]);
    }

    public function test_user_cannot_reset_password_with_invalid_token(): void
    {
        User::factory()->create([
            'email' => 'jorge@example.com',
            'password' => Hash::make('old-password'),
        ]);

        $response = $this->postJson('/api/v1/reset-password', [
            'email' => 'jorge@example.com',
            'token' => 'invalid-token',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }
}
