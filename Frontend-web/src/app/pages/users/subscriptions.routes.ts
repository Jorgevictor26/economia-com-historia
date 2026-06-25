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
  template: `
    <section class="profile-page -m-6 min-h-dvh bg-[#f5f6f8] text-[#2d333a]">
      <app-public-navbar />

      <main class="fluid-container py-8 lg:py-10">
        <section class="grid items-start gap-4 lg:grid-cols-[minmax(228px,260px)_minmax(0,1fr)]">
          <aside class="rounded-[8px] border border-[#e3d4d8]/75 bg-white/95 shadow-[0_24px_60px_rgb(22_19_21_/_0.12)]" aria-label="Menu de perfil">
            <div class="grid justify-items-center gap-2 px-4 py-4 text-center">
              <label class="grid size-[100px] place-items-center overflow-hidden rounded-full bg-[#662239] font-display text-[2rem] font-extrabold text-white" aria-label="Alterar foto de perfil">
                @if (auth.user()?.avatarUrl) {
                  <img [src]="auth.user()?.avatarUrl" [alt]="auth.user()?.name || 'Estudante Angola'" class="h-full w-full object-cover" />
                } @else {
                  {{ initials() }}
                }
                <input type="file" accept="image/*" class="sr-only" (change)="onSidebarPhotoSelected($event)" />
              </label>
              <h2 class="max-w-52 font-display text-[0.92rem] font-extrabold leading-tight text-[#5c1e2f]">{{ auth.user()?.name || 'Estudante Angola' }}</h2>
              <p class="text-[0.72rem] text-[#343a40]">Utilizador Comum</p>
            </div>

            <nav class="grid gap-[0.1rem] px-3 pb-3">
              @for (item of profileMenu; track item.label) {
                <a
                  [routerLink]="item.route"
                  class="flex min-h-[2.05rem] items-center gap-2 rounded-[8px] px-3 text-[0.78rem] leading-tight text-[#32373d] hover:bg-[#f7edf1] hover:text-[#6b2038]"
                  [class.bg-[#f7edf1]]="item.active"
                  [class.text-[#6b2038]]="item.active"
                >
                  <span class="profile-menu-icon" aria-hidden="true">{{ item.icon }}</span>
                  {{ item.label }}
                </a>
              }
              <a routerLink="/auth/login" class="profile-menu-logout flex min-h-[2.05rem] items-center gap-2 rounded-[8px] px-3 text-[0.78rem] text-[#b42318] hover:bg-[#fff1f1]" (click)="auth.logout()">
                <span class="profile-menu-icon" aria-hidden="true">logout</span>
                Sair
              </a>
            </nav>
          </aside>

          <section class="rounded-[8px] border border-[#dfe3e8] bg-white px-4 py-5 shadow-sm sm:px-6">
            <header class="flex flex-wrap items-start justify-between gap-4 border-b border-[#dfe3e8] pb-6">
              <div>
                <h1 class="font-display text-[28px] font-extrabold leading-tight text-[#5c1e2f]">Subscrições</h1>
                <p class="mt-2 text-[14px] leading-6 text-[#303640]">Escolha os canais e acompanhe conteúdos exclusivos.</p>
              </div>

              <a routerLink="/admin/subscriptions" class="inline-flex h-9 items-center justify-center rounded-[8px] border border-[#cfd5dd] bg-white px-4 text-[13px] font-semibold text-[#2f3440] hover:bg-[#f7f8fa]">
                Gerir subscrições
              </a>
            </header>

            <section class="py-6" aria-labelledby="subscription-channels-title">
              <h2 id="subscription-channels-title" class="sr-only">Canais disponíveis</h2>

              <article class="w-full max-w-[210px] overflow-hidden rounded-[8px] border border-[#dfe3e8] bg-white shadow-[0_8px_22px_rgb(22_19_21_/_0.08)]">
                <img
                  src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=520&q=80"
                  alt="Livro aberto do canal Jindungo"
                  class="h-[56px] w-full object-cover"
                />

                <div class="px-3 py-3">
                  <h3 class="font-display text-[15px] font-extrabold leading-snug text-[#5c1e2f]">Canal Jindungo</h3>
                  <p class="mt-2 min-h-8 text-[11px] leading-4 text-[#303640]">Textos exclusivos e previews antecipados</p>

                  <button
                    type="button"
                    class="mx-auto mt-3 flex h-8 min-w-[104px] items-center justify-center rounded-[8px] border border-[#c5cbd3] bg-white px-4 text-[12px] font-medium text-[#202631] hover:bg-[#f7f8fa]"
                    (click)="subscribeToJindungo()"
                  >
                    {{ auth.canReadJindungo() ? 'Subscrito' : 'Subscrever' }}
                  </button>
                </div>
              </article>
            </section>

            <section class="border-t border-[#dfe3e8] pt-4" aria-labelledby="subscribed-texts-title">
              <div class="flex flex-wrap items-center justify-between gap-4">
                <h2 id="subscribed-texts-title" class="font-display text-[18px] font-extrabold text-[#5c1e2f]">Textos Subscritos</h2>

                <label class="relative inline-flex items-center">
                  <span class="sr-only">Filtrar textos subscritos</span>
                  <select class="h-9 min-w-[132px] appearance-none rounded-[8px] border border-[#cfd5dd] bg-white py-0 pl-3 pr-9 text-[13px] font-semibold text-[#2f3440] outline-none focus:border-[#8f9ab2]">
                    <option>Filtrar: Todos</option>
                    <option>Mais recentes</option>
                    <option>Economia</option>
                  </select>
                  <span class="material-symbols-outlined pointer-events-none absolute right-2 text-[18px] text-[#333844]" aria-hidden="true">arrow_drop_down</span>
                </label>
              </div>

              <div class="mt-4 grid gap-4 md:grid-cols-3">
                @for (text of subscriptionService.subscribedJindungoTexts(); track text.id) {
                  <article class="flex min-h-[138px] flex-col rounded-[8px] border border-[#dfe3e8] bg-white p-4 shadow-sm">
                    <h3 class="font-display text-[15px] font-extrabold leading-snug text-[#5c1e2f]">{{ text.title }}</h3>
                    <p class="mt-3 text-[11px] text-[#303640]">Subscrito em {{ text.subscribedAt }}</p>
                    <p class="mt-1 text-[11px] text-[#303640]">{{ text.readingMinutes }} min leitura</p>

                    <a [routerLink]="text.route" class="mt-auto self-end rounded-[6px] border border-[#c5cbd3] px-4 py-2 text-[12px] font-medium text-[#202631] hover:bg-[#f7f8fa]">
                      Ver textos
                    </a>
                  </article>
                }
              </div>
            </section>
          </section>
        </section>
      </main>

      <app-public-footer />
      <app-back-to-top />
    </section>
  `
})
export class SubscriptionsPage {
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

export const SUBSCRIPTIONS_ROUTES: Routes = [{ path: '', component: SubscriptionsPage }];



