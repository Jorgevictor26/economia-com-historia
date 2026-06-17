import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  templateUrl: './admin-console-shell.component.html'
})
export class AdminConsoleShellComponent {
  @Input() homeRoute = '/admin';
  @Input() userInitials = 'JD';
  @Input() userName = 'Joao dos Santos';
  @Input() userRole = 'Super Admin';
  @Input() avatarUrl = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80';
  @Input() activeItem: 'dashboard' | 'statistics' | 'admins' | 'reports' | 'users' | 'subscriptions' | 'quiz' | 'contents' | 'settings' =
    'dashboard';

  get navGroups(): AdminNavGroup[] {
    return [
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
          { label: 'Gestao Admins', route: '/super-admin/admins', icon: 'admin_panel_settings', active: this.activeItem === 'admins' },
          { label: 'Gestao Denuncias', route: '/admin/reports', icon: 'report', active: this.activeItem === 'reports' },
          { label: 'Utilizadores', route: '/admin/users', icon: 'group', active: this.activeItem === 'users' },
          { label: 'Subscricoes', route: '/admin/subscriptions', icon: 'workspace_premium', active: this.activeItem === 'subscriptions' },
          { label: 'Gestao de Quiz', route: '/admin/quiz', icon: 'quiz', active: this.activeItem === 'quiz' },
          {
            label: 'Conteúdos',
            route: '/admin/contents/create',
            icon: 'article',
            active: this.activeItem === 'contents',
            children: [
              { label: 'Artigo', route: '/admin/contents/create', icon: 'article' },
              { label: 'Video', route: '/admin/video/create', icon: 'smart_display' },
              { label: 'Podcast', route: '/admin/podcast/create', icon: 'podcasts' },
              { label: 'Forum', route: '/admin/forum/create', icon: 'forum' },
            ],
          },
        ],
      },
      {
        label: 'Infraestrutura',
        items: [{ label: 'Configuracoes', route: '/admin/settings', icon: 'settings', active: this.activeItem === 'settings' }],
      },
    ];
  }
}

