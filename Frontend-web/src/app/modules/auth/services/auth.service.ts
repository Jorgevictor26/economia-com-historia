import { inject, Injectable } from '@angular/core';
import { LoginForm } from '../models/login-form.model';
import { AuthStateService } from '../../../services/auth-state.service';
import { UserRole } from '../../../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authState = inject(AuthStateService);

  login(payload: LoginForm): Promise<void> {
    return new Promise((resolve) => {
      console.info('Login pronto para integrar com API REST', payload);
      setTimeout(() => {
        this.authState.loginAs(this.resolveDemoRole(payload.email), payload.email);
        resolve();
      }, 700);
    });
  }

  private resolveDemoRole(email: string): UserRole {
    const normalizedEmail = email.toLowerCase();

    if (normalizedEmail.includes('super')) {
      return 'super-admin';
    }

    if (normalizedEmail.includes('moderador')) {
      return 'moderator';
    }

    if (normalizedEmail.includes('escritor')) {
      return 'writer';
    }

    if (normalizedEmail.includes('admin')) {
      return 'admin';
    }

    return 'student';
  }
}
