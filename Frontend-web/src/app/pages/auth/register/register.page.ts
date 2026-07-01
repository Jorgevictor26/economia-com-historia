import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthSidePanelComponent } from '../components/auth-side-panel/auth-side-panel.component';
import { AuthService, RegisterPayload } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

type RegisterStep = 'account' | 'photo' | 'bio';

@Component({
  selector: 'app-register-page',
  imports: [AuthSidePanelComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss',
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly isLoading = signal(false);
  readonly submitted = signal(false);
  readonly step = signal<RegisterStep>('account');
  readonly photoSubmitted = signal(false);
  readonly bioSubmitted = signal(false);
  readonly selectedPhotoName = signal('');
  readonly photoPreviewUrl = signal('');
  readonly feedbackMessage = signal('');
  readonly completionPulse = signal(false);
  readonly passwordVisible = signal(false);
  readonly confirmPasswordVisible = signal(false);

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    acceptedTerms: [false, [Validators.requiredTrue]],
  });
  readonly bioForm = this.fb.nonNullable.group({
    biography: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(150)]],
  });

  readonly initials = computed(() => {
    const names = this.form.controls.fullName.value.split(' ').filter(Boolean);
    return names
      .slice(0, 2)
      .map((name) => name[0])
      .join('')
      .toUpperCase();
  });
  readonly fullNameInvalid = computed(() => this.isInvalid('fullName'));
  readonly emailInvalid = computed(() => this.isInvalid('email'));
  readonly passwordInvalid = computed(() => this.isInvalid('password'));
  readonly termsInvalid = computed(() => this.isInvalid('acceptedTerms'));
  readonly photoInvalid = computed(() => this.photoSubmitted() && !this.selectedPhotoName());
  readonly biographyInvalid = computed(() => {
    const control = this.bioForm.controls.biography;
    return control.invalid && (control.touched || this.bioSubmitted());
  });
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

    if (this.form.invalid || this.passwordsDoNotMatch()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.showSuccess('Dados validados. Agora pode personalizar o seu perfil.');
    this.isLoading.set(false);
    this.pulseStep();
    this.step.set('photo');
  }

  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }

    this.selectedPhotoName.set(file.name);
    this.showSuccess('Foto selecionada. Pode avançar quando estiver pronto.');

    const reader = new FileReader();
    reader.onload = () => this.photoPreviewUrl.set(String(reader.result || ''));
    reader.readAsDataURL(file);
  }

  advanceFromPhoto(): void {
    this.photoSubmitted.set(true);

    if (!this.selectedPhotoName()) {
      this.showError('Escolha uma foto ou use Pular para continuar sem foto.');
      return;
    }

    this.showSuccess('Foto adicionada ao perfil. Agora escreva uma biografia.');
    this.pulseStep();
    this.step.set('bio');
  }

  skipPhoto(): void {
    this.selectedPhotoName.set('');
    this.photoPreviewUrl.set('');
    this.showSuccess('Sem problema. Pode adicionar uma foto mais tarde; agora sugerimos uma biografia.');
    this.pulseStep();
    this.step.set('bio');
  }

  advanceFromBio(): void {
    this.bioSubmitted.set(true);

    if (this.bioForm.invalid) {
      this.bioForm.markAllAsTouched();
      this.showError('Escreva uma breve biografia para avançar.');
      return;
    }

    this.showSuccess('Biografia guardada. A finalizar a criação da conta...');
    void this.finishRegistration();
  }

  skipBiography(): void {
    this.bioForm.reset({ biography: '' });
    this.showSuccess('Biografia ignorada. O perfil ficará sem biografia por agora.');
    void this.finishRegistration();
  }

  private async finishRegistration(): Promise<void> {
    const { fullName, email, password, confirmPassword } = this.form.getRawValue();
    const biography = this.bioForm.controls.biography.value.trim().slice(0, 150);
    const payload: RegisterPayload = {
      name: fullName,
      email,
      password,
      password_confirmation: confirmPassword,
    };

    if (this.photoPreviewUrl()) {
      payload.photo = this.photoPreviewUrl();
    }

    if (biography) {
      payload.bio = biography;
      payload.biography = biography;
    }

    this.isLoading.set(true);

    try {
      await this.authService.register(payload);
      await this.router.navigateByUrl('/app/home');
    } catch (error) {
      this.showError(this.extractErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  private pulseStep(): void {
    this.completionPulse.set(true);
    window.setTimeout(() => this.completionPulse.set(false), 650);
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

    return 'Não foi possível criar a conta. Verifique se a API está ativa e tente novamente.';
  }

  private showSuccess(message: string): void {
    this.feedbackMessage.set('');
    this.toastService.success(message);
  }

  private showError(message: string): void {
    this.feedbackMessage.set('');
    this.toastService.error(message);
  }
}


