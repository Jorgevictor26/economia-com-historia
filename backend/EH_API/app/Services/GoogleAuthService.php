<?php

namespace App\Services;

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class GoogleAuthService
{
    private const GOOGLE_ISSUERS = [
        'accounts.google.com',
        'https://accounts.google.com',
    ];

    public function authenticate(string $idToken): User
    {
        $payload = $this->verifyIdToken($idToken);

        return DB::transaction(function () use ($payload): User {
            $googleId = $payload['google_id'] ?? null;
            $firebaseUid = $payload['firebase_uid'] ?? null;
            $email = strtolower((string) $payload['email']);

            $user = User::query()
                ->where('email', $email)
                ->when($googleId, fn ($query) => $query->orWhere('google_id', $googleId))
                ->when($firebaseUid, fn ($query) => $query->orWhere('firebase_uid', $firebaseUid))
                ->first();

            if ($user) {
                if ($user->status !== 'active') {
                    throw ValidationException::withMessages([
                        'email' => ['Esta conta nao esta ativa.'],
                    ]);
                }

                $updates = [];
                if ($googleId) {
                    $updates['google_id'] = $googleId;
                }
                if ($firebaseUid) {
                    $updates['firebase_uid'] = $firebaseUid;
                }
                if (! $user->photo && ! empty($payload['picture'])) {
                    $updates['photo'] = $payload['picture'];
                }
                if (! $user->name && ! empty($payload['name'])) {
                    $updates['name'] = $payload['name'];
                }

                if ($updates !== []) {
                    $user->forceFill($updates)->save();
                }

                return $user->fresh(['roles']);
            }

            $user = User::query()->create([
                'name' => $payload['name'] ?? $email,
                'email' => $email,
                'google_id' => $googleId,
                'firebase_uid' => $firebaseUid,
                'password' => Hash::make(Str::random(48)),
                'photo' => $payload['picture'] ?? null,
                'status' => 'active',
            ]);

            $role = Role::query()->firstOrCreate(
                ['name' => 'user'],
                ['description' => 'Utilizador normal que pode visualizar conteudos e quizzes.']
            );

            $user->roles()->syncWithoutDetaching([
                $role->id => ['created_at' => now()],
            ]);

            return $user->fresh(['roles']);
        });
    }

    private function verifyIdToken(string $idToken): array
    {
        $issuer = $this->unverifiedIssuer($idToken);

        if (in_array($issuer, self::GOOGLE_ISSUERS, true)) {
            return $this->verifyGoogleIdToken($idToken);
        }

        if (is_string($issuer) && str_starts_with($issuer, 'https://securetoken.google.com/')) {
            return $this->verifyFirebaseIdToken($idToken);
        }

        try {
            return $this->verifyGoogleIdToken($idToken);
        } catch (ValidationException) {
            return $this->verifyFirebaseIdToken($idToken);
        }
    }

    private function verifyGoogleIdToken(string $idToken): array
    {
        $clientIds = config('services.google.client_ids', []);
        if (empty($clientIds)) {
            throw ValidationException::withMessages([
                'id_token' => ['Autenticacao Google nao configurada.'],
            ]);
        }

        $parts = explode('.', $idToken);
        if (count($parts) !== 3) {
            throw ValidationException::withMessages([
                'id_token' => ['Token Google invalido.'],
            ]);
        }

        $header = $this->decodeJwtPart($parts[0]);
        $payload = $this->decodeJwtPart($parts[1]);
        $signature = $this->base64UrlDecode($parts[2]);
        $kid = $header['kid'] ?? null;

        if (($header['alg'] ?? null) !== 'RS256' || ! $kid) {
            throw ValidationException::withMessages([
                'id_token' => ['Token Google invalido.'],
            ]);
        }

        $certificates = $this->certificates(
            'google_oauth_public_keys',
            'https://www.googleapis.com/oauth2/v1/certs'
        );

        $certificate = $certificates[$kid] ?? null;
        if (! $certificate || openssl_verify($parts[0].'.'.$parts[1], $signature, $certificate, OPENSSL_ALGO_SHA256) !== 1) {
            throw ValidationException::withMessages([
                'id_token' => ['Token Google invalido.'],
            ]);
        }

        $now = time();
        $issuer = $payload['iss'] ?? null;
        $audience = $payload['aud'] ?? null;
        $email = $payload['email'] ?? null;
        $subject = $payload['sub'] ?? null;
        $emailVerified = filter_var($payload['email_verified'] ?? false, FILTER_VALIDATE_BOOL);

        if (! in_array($issuer, self::GOOGLE_ISSUERS, true) ||
            ! $this->audienceMatches($audience, $clientIds) ||
            ! $subject ||
            ($payload['exp'] ?? 0) <= $now ||
            ($payload['iat'] ?? PHP_INT_MAX) > $now + 60 ||
            ! $email ||
            ! $emailVerified) {
            throw ValidationException::withMessages([
                'id_token' => ['Token Google invalido.'],
            ]);
        }

        return [
            'provider' => 'google',
            'google_id' => (string) $subject,
            'firebase_uid' => null,
            'email' => $email,
            'name' => $payload['name'] ?? null,
            'picture' => $payload['picture'] ?? null,
        ];
    }

    private function verifyFirebaseIdToken(string $idToken): array
    {
        $projectId = config('services.firebase.project_id');
        if (! $projectId) {
            throw ValidationException::withMessages([
                'id_token' => ['Autenticacao Firebase nao configurada.'],
            ]);
        }

        $parts = explode('.', $idToken);
        if (count($parts) !== 3) {
            throw ValidationException::withMessages([
                'id_token' => ['Token Firebase invalido.'],
            ]);
        }

        $header = $this->decodeJwtPart($parts[0]);
        $payload = $this->decodeJwtPart($parts[1]);
        $signature = $this->base64UrlDecode($parts[2]);
        $kid = $header['kid'] ?? null;

        if (($header['alg'] ?? null) !== 'RS256' || ! $kid) {
            throw ValidationException::withMessages([
                'id_token' => ['Token Firebase invalido.'],
            ]);
        }

        $certificates = $this->certificates(
            'firebase_auth_public_keys',
            'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
        );

        $certificate = $certificates[$kid] ?? null;
        if (! $certificate || openssl_verify($parts[0].'.'.$parts[1], $signature, $certificate, OPENSSL_ALGO_SHA256) !== 1) {
            throw ValidationException::withMessages([
                'id_token' => ['Token Firebase invalido.'],
            ]);
        }

        $now = time();
        $issuer = "https://securetoken.google.com/{$projectId}";
        $emailVerified = filter_var($payload['email_verified'] ?? false, FILTER_VALIDATE_BOOL);
        $subject = $payload['sub'] ?? null;
        $googleIds = $payload['firebase']['identities']['google.com'] ?? [];

        if (($payload['iss'] ?? null) !== $issuer ||
            ($payload['aud'] ?? null) !== $projectId ||
            ! $subject ||
            strlen((string) $subject) > 128 ||
            ($payload['exp'] ?? 0) <= $now ||
            ($payload['iat'] ?? PHP_INT_MAX) > $now + 60 ||
            empty($payload['email']) ||
            ! $emailVerified) {
            throw ValidationException::withMessages([
                'id_token' => ['Token Firebase invalido.'],
            ]);
        }

        return [
            'provider' => 'firebase',
            'google_id' => is_array($googleIds) ? ($googleIds[0] ?? null) : null,
            'firebase_uid' => (string) $subject,
            'email' => $payload['email'],
            'name' => $payload['name'] ?? null,
            'picture' => $payload['picture'] ?? null,
        ];
    }

    private function decodeJwtPart(string $value): array
    {
        $decoded = json_decode($this->base64UrlDecode($value), true);
        if (! is_array($decoded)) {
            throw ValidationException::withMessages([
                'id_token' => ['Token invalido.'],
            ]);
        }

        return $decoded;
    }

    private function unverifiedIssuer(string $idToken): ?string
    {
        $parts = explode('.', $idToken);
        if (count($parts) !== 3) {
            return null;
        }

        try {
            $payload = $this->decodeJwtPart($parts[1]);
        } catch (ValidationException) {
            return null;
        }

        return is_string($payload['iss'] ?? null) ? $payload['iss'] : null;
    }

    private function audienceMatches(mixed $audience, array $clientIds): bool
    {
        if (is_string($audience)) {
            return in_array($audience, $clientIds, true);
        }

        if (is_array($audience)) {
            return ! empty(array_intersect($audience, $clientIds));
        }

        return false;
    }

    private function certificates(string $cacheKey, string $url): array
    {
        $cached = Cache::get($cacheKey);
        if (is_array($cached) && $cached !== []) {
            return $cached;
        }

        try {
            $response = Http::timeout(10)->get($url);
        } catch (\Throwable) {
            return [];
        }

        $certificates = $response->ok() && is_array($response->json())
            ? $response->json()
            : [];

        if ($certificates !== []) {
            Cache::put($cacheKey, $certificates, now()->addHour());
        }

        return $certificates;
    }

    private function base64UrlDecode(string $value): string
    {
        $remainder = strlen($value) % 4;
        if ($remainder > 0) {
            $value .= str_repeat('=', 4 - $remainder);
        }

        $decoded = base64_decode(strtr($value, '-_', '+/'), true);
        if ($decoded === false) {
            throw ValidationException::withMessages([
                'id_token' => ['Token invalido.'],
            ]);
        }

        return $decoded;
    }
}
