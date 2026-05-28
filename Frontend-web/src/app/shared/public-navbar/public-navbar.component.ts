import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';

@Component({
  selector: 'app-public-navbar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="public-navbar sticky top-0 z-40 border-b border-[#ece7e4] bg-white">
      <div class="mx-auto flex min-h-[58px] max-w-[1500px] flex-wrap items-center gap-4 px-5 lg:px-10 2xl:px-14">
        <a [routerLink]="homeRoute()" class="flex shrink-0 items-center gap-2 font-display text-[15px] font-extrabold text-[#8a4055]">
          <img src="/auth-logo.png" alt="Economia com História" class="h-[24px] w-auto" />
          <span [class.hidden]="menuOpen()">Economia com História</span>
        </a>

        <nav class="mx-auto hidden min-w-0 items-center gap-8 overflow-x-auto text-[14px] font-semibold text-[#2c2729] md:flex">
          @for (item of navItems(); track item.label) {
            <a
              [routerLink]="item.route"
              routerLinkActive="is-active"
              [routerLinkActiveOptions]="{ exact: item.exact }"
              class="public-navbar-link"
            >
              {{ item.label }}
            </a>
          }
        </nav>

        <div class="ml-auto hidden shrink-0 items-center gap-3 md:flex">
          @if (auth.canWriteContent()) {
            <a routerLink="/admin/contents/create" class="inline-flex h-9 items-center justify-center rounded-[8px] bg-[#5c1e2f] px-5 text-[13px] font-bold text-white transition hover:bg-[#471525]">Publicar</a>
          }

          @if (auth.isAuthenticated()) {
            <a routerLink="/app/profile" class="flex items-center" aria-label="Perfil">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80"
                alt="Perfil"
                class="size-[34px] rounded-full object-cover ring-1 ring-[#5c1e2f]/10"
              />
            </a>
          } @else {
            <a routerLink="/auth/login" class="inline-flex h-9 items-center justify-center rounded-[8px] border border-[#5c1e2f] px-5 text-[13px] font-bold text-[#5c1e2f]">Entrar</a>
            <a routerLink="/auth/register" class="inline-flex h-9 items-center justify-center rounded-[8px] bg-[#5c1e2f] px-5 text-[13px] font-bold text-white transition hover:bg-[#471525]">Criar conta</a>
          }
        </div>

        <button type="button" class="ml-auto grid size-10 place-items-center rounded-[8px] border border-[#e3d4d8] text-[#5c1e2f] md:hidden" aria-label="Abrir menu" (click)="openMenu()">
          <span class="grid gap-1.5">
            <i class="block h-0.5 w-5 bg-current"></i>
            <i class="block h-0.5 w-5 bg-current"></i>
            <i class="block h-0.5 w-5 bg-current"></i>
          </span>
        </button>
      </div>
    </header>

      <button
        type="button"
        class="fixed inset-0 z-[80] bg-black/35 transition-opacity duration-300 md:hidden"
        [class.opacity-100]="menuOpen()"
        [class.opacity-0]="!menuOpen()"
        [class.pointer-events-auto]="menuOpen()"
        [class.pointer-events-none]="!menuOpen()"
        aria-label="Fechar menu"
        (click)="closeMenu()"
      ></button>
      <aside
        class="fixed inset-y-0 left-0 z-[90] flex w-[min(300px,86vw)] flex-col overflow-y-auto bg-white p-5 shadow-2xl transition-transform duration-300 ease-out md:hidden"
        [class.translate-x-0]="menuOpen()"
        [class.-translate-x-full]="!menuOpen()"
      >
        <div class="flex items-center justify-between gap-4">
          <a [routerLink]="homeRoute()" class="flex items-center gap-2 font-display text-[14px] font-extrabold text-[#8a4055]" (click)="closeMenu()">
            <img src="/auth-logo.png" alt="Economia com História" class="h-[24px] w-auto" />
          </a>
          <button type="button" class="grid size-9 place-items-center rounded-[8px] border border-[#e3d4d8] text-[20px] text-[#5c1e2f]" aria-label="Fechar menu" (click)="closeMenu()">×</button>
        </div>

        <nav class="mt-6 grid gap-2 text-[14px] font-semibold text-[#2c2729]">
          @for (item of navItems(); track item.label) {
            <a
              [routerLink]="item.route"
              routerLinkActive="is-active"
              [routerLinkActiveOptions]="{ exact: item.exact }"
              class="public-navbar-drawer-link"
              (click)="closeMenu()"
            >
              {{ item.label }}
            </a>
          }
        </nav>

        <div class="mt-5 grid gap-3 border-t border-[#ece7e4] pt-5">
          @if (auth.canWriteContent()) {
            <a routerLink="/admin/contents/create" class="inline-flex h-10 items-center justify-center rounded-[8px] bg-[#5c1e2f] px-5 text-[13px] font-bold text-white" (click)="closeMenu()">Publicar</a>
          }

          @if (auth.isAuthenticated()) {
            <a routerLink="/app/profile" class="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#5c1e2f] px-5 text-[13px] font-bold text-[#5c1e2f]" (click)="closeMenu()">Perfil</a>
          } @else {
            <a routerLink="/auth/login" class="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#5c1e2f] px-5 text-[13px] font-bold text-[#5c1e2f]" (click)="closeMenu()">Entrar</a>
            <a routerLink="/auth/register" class="inline-flex h-10 items-center justify-center rounded-[8px] bg-[#5c1e2f] px-5 text-[13px] font-bold text-white" (click)="closeMenu()">Criar conta</a>
          }
        </div>
      </aside>
  `,
})
export class PublicNavbarComponent {
  readonly auth = inject(AuthStateService);
  readonly menuOpen = signal(false);

  homeRoute(): string {
    return this.auth.isAuthenticated() ? '/app/contents' : '/';
  }

  navItems(): Array<{ label: string; route: string; exact: boolean }> {
    if (this.auth.isAuthenticated()) {
      return [
        { label: 'Home', route: this.homeRoute(), exact: true },
        { label: 'Quiz', route: '/app/quizzes', exact: false },
        { label: 'Fórum', route: '/app/forums', exact: false },
      ];
    }

    return [
      { label: 'Home', route: '/', exact: true },
      { label: 'Conteúdo', route: '/app/contents', exact: false },
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
}

