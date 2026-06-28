import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStateService } from '../../../services/auth-state.service';
import { PublicNavbarComponent } from '../../shared/public-navbar/public-navbar.component';

interface AdminNavItem {
  label: string;
  route: string;
  icon: string;
  active?: boolean;
  children?: AdminNavItem[];
}

interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

@Component({
  selector: 'app-admin-console-shell',
  imports: [RouterLink, PublicNavbarComponent],
  templateUrl: './admin-console-shell.component.html',
  styleUrl: './admin-console-shell.component.scss',
})
export class AdminConsoleShellComponent {
  readonly auth = inject(AuthStateService);

  @Input() homeRoute = '/admin';
  @Input() userInitials = 'JD';
  @Input() userName = 'Joao dos Santos';
  @Input() userRole = 'Admin';
  @Input() avatarUrl = '';
  @Input() activeItem: 'dashboard' | 'statistics' | 'admins' | 'reports' | 'users' | 'subscriptions' | 'quiz' | 'contents' | 'settings' =
    'dashboard';

  get displayName(): string {
    return this.auth.user()?.name || this.userName;
  }

  get displayAvatarUrl(): string {
    return this.auth.user()?.avatarUrl || this.avatarUrl;
  }

  get displayRole(): string {
    const role = this.auth.user()?.role;

    if (role === 'super-admin') {
      return 'Superadministrador';
    }

    if (role === 'admin') {
      return 'Administrador';
    }

    if (role === 'writer') {
      return 'Editor de conteúdos';
    }

    if (role === 'moderator') {
      return 'Moderador';
    }

    return this.userRole;
  }

  get displayInitials(): string {
    const name = this.displayName.trim();

    if (!name) {
      return this.userInitials;
    }

    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  get navGroups(): AdminNavGroup[] {
    const groups: AdminNavGroup[] = [
      {
        label: 'Plataforma',
        items: [
          { label: 'Painel Geral', route: '/admin', icon: 'dashboard', active: this.activeItem === 'dashboard' },
          { label: 'Estatísticas', route: '/admin/statistics', icon: 'monitoring', active: this.activeItem === 'statistics' },
        ],
      },
      {
        label: 'Administração',
        items: [
          { label: 'Gestão Denúncias', route: '/admin/reports', icon: 'report', active: this.activeItem === 'reports' },
          { label: 'Utilizadores', route: '/admin/users', icon: 'group', active: this.activeItem === 'users' },
          { label: 'Subscricoes', route: '/admin/subscriptions', icon: 'workspace_premium', active: this.activeItem === 'subscriptions' },
          { label: 'Gestão de Quiz', route: '/admin/quiz', icon: 'quiz', active: this.activeItem === 'quiz' },
          {
            label: 'Conteúdos',
            route: '/admin/contents',
            icon: 'article',
            active: this.activeItem === 'contents',
          },
        ],
      },
      {
        label: 'Infraestrutura',
        items: [{ label: 'Configurações', route: '/admin/settings', icon: 'settings', active: this.activeItem === 'settings' }],
      },
    ];

    if (this.auth.canManagePlatform()) {
      return groups;
    }

    return [
      {
        label: 'Conteudos',
        items: [
          {
            label: 'Conteudos',
            route: '/admin/contents',
            icon: 'article',
            active: this.activeItem === 'contents',
          },
        ],
      },
    ];
  }
}

