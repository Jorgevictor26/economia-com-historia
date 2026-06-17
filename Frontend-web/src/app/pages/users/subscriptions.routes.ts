import { Component, inject } from '@angular/core';
import { RouterLink, Routes } from '@angular/router';
import { SubscriptionService } from '../../services/subscription.service';
import { AuthStateService } from '../../services/auth-state.service';
import { BackToTopComponent } from '../shared/back-to-top/back-to-top.component';
import { PublicFooterComponent } from '../shared/public-footer/public-footer.component';
import { PublicNavbarComponent } from '../shared/public-navbar/public-navbar.component';

@Component({
  selector: 'app-subscriptions-page',
  imports: [RouterLink, PublicNavbarComponent, PublicFooterComponent, BackToTopComponent],
  templateUrl: './subscriptions-page.html'
})
export class SubscriptionsPage {
  readonly subscriptionService = inject(SubscriptionService);
  readonly auth = inject(AuthStateService);
  readonly profileMenu = [
    { label: 'Perfil', icon: 'person', route: '/app/profile', active: false },
    { label: 'Meu aprendizado', icon: 'school', route: '/app/profile/learning', active: false },
    { label: 'Minhas conquistas', icon: 'military_tech', route: '/app/profile/achievements', active: false },
    { label: 'Histórico', icon: 'history', route: '/app/profile/history', active: false },
    { label: 'Foto', icon: 'photo_camera', route: '/app/profile/photo', active: false },
    { label: 'Seguranca da conta', icon: 'lock', route: '/app/profile/security', active: false },
    { label: 'Preferencia de notificacao', icon: 'notifications', route: '/app/profile/notification-preferences', active: false },
    { label: 'Subscricoes', icon: 'workspace_premium', route: '/app/subscriptions', active: true },
    { label: 'Suporte', icon: 'help_outline', route: '/app/profile/support', active: false },
  ];

  subscribeToJindungo(): void {
    this.auth.subscribeToJindungo();
  }

  initials(): string {
    return (this.auth.user()?.name || 'Estudante Angola')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name[0])
      .join('')
      .toUpperCase();
  }
}

export const SUBSCRIPTIONS_ROUTES: Routes = [{ path: '', component: SubscriptionsPage }];



