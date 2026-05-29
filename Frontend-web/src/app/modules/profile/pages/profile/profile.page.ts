import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthStateService } from '../../../../services/auth-state.service';
import { BackToTopComponent } from '../../../../shared/back-to-top/back-to-top.component';
import { PublicFooterComponent } from '../../../../shared/public-footer/public-footer.component';
import { PublicNavbarComponent } from '../../../../shared/public-navbar/public-navbar.component';
import { AchievementsComponent } from '../../components/achievements/achievements.component';
import { LearningProgressComponent } from '../../components/learning-progress/learning-progress.component';
import { ProgressDomainsComponent } from '../../components/progress-domains/progress-domains.component';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-profile-page',
  imports: [
    RouterLink,
    PublicNavbarComponent,
    PublicFooterComponent,
    BackToTopComponent,
    AchievementsComponent,
    LearningProgressComponent,
    ProgressDomainsComponent,
  ],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
})
export class ProfilePage {
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

  readonly profileMenu = [
    { label: 'Perfil', icon: 'person', route: '/app/profile', active: !this.section },
    { label: 'Meu aprendizado', icon: 'school', route: '/app/profile/learning', active: this.isLearningSection },
    { label: 'Minhas conquistas', icon: 'military_tech', route: '/app/profile/achievements', active: this.isAchievementsSection },
    { label: 'Histórico', icon: 'history', route: '/app/profile/history', active: this.isHistorySection },
    { label: 'Foto', icon: 'photo_camera', route: '/app/profile/photo', active: this.isPhotoSection },
    { label: 'Segurança da conta', icon: 'lock', route: '/app/profile/security', active: this.isSecuritySection },
    {
      label: 'Preferência de notificação',
      icon: 'notifications',
      route: '/app/profile/notification-preferences',
      active: this.isNotificationPreferencesSection,
    },
    { label: 'Subscrições', icon: 'workspace_premium', route: '/app/subscriptions', active: false },
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
  readonly profileAvatarUrl = computed(() => {
    const authenticatedUser = this.auth.user();
    return authenticatedUser ? (authenticatedUser.avatarUrl ?? '') : this.dashboard.user.avatarUrl;
  });
  readonly profileDescription = computed(() => {
    const authenticatedUser = this.auth.user();
    return authenticatedUser ? (authenticatedUser.biography ?? '') : this.dashboard.user.description;
  });

  initials(): string {
    return this.profileName()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name[0])
      .join('')
      .toUpperCase();
  }
}
