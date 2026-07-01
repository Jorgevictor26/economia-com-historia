import { Component, inject } from '@angular/core';
import { RouterLink, Routes } from '@angular/router';
import { SubscriptionService } from '../../services/subscription.service';
import { AuthStateService } from '../../services/auth-state.service';
import { BackToTopComponent } from '../shared/back-to-top/back-to-top.component';
import { PublicNavbarComponent } from '../shared/public-navbar/public-navbar.component';

@Component({
  selector: 'app-subscription-management-page',
  imports: [RouterLink, PublicNavbarComponent, BackToTopComponent],
  templateUrl: './subscription-management.page.html',
  styleUrl: './profile/profile.page.scss',
})
export class SubscriptionManagementPage {
  readonly subscriptionService = inject(SubscriptionService);
  readonly auth = inject(AuthStateService);
  readonly profileMenu = [
    { label: 'Perfil', icon: 'person', route: '/app/profile', active: false },
    { label: 'Meu aprendizado', icon: 'school', route: '/app/profile/learning', active: false },
    { label: 'Minhas conquistas', icon: 'military_tech', route: '/app/profile/achievements', active: false },
    { label: 'Histórico', icon: 'history', route: '/app/profile/history', active: false },
    { label: 'Segurança da conta', icon: 'lock', route: '/app/profile/security', active: false },
    { label: 'Preferência de notificação', icon: 'notifications', route: '/app/profile/notification-preferences', active: false },
    { label: 'Subscrições', icon: 'workspace_premium', route: '/app/subscriptions', active: true },
    { label: 'Suporte', icon: 'help_outline', route: '/app/profile/support', active: false },
  ];

  subscribeToJindungo(): void {
    this.auth.subscribeToJindungo();
  }

  onSidebarPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const currentUser = this.auth.user();

    if (!file || !currentUser) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.auth.updateAuthenticatedUser({
        ...currentUser,
        avatarUrl: String(reader.result || ''),
      });
    };
    reader.readAsDataURL(file);
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

export const SUBSCRIPTION_MANAGEMENT_ROUTES: Routes = [{ path: '', component: SubscriptionManagementPage }];

