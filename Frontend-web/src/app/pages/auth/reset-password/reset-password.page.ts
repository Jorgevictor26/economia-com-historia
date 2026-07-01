import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthSidePanelComponent } from '../components/auth-side-panel/auth-side-panel.component';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-reset-password-page',
  imports: [AuthSidePanelComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.page.html',
  styleUrl: './reset-password.page.scss',
})
export class ResetPasswordPage {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly isLoading = signal(false);
  readonly submitted = signal(false);
  readonly passwordVisible = signal(false);
  readonly confirmPasswordVisible = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    token: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  readonly password = computed(() => this.form.controls.password.value);
  readonly hasMinLength = computed(() => this.password().length >= 8);
  readonly hasUppercase = computed(() => /[A-Z]/.test(this.password()));
  readonly hasNumber = computed(() => /\d/.test(this.password()));
  readonly passwordInvalid = computed(() => this.isInvalid('password'));
  readonly confirmPasswordInvalid = computed(() => {
    const control = this.form.controls.confirmPassword;
    return (
      (control.invalid || this.passwordsDoNotMatch()) &&
      (control.touched || this.form.controls.password.touched || this.submitted())
    );
  });
  readonly emailInvalid = computed(() => this.isInvalid('email'));
  readonly tokenInvalid = computed(() => this.isInvalid('token'));

  ngOnInit(): void {
    const query = this.route.snapshot.queryParamMap;
    const token = query.get('token') ?? this.route.snapshot.paramMap.get('token') ?? '';
    const email = query.get('email') ?? '';

    this.form.patchValue({ token, email });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible.update((visible) => !visible);
  }

  async submit(): Promise<void> {
    this.submitted.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.form.invalid || this.passwordsDoNotMatch() || !this.hasUppercase() || !this.hasNumber()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    try {
      const { email, token, password, confirmPassword } = this.form.getRawValue();
      const message = await this.authService.resetPassword({
        email,
        token,
        password,
        password_confirmation: confirmPassword,
      });

      this.successMessage.set('');
      this.toastService.success(message);

      window.setTimeout(() => {
        void this.router.navigateByUrl('/auth/login');
      }, 900);
    } catch (error) {
      const message = this.extractErrorMessage(error);
      this.errorMessage.set('');
      this.toastService.error(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  private passwordsDoNotMatch(): boolean {
    const { password, confirmPassword } = this.form.getRawValue();
    return Boolean(confirmPassword) && password !== confirmPassword;
  }

  private isInvalid(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted());
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

    return 'Não foi possível redefinir a palavra-passe. Verifique o link e tente novamente.';
  }
}
