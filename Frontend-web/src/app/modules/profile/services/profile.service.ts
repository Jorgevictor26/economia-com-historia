import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../../../interfaces/api-response.interface';
import { User, UserRole } from '../../../models/user.model';
import { AuthStateService } from '../../../services/auth-state.service';
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

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const response = await firstValueFrom(this.http.put<ApiResponse<BackendUser>>('/profile', payload));
    const user = this.toUser(response.data);

    this.authState.updateAuthenticatedUser(user);

    return user;
  }

  getDashboard(): ProfileDashboard {
    return {
      user: {
        name: 'Lisandro Acsátimo',
        email: 'lisandro.acsatimo@economiahistoria.ao',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80',
        accessLevel: 'Utilizador Comum',
        badge: 'Nível 44',
        description:
          'Dedicado ao estudo das estruturas macroeconómicas de Luanda e ao seu impacto histórico no desenvolvimento da África Austral.',
      },
      ranking: {
        currentPosition: 12,
        totalStudents: 1450,
        points: 2795,
        rows: [
          { position: 11, name: 'S. Gonçalves', points: 2840 },
          { position: 12, name: 'Tu (Utilizador)', points: 2795, isCurrentUser: true },
          { position: 13, name: 'M. Neto', points: 2710 },
        ],
      },
      domains: [
        {
          title: 'DOMÍNIO: HISTÓRIA DE ANGOLA',
          percent: 75,
          completedTopics: 18,
          pendingTopics: 6,
          color: '#5C1E2F',
        },
        {
          title: 'DOMÍNIO: ECONOMIA APLICADA',
          percent: 50,
          completedTopics: 12,
          pendingTopics: 12,
          color: '#D4AF37',
        },
      ],
      achievements: [
        { icon: 'graduation', name: 'Mestre Colonial', description: 'Rotas marítimas', unlocked: true },
        { icon: 'trend', name: 'Analista Júnior', description: '10 casos práticos', unlocked: true },
        { icon: 'archive', name: 'Arquivista', description: '50 documentos', unlocked: true },
        { icon: 'mentor', name: 'Mentor Sênior', description: 'Fórum activo', unlocked: true },
        { icon: 'medal', name: 'Doutorado', description: 'Bloqueado', unlocked: false },
        { icon: 'wallet', name: 'Investidor', description: 'Bloqueado', unlocked: false },
      ],
      rankingAchievements: [
        {
          position: 5,
          previousPosition: 9,
          quizTitle: 'Quiz: Inflacao, moeda e memoria social',
          quizTopic: 'Economia aplicada',
          score: 92,
          earnedXp: 180,
          achievedAt: '12 Mai 2026',
        },
        {
          position: 3,
          previousPosition: 6,
          quizTitle: 'Quiz: Rotas comerciais do Reino do Kongo',
          quizTopic: 'Historia de Angola',
          score: 96,
          earnedXp: 220,
          achievedAt: '18 Mai 2026',
        },
        {
          position: 4,
          previousPosition: 8,
          quizTitle: 'Quiz: Politica monetaria de Angola',
          quizTopic: 'Macroeconomia',
          score: 89,
          earnedXp: 160,
          achievedAt: '24 Mai 2026',
        },
        {
          position: 2,
          previousPosition: 4,
          quizTitle: 'Quiz: Petroleo e soberania economica',
          quizTopic: 'Textos com Jindungo',
          score: 98,
          earnedXp: 260,
          achievedAt: '27 Mai 2026',
        },
      ],
      learning: {
        title: 'MÓDULO AVANÇADO',
        subtitle: 'A Evolução do Kwanza no Contexto Regional',
        imageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=640&q=80',
        progress: 64,
      },
      stats: {
        studyHours: 124,
        completedCourses: 8,
        forumPosts: 42,
        completedQuizzes: 31,
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
