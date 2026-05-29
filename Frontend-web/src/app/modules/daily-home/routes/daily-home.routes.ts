import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RouterLink, Routes } from '@angular/router';
import { AuthStateService } from '../../../services/auth-state.service';
import { BackToTopComponent } from '../../../shared/back-to-top/back-to-top.component';
import { AngolaEconomicMapComponent } from '../../../shared/angola-economic-map/angola-economic-map.component';
import { PublicFooterComponent } from '../../../shared/public-footer/public-footer.component';
import { PublicNavbarComponent } from '../../../shared/public-navbar/public-navbar.component';

interface DailyPublication {
  id: string;
  type: 'Artigo' | 'Podcast' | 'Quiz' | 'Jindungo' | 'Forum';
  title: string;
  summary: string;
  author: string;
  publishedAt: string;
  time: string;
  route: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-daily-home-page',
  imports: [RouterLink, PublicNavbarComponent, PublicFooterComponent, BackToTopComponent, AngolaEconomicMapComponent],
  template: `
    <section class="-m-6 min-h-dvh bg-[#f7f8f8] text-[#2c2729]">
      <app-public-navbar />

      @if (showWelcome()) {
        <section class="fixed left-0 right-0 top-[58px] z-30 pointer-events-none">
          <div class="fluid-container pt-4">
            <p class="w-fit rounded-[8px] border border-[#eadde1] bg-white px-5 py-3 text-sm font-bold text-bordeaux shadow-[0_18px_45px_rgba(64,8,26,0.12)]">
              Bem vindo, &#64;{{ userName() }}
            </p>
          </div>
        </section>
      }

      <main>
        <section class="relative overflow-hidden bg-white">
          @if (featuredPublication(); as featured) {
            <div class="absolute inset-0">
              <img [src]="featured.imageUrl" [alt]="featured.title" class="h-full w-full object-cover" />
              <div class="absolute inset-0 bg-[linear-gradient(90deg,#f8f9fa_0%,rgba(248,249,250,0.94)_38%,rgba(248,249,250,0.68)_68%,rgba(248,249,250,0.2)_100%)]"></div>
            </div>

            <div class="fluid-container relative z-10 grid min-h-[430px] items-center py-14 lg:grid-cols-[minmax(0,0.9fr)_360px] lg:py-20">
              <div class="max-w-[760px]">
                <p class="text-[12px] font-bold uppercase tracking-[0.18em] text-[#735c00]">Resumo diario</p>
                <h1 class="mt-4 font-display text-[38px] font-extrabold leading-[1.04] text-[#40081a] sm:text-[48px]">
                  Hoje na Economia com Historia
                </h1>
                <p class="mt-5 max-w-[620px] text-[16px] leading-8 text-[#534345]">
                  Tudo que foi publicado hoje reunido num so lugar: artigos, quizzes, podcasts, debates e textos Jindungo para acompanhar o dia sem perder o fio.
                </p>
                <div class="mt-8 flex flex-wrap gap-3">
                  <a [routerLink]="featured.route" class="inline-flex min-h-12 items-center justify-center rounded-[8px] bg-[#40081a] px-7 text-[13px] font-bold text-white shadow-lg shadow-[#40081a]/15 transition hover:-translate-y-0.5">
                    Abrir destaque
                  </a>
                  <a routerLink="/app/contents" class="inline-flex min-h-12 items-center justify-center rounded-[8px] border border-[#40081a] bg-white/80 px-7 text-[13px] font-bold text-[#40081a] transition hover:bg-[#40081a] hover:text-white">
                    Ver conteudos
                  </a>
                </div>
              </div>

              <aside class="mt-8 rounded-[8px] border border-[#d8c1c4]/70 bg-white/92 p-6 shadow-[0_22px_60px_rgba(64,8,26,0.12)] backdrop-blur lg:mt-0">
                <span class="rounded-[4px] bg-[#5c1e2f] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-white">{{ featured.type }}</span>
                <h2 class="mt-4 font-display text-[24px] font-extrabold leading-tight text-[#40081a]">{{ featured.title }}</h2>
                <p class="mt-3 text-[13px] leading-6 text-[#5f575b]">{{ featured.summary }}</p>
                <div class="mt-5 flex items-center justify-between gap-4 border-t border-[#eee7ea] pt-4 text-xs font-bold">
                  <span class="text-[#534345]">{{ featured.author }}</span>
                  <span class="text-[#735c00]">{{ featured.time }}</span>
                </div>
              </aside>
            </div>
          }
        </section>

        <section class="fluid-container -mt-8 relative z-20">
          <div class="grid gap-4 rounded-[8px] border border-[#e3d4d8] bg-white p-4 shadow-[0_18px_50px_rgba(22,19,21,0.06)] md:grid-cols-3">
            <article class="rounded-[8px] bg-[#fbfaf7] p-5">
              <span class="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#735c00]">Publicacoes</span>
              <strong class="mt-2 block font-display text-[34px] text-[#40081a]">{{ todaysPublications().length }}</strong>
              <p class="text-sm text-[#5f575b]">publicadas hoje</p>
            </article>
            @for (group of publicationSummary(); track group.type) {
              <article class="flex items-center justify-between rounded-[8px] border border-[#f0ecee] p-5">
                <span class="text-sm font-extrabold text-[#534345]">{{ group.type }}</span>
                <strong class="font-display text-[28px] text-[#40081a]">{{ group.count }}</strong>
              </article>
            }
          </div>
        </section>

        <section class="fluid-container py-10 lg:py-14">
          <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 class="font-display text-[30px] font-extrabold text-[#40081a]">Publicado hoje</h2>
              <p class="mt-2 text-sm text-[#5f575b]">Um resumo visual para entrar rapidamente nos temas do dia.</p>
            </div>
            <a routerLink="/app/contents" class="inline-flex min-h-10 items-center justify-center rounded-[8px] border border-[#40081a] px-5 text-xs font-bold text-[#40081a] transition hover:bg-[#40081a] hover:text-white">
              Ver arquivo completo
            </a>
          </div>

          <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            @for (publication of todaysPublications(); track publication.id) {
              <article class="group overflow-hidden rounded-[8px] border border-[#d8c1c4]/60 bg-white shadow-[0_1px_2px_rgba(22,19,21,0.03)] transition duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                <a [routerLink]="publication.route" class="block">
                  <div class="relative h-[190px] overflow-hidden bg-[#eee9eb]">
                    <img [src]="publication.imageUrl" [alt]="publication.title" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <span class="absolute left-4 top-4 rounded-[4px] bg-[#40081a]/92 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-white">{{ publication.type }}</span>
                    <span class="absolute bottom-4 right-4 rounded-[4px] bg-white/92 px-3 py-1 text-[11px] font-bold text-[#735c00]">{{ publication.time }}</span>
                  </div>

                  <div class="grid min-h-[230px] content-start p-6">
                    <h3 class="font-display text-[21px] font-extrabold leading-tight text-[#40081a]">{{ publication.title }}</h3>
                    <p class="mt-3 line-clamp-3 text-[13px] leading-6 text-[#5f575b]">{{ publication.summary }}</p>
                    <div class="mt-auto flex items-center justify-between gap-4 border-t border-[#f0ecee] pt-4 text-xs font-bold">
                      <span class="text-[#534345]">{{ publication.author }}</span>
                      <span class="text-[#735c00]">Abrir</span>
                    </div>
                  </div>
                </a>
              </article>
            }
          </div>
        </section>

        <section class="bg-white py-12 lg:py-16">
          <div class="fluid-container">
            <app-angola-economic-map />
          </div>
        </section>
      </main>

      <app-public-footer />
      <app-back-to-top />
    </section>
  `,
})
export class DailyHomePage implements OnInit, OnDestroy {
  readonly auth = inject(AuthStateService);
  readonly showWelcome = signal(true);
  private welcomeTimer?: ReturnType<typeof window.setTimeout>;

  readonly publications: DailyPublication[] = [
    {
      id: 'daily-cafe-planalto',
      type: 'Artigo',
      title: 'A economia do cafe no planalto angolano',
      summary: 'Uma leitura historica sobre exportacao, trabalho e transformacao regional no planalto.',
      author: 'Equipa editorial',
      publishedAt: '2026-05-29',
      time: '08:20',
      route: '/app/contents/rotas-comerciais',
      imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'daily-jindungo-kwanza',
      type: 'Jindungo',
      title: 'O Impacto das Reservas Internacionais no Kwanza',
      summary: 'Relatorio reservado sobre cambio, balanca comercial e soberania monetaria angolana.',
      author: 'Jindungo Lab',
      publishedAt: '2026-05-29',
      time: '10:45',
      route: '/app/contents/imposto-reservas',
      imageUrl: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'daily-quiz-moeda',
      type: 'Quiz',
      title: 'Quiz rapido: inflacao, moeda e memoria social',
      summary: 'Cinco perguntas para testar os conceitos economicos publicados hoje.',
      author: 'Nucleo academico',
      publishedAt: '2026-05-29',
      time: '12:10',
      route: '/app/quizzes',
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'daily-podcast-lunda',
      type: 'Podcast',
      title: 'Ep. especial: mercado de diamantes na Lunda Sul',
      summary: 'Conversa sobre cadeia de valor, concessoes mineiras e impacto economico regional.',
      author: 'Equipa EH',
      publishedAt: '2026-05-29',
      time: '14:30',
      route: '/app/podcasts',
      imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'daily-forum-agro',
      type: 'Forum',
      title: 'Debate: diversificacao economica e agro-industria',
      summary: 'Discussao aberta sobre politicas de incentivo, producao local e exportacao.',
      author: 'Comunidade',
      publishedAt: '2026-05-29',
      time: '16:05',
      route: '/app/forums',
      imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  ngOnInit(): void {
    this.welcomeTimer = window.setTimeout(() => this.showWelcome.set(false), 4200);
  }

  ngOnDestroy(): void {
    if (this.welcomeTimer) {
      window.clearTimeout(this.welcomeTimer);
    }
  }

  userName(): string {
    return this.auth.user()?.name || 'Estudante Angola';
  }

  todaysPublications(): DailyPublication[] {
    return this.publications.filter((publication) => publication.publishedAt === '2026-05-29');
  }

  featuredPublication(): DailyPublication | undefined {
    return this.todaysPublications()[0];
  }

  publicationSummary(): Array<{ type: string; count: number }> {
    return ['Artigo', 'Jindungo', 'Quiz', 'Podcast', 'Forum']
      .map((type) => ({
        type,
        count: this.todaysPublications().filter((publication) => publication.type === type).length,
      }))
      .filter((group) => group.count > 0);
  }
}

export const DAILY_HOME_ROUTES: Routes = [{ path: '', component: DailyHomePage }];
