import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthSidePanelComponent } from '../../components/auth-side-panel/auth-side-panel.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [AuthSidePanelComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly submitted = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
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
    await this.authService.login(this.form.getRawValue());
    this.isLoading.set(false);
    await this.router.navigateByUrl('/app/contents');
  }

  private isInvalid(controlName: 'email' | 'password'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted());
  }
}
