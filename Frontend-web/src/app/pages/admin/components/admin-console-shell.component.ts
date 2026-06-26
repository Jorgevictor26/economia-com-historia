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
      return 'Editor de conteudos';
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
    const contentChildren: AdminNavItem[] = [
      { label: 'Artigo', route: '/admin/contents/create', icon: 'article' },
      { label: 'Video', route: '/admin/video/create', icon: 'smart_display' },
      { label: 'Podcast', route: '/admin/podcast/create', icon: 'podcasts' },
      { label: 'Forum', route: '/admin/forum/create', icon: 'forum' },
    ];

    if (this.auth.canCreateJindungo()) {
      contentChildren.push({ label: 'Jindungo', route: '/admin/jindungo/create', icon: 'workspace_premium' });
    }

    const groups: AdminNavGroup[] = [
      {
        label: 'Plataforma',
        items: [
          { label: 'Painel Geral', route: '/admin', icon: 'dashboard', active: this.activeItem === 'dashboard' },
          { label: 'Estatisticas', route: '/admin/statistics', icon: 'monitoring', active: this.activeItem === 'statistics' },
        ],
      },
      {
        label: 'Administracao',
        items: [
          { label: 'Gestao Denuncias', route: '/admin/reports', icon: 'report', active: this.activeItem === 'reports' },
          { label: 'Utilizadores', route: '/admin/users', icon: 'group', active: this.activeItem === 'users' },
          { label: 'Subscricoes', route: '/admin/subscriptions', icon: 'workspace_premium', active: this.activeItem === 'subscriptions' },
          { label: 'Gestao de Quiz', route: '/admin/quiz', icon: 'quiz', active: this.activeItem === 'quiz' },
          {
            label: 'Conteúdos',
            route: '/admin/contents/create',
            icon: 'article',
            active: this.activeItem === 'contents',
            children: contentChildren,
          },
        ],
      },
      {
        label: 'Infraestrutura',
        items: [{ label: 'Configuracoes', route: '/admin/settings', icon: 'settings', active: this.activeItem === 'settings' }],
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
            label: 'Criar conteudo',
            route: '/admin/contents/create',
            icon: 'article',
            active: this.activeItem === 'contents',
            children: contentChildren,
          },
        ],
      },
    ];
  }
}

