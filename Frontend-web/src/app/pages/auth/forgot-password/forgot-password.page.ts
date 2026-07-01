import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthSidePanelComponent } from '../components/auth-side-panel/auth-side-panel.component';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-forgot-password-page',
  imports: [AuthSidePanelComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.page.html',
  styleUrl: './forgot-password.page.scss',
})
export class ForgotPasswordPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly isLoading = signal(false);
  readonly submitted = signal(false);
  readonly sent = signal(false);
  readonly feedbackMessage = signal('');
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  readonly emailInvalid = computed(() => {
    const control = this.form.controls.email;
    return control.invalid && (control.touched || this.submitted());
  });

  async submit(): Promise<void> {
    this.submitted.set(true);
    this.sent.set(false);
    this.feedbackMessage.set('');
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    try {
      const message = await this.authService.forgotPassword(this.form.getRawValue());
      this.feedbackMessage.set('');
      this.toastService.success(message);
      this.sent.set(true);
    } catch (error) {
      const message = this.extractErrorMessage(error);
      this.errorMessage.set('');
      this.toastService.error(message);
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

    return 'Não foi possível enviar o email de recuperação. Verifique se a API está ativa e tente novamente.';
  }
}

