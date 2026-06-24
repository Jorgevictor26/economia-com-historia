import { computed, Injectable, signal } from '@angular/core';
import { User, UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly storageKey = 'economia-com-historia.user';
  private readonly tokenStorageKey = 'economia-com-historia.token';
  private readonly rememberStorageKey = 'economia-com-historia.remember';
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

  setAuthenticatedUser(user: User, token: string, remember = true): void {
    this.setToken(token, remember);
    this.setUser(user, remember);
  }

  updateAuthenticatedUser(user: User): void {
    this.setUser(user, this.shouldRemember());
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

  private setUser(user: User | null, remember = true): void {
    this.userSignal.set(user);

    try {
      window.localStorage.removeItem(this.storageKey);
      window.sessionStorage.removeItem(this.storageKey);

      if (user) {
        this.storage(remember).setItem(this.storageKey, JSON.stringify(user));
      }
    } catch {
      // Storage can be unavailable in restricted browser contexts.
    }
  }

  private setToken(token: string | null, remember = true): void {
    this.tokenSignal.set(token);

    try {
      window.localStorage.removeItem(this.tokenStorageKey);
      window.sessionStorage.removeItem(this.tokenStorageKey);

      if (token) {
        this.storage(remember).setItem(this.tokenStorageKey, token);
        window.localStorage.setItem(this.rememberStorageKey, String(remember));
      } else {
        window.localStorage.removeItem(this.rememberStorageKey);
      }
    } catch {
      // Storage can be unavailable in restricted browser contexts.
    }
  }

  private readStoredUser(): User | null {
    try {
      const storedUser = window.localStorage.getItem(this.storageKey) ?? window.sessionStorage.getItem(this.storageKey);
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
      return window.localStorage.getItem(this.tokenStorageKey) ?? window.sessionStorage.getItem(this.tokenStorageKey);
    } catch {
      return null;
    }
  }

  private shouldRemember(): boolean {
    try {
      return window.localStorage.getItem(this.rememberStorageKey) !== 'false';
    } catch {
      return true;
    }
  }

  private storage(remember: boolean): Storage {
    return remember ? window.localStorage : window.sessionStorage;
  }
}
