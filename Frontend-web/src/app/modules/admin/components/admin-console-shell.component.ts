import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PublicNavbarComponent } from '../../../shared/public-navbar/public-navbar.component';

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
  template: `
    <section class="-m-6 min-h-dvh bg-[#f7f8f8] text-[#191c1d]">
      <app-public-navbar />

      <main class="grid min-h-[calc(100dvh-58px)] grid-cols-[minmax(220px,270px)_minmax(0,1fr)] gap-0 border border-[#e3d4d8] bg-white max-lg:grid-cols-1">
        <aside class="flex min-h-[calc(100dvh-116px)] flex-col border-r border-[#e3d4d8] bg-white max-lg:min-h-0 max-lg:border-b max-lg:border-r-0">
          <nav class="grid py-5" aria-label="Administracao">
            @for (group of navGroups; track group.label) {
              <section>
                <p class="px-4 pt-4 text-[12px] font-medium uppercase tracking-[0.08em] text-[#8a8587]">{{ group.label }}</p>
                <div class="mt-2 grid">
                  @for (item of group.items; track item.route) {
                    @if (item.children; as children) {
                      <details class="mx-2 rounded-[8px]" [open]="item.active">
                        <summary
                          class="flex min-h-[38px] cursor-pointer list-none items-center gap-2 rounded-[8px] px-4 text-[14px] transition marker:hidden hover:bg-[#f7edef] hover:text-[#5c1e2f]"
                          [class.bg-[#f7edef]]="item.active"
                          [class.font-extrabold]="item.active"
                          [class.text-[#5c1e2f]]="item.active"
                          [class.text-[#2c2729]]="!item.active"
                        >
                          <span
                            class="grid size-[22px] shrink-0 place-items-center overflow-hidden text-[20px] leading-none"
                            style="font-family: 'Material Symbols Outlined'; font-feature-settings: 'liga'; -webkit-font-feature-settings: 'liga'; font-variation-settings: 'FILL' 0, 'wght' 430, 'GRAD' 0, 'opsz' 24;"
                            aria-hidden="true"
                          >{{ item.icon }}</span>
                          <span class="min-w-0 flex-1">{{ item.label }}</span>
                          <span
                            class="grid size-5 place-items-center text-[18px] leading-none"
                            style="font-family: 'Material Symbols Outlined'; font-feature-settings: 'liga'; -webkit-font-feature-settings: 'liga'; font-variation-settings: 'FILL' 0, 'wght' 430, 'GRAD' 0, 'opsz' 24;"
                            aria-hidden="true"
                          >expand_more</span>
                        </summary>

                        <div class="mt-1 grid gap-1 pb-1 pl-8">
                          @for (child of children; track child.route) {
                            <a
                              [routerLink]="child.route"
                              class="mr-2 flex min-h-[34px] items-center gap-2 rounded-[8px] px-3 text-[13px] font-semibold text-[#5f575b] transition hover:bg-[#f7edef] hover:text-[#5c1e2f]"
                            >
                              <span
                                class="grid size-[20px] shrink-0 place-items-center overflow-hidden text-[18px] leading-none"
                                style="font-family: 'Material Symbols Outlined'; font-feature-settings: 'liga'; -webkit-font-feature-settings: 'liga'; font-variation-settings: 'FILL' 0, 'wght' 430, 'GRAD' 0, 'opsz' 24;"
                                aria-hidden="true"
                              >{{ child.icon }}</span>
                              {{ child.label }}
                            </a>
                          }
                        </div>
                      </details>
                    } @else {
                      <a
                        [routerLink]="item.route"
                        class="mx-2 flex min-h-[38px] items-center gap-2 rounded-[8px] px-4 text-[14px] transition hover:bg-[#f7edef] hover:text-[#5c1e2f]"
                        [class.bg-[#f7edef]]="item.active"
                        [class.font-extrabold]="item.active"
                        [class.text-[#5c1e2f]]="item.active"
                        [class.text-[#2c2729]]="!item.active"
                      >
                        <span
                          class="grid size-[22px] shrink-0 place-items-center overflow-hidden text-[20px] leading-none"
                          style="font-family: 'Material Symbols Outlined'; font-feature-settings: 'liga'; -webkit-font-feature-settings: 'liga'; font-variation-settings: 'FILL' 0, 'wght' 430, 'GRAD' 0, 'opsz' 24;"
                          aria-hidden="true"
                        >{{ item.icon }}</span>
                        {{ item.label }}
                      </a>
                    }
                  }
                </div>
              </section>
            }
          </nav>

          <span class="mt-auto"></span>
        </aside>

        <section class="min-w-0 bg-[#f7f8f8] px-6 py-7 max-lg:px-4">
          <ng-content />
        </section>
      </main>
    </section>
  `,
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
            label: 'Conteudos',
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
