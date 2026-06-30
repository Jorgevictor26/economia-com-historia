import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthStateService } from '../../../services/auth-state.service';
import { ProfileService } from '../../../services/profile.service';
import { PublicNavbarComponent } from '../../shared/public-navbar/public-navbar.component';
import { AchievementsComponent } from './components/achievements/achievements.component';
import { LearningProgressComponent } from './components/learning-progress/learning-progress.component';
import { ProgressDomainsComponent } from './components/progress-domains/progress-domains.component';

@Component({
  selector: 'app-profile-page',
  imports: [
    RouterLink,
    PublicNavbarComponent,
    AchievementsComponent,
    LearningProgressComponent,
    ProgressDomainsComponent,
  ],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
})
export class ProfilePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly profileService = inject(ProfileService);
  readonly auth = inject(AuthStateService);
  readonly dashboard = this.profileService.getDashboard();
  readonly section = this.route.snapshot.data['section'];
  readonly isLearningSection = this.section === 'learning';
  readonly isAchievementsSection = this.section === 'achievements';
  readonly isHistorySection = this.section === 'history';
  readonly isSupportSection = this.section === 'support';
  readonly isPhotoSection = this.section === 'photo';
  readonly isSecuritySection = this.section === 'security';
  readonly isNotificationPreferencesSection = this.section === 'notification-preferences';
  readonly isSavingProfile = signal(false);
  readonly isSavingSecurity = signal(false);
  readonly isLoadingProfile = signal(false);
  readonly profileSaveMessage = signal('');
  readonly profileSaveError = signal('');
  readonly securitySaveMessage = signal('');
  readonly securitySaveError = signal('');
  readonly selectedPhotoPreviewUrl = signal('');
  readonly selectedPhotoName = signal('');
  readonly photoSaveMessage = signal('');
  readonly photoSaveError = signal('');

  readonly profileMenu = [
    { label: 'Perfil', icon: 'person', route: '/app/profile', active: !this.section },
    { label: 'Meu aprendizado', icon: 'school', route: '/app/profile/learning', active: this.isLearningSection },
    { label: 'Minhas conquistas', icon: 'military_tech', route: '/app/profile/achievements', active: this.isAchievementsSection },
    { label: 'Histórico', icon: 'history', route: '/app/profile/history', active: this.isHistorySection },
    { label: 'Segurança da conta', icon: 'lock', route: '/app/profile/security', active: this.isSecuritySection },
    {
      label: 'Preferência de notificação',
      icon: 'notifications',
      route: '/app/profile/notification-preferences',
      active: this.isNotificationPreferencesSection,
    },
    { label: 'Subscrições', icon: 'workspace_premium', route: '/app/subscriptions', active: false },
    ...(this.auth.canWriteContent()
      ? [{ label: this.auth.canManagePlatform() ? 'Administração' : 'Console editorial', icon: 'admin_panel_settings', route: '/admin', active: false }]
      : []),
    { label: 'Suporte', icon: 'help_outline', route: '/app/profile/support', active: this.isSupportSection },
  ];

  readonly historyItems = [
    { title: 'A Evolução do Kwanza', detail: 'Módulo retomado recentemente', route: '/app/contents' },
    { title: 'Quiz de economia colonial', detail: '31 quizzes concluídos no total', route: '/app/quizzes' },
    { title: 'Arquivos favoritos', detail: 'Conteúdos guardados para consulta', route: '/app/favorites' },
  ];

  readonly languages = ['Português (Angola)', 'Português (Brasil)', 'Inglês', 'Francês'];
  readonly profileStats = [
    { label: 'Horas de estudo', value: this.dashboard.stats.studyHours },
    { label: 'Quizzes concluídos', value: this.dashboard.stats.completedQuizzes },
    { label: 'Publicações no fórum', value: this.dashboard.stats.forumPosts },
  ];

  readonly profileName = computed(() => this.auth.user()?.name || this.dashboard.user.name);
  readonly profileEmail = computed(() => this.auth.user()?.email || this.dashboard.user.email);
  readonly profileAccessLevel = computed(() => {
    const role = this.auth.user()?.role;

    switch (role) {
      case 'super-admin':
        return 'Super admin';
      case 'admin':
        return 'Admin';
      case 'writer':
        return 'Escritor';
      case 'moderator':
        return 'Moderador';
      default:
        return this.dashboard.user.accessLevel;
    }
  });
  readonly profileAvatarUrl = computed(() => {
    const authenticatedUser = this.auth.user();
    return authenticatedUser ? (authenticatedUser.avatarUrl ?? '') : this.dashboard.user.avatarUrl;
  });
  readonly displayedAvatarUrl = computed(() => this.selectedPhotoPreviewUrl() || this.profileAvatarUrl());
  readonly profileDescription = computed(() => {
    const authenticatedUser = this.auth.user();
    return authenticatedUser ? (authenticatedUser.biography ?? '') : this.dashboard.user.description;
  });

  async ngOnInit(): Promise<void> {
    if (!this.auth.isAuthenticated()) {
      return;
    }

    this.isLoadingProfile.set(true);

    try {
      await this.profileService.loadProfile();
    } catch {
      this.profileSaveError.set('Não foi possível carregar os dados atualizados do perfil.');
    } finally {
      this.isLoadingProfile.set(false);
    }
  }

  initials(): string {
    return this.profileName()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name[0])
      .join('')
      .toUpperCase();
  }

  async saveProfile(name: string, email: string, biography: string): Promise<void> {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim();
    const normalizedBiography = biography.trim();

    this.profileSaveMessage.set('');
    this.profileSaveError.set('');

    if (!normalizedName || !normalizedEmail) {
      this.profileSaveError.set('Preencha o nome e o e-mail antes de salvar.');
      return;
    }

    this.isSavingProfile.set(true);

    try {
      await this.profileService.updateProfile({
        name: normalizedName,
        email: normalizedEmail,
        bio: normalizedBiography || null,
      });
      this.profileSaveMessage.set('Perfil atualizado com sucesso.');
    } catch {
      this.profileSaveError.set('Não foi possível atualizar o perfil. Verifique os dados e tente novamente.');
    } finally {
      this.isSavingProfile.set(false);
    }
  }

  onPhotoSelected(event: Event, saveAfterLoad = false): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.photoSaveMessage.set('');

    if (!file) {
      return;
    }

    this.selectedPhotoName.set(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      this.selectedPhotoPreviewUrl.set(String(reader.result || ''));

      if (saveAfterLoad) {
        this.savePhoto();
      }
    };
    reader.readAsDataURL(file);
  }

  async saveSecurity(password: string, passwordConfirmation: string): Promise<void> {
    const normalizedPassword = password.trim();
    const normalizedConfirmation = passwordConfirmation.trim();

    this.securitySaveMessage.set('');
    this.securitySaveError.set('');

    if (!normalizedPassword || !normalizedConfirmation) {
      this.securitySaveError.set('Preencha e confirme a nova palavra-passe.');
      return;
    }

    if (normalizedPassword.length < 8) {
      this.securitySaveError.set('A palavra-passe deve ter pelo menos 8 caracteres.');
      return;
    }

    if (normalizedPassword !== normalizedConfirmation) {
      this.securitySaveError.set('As palavras-passe não coincidem.');
      return;
    }

    this.isSavingSecurity.set(true);

    try {
      await this.profileService.updateProfile({
        password: normalizedPassword,
        password_confirmation: normalizedConfirmation,
      });
      this.securitySaveMessage.set('Palavra-passe atualizada com sucesso.');
    } catch {
      this.securitySaveError.set('Não foi possível atualizar a palavra-passe.');
    } finally {
      this.isSavingSecurity.set(false);
    }
  }

  async savePhoto(): Promise<void> {
    const previewUrl = this.selectedPhotoPreviewUrl();
    const currentUser = this.auth.user();

    if (!previewUrl || !currentUser) {
      return;
    }

    this.photoSaveMessage.set('');
    this.photoSaveError.set('');

    try {
      await this.profileService.updateProfile({ photo: previewUrl });
      this.selectedPhotoPreviewUrl.set('');
      this.selectedPhotoName.set('');
      this.photoSaveMessage.set('Foto atualizada com sucesso!');
    } catch {
      this.auth.updateAuthenticatedUser({
        ...currentUser,
        avatarUrl: previewUrl,
      });
      this.photoSaveError.set('A foto foi atualizada localmente, mas não foi possível guardar no backend.');
    }
  }
}
