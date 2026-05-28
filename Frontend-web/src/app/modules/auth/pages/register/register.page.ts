import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthSidePanelComponent } from '../../components/auth-side-panel/auth-side-panel.component';

@Component({
  selector: 'app-register-page',
  imports: [AuthSidePanelComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss',
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);

  readonly isLoading = signal(false);
  readonly submitted = signal(false);

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    acceptedTerms: [false, [Validators.requiredTrue]],
  });

  readonly fullNameInvalid = computed(() => this.isInvalid('fullName'));
  readonly emailInvalid = computed(() => this.isInvalid('email'));
  readonly passwordInvalid = computed(() => this.isInvalid('password'));
  readonly termsInvalid = computed(() => this.isInvalid('acceptedTerms'));
  readonly confirmPasswordInvalid = computed(() => {
    const control = this.form.controls.confirmPassword;
    return (
      (control.invalid || this.passwordsDoNotMatch()) &&
      (control.touched || this.form.controls.password.touched || this.submitted())
    );
  });

  async submit(): Promise<void> {
    this.submitted.set(true);

    if (this.form.invalid || this.passwordsDoNotMatch()) {
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
