import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthSidePanelComponent } from '../components/auth-side-panel/auth-side-panel.component';

@Component({
  selector: 'app-reset-password-page',
  imports: [AuthSidePanelComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.page.html',
  styleUrl: './reset-password.page.scss',
})
export class ResetPasswordPage {
  private readonly fb = inject(FormBuilder);

  readonly isLoading = signal(false);
  readonly submitted = signal(false);
  readonly passwordVisible = signal(false);
  readonly confirmPasswordVisible = signal(false);

  readonly form = this.fb.nonNullable.group({
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

  togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible.update((visible) => !visible);
  }

  async submit(): Promise<void> {
    this.submitted.set(true);

    if (this.form.invalid || this.passwordsDoNotMatch() || !this.hasUppercase() || !this.hasNumber()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    this.isLoading.set(false);
  }

  private passwordsDoNotMatch(): boolean {
    const { password, confirmPassword } = this.form.getRawValue();
    return Boolean(confirmPassword) && password !== confirmPassword;
  }

  private isInvalid(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted());
  }
}

