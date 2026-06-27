import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LoginForm } from '../models/login-form.model';
import { AuthStateService } from './auth-state.service';
import { User, UserRole } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';

interface BackendUser {
  id: number | string;
  name: string;
  email: string;
  photo?: string | null;
  bio?: string | null;
  roles?: Array<{ name: string }>;
  jindungo_subscription_expires_at?: string | null;
}

interface AuthPayload {
  user: BackendUser;
  token: string;
  token_type: 'Bearer' | string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  photo?: string;
  bio?: string;
  biography?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authState = inject(AuthStateService);

  async login(payload: LoginForm): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<AuthPayload>>('/login', {
        email: payload.email,
        password: payload.password,
      }),
    );

    this.storeAuthPayload(response.data, payload.rememberMe);
  }

  async register(payload: RegisterPayload): Promise<void> {
    const response = await firstValueFrom(this.http.post<ApiResponse<AuthPayload>>('/register', payload));
    this.storeAuthPayload(response.data);
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post<ApiResponse<null>>('/logout', null));
    } finally {
      this.authState.logout();
    }
  }

  async forgotPassword(payload: ForgotPasswordPayload): Promise<string> {
    const response = await firstValueFrom(this.http.post<ApiResponse<null>>('/forgot-password', payload));

    return response.message;
  }

  async resetPassword(payload: ResetPasswordPayload): Promise<string> {
    const response = await firstValueFrom(this.http.post<ApiResponse<null>>('/reset-password', payload));

    return response.message;
  }

  private storeAuthPayload(payload: AuthPayload, remember = true): void {
    this.authState.setAuthenticatedUser(this.toUser(payload.user), payload.token, remember);
  }

  private toUser(user: BackendUser): User {
    return {
      id: String(user.id),
      name: user.name,
      email: user.email,
      role: this.resolveRole(user.roles),
      avatarUrl: user.photo || undefined,
      biography: user.bio || undefined,
      hasPremiumAccess: this.hasPremiumAccess(user),
      invitedForumIds: [],
      streakDays: 0,
    };
  }

  private resolveRole(roles: BackendUser['roles'] = []): UserRole {
    const roleNames = roles.map((role) => role.name.toLowerCase());

    if (roleNames.includes('super-admin')) {
      return 'super-admin';
    }

    if (roleNames.includes('admin')) {
      return 'admin';
    }

    if (roleNames.includes('moderator') || roleNames.includes('moderador')) {
      return 'moderator';
    }

    if (roleNames.includes('writer') || roleNames.includes('escritor')) {
      return 'writer';
    }

    return 'student';
  }

  private hasPremiumAccess(user: BackendUser): boolean {
    return this.resolveRole(user.roles) !== 'student' || Boolean(user.jindungo_subscription_expires_at);
  }
}

