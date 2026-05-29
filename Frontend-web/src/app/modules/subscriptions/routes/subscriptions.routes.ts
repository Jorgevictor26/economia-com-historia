import { Component, inject } from '@angular/core';
import { RouterLink, Routes } from '@angular/router';
import { SubscriptionService } from '../../../services/subscription.service';
import { AuthStateService } from '../../../services/auth-state.service';
import { BackToTopComponent } from '../../../shared/back-to-top/back-to-top.component';
import { PublicFooterComponent } from '../../../shared/public-footer/public-footer.component';
import { PublicNavbarComponent } from '../../../shared/public-navbar/public-navbar.component';

@Component({
  selector: 'app-subscriptions-page',
  imports: [RouterLink, PublicNavbarComponent, PublicFooterComponent, BackToTopComponent],
  template: `
    <section class="profile-page -m-6 min-h-dvh bg-[#f7f8f8] text-[#191c1d]">
      <app-public-navbar />

      <main class="fluid-container py-8 lg:py-12">
        <section class="grid border border-[#e3d4d8] bg-white lg:grid-cols-[minmax(220px,270px)_1fr]">
          <aside class="border-b border-[#e3d4d8] lg:border-b-0 lg:border-r" aria-label="Menu de perfil">
            <div class="grid justify-items-center gap-3 px-4 py-7 text-center">
              <div class="grid size-[112px] place-items-center rounded-full bg-bordeaux font-display text-3xl font-extrabold text-white">{{ initials() }}</div>
              <h2 class="max-w-48 font-display text-base font-extrabold leading-tight text-bordeaux">{{ auth.user()?.name || 'Estudante Angola' }}</h2>
              <p class="text-xs font-extrabold text-[#735c00]">Utilizador Comum</p>
            </div>

            <nav class="grid px-2 pb-3">
              @for (item of profileMenu; track item.label) {
                <a
                  [routerLink]="item.route"
                  class="mx-1 flex min-h-10 items-center gap-2 rounded-[8px] px-4 text-sm text-[#2c2729] hover:bg-[#f7edef] hover:text-bordeaux"
                  [class.bg-[#f7edef]]="item.active"
                  [class.text-bordeaux]="item.active"
                >
                  <span class="profile-menu-icon" aria-hidden="true">{{ item.icon }}</span>
                  {{ item.label }}
                </a>
              }
              <a routerLink="/auth/login" class="mx-1 flex min-h-10 items-center gap-2 rounded-[8px] px-4 text-sm text-[#2c2729] hover:bg-[#f7edef] hover:text-bordeaux" (click)="auth.logout()">
                <span class="profile-menu-icon" aria-hidden="true">logout</span>
                Sair
              </a>
            </nav>

            <div class="m-4 border border-[#e3d4d8] bg-[#fbfaf7] p-4">
              <span class="text-xs font-extrabold uppercase text-[#735c00]">Jindungo</span>
              <strong class="mt-1 block font-display text-xl font-extrabold text-bordeaux">{{ auth.hasPremiumAccess() ? 'Subscrito' : 'Por subscrever' }}</strong>
              <p class="mt-1 text-xs leading-5 text-[#534345]">Acesso gratuito aos textos reservados.</p>
            </div>
          </aside>

          <section>
            <header class="border-b border-[#e3d4d8] px-6 py-7 text-center">
              <h1 class="font-display text-[clamp(1.45rem,2vw,1.9rem)] font-extrabold leading-tight text-bordeaux">Subscricoes</h1>
              <span class="mx-auto mt-2 block max-w-[680px] text-[0.95rem] leading-6 text-[#534345]">
                Subscrever aqui e como seguir um canal: nao envolve dinheiro, apenas liga a sua conta a recursos que nao ficam disponiveis para todos.
              </span>
            </header>

            <div class="grid gap-6 px-5 py-6 lg:px-10">
              <div class="grid gap-4 md:grid-cols-2">
                @for (plan of subscriptionService.plans(); track plan.id) {
                  <article class="border border-[#ebe7e9] bg-white p-5">
                    <h2 class="font-display text-xl font-extrabold text-bordeaux">{{ plan.name }}</h2>
                    <p class="mt-2 text-sm leading-6 text-black/60">{{ plan.description }}</p>

                    <ul class="mt-5 grid gap-2 text-sm text-black/70">
                      @for (feature of plan.features; track feature) {
                        <li class="flex items-center gap-2">
                          <span class="grid size-5 place-items-center rounded-full bg-bordeaux text-[10px] font-bold text-white">+</span>
                          {{ feature }}
                        </li>
                      }
                    </ul>

                    @if (plan.id === 'jindungo') {
                      <div class="mt-5 flex flex-wrap gap-3">
                        <button type="button" class="min-h-10 rounded-[3px] bg-bordeaux px-6 text-xs font-bold text-white" (click)="subscribeToJindungo()">
                          Subscrever
                        </button>
                        <a routerLink="/app/contents" class="inline-flex min-h-10 items-center justify-center rounded-[3px] border border-bordeaux px-6 text-xs font-bold text-bordeaux">
                          Ver mais textos
                        </a>
                      </div>
                    }
                  </article>
                }
              </div>

              <section class="border border-[#ebe7e9] bg-white p-5">
                <div class="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 class="font-display text-xl font-extrabold text-bordeaux">Textos com Jindungo subscritos</h2>
                    <p class="mt-2 text-sm text-black/60">Todos os textos Jindungo associados a sua subscricao.</p>
                  </div>
                  <a routerLink="/app/contents" class="inline-flex min-h-10 items-center justify-center rounded-[3px] border border-bordeaux px-5 text-xs font-bold text-bordeaux">
                    Ver mais textos para subscrever
                  </a>
                </div>

                <div class="mt-5 grid gap-4 lg:grid-cols-3">
                  @for (text of subscriptionService.subscribedJindungoTexts(); track text.id) {
                    <a [routerLink]="text.route" class="block rounded-[3px] border border-black/10 p-4 transition hover:border-gold hover:bg-gold/5">
                      <span class="text-[10px] font-extrabold uppercase tracking-[0.08em] text-bordeaux">Subscrito em {{ text.subscribedAt }}</span>
                      <h3 class="mt-3 text-base font-extrabold leading-snug text-bordeaux">{{ text.title }}</h3>
                      <p class="mt-2 text-xs leading-5 text-black/60">{{ text.excerpt }}</p>
                      <span class="mt-4 inline-flex text-xs font-bold text-black/55">{{ text.readingMinutes }} min leitura</span>
                    </a>
                  }
                </div>
              </section>
            </div>
          </section>
        </section>
      </main>

      <app-public-footer />
      <app-back-to-top />
    </section>
  `,
})
export class SubscriptionsPage {
  readonly subscriptionService = inject(SubscriptionService);
  readonly auth = inject(AuthStateService);
  readonly profileMenu = [
    { label: 'Perfil', icon: 'person', route: '/app/profile', active: false },
    { label: 'Meu aprendizado', icon: 'school', route: '/app/profile/learning', active: false },
    { label: 'Minhas conquistas', icon: 'military_tech', route: '/app/profile/achievements', active: false },
    { label: 'Historico', icon: 'history', route: '/app/profile/history', active: false },
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
