import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthStateService } from '../../../../services/auth-state.service';
import { ProfileService } from '../../services/profile.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  active?: boolean;
}

interface ProfileSearchResult {
  label: string;
  detail: string;
  route: string;
}

@Component({
  selector: 'app-edit-profile-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './edit-profile.page.html',
  styleUrl: './edit-profile.page.scss',
})
export class EditProfilePage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);
  readonly auth = inject(AuthStateService);

  readonly sidebarOpen = signal(false);
  readonly notificationsOpen = signal(false);
  readonly searchTerm = signal('');
  readonly dashboard = signal(this.profileService.getDashboard());
  readonly accessLevel = computed(() => this.dashboard().user.accessLevel);

  readonly form = this.formBuilder.nonNullable.group({
    fullName: [this.dashboard().user.name, [Validators.required, Validators.minLength(3)]],
    email: [this.dashboard().user.email, [Validators.required, Validators.email]],
    biography: [this.dashboard().user.description, [Validators.required, Validators.maxLength(260)]],
    newPassword: [''],
    confirmPassword: [''],
    weeklySummary: [true],
    contentAlerts: [false],
  });

  readonly platformItems: MenuItem[] = [{ label: 'Painel Global', icon: 'dashboard', route: '/app/profile' }];
  readonly administrationItems: MenuItem[] = [
    { label: 'Minha Aprendizagem', icon: 'school', route: '/app/contents' },
    { label: 'Conquistas', icon: 'military_tech', route: '/app/profile' },
    { label: 'Arquivos Históricos', icon: 'account_balance', route: '/app/contents' },
  ];
  readonly infrastructureItems: MenuItem[] = [
    { label: 'Configurações', icon: 'settings', route: '/app/profile/edit', active: true },
  ];
  readonly notifications = [
    { title: 'Perfil pronto para edição', text: 'Pode atualizar os seus dados académicos.', time: 'Agora' },
    { title: 'Preferências guardadas', text: 'As notificações semanais estão ativas.', time: 'Hoje' },
    { title: 'Segurança', text: 'Recomendamos atualizar a senha regularmente.', time: 'Ontem' },
  ];
  readonly searchResults = computed(() => {
    const query = this.normalizeText(this.searchTerm());
    const results: ProfileSearchResult[] = [
      ...this.platformItems.map((item) => ({ label: item.label, detail: 'Área do perfil', route: item.route })),
      ...this.administrationItems.map((item) => ({ label: item.label, detail: 'Menu académico', route: item.route })),
      ...this.infrastructureItems.map((item) => ({ label: item.label, detail: 'Definições da conta', route: item.route })),
      { label: 'Nome completo', detail: this.form.controls.fullName.value, route: '/app/profile/edit' },
      { label: 'E-mail académico', detail: this.form.controls.email.value, route: '/app/profile/edit' },
      { label: 'Preferências de notificação', detail: 'Resumo semanal e alertas', route: '/app/profile/edit' },
    ];

    if (!query) {
      return [];
    }

    return results.filter((result) => this.normalizeText(`${result.label} ${result.detail}`).includes(query)).slice(0, 5);
  });

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  toggleNotifications(): void {
    this.notificationsOpen.update((open) => !open);
  }

  closeNotifications(): void {
    this.notificationsOpen.set(false);
  }

  updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  discardChanges(): void {
    const user = this.dashboard().user;

    this.form.reset({
      fullName: user.name,
      email: user.email,
      biography: user.description,
      newPassword: '',
      confirmPassword: '',
      weeklySummary: true,
      contentAlerts: false,
    });
  }

  saveChanges(): void {
    this.form.markAllAsTouched();
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
