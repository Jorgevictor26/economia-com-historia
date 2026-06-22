import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { User, UserRole } from '../models/user.model';
import { AuthStateService } from './auth-state.service';
import { ProfileDashboard } from '../models/profile.model';

interface BackendUser {
  id: number | string;
  name: string;
  email: string;
  photo?: string | null;
  bio?: string | null;
  roles?: Array<{ name: string }>;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
  bio?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly authState = inject(AuthStateService);

  async loadProfile(): Promise<User> {
    const response = await firstValueFrom(this.http.get<ApiResponse<BackendUser>>('/profile'));
    const user = this.toUser(response.data);

    if (this.authState.token()) {
      this.authState.updateAuthenticatedUser(user);
    }

    return user;
  }

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const response = await firstValueFrom(this.http.put<ApiResponse<BackendUser>>('/profile', payload));
    const user = this.toUser(response.data);

    this.authState.updateAuthenticatedUser(user);

    return user;
  }

  getDashboard(): ProfileDashboard {
    return {
      user: {
        name: this.authState.user()?.name ?? 'Utilizador',
        email: this.authState.user()?.email ?? '',
        avatarUrl: this.authState.user()?.avatarUrl ?? '',
        accessLevel: 'Utilizador Comum',
        badge: 'Nível 1',
        description: this.authState.user()?.biography ?? '',
      },
      ranking: {
        currentPosition: 0,
        totalStudents: 0,
        points: 0,
        rows: [],
      },
      domains: [],
      achievements: [],
      rankingAchievements: [],
      learning: {
        title: 'Sem módulo em progresso',
        subtitle: 'Comece por explorar os conteúdos disponíveis.',
        imageUrl: '',
        progress: 0,
      },
      stats: {
        studyHours: 0,
        completedCourses: 0,
        forumPosts: 0,
        completedQuizzes: 0,
      },
    };
  }

  private toUser(user: BackendUser): User {
    const currentUser = this.authState.user();

    return {
      id: String(user.id),
      name: user.name,
      email: user.email,
      role: this.resolveRole(user.roles) ?? currentUser?.role ?? 'student',
      avatarUrl: user.photo || undefined,
      biography: user.bio || undefined,
      hasPremiumAccess: this.hasPremiumAccess(user.roles) || currentUser?.hasPremiumAccess || false,
      invitedForumIds: currentUser?.invitedForumIds ?? [],
      streakDays: currentUser?.streakDays ?? 0,
    };
  }

  private resolveRole(roles: BackendUser['roles'] = []): UserRole | null {
    const roleNames = roles.map((role) => role.name.toLowerCase());

    if (roleNames.includes('super-admin')) {
      return 'super-admin';
    }

    if (roleNames.includes('moderator') || roleNames.includes('moderador')) {
      return 'moderator';
    }

    if (roleNames.includes('writer') || roleNames.includes('escritor')) {
      return 'writer';
    }

    if (roleNames.includes('admin')) {
      return 'admin';
    }

    return roles.length > 0 ? 'student' : null;
  }

  private hasPremiumAccess(roles: BackendUser['roles'] = []): boolean {
    const role = this.resolveRole(roles);

    return Boolean(role && role !== 'student');
  }
}


