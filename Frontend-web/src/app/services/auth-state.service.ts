import { computed, Injectable, signal } from '@angular/core';
import { User, UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly storageKey = 'economia-com-historia.user';
  private readonly userSignal = signal<User | null>(this.readStoredUser());
  private readonly loginPromptSignal = signal<{ operation: string } | null>(null);
  private readonly loginPromptClosingSignal = signal(false);

  readonly user = this.userSignal.asReadonly();
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

  canAccessForum(roomId: string, visibility: 'public' | 'private'): boolean {
    const user = this.userSignal();
    if (!user) {
      return false;
    }

    return visibility === 'public' || this.isAdmin() || Boolean(user.invitedForumIds?.includes(roomId));
  }

  logout(): void {
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
}
