import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStateService } from '../../../../services/auth-state.service';
import { AuthSidePanelComponent } from '../../components/auth-side-panel/auth-side-panel.component';

type RegisterStep = 'account' | 'photo' | 'bio';

@Component({
  selector: 'app-register-page',
  imports: [AuthSidePanelComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss',
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthStateService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly submitted = signal(false);
  readonly step = signal<RegisterStep>('account');
  readonly photoSubmitted = signal(false);
  readonly bioSubmitted = signal(false);
  readonly selectedPhotoName = signal('');
  readonly photoPreviewUrl = signal('');
  readonly feedbackMessage = signal('');
  readonly completionPulse = signal(false);

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    acceptedTerms: [false, [Validators.requiredTrue]],
  });
  readonly bioForm = this.fb.nonNullable.group({
    biography: ['', [Validators.required, Validators.minLength(20)]],
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

  async submit(): Promise<void> {
    this.submitted.set(true);

    if (this.form.invalid || this.passwordsDoNotMatch()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.feedbackMessage.set('A preparar os próximos passos do perfil...');
    await new Promise((resolve) => setTimeout(resolve, 700));
    this.isLoading.set(false);
    this.feedbackMessage.set('Conta criada. Agora pode personalizar o seu perfil.');
    this.pulseStep();
    this.step.set('photo');
  }

  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }

    this.selectedPhotoName.set(file.name);
    this.feedbackMessage.set('Foto selecionada. Pode avançar quando estiver pronto.');

    const reader = new FileReader();
    reader.onload = () => this.photoPreviewUrl.set(String(reader.result || ''));
    reader.readAsDataURL(file);
  }

  advanceFromPhoto(): void {
    this.photoSubmitted.set(true);

    if (!this.selectedPhotoName()) {
      this.feedbackMessage.set('Escolha uma foto ou use Pular para continuar sem foto.');
      return;
    }

    this.feedbackMessage.set('Foto adicionada ao perfil. Agora escreva uma biografia.');
    this.pulseStep();
    this.step.set('bio');
  }

  skipPhoto(): void {
    this.selectedPhotoName.set('');
    this.photoPreviewUrl.set('');
    this.feedbackMessage.set('Sem problema. Pode adicionar uma foto mais tarde; agora sugerimos uma biografia.');
    this.pulseStep();
    this.step.set('bio');
  }

  advanceFromBio(): void {
    this.bioSubmitted.set(true);

    if (this.bioForm.invalid) {
      this.bioForm.markAllAsTouched();
      this.feedbackMessage.set('Escreva uma breve biografia para avançar.');
      return;
    }

    this.feedbackMessage.set('Biografia guardada. A finalizar a criação da conta...');
    this.finishRegistration();
  }

  skipBiography(): void {
    this.bioForm.reset({ biography: '' });
    this.feedbackMessage.set('Biografia ignorada. O perfil ficará sem biografia por agora.');
    this.finishRegistration();
  }

  private finishRegistration(): void {
    const { fullName, email } = this.form.getRawValue();
    this.auth.registerStudent(fullName, email, this.photoPreviewUrl(), this.bioForm.controls.biography.value.trim());
    void this.router.navigateByUrl('/app/contents');
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
}
