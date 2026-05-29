import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthStateService } from '../../../../services/auth-state.service';
import { BackToTopComponent } from '../../../../shared/back-to-top/back-to-top.component';
import { PublicFooterComponent } from '../../../../shared/public-footer/public-footer.component';
import { PublicNavbarComponent } from '../../../../shared/public-navbar/public-navbar.component';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-profile-page',
  imports: [RouterLink, PublicNavbarComponent, PublicFooterComponent, BackToTopComponent],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
})
export class ProfilePage {
  private readonly route = inject(ActivatedRoute);
  private readonly profileService = inject(ProfileService);
  readonly auth = inject(AuthStateService);
  readonly dashboard = this.profileService.getDashboard();
  readonly section = this.route.snapshot.data['section'];
  readonly isPhotoSection = this.section === 'photo';
  readonly isSecuritySection = this.section === 'security';

  readonly profileMenu = [
    { label: 'Visualizar perfil público', route: '/app/profile', active: false },
    { label: 'Perfil', route: '/app/profile', active: !this.isPhotoSection && !this.isSecuritySection },
    { label: 'Foto', route: '/app/profile/photo', active: this.isPhotoSection },
    { label: 'Segurança da conta', route: '/app/profile/security', active: this.isSecuritySection },
    { label: 'Subscrições', route: '/app/subscriptions', active: false },
    { label: 'Preferências', route: '/app/profile/edit', active: false },
    { label: 'Notificações', route: '/app/notifications', active: false },
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
