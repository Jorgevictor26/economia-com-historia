import { Component, inject } from '@angular/core';
import { RouterLink, Routes } from '@angular/router';
import { AuthStateService } from '../../../services/auth-state.service';
import { BackToTopComponent } from '../../../shared/back-to-top/back-to-top.component';
import { PublicFooterComponent } from '../../../shared/public-footer/public-footer.component';
import { PublicNavbarComponent } from '../../../shared/public-navbar/public-navbar.component';

@Component({
  selector: 'app-jindungo-page',
  imports: [RouterLink, PublicNavbarComponent, PublicFooterComponent, BackToTopComponent],
  template: `
    <section class="min-h-dvh bg-white text-[#2c2729]">
      <app-public-navbar />

      <main>
        <section class="fluid-container-narrow pb-12 pt-6 text-center">
          <p class="mx-auto mb-3 inline-flex h-4 items-center justify-center bg-[#d4af37] px-2 text-[7px] font-extrabold uppercase tracking-[0.12em] text-[#5c1e2f]">Premium Editorial</p>
          <h1 class="font-display mx-auto max-w-[390px] text-[28px] font-extrabold leading-[1.04] text-[#8a1538]">
            Desbloqueie a Profundidade da Economia Angolana
          </h1>
          <p class="mx-auto mt-6 max-w-[360px] text-[9px] leading-4 text-[#6f686b]">
            Tenha acesso a textos premium e análises históricas que ligam política, economia e sociedade em Angola.
          </p>
          <a [routerLink]="auth.isAuthenticated() ? '/app/subscriptions' : null" class="mt-6 inline-flex h-10 items-center justify-center bg-[#5c0b25] px-8 text-[10px] font-extrabold text-white" (click)="!auth.isAuthenticated() && requireLogin($event, 'subscrever ao Jindungo')">
            {{ auth.isAuthenticated() ? 'Subscrever' : 'Entrar para subscrever' }}
          </a>
          <p class="mt-6 text-[9px] text-[#8a1538]">♙</p>
          <p class="mt-1 text-[7px] text-[#b3aaae]">Junte-se a nossa comunidade académica.</p>

          <div class="mx-auto mt-12 grid max-w-[1120px] gap-4 text-left md:grid-cols-3 2xl:gap-6">
            <article class="min-h-[172px] border border-[#d8b7c1] bg-white p-7">
              <span class="mb-5 grid size-8 place-items-center bg-[#f9dbe4] text-[17px] text-[#8a1538]">▤</span>
              <h2 class="font-display text-[15px] font-extrabold text-[#8a1538]">Análises Exclusivas</h2>
              <p class="mt-4 text-[10px] leading-5 text-[#5f575b]">
                Ensaios aprofundados sobre transformação económica e ciclos históricos do país.
              </p>
            </article>
            <article class="min-h-[172px] border border-[#d8b7c1] bg-white p-7">
              <span class="mb-5 grid size-8 place-items-center bg-[#f9dbe4] text-[17px] text-[#8a1538]">▣</span>
              <h2 class="font-display text-[15px] font-extrabold text-[#8a1538]">Rigor Histórico</h2>
              <p class="mt-4 text-[10px] leading-5 text-[#5f575b]">
                Fontes, arquivos e contexto para ler a economia angolana com profundidade.
              </p>
            </article>
            <article class="min-h-[172px] border border-[#d8b7c1] bg-white p-7">
              <span class="mb-5 grid size-8 place-items-center bg-[#f9dbe4] text-[17px] text-[#8a1538]">♜</span>
              <h2 class="font-display text-[15px] font-extrabold text-[#8a1538]">Comunidade de Elite</h2>
              <p class="mt-4 text-[10px] leading-5 text-[#5f575b]">
                Conteúdos pensados para estudantes, investigadores e profissionais.
              </p>
            </article>
          </div>
        </section>

        <section class="bg-[#f2f3f3] px-6 py-16">
          <div class="fluid-container-narrow text-center">
            <h2 class="font-display text-[22px] font-extrabold text-[#5c1e2f]">Edições Recentes</h2>
            <p class="mt-3 text-[10px] text-[#6f686b]">Veja o que espera por si nos textos com Jindungo.</p>

            <div class="mx-auto mt-12 grid max-w-[1120px] gap-5 md:grid-cols-3 2xl:gap-7">
              @for (edition of editions; track edition.title) {
                <article class="relative overflow-hidden bg-white text-left shadow-[0_1px_2px_rgba(22,19,21,0.04)]">
                  <div class="relative h-[142px] overflow-hidden">
                    <img [src]="edition.image" [alt]="edition.title" class="h-full w-full object-cover grayscale" [class.blur-[3px]]="!auth.canReadJindungo()" />
                    @if (!auth.canReadJindungo()) {
                      <div class="absolute inset-0 bg-white/35"></div>
                    }
                    <span class="absolute bottom-[-14px] left-1/2 grid size-12 -translate-x-1/2 place-items-center rounded-full bg-[#5c0b25] text-[18px] text-white">▣</span>
                  </div>
                  <div class="min-h-[122px] px-5 pb-6 pt-7" [class.blur-[2px]]="!auth.canReadJindungo()">
                    <p class="text-[8px] font-extrabold uppercase text-[#8a1538]">{{ auth.canReadJindungo() ? 'Disponível para si' : 'Reservado a subscritores' }}</p>
                    <h3 class="font-display mt-2 text-[13px] font-extrabold leading-snug text-[#5c1e2f]">{{ edition.title }}</h3>
                    <p class="mt-3 text-[9px] leading-4 text-[#8a8587]">{{ edition.text }}</p>
                  </div>
                </article>
              }
            </div>
          </div>
        </section>

        <section class="mx-auto max-w-[520px] px-6 py-20">
          <h2 class="font-display text-center text-[21px] font-extrabold text-[#5c1e2f]">Perguntas Frequentes</h2>

          <div class="mt-12 space-y-7">
            <article>
              <h3 class="font-display text-[14px] font-extrabold text-[#5c1e2f]">A subscrição é mesmo gratuita?</h3>
              <p class="mt-3 text-[10px] leading-5 text-[#5f575b]">
                Sim. O nosso objetivo principal é criar e cultivar uma comunidade de investigadores e curiosos altamente especializados que valorizam o rigor acima do sensacionalismo.
              </p>
            </article>
            <div class="border-t border-[#eee7ea]"></div>
            <article>
              <h3 class="font-display text-[14px] font-extrabold text-[#5c1e2f]">O que diferencia o Jindungo?</h3>
              <p class="mt-3 text-[10px] leading-5 text-[#5f575b]">
                Os Textos com Jindungo são a nossa camada mais crítica. Enquanto o conteúdo geral é educativo, o Jindungo foca-se na análise profunda, utilizando métodos académicos para questionar paradigmas económicos atuais.
              </p>
            </article>
          </div>

          <div class="mt-12 text-center">
            <a [routerLink]="auth.isAuthenticated() ? '/app/subscriptions' : null" class="inline-flex h-12 items-center justify-center bg-[#5c0b25] px-9 text-[14px] font-extrabold text-white" (click)="!auth.isAuthenticated() && requireLogin($event, 'subscrever ao Jindungo')">
              {{ auth.isAuthenticated() ? 'Quero Subscrever Agora' : 'Entrar para subscrever' }}
            </a>
          </div>
        </section>
      </main>

      <app-public-footer />
      <app-back-to-top />
    </section>
  `,
})
export class JindungoPage {
  readonly auth = inject(AuthStateService);

  requireLogin(event: Event, operation: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.auth.requireLoginFor(operation);
  }

  readonly editions = [
    {
      title: 'A Crise do Petróleo e os Pactos Regionais',
      text: 'Como as oscilações do crude afetaram decisões de soberania económica.',
      image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Infraestruturas e Círculos Comerciais do Kwanza',
      text: 'Leitura histórica sobre circulação, transporte e tributação.',
      image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'O Papel das Moedas no Comércio Colonial Angolano',
      text: 'Da moeda local às instituições financeiras modernas.',
      image: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&w=600&q=80',
    },
  ];

}

export const JINDUNGO_ROUTES: Routes = [{ path: '', component: JindungoPage }];



