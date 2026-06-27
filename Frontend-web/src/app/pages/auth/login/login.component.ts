import { AfterViewInit, Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthSidePanelComponent } from '../components/auth-side-panel/auth-side-panel.component';
import { AuthService } from '../../../services/auth.service';
import { AuthStateService } from '../../../services/auth-state.service';
import { UserRole } from '../../../models/user.model';
import { environmentConfig } from '../../../services/environment.config';

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleJwtPayload {
  sub?: string;
  name?: string;
  email?: string;
  picture?: string;
}

interface GoogleIdentityApi {
  accounts: {
    id: {
      initialize(config: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        ux_mode?: 'popup' | 'redirect';
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
      }): void;
      renderButton(parent: HTMLElement, options: Record<string, string | number | boolean>): void;
      prompt(): void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentityApi;
  }
}

@Component({
  selector: 'app-login',
  imports: [AuthSidePanelComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements AfterViewInit {
  @ViewChild('googleButtonHost') private readonly googleButtonHost?: ElementRef<HTMLElement>;

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly submitted = signal(false);
  readonly errorMessage = signal('');
  readonly passwordVisible = signal(false);
  readonly googleReady = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [false],
  });

  readonly emailInvalid = computed(() => this.isInvalid('email'));
  readonly passwordInvalid = computed(() => this.isInvalid('password'));

  togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  startGoogleLogin(): void {
    if (window.google?.accounts?.id && this.googleReady()) {
      window.google.accounts.id.prompt();
      return;
    }

    this.errorMessage.set('Configure o Google Client ID para ativar a seleção de contas Google.');
  }

  ngAfterViewInit(): void {
    void this.setupGoogleLogin();
  }

  async submit(): Promise<void> {
    this.submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      await this.authService.login(this.form.getRawValue());
      await this.router.navigateByUrl(this.routeForRole(this.authState.user()?.role));
    } catch (error) {
      this.errorMessage.set(this.extractErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const validationErrors = error.error?.errors;
      const firstError = validationErrors ? Object.values(validationErrors)[0] : null;

      if (Array.isArray(firstError) && firstError[0]) {
        return String(firstError[0]);
      }

      if (error.error?.message) {
        return String(error.error.message);
      }
    }

    return 'Não foi possível entrar. Verifique se a API está ativa e tente novamente.';
  }

  private routeForRole(role: UserRole | undefined): string {
    if (role === 'super-admin' || role === 'admin' || role === 'writer' || role === 'moderator') {
      return '/admin';
    }

    return '/app/home';
  }

  private isInvalid(controlName: 'email' | 'password'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted());
  }

  private async setupGoogleLogin(): Promise<void> {
    const clientId = environmentConfig.googleClientId;

    if (!clientId || clientId.startsWith('COLOQUE_AQUI')) {
      this.googleReady.set(false);
      return;
    }

    try {
      await this.loadGoogleIdentityScript();
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => this.handleGoogleCredential(response),
        ux_mode: 'popup',
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      const host = this.googleButtonHost?.nativeElement;
      if (!host || !window.google) {
        return;
      }

      host.innerHTML = '';
      window.google.accounts.id.renderButton(host, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 420,
        locale: 'pt',
      });
      this.googleReady.set(true);
    } catch {
      this.googleReady.set(false);
      this.errorMessage.set('Não foi possível carregar o login com Google.');
    }
  }

  private loadGoogleIdentityScript(): Promise<void> {
    if (window.google?.accounts?.id) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.head.appendChild(script);
    });
  }

  private handleGoogleCredential(response: GoogleCredentialResponse): void {
    if (!response.credential) {
      this.errorMessage.set('Não foi possível obter a conta Google selecionada.');
      return;
    }

    const profile = this.decodeGoogleCredential(response.credential);

    if (!profile?.email) {
      this.errorMessage.set('A conta Google selecionada não devolveu um e-mail válido.');
      return;
    }

    this.authState.setAuthenticatedUser(
      {
        id: `google-${profile.sub || profile.email}`,
        name: profile.name || profile.email,
        email: profile.email,
        role: 'student',
        avatarUrl: profile.picture,
        hasPremiumAccess: false,
        invitedForumIds: [],
        streakDays: 0,
      },
      response.credential,
      true,
    );
    void this.router.navigateByUrl('/app/home');
  }

  private decodeGoogleCredential(credential: string): GoogleJwtPayload | null {
    try {
      const payload = credential.split('.')[1];
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = window.atob(normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '='));
      const json = decodeURIComponent(
        Array.from(decoded)
          .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
          .join(''),
      );

      return JSON.parse(json) as GoogleJwtPayload;
    } catch {
      return null;
    }
  }
}

