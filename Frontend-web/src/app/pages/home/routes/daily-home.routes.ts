import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RouterLink, Routes } from '@angular/router';
import { AuthStateService } from '../../../services/auth-state.service';
import { BackToTopComponent } from '../../../components/back-to-top/back-to-top.component';
import { PublicFooterComponent } from '../../../components/public-footer/public-footer.component';
import { PublicNavbarComponent } from '../../../components/public-navbar/public-navbar.component';

interface DailyContent {
  id: string; 
  type: 'Artigo' | 'Video' | 'Podcast' | 'Quiz' | 'Jindungo' | 'Forum';
  title: string;
  summary: string;
  author: string;
  route: string;
  imageUrl: string;
  meta: string;
  premium?: boolean;
  progress?: number;
}

@Component({
  selector: 'app-daily-home-page',
  imports: [RouterLink, PublicNavbarComponent, PublicFooterComponent, BackToTopComponent],
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
        <section class="relative overflow-hidden bg-[#14060b] text-white">
          @if (activeHighlight(); as highlight) {
            <div class="absolute inset-0">
              <img [src]="highlight.imageUrl" [alt]="highlight.title" class="h-full w-full object-cover" />
              <div class="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,6,11,0.96)_0%,rgba(20,6,11,0.76)_46%,rgba(20,6,11,0.36)_100%)]"></div>
            </div>

            <div class="fluid-container relative z-10 flex min-h-[500px] items-end py-10 lg:items-center lg:py-16">
              <a [routerLink]="highlight.route" class="block max-w-[760px] pb-4">
                <span class="inline-flex items-center gap-2 rounded-[4px] bg-white/12 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white ring-1 ring-white/20">
                  <span class="material-symbols-outlined text-[16px]" aria-hidden="true">play_arrow</span>
                  {{ highlight.type }} em destaque
                </span>
                <h1 class="mt-5 font-display text-[38px] font-extrabold leading-[1.04] text-white sm:text-[52px]">
                  {{ highlight.title }}
                </h1>
                <p class="mt-5 max-w-[640px] text-[16px] leading-8 text-white/82">{{ highlight.summary }}</p>
                <span class="mt-7 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#40081a] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
                  <span class="material-symbols-outlined" aria-hidden="true">play_arrow</span>
                </span>
              </a>
            </div>
          }
        </section>

        <section class="bg-white py-10 lg:py-14">
          <div class="fluid-container">
            <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 class="mt-2 font-display text-[30px] font-extrabold text-[#40081a]">Sugestoes para continuar</h2>
              </div>
              <a routerLink="/app/contents" class="inline-flex min-h-10 items-center justify-center rounded-[8px] border border-[#40081a] px-5 text-xs font-bold text-[#40081a] transition hover:bg-[#40081a] hover:text-white">
                Ver biblioteca
              </a>
            </div>

            <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              @for (item of recommendedContent; track item.id) {
                <article
                  class="group overflow-hidden rounded-[8px] border border-[#d8c1c4]/60 bg-white shadow-[0_1px_2px_rgba(22,19,21,0.03)] transition duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                  [style.height.px]="item.type === 'Quiz' ? 368 : null"
                  [style.max-width.px]="item.type === 'Quiz' ? 311 : null"
                >
                  <a [routerLink]="item.route" class="block h-full">
                    <div class="relative h-[190px] overflow-hidden bg-[#eee9eb]" [style.height.px]="item.type === 'Quiz' ? 150 : null">
                      <img [src]="item.imageUrl" [alt]="item.title" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      <span class="absolute left-4 top-4 rounded-[4px] bg-[#40081a]/92 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-white">{{ item.type }}</span>
                      @if (item.premium) {
                        <span class="absolute bottom-4 right-4 rounded-[4px] bg-[#d4af37] px-3 py-1 text-[11px] font-extrabold text-[#40081a]">Subscricao</span>
                      }
                    </div>
                    <div class="grid min-h-[210px] content-start p-6" [class.min-h-0]="item.type === 'Quiz'" [class.p-5]="item.type === 'Quiz'" [style.height.px]="item.type === 'Quiz' ? 218 : null">
                      <small class="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#735c00]">{{ item.meta }}</small>
                      <h3 class="mt-2 font-display text-[21px] font-extrabold leading-tight text-[#40081a]">{{ item.title }}</h3>
                      <p class="mt-3 line-clamp-3 text-[13px] leading-6 text-[#5f575b]">{{ item.summary }}</p>
                      <span class="mt-auto border-t border-[#f0ecee] pt-4 text-xs font-bold text-[#735c00]">Abrir</span>
                    </div>
                  </a>
                </article>
              }
            </div>
          </div>
        </section>

        <section class="fluid-container py-10 lg:py-12">
          <div class="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p class="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#735c00]">Retomar agora</p>
              <h2 class="mt-2 font-display text-[28px] font-extrabold text-[#40081a]">Continue de onde parou</h2>
            </div>
          </div>

          <div class="grid gap-6 sm:grid-cols-2 lg:flex">
            @for (item of resumeItems; track item.id) {
              <article class="group h-[368px] w-full max-w-[311px] overflow-hidden rounded-[8px] border border-[#d8c1c4]/70 bg-white shadow-[0_18px_50px_rgba(22,19,21,0.045)] transition duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                <a [routerLink]="item.route" class="flex h-full flex-col">
                  <div class="relative h-[136px] overflow-hidden bg-[#eee9eb]">
                    <img [src]="item.imageUrl" [alt]="item.title" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <span class="absolute left-4 top-4 rounded-[4px] bg-[#40081a]/92 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-white">{{ item.type }}</span>
                  </div>
                  <div class="flex flex-1 flex-col p-5">
                    <small class="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#735c00]">{{ item.meta }}</small>
                    <h3 class="mt-2 font-display text-[21px] font-extrabold leading-tight text-[#40081a]">{{ item.title }}</h3>
                    <p class="mt-3 line-clamp-3 text-[13px] leading-6 text-[#5f575b]">{{ item.summary }}</p>
                    <div class="mt-auto h-2 overflow-hidden rounded-full bg-[#eee7ea]">
                      <span class="block h-full rounded-full bg-[#5c1e2f]" [style.width.%]="item.progress"></span>
                    </div>
                    <div class="mt-4 flex items-center justify-between gap-4">
                      <small class="text-xs font-bold text-[#534345]">{{ item.progress }}% concluido</small>
                      <span class="text-xs font-bold text-[#735c00]">Retomar</span>
                    </div>
                  </div>
                </a>
              </article>
            }
          </div>
        </section>

        <section class="fluid-container py-10 lg:py-14">
          <div class="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(300px,0.55fr)]">
            <article class="overflow-hidden rounded-[8px] border border-[#d8c1c4] bg-[#40081a] text-white shadow-[0_20px_60px_rgba(64,8,26,0.18)]">
              <div class="grid gap-6 p-7 lg:grid-cols-[1fr_220px] lg:items-center">
                <div>
                  <p class="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#d4af37]">Texto com Jindungo</p>
                  <h2 class="mt-3 font-display text-[31px] font-extrabold leading-tight">O Impacto das Reservas Internacionais no Kwanza</h2>
                  <p class="mt-3 text-sm leading-7 text-white/82">
                    Relatorio premium com leitura historica, dados economicos, balanca comercial e efeitos sociais da estabilidade cambial.
                  </p>
                  <a routerLink="/app/subscriptions" class="mt-6 inline-flex min-h-11 items-center justify-center rounded-[8px] bg-[#d4af37] px-6 text-xs font-extrabold text-[#40081a]">
                    Subscrever Jindungo
                  </a>
                </div>
                <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80" alt="Relatorio economico premium" class="h-[210px] w-full rounded-[8px] object-cover" />
              </div>
            </article>

            <aside class="rounded-[8px] border border-[#d8c1c4]/70 bg-white p-6">
              <p class="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#735c00]">Fila rapida</p>
              <div class="mt-4 grid gap-3">
                @for (item of quickQueue; track item.id) {
                  <a [routerLink]="item.route" class="grid grid-cols-[54px_1fr] gap-3 rounded-[8px] border border-[#eee7ea] p-2 transition hover:border-[#5c1e2f] hover:bg-[#f7edef]">
                    <img [src]="item.imageUrl" [alt]="item.title" class="h-[54px] w-[54px] rounded-[6px] object-cover" />
                    <span>
                      <small class="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#735c00]">{{ item.type }}</small>
                      <strong class="line-clamp-2 block text-sm font-extrabold leading-tight text-[#40081a]">{{ item.title }}</strong>
                    </span>
                  </a>
                }
              </div>
            </aside>
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
  readonly activeHighlightIndex = signal(0);
  private welcomeTimer?: ReturnType<typeof window.setTimeout>;
  private carouselTimer?: ReturnType<typeof window.setInterval>;

  readonly highlights: DailyContent[] = [
    {
      id: 'jindungo-reservas',
      type: 'Jindungo',
      title: 'Jindungo: Reservas internacionais e soberania monetaria',
      summary: 'Uma leitura premium sobre cambio, importacoes, memoria inflacionaria e as decisoes que moldam o Kwanza.',
      author: 'Jindungo Lab',
      route: '/app/contents/imposto-reservas',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80',
      meta: 'Premium',
      premium: true,
      progress: 74,
    },
    {
      id: 'video-cafe',
      type: 'Video',
      title: 'Do cafe ao petroleo: ciclos economicos que mudaram Angola',
      summary: 'Video-aula com mapas, imagens de arquivo e conceitos essenciais para entender a economia angolana.',
      author: 'Equipa EH',
      route: '/app/contents',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80',
      meta: '18 min',
      progress: 42,
    },
    {
      id: 'podcast-lobito',
      type: 'Podcast',
      title: 'Corredor do Lobito e a nova geografia das exportacoes',
      summary: 'Conversa sobre portos, caminho-de-ferro, mineiros, agricultores e mercados regionais.',
      author: 'Podcast EH',
      route: '/app/podcasts',
      imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1400&q=80',
      meta: '42 min',
      progress: 58,
    },
  ];

  readonly quizResume: DailyContent = {
    id: 'quiz-moeda',
    type: 'Quiz',
    title: 'Quiz: moeda, inflacao e memoria social',
    summary: 'Continuar de onde parou: faltam perguntas sobre Kwanza, poder de compra e politica monetaria.',
    author: 'Nucleo academico',
    route: '/app/quizzes',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
    meta: '6 de 10 perguntas',
    progress: 60,
  };

  readonly podcastResume: DailyContent = {
    id: 'podcast-diamantes',
    type: 'Podcast',
    title: 'Diamantes na Lunda Sul: cadeia de valor e historia local',
    summary: 'Retome o episodio no ponto em que ficou e acompanhe a discussao sobre economia mineira regional.',
    author: 'Podcast EH',
    route: '/app/podcasts',
    imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=900&q=80',
    meta: '24:18',
    progress: 48,
  };

  readonly resumeItems: DailyContent[] = [this.quizResume, this.podcastResume];

  readonly videoContent: DailyContent[] = [
    {
      id: 'video-ferrovia',
      type: 'Video',
      title: 'Ferrovias, portos e mercados: a logistica que move Angola',
      summary: 'Aula visual sobre corredores de transporte, exportacoes e integracao regional.',
      author: 'Equipa EH',
      route: '/app/contents',
      imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=900&q=80',
      meta: 'Video 14 min',
      progress: 36,
    },
    {
      id: 'video-inflacao',
      type: 'Video',
      title: 'Inflacao explicada com exemplos do quotidiano angolano',
      summary: 'Conceitos de poder de compra, moeda e precos apresentados de forma aplicada.',
      author: 'Equipa EH',
      route: '/app/contents',
      imageUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=900&q=80',
      meta: 'Video 11 min',
      progress: 64,
    },
  ];

  readonly recommendedContent: DailyContent[] = [
    ...this.highlights,
    ...this.videoContent,
    this.podcastResume,
    {
      id: 'artigo-planalto',
      type: 'Artigo',
      title: 'A economia do cafe no planalto angolano',
      summary: 'Uma leitura historica sobre exportacao, trabalho, ferrovias e transformacao regional no planalto.',
      author: 'Equipa editorial',
      route: '/app/contents/rotas-comerciais',
      imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
      meta: 'Leitura 8 min',
    },
  ];

  readonly quickQueue = this.recommendedContent.slice(1, 5);

  ngOnInit(): void {
    this.welcomeTimer = window.setTimeout(() => this.showWelcome.set(false), 4200);
    this.carouselTimer = window.setInterval(() => this.nextHighlight(), 3600);
  }

  ngOnDestroy(): void {
    if (this.welcomeTimer) {
      window.clearTimeout(this.welcomeTimer);
    }

    if (this.carouselTimer) {
      window.clearInterval(this.carouselTimer);
    }
  }

  userName(): string {
    return this.auth.user()?.name || 'Estudante Angola';
  }

  activeHighlight(): DailyContent {
    return this.highlights[this.activeHighlightIndex()] ?? this.highlights[0];
  }

  setHighlight(index: number): void {
    this.activeHighlightIndex.set(index);
  }

  private nextHighlight(): void {
    this.activeHighlightIndex.update((index) => (index + 1) % this.highlights.length);
  }
}

export const DAILY_HOME_ROUTES: Routes = [{ path: '', component: DailyHomePage }];
