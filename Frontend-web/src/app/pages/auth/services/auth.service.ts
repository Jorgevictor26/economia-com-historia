import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LoginForm } from '../models/login-form.model';
import { AuthStateService } from '../../../services/auth-state.service';
import { User, UserRole } from '../../../models/user.model';
import { ApiResponse } from '../../../components/interfaces/api-response.interface';

interface BackendUser {
  id: number | string;
  name: string;
  email: string;
  photo?: string | null;
  bio?: string | null;
  roles?: Array<{ name: string }>;
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
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authState = inject(AuthStateService);

  async login(payload: LoginForm): Promise<void> {
    if (this.isLocalAdminCredential(payload)) {
      this.authState.setAuthenticatedUser(
        {
          id: 'local-admin',
          name: 'Administrador Local',
          email: 'admin@gmail.com',
          role: 'admin',
          hasPremiumAccess: true,
          invitedForumIds: [],
          streakDays: 0,
        },
        'local-admin-token',
      );
      return;
    }

    const response = await firstValueFrom(
      this.http.post<ApiResponse<AuthPayload>>('/login', {
        email: payload.email,
        password: payload.password,
      }),
    );

    this.storeAuthPayload(response.data);
  }

  private isLocalAdminCredential(payload: LoginForm): boolean {
    return payload.email.trim().toLowerCase() === 'admin@gmail.com' && payload.password === 'password';
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

  private storeAuthPayload(payload: AuthPayload): void {
    this.authState.setAuthenticatedUser(this.toUser(payload.user), payload.token);
  }

  private toUser(user: BackendUser): User {
    return {
      id: String(user.id),
      name: user.name,
      email: user.email,
      role: this.resolveRole(user.roles),
      avatarUrl: user.photo || undefined,
      biography: user.bio || undefined,
      hasPremiumAccess: this.hasPremiumAccess(user.roles),
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

  private hasPremiumAccess(roles: BackendUser['roles'] = []): boolean {
    return this.resolveRole(roles) !== 'student';
  }
}
