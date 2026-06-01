import { computed, Injectable, signal } from '@angular/core';
import { User, UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly storageKey = 'economia-com-historia.user';
  private readonly tokenStorageKey = 'economia-com-historia.token';
  private readonly userSignal = signal<User | null>(this.readStoredUser());
  private readonly tokenSignal = signal<string | null>(this.readStoredToken());
  private readonly loginPromptSignal = signal<{ operation: string } | null>(null);
  private readonly loginPromptClosingSignal = signal(false);

  readonly user = this.userSignal.asReadonly();
  readonly token = this.tokenSignal.asReadonly();
  readonly loginPrompt = this.loginPromptSignal.asReadonly();
  readonly loginPromptClosing = this.loginPromptClosingSignal.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.userSignal()));
  readonly isAdmin = computed(() => ['writer', 'moderator', 'admin', 'super-admin'].includes(this.userSignal()?.role ?? 'student'));
  readonly canWriteContent = computed(() => ['writer', 'admin', 'super-admin'].includes(this.userSignal()?.role ?? 'student'));
  readonly canModerate = computed(() => ['moderator', 'admin', 'super-admin'].includes(this.userSignal()?.role ?? 'student'));
  readonly isSuperAdmin = computed(() => this.userSignal()?.role === 'super-admin');
  readonly hasPremiumAccess = computed(() => Boolean(this.userSignal()?.hasPremiumAccess || this.isAdmin()));
  readonly canReadJindungo = computed(() => this.hasPremiumAccess());

  loginAs(role: UserRole = 'student', email = 'estudante@economiahistoria.ao'): void {
    this.setUser({
      id: 'demo-user',
      name: role === 'student' ? 'Estudante Angola' : 'Equipa Angola',
      email,
      role,
      hasPremiumAccess: role !== 'student',
      invitedForumIds: [],
      streakDays: 12,
    });
  }

  registerStudent(name: string, email: string, avatarUrl = '', biography = ''): void {
    this.setUser({
      id: `student-${Date.now()}`,
      name,
      email,
      role: 'student',
      avatarUrl: avatarUrl || undefined,
      biography,
      hasPremiumAccess: false,
      invitedForumIds: [],
      streakDays: 0,
    });
  }

  setAuthenticatedUser(user: User, token: string): void {
    this.setToken(token);
    this.setUser(user);
  }

  updateAuthenticatedUser(user: User): void {
    this.setUser(user);
  }

  canAccessForum(roomId: string, visibility: 'public' | 'private'): boolean {
    const user = this.userSignal();
    if (!user) {
      return false;
    }

    return visibility === 'public' || this.isAdmin() || Boolean(user.invitedForumIds?.includes(roomId));
  }

  logout(): void {
    this.setToken(null);
    this.setUser(null);
  }

  subscribeToJindungo(): void {
    this.setUser(this.userSignal() ? { ...this.userSignal()!, hasPremiumAccess: true } : null);
  }

  requireLoginFor(operation: string): void {
    if (!this.isAuthenticated()) {
      this.loginPromptClosingSignal.set(false);
      this.loginPromptSignal.set({ operation });
    }
  }

  closeLoginPrompt(): void {
    if (!this.loginPromptSignal()) {
      return;
    }

    this.loginPromptClosingSignal.set(true);

    window.setTimeout(() => {
      this.loginPromptSignal.set(null);
      this.loginPromptClosingSignal.set(false);
    }, 220);
  }

  private setUser(user: User | null): void {
    this.userSignal.set(user);

    try {
      if (user) {
        window.localStorage.setItem(this.storageKey, JSON.stringify(user));
      } else {
        window.localStorage.removeItem(this.storageKey);
      }
    } catch {
      // Storage can be unavailable in restricted browser contexts.
    }
  }

  private setToken(token: string | null): void {
    this.tokenSignal.set(token);

    try {
      if (token) {
        window.localStorage.setItem(this.tokenStorageKey, token);
      } else {
        window.localStorage.removeItem(this.tokenStorageKey);
      }
    } catch {
      // Storage can be unavailable in restricted browser contexts.
    }
  }

  private readStoredUser(): User | null {
    try {
      const storedUser = window.localStorage.getItem(this.storageKey);
      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser) as User;
    } catch {
      return null;
    }
  }

  private readStoredToken(): string | null {
    try {
      return window.localStorage.getItem(this.tokenStorageKey);
    } catch {
      return null;
    }
  }
}
