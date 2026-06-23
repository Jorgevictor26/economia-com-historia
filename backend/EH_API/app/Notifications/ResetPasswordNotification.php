<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Config;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $token,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function token(): string
    {
        return $this->token;
    }

    public function toMail(object $notifiable): MailMessage
    {
        $resetUrl = $this->resetUrl($notifiable->email);

        return (new MailMessage)
            ->subject('Recuperar senha')
            ->greeting('Olá!')
            ->line('Recebemos um pedido para recuperar a senha da sua conta.')
            ->when(
                $resetUrl !== null,
                fn (MailMessage $message) => $message
                    ->action('Alterar senha', $resetUrl)
                    ->line('Se o botão não funcionar, copie e cole o link no navegador: '.$resetUrl),
                fn (MailMessage $message) => $message
                    ->line('Use este token para alterar a sua senha: '.$this->token)
                    ->line('Email: '.$notifiable->email)
            )
            ->line('Este pedido expira em '.Config::get('auth.passwords.users.expire', 60).' minutos.')
            ->line('Se você não pediu esta alteração, ignore este email.');
    }

    private function resetUrl(string $email): ?string
    {
        $baseUrl = Config::get('app.frontend_password_reset_url')
            ?? Config::get('app.frontend_url');

        if (! $baseUrl) {
            return null;
        }

        return rtrim($baseUrl, '/').'?'.http_build_query([
            'token' => $this->token,
            'email' => $email,
        ]);
    }
}
