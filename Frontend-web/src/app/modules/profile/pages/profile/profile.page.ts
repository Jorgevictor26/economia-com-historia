import { Component, inject } from '@angular/core';
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

  readonly profileMenu = [
    { label: 'Visualizar perfil publico', route: '/app/profile', active: false },
    { label: 'Perfil', route: '/app/profile', active: !this.isPhotoSection },
    { label: 'Foto', route: '/app/profile/photo', active: this.isPhotoSection },
    { label: 'Seguranca da conta', route: '/app/profile/edit', active: false },
    { label: 'Subscrições', route: '/app/subscriptions', active: false },
    { label: 'Preferencias', route: '/app/profile/edit', active: false },
    { label: 'Notificacoes', route: '/app/notifications', active: false },
  ];

  readonly languages = ['Portugues (Angola)', 'Portugues (Brasil)', 'Ingles', 'Frances'];
  readonly profileStats = [
    { label: 'Horas de estudo', value: this.dashboard.stats.studyHours },
    { label: 'Quizzes concluidos', value: this.dashboard.stats.completedQuizzes },
    { label: 'Publicacoes no forum', value: this.dashboard.stats.forumPosts },
  ];

  initials(): string {
    return this.dashboard.user.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name[0])
      .join('')
      .toUpperCase();
  }
}
