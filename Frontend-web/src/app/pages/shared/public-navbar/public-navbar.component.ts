import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStateService } from '../../../services/auth-state.service';
import { NotificationService } from '../../../services/notification.service';
import { normalizeMediaUrl } from '../../../services/media-url.util';

@Component({
  selector: 'app-public-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './public-navbar.component.html'
})
export class PublicNavbarComponent implements OnInit {
  readonly auth = inject(AuthStateService);
  readonly notificationService = inject(NotificationService);
  readonly menuOpen = signal(false);
  readonly notificationsOpen = signal(false);

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      void this.notificationService.loadNotifications();
    }
  }

  homeRoute(): string {
    return this.auth.isAuthenticated() ? '/app/home' : '/';
  }

  navItems(): Array<{ label: string; route: string; exact: boolean }> {
    if (this.auth.isAuthenticated()) {
      return [
        { label: 'Home', route: this.homeRoute(), exact: true },
        { label: 'Conteúdo', route: '/app/contents', exact: false },
        { label: 'Favoritos', route: '/app/favorites', exact: false },
        { label: 'Mapa', route: '/app/map', exact: false },
        { label: 'Quiz', route: '/app/quizzes', exact: false },
        { label: 'Fórum', route: '/app/forums', exact: false },
      ];
    }

    return [
      { label: 'Home', route: '/', exact: true },
      { label: 'Conteúdo', route: '/app/contents', exact: false },
      { label: 'Mapa', route: '/app/map', exact: false },
      { label: 'Quiz', route: '/app/quizzes', exact: false },
      { label: 'Fórum', route: '/app/forums', exact: false },
    ];
  }

  openMenu(): void {
    this.menuOpen.set(true);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  toggleNotifications(): void {
    this.notificationsOpen.update((open) => !open);

    if (this.notificationsOpen()) {
      void this.notificationService.loadNotifications();
    }
  }

  closeNotifications(): void {
    this.notificationsOpen.set(false);
  }

  unreadNotificationsCount(): number {
    return this.notificationService.notifications().filter((notification) => !notification.read).length;
  }

  markAllNotificationsAsRead(): void {
    void this.notificationService.markAllAsRead();
  }

  clearNotifications(): void {
    this.notificationService.clearNotifications();
  }

  userInitials(): string {
    return (this.auth.user()?.name ?? 'Utilizador')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name[0])
      .join('')
      .toUpperCase();
  }

  profileAvatarUrl(): string | undefined {
    return normalizeMediaUrl(this.auth.user()?.avatarUrl);
  }
}
