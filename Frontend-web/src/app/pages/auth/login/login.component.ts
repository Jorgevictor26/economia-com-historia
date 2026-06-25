import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthSidePanelComponent } from '../components/auth-side-panel/auth-side-panel.component';
import { AuthService } from '../../../services/auth.service';
import { AuthStateService } from '../../../services/auth-state.service';
import { UserRole } from '../../../models/user.model';

@Component({
  selector: 'app-login',
  imports: [AuthSidePanelComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly submitted = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [false],
  });

  readonly emailInvalid = computed(() => this.isInvalid('email'));
  readonly passwordInvalid = computed(() => this.isInvalid('password'));

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
}

