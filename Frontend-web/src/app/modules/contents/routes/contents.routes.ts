import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Routes } from '@angular/router';
import { adminGuard } from '../../../core/guards/admin.guard';
import { AuthStateService } from '../../../services/auth-state.service';
import { BackToTopComponent } from '../../../shared/back-to-top/back-to-top.component';
import { PublicFooterComponent } from '../../../shared/public-footer/public-footer.component';
import { PublicNavbarComponent } from '../../../shared/public-navbar/public-navbar.component';

interface HomeContent {
  id: string;
  category: string;
  meta: string;
  title: string;
  excerpt: string;
  author: string;
  authorInitials: string;
  imageUrl?: string;
  premium?: boolean;
}

@Component({
  selector: 'app-content-list-page',
  imports: [RouterLink, PublicNavbarComponent, PublicFooterComponent, BackToTopComponent],
  template: `
    <section class="-m-6 min-h-dvh bg-[#f7f8f8] text-[#2c2729]">
      <app-public-navbar />

      <main class="mx-auto max-w-[1224px] px-4 pb-14 pt-5 sm:px-6 lg:px-4">
        <div class="mb-9">
          <h1 class="font-display text-[32px] font-extrabold leading-tight text-[#8a4055]">Explorar Conteúdos</h1>
          <label class="mt-7 flex h-[58px] max-w-[772px] items-center gap-3 rounded-[8px] border border-[#f0ecee] bg-white px-5 text-[#7f777b] shadow-[0_1px_2px_rgba(22,19,21,0.02)]">
            <span class="relative size-4 rounded-full border-2 border-current after:absolute after:-bottom-1 after:-right-1 after:h-2 after:w-0.5 after:rotate-[-45deg] after:bg-current"></span>
            <input
              class="w-full bg-transparent text-[13px] text-[#3b3437] outline-none placeholder:text-[#8e878b]"
              type="search"
              placeholder="Pesquisar por autores, períodos históricos ou temas económicos..."
              [value]="searchTerm()"
              (input)="updateSearch($event)"
            />
          </label>
        </div>

        <div class="mb-5 flex flex-wrap items-center gap-3">
          @for (filter of filters; track filter) {
            <button
              type="button"
              class="content-filter-button h-11 min-w-[96px] rounded-[8px] border px-5 text-[12px] font-semibold transition"
              [class.is-selected]="filter === selectedFilter()"
              [class.border-[#8a4055]]="filter === selectedFilter()"
              [class.bg-[#8a4055]]="filter === selectedFilter()"
              [class.text-white]="filter === selectedFilter()"
              [class.border-[#d8cbd0]]="filter !== selectedFilter()"
              [class.bg-white]="filter !== selectedFilter()"
              [class.text-[#5f575b]]="filter !== selectedFilter()"
              (click)="selectFilter(filter)"
            >
              {{ filter }}
            </button>
          }
        </div>

        @if (filteredContents().length === 0) {
          <section class="rounded-[8px] border border-[#e3d4d8] bg-white px-6 py-12 text-center">
            <h2 class="font-display text-[22px] font-extrabold text-[#5c1e2f]">Conteúdo não encontrado</h2>
            <p class="mx-auto mt-3 max-w-[460px] text-[13px] leading-6 text-[#6f686b]">Não encontramos conteúdos para a pesquisa ou filtro aplicado.</p>
          </section>
        }

        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          @for (content of filteredContents(); track content.id) {
            <article
              class="group overflow-hidden bg-white shadow-[0_1px_2px_rgba(22,19,21,0.03)]"
              [class.border]="!content.premium"
              [class.border-[#ded7da]]="!content.premium"
              [class.jindungo-card]="content.premium"
            >
              <a [routerLink]="content.id" class="block">
                <div class="relative h-[216px] overflow-hidden bg-[#eee9eb]" [class.h-[170px]]="content.premium">
                  @if (content.imageUrl) {
                    <img
                      [src]="content.imageUrl"
                      [alt]="content.title"
                      class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      [class.brightness-[0.55]]="content.premium && !auth.canReadJindungo()"
                    />
                  }
                  <span
                    class="absolute left-4 top-4 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em]"
                    [class.bg-[#5c1e2f]]="!content.premium"
                    [class.text-white]="!content.premium"
                    [class.bg-[#7d263c]]="content.premium"
                    [class.text-[#d4af37]]="content.premium"
                  >
                    {{ content.premium ? 'Jindungo' : content.category }}
                  </span>

                  @if (content.premium && !auth.canReadJindungo()) {
                    <div class="absolute inset-0 grid place-items-center">
                      <div class="grid size-[58px] place-items-center rounded-[8px] bg-white/95 shadow-lg">
                        <img src="/assets/icons/lock.png" alt="Bloqueado" class="h-7 w-7 object-contain" />
                      </div>
                    </div>
                  }
                </div>

                <div class="grid min-h-[270px] gap-3 p-6" [class.min-h-[278px]]="content.premium">
                  <p class="text-[10px] font-bold uppercase tracking-[0.04em] text-[#6f686b]">{{ content.meta }}</p>
                  <h2 class="font-display text-[21px] font-extrabold leading-[1.16] text-[#5c1e2f]">{{ content.title }}</h2>
                  <p class="line-clamp-3 text-[13px] leading-6 text-[#6f686b]">{{ content.excerpt }}</p>

                  <div
                    class="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3"
                    [class.border-t]="!content.premium"
                    [class.border-[#f0ecee]]="!content.premium"
                  >
                    @if (!content.premium) {
                      <span class="flex items-center gap-2 text-[10px] font-extrabold text-[#4b4447]">
                      <span class="grid size-6 place-items-center rounded-full bg-[#f5dce4] text-[8px] text-[#8a4055]">{{ content.authorInitials }}</span>
                      {{ content.author }}
                      </span>
                    }
                    <span class="flex flex-wrap items-center gap-3 text-[12px] text-[#6f686b]">
                      <button type="button" class="content-action" aria-label="Gostar" (click)="requireLogin($event, 'gostar')">
                        <img src="/assets/icons/like.png" alt="" />
                        <span>12</span>
                      </button>
                      <button type="button" class="content-action" aria-label="Comentar" (click)="requireLogin($event, 'comentar')">
                        <img src="/assets/icons/comment.png" alt="" />
                        <span>5</span>
                      </button>
                      <button type="button" class="content-action" aria-label="Partilhar" (click)="requireLogin($event, 'partilhar')">
                        <img src="/assets/icons/share.png" alt="" />
                      </button>
                      <button type="button" class="content-action" aria-label="Denunciar" (click)="requireLogin($event, 'denunciar')">
                        <img src="/assets/icons/report.png" alt="" />
                      </button>
                    </span>
                  </div>

                  @if (content.premium && !auth.canReadJindungo()) {
                    <button type="button" class="jindungo-unlock-button" (click)="!auth.isAuthenticated() && requireLogin($event, 'subscrever ao Jindungo')">
                      <img src="/assets/icons/lock.png" alt="" />
                      {{ auth.isAuthenticated() ? 'Desbloquear com Jindungo' : 'Desbloquear com Jindungo' }}
                    </button>
                  }
                </div>
              </a>
            </article>
          }
        </div>

        <div class="mt-16 text-center">
          <p class="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-[#8a8587]">A mostrar 9 de 142 artigos</p>
          <button type="button" class="h-[50px] border border-[#5c1e2f] bg-white px-10 text-[12px] font-extrabold text-[#5c1e2f] transition hover:bg-[#5c1e2f] hover:text-white">
            Ver Mais Conteúdos
          </button>
        </div>
      </main>

      <app-public-footer />
      <app-back-to-top />
    </section>
  `,
})
export class ContentListPage {
  readonly auth = inject(AuthStateService);
  readonly filters = ['Todos', 'História', 'Economia', 'Podcasts', 'Jindungo'];
  readonly selectedFilter = signal('Todos');
  readonly searchTerm = signal('');
  readonly filteredContents = computed(() => {
    const filter = this.selectedFilter();
    const query = this.normalizeText(this.searchTerm());

    let results = this.contents;

    if (filter === 'Jindungo') {
      results = results.filter((content) => content.premium);
    } else if (filter !== 'Todos') {
      results = results.filter((content) => content.category.includes(filter));
    }

    if (!query) {
      return results;
    }

    return results.filter((content) =>
      [content.title, content.excerpt, content.author, content.category, content.meta]
        .map((value) => this.normalizeText(value))
        .some((value) => value.includes(query)),
    );
  });

  requireLogin(event: Event, operation: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.auth.requireLoginFor(operation);
  }

  selectFilter(filter: string): void {
    this.selectedFilter.set(filter);
  }

  updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  readonly contents: HomeContent[] = [
    {
      id: 'rotas-comerciais',
      category: 'História',
      meta: '12 Out 2024 - 15 min leitura',
      title: 'As Rotas Comerciais do Reino do Kongo',
      excerpt:
        'Uma análise profunda sobre como a diplomacia e comércio moldaram o poder político na região central de África muito antes da colonização.',
      author: 'Dr. Ricardo Mbaxi',
      authorInitials: 'DR',
      imageUrl: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 'imposto-reservas',
      category: '# Jindungo',
      meta: '08 Out 2024 - Conteúdo exclusivo',
      title: 'O Impacto das Reservas Internacionais no Kwanza',
      excerpt:
        'Relatório trimestral exclusivo para assinantes Premium sobre as projeções cambiais e a balança comercial angolana para 2025.',
      author: 'Jindungo Lab',
      authorInitials: 'JL',
      imageUrl: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&w=900&q=80',
      premium: true,
    },
    {
      id: 'caso-agro',
      category: 'Economia',
      meta: '05 Out 2024 - 10 min leitura',
      title: 'Diversificação Económica: O Caso da Agro-Indústria',
      excerpt:
        'Como as novas políticas de incentivo estão a transformar o Huambo no novo celeiro de exportação de Angola.',
      author: 'Dra. Maria Luvuala',
      authorInitials: 'ML',
      imageUrl: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 'heranca-imperio',
      category: 'Podcast',
      meta: '01 Out 2024 - 45 min áudio',
      title: 'Ep. 24: A Herança do Império Lunda',
      excerpt:
        'Conversa exclusiva com historiadores locais sobre a estrutura económica e social do povo Lunda-Chokwe.',
      author: 'Equipa EH',
      authorInitials: 'EH',
      imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 'diamantes-luanda-sul',
      category: '# Jindungo',
      meta: '28 Set 2024 - Relatório mensal',
      title: 'Análise do Mercado de Diamantes na Lunda Sul',
      excerpt:
        'Um estudo detalhado sobre a cadeia de valor e o impacto das novas concessões mineiras no PIB nacional.',
      author: 'Jindungo Lab',
      authorInitials: 'JL',
      imageUrl: 'https://images.unsplash.com/photo-1642790551116-18e150f248e3?auto=format&fit=crop&w=900&q=80',
      premium: true,
    },
    {
      id: 'nzinga-diplomacia',
      category: 'História',
      meta: '25 Set 2024 - 20 min leitura',
      title: 'A Rainha Nzinga e a Diplomacia com os Holandeses',
      excerpt:
        'Como a soberana do Ndongo e Matamba utilizou alianças estratégicas para manter a independência do seu reino.',
      author: 'Dr. Joaquim Santos',
      authorInitials: 'JS',
      imageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 'evolucao-comercio-kongo',
      category: 'História',
      meta: '22 Set 2024 - 10 min leitura',
      title: 'A Evolução do Comércio no Reino do Kongo',
      excerpt:
        'Um estudo cronológico sobre a transformação das redes comerciais e a influência das moedas tradicionais na região.',
      author: 'Dr. António Manuel',
      authorInitials: 'AM',
    },
    {
      id: 'politica-monetaria-angola',
      category: '# Jindungo',
      meta: '15 Set 2024 - Relatório especial',
      title: 'Análise da Política Monetária de Angola',
      excerpt:
        'Investigação técnica sobre as taxas de juro, inflação e os novos mecanismos de regulação do Banco Nacional de Angola.',
      author: 'Jindungo Lab',
      authorInitials: 'JL',
      premium: true,
    },
    {
      id: 'petroleo-estrutura-social',
      category: 'Economia',
      meta: '10 Set 2024 - 25 min leitura',
      title: 'O Impacto do Petróleo na Estrutura Social',
      excerpt:
        'Como a indústria extractiva redefiniu as classes sociais e o desenvolvimento urbano nas principais capitais provinciais de Angola.',
      author: 'Dra. Sofia Bento',
      authorInitials: 'SB',
    },
  ];
}

@Component({
  selector: 'app-content-detail-page',
  imports: [RouterLink, PublicNavbarComponent, PublicFooterComponent, BackToTopComponent],
  template: `
    <section class="-m-6 min-h-dvh bg-[#f7f8f8] text-[#2c2729]">
      <app-public-navbar />

      <main class="mx-auto grid max-w-[1160px] grid-cols-[200px_minmax(0,560px)_250px] gap-7 px-8 pb-20 pt-8">
        <aside class="hidden lg:block">
          <div class="sticky top-[82px]">
            <section class="border border-[#ded7da] bg-white px-6 py-6 text-center">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=180&q=80&sat=-100"
                alt="Dr. Manuel Kinuani"
                class="mx-auto size-[70px] rounded-[8px] object-cover grayscale"
              />
              <h2 class="font-display mt-5 text-[13px] font-medium text-[#5c1e2f]">Dr. Manuel Kinuani</h2>
              <p class="mx-auto mt-2 max-w-[138px] text-[9px] leading-[1.35] text-[#5f575b]">
                Doutor em História Económica e especialista em civilizações do vale do Congo.
              </p>
              <div class="mt-5 flex justify-center gap-4 text-[#5f575b]">
                <span class="text-[24px] leading-none">⌘</span>
                <span class="text-[24px] leading-none">♧</span>
              </div>
            </section>

            <section class="mt-7 border-t border-[#ded7da] pt-6">
              <h3 class="mb-5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#8a8587]">Métricas</h3>
              <div class="grid gap-4 text-[11px] text-[#5f575b]">
                <p class="flex items-center gap-3"><span class="text-[18px]">▷</span>12 min de leitura</p>
                <p class="flex items-center gap-3"><span class="text-[18px]">⊙</span>4.2k visualizações</p>
              </div>
            </section>
          </div>
        </aside>

        <article class="px-0 pb-12 pt-0">
          <div class="mb-4 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#8c6f36]">
            Série: Economias Pré-Coloniais
          </div>

          <h1 class="font-display max-w-[540px] text-[34px] font-extrabold leading-[1.08] text-[#5c1e2f]">
            As Rotas Comerciais do Reino do Kongo
          </h1>

          <p class="mt-6 max-w-[510px] border-l-4 border-[#d4af37] pl-7 font-display text-[14px] italic leading-7 text-[#81787c]">
            Uma análise profunda sobre as complexas redes de trocas de tecidos de ráfia, sal e zimbo que estruturaram o poder económico centralizado em M'banza Kongo.
          </p>

          <div class="hidden">
            <span>Por <strong class="text-[#5c1e2f]">Dr. Ricardo Mbaxi</strong></span>
            <span class="flex items-center gap-4">♡ 66 □ 12 ↗ ⚑</span>
          </div>

          <figure class="mt-7">
            <img
              src="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80"
              alt="Salão histórico com colunas e iluminação dourada"
              class="h-[310px] w-full object-cover"
            />
            <figcaption class="mt-2 text-center text-[10px] text-[#8a8587]">
              Representação visual das estruturas comerciais e diplomáticas do Kongo.
            </figcaption>
          </figure>

          <div class="mt-8 space-y-6 text-[16px] leading-8 text-[#2f292c]">
            <p>
              Durante séculos, o Reino do Kongo ocupou uma posição estratégica nas redes de comércio da África Central. A sua economia articulava rotas terrestres, mercados locais, relações diplomáticas e corredores atlânticos que ligavam comunidades produtoras, intermediários e centros políticos.
            </p>
            <p>
              A circulação de tecidos, metais, sal, marfim e produtos agrícolas não era apenas uma actividade económica. Era também uma linguagem de poder, onde alianças, tributos e autoridade se expressavam por meio do controlo das rotas e da capacidade de negociar com diferentes povos.
            </p>

            <h2 class="font-display pt-6 text-[28px] font-extrabold leading-tight text-[#5c1e2f]">A Geopolítica do Zimbo</h2>
            <p>
              Diferente das economias europeias da época, a gestão monetária do Kongo era centralizada com um rigor surpreendente. O ManiKongo exercia um controlo directo sobre a "casa da moeda", garantindo que a inflação não erodisse o valor do trabalho e da produção agrícola. Este sistema permitia o financiamento de uma burocracia complexa e de um exército permanente.
            </p>
            <p>
              As rotas transversais ligavam M'banza Kongo aos centros produtores de cobre no leste e às indústrias têxteis de ráfia no norte. O tecido de ráfia, conhecido como <em>lubongo</em>, servia não só como vestuário mas como uma segunda unidade de valor, aceite em transacções inter-regionais.
            </p>

            <div class="my-8 bg-[#f4f4f4] px-8 py-7">
              <h3 class="font-display text-[15px] font-medium text-[#5c1e2f]">Nota do Historiador</h3>
              <p class="mt-4 text-[14px] leading-7 text-[#6f686b]">
                "O rigor com que as alfândegas eram geridas nos portos fluviais demonstra um estado que compreendia perfeitamente a balança comercial. O Kongo não era um receptáculo de trocas, mas um regulador ativo delas."
              </p>
            </div>

            <p>
              No entanto, a chegada das potências europeias alterou drasticamente esta dinâmica. A introdução de produtos manufacturados estrangeiros e a pressão pelo tráfico transatlântico começaram a desestabilizar os pilares da economia tradicional, levando a uma eventual fragmentação das rotas que antes nutriam o coração do reino.
            </p>
          </div>

          <section class="mt-9 border-t border-[#eee7ea] pt-5">
            @if (isPremiumContent() && !auth.canReadJindungo()) {
              <div class="mb-8 border border-[#d4af37] bg-[#fffdf7] px-6 py-5 text-center">
                <h2 class="font-display text-[18px] font-extrabold text-[#5c1e2f]">Texto com Jindungo reservado</h2>
                <p class="mx-auto mt-2 max-w-[440px] text-[12px] leading-5 text-[#6f686b]">A subscrição é gratuita, mas precisa de uma conta para desbloquear esta camada editorial.</p>
                <a [routerLink]="auth.isAuthenticated() ? '/app/subscriptions' : null" class="mt-4 inline-flex h-10 items-center justify-center bg-[#5c0b25] px-6 text-[12px] font-bold text-white" (click)="!auth.isAuthenticated() && requireLogin($event, 'subscrever ao Jindungo')">
                  {{ auth.isAuthenticated() ? 'Subscrever ao Jindungo' : 'Entrar para subscrever' }}
                </a>
              </div>
            }
            <div class="flex flex-wrap items-center justify-between gap-5 text-[12px] text-[#5f575b]">
              <div class="flex flex-wrap items-center gap-8">
                <button type="button" class="content-action" (click)="requireLogin($event, 'reagir')">
                  <img src="/assets/icons/like.png" alt="" />
                  <span>Reagir</span>
                </button>
                <button type="button" class="content-action" (click)="requireLogin($event, 'comentar')">
                  <img src="/assets/icons/comment.png" alt="" />
                  <span>Comentar</span>
                </button>
              </div>
              <div class="flex flex-wrap items-center gap-8">
                <button type="button" class="content-action" (click)="requireLogin($event, 'partilhar')">
                  <img src="/assets/icons/share.png" alt="" />
                  <span>Partilhar</span>
                </button>
                <button type="button" class="content-action" (click)="requireLogin($event, 'denunciar')">
                  <img src="/assets/icons/report.png" alt="" />
                  <span>Denunciar</span>
                </button>
              </div>
            </div>

            <h2 class="mt-10 text-[14px] font-medium text-[#5c1e2f]">Comentários (12)</h2>

            @if (auth.isAuthenticated()) {
            <div class="mt-6 flex gap-4">
              <span class="size-9 rounded-[10px] bg-[#e7e7e7]"></span>
              <div class="min-w-0 flex-1">
                <textarea class="h-[96px] w-full resize-none border border-[#d8d8d8] bg-[#fafafa] p-5 text-[13px] outline-none placeholder:text-[#b7b2b4] focus:border-[#8a4055]" placeholder="Partilhe a sua reflexão académica..."></textarea>
                <div class="-mt-px text-right">
                  <button type="button" class="h-10 bg-[#5c0b25] px-6 text-[12px] font-bold text-white">Publicar</button>
                </div>
              </div>
            </div>
            }

            <div class="mt-9 grid gap-7">
              <div class="flex gap-4">
                <span class="grid size-9 place-items-center rounded-[8px] bg-[#e7e7e7] text-[#777]">♙</span>
                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-4">
                    <p class="text-[13px] font-extrabold text-[#5c1e2f]">Dr. Alberto Cassule</p>
                    <span class="text-[10px] text-[#777]">há 2 dias</span>
                  </div>
                  <p class="mt-1 text-[13px] leading-5 text-[#1f1a1c]">
                    Excelente análise. É fundamental notar como o monopólio do zimbo permitiu ao estado Konguês uma soberania monetária que muitos estados europeus demoraram séculos a consolidar.
                  </p>
                  <div class="mt-3 flex gap-6 text-[10px] text-[#5f575b]">
                    <button type="button" class="content-action" (click)="requireLogin($event, 'gostar')"><img src="/assets/icons/like.png" alt="" /><span>Gostar (14)</span></button>
                    <button type="button" (click)="requireLogin($event, 'responder')">Responder</button>
                    <button type="button" class="content-action" (click)="requireLogin($event, 'denunciar')"><img src="/assets/icons/report.png" alt="" /><span>Denunciar</span></button>
                  </div>

                  <div class="mt-6 flex gap-4 border-l border-[#d8d8d8] pl-7">
                    <span class="grid size-7 place-items-center rounded-[7px] bg-[#e7e7e7] text-[11px] text-[#777]">♙</span>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-start justify-between gap-4">
                        <p class="text-[12px] font-medium text-[#5c1e2f]">Ana Paula Santos</p>
                        <span class="text-[10px] text-[#777]">há 1 dia</span>
                      </div>
                      <p class="mt-1 text-[12px] leading-5 text-[#1f1a1c]">
                        Concordo plenamente. Seria interessante aprofundar a relação entre o zimbo e a ráfia nas trocas rituais.
                      </p>
                      <div class="mt-3 flex gap-6 text-[10px] text-[#5f575b]">
                        <button type="button" class="content-action" (click)="requireLogin($event, 'gostar')"><img src="/assets/icons/like.png" alt="" /><span>Gostar (3)</span></button>
                        <button type="button" (click)="requireLogin($event, 'responder')">Responder</button>
                        <button type="button" class="content-action" (click)="requireLogin($event, 'denunciar')"><img src="/assets/icons/report.png" alt="" /><span>Denunciar</span></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <section class="mt-12 border-t border-[#eee7ea] pt-8">
              <h2 class="text-[14px] font-medium text-[#5c1e2f]">Referências e Bibliografia</h2>
              <ul class="mt-6 grid gap-4 text-[13px] leading-6 text-[#4b4447]">
                <li>• Thornton, J. (1983). <em>The Kingdom of Kongo: Civil War and Transition.</em> University of Wisconsin Press.</li>
                <li>• Hilton, A. (1985). <em>The Kingdom of Kongo.</em> Oxford Studies in African Affairs.</li>
                <li>• Arquivos Digitais da Torre do Tombo: Relatórios de Comércio de São Salvador (1512-1560).</li>
              </ul>
            </section>
          </section>
        </article>

        <aside class="hidden xl:block">
          <div class="sticky top-[82px] grid gap-6">
            <h2 class="font-display text-[17px] font-medium text-[#5c1e2f]">Relacionados</h2>

            <a routerLink="/app/contents/diplomacia-cobre" class="block">
              <img src="https://commons.wikimedia.org/wiki/Special:FilePath/Clay%20pot%2C%20southeast%20Senegal%20%28West%20Africa%29%20%282220693915%29.jpg?width=600" alt="Cerâmica de cobre" class="h-[141px] w-full rounded-[2px] object-cover object-center" />
              <p class="mt-2 text-[10px] font-bold uppercase text-[#8c6f36]">Economia Política</p>
              <h3 class="font-display mt-1 text-[16px] font-extrabold leading-tight text-[#5c1e2f]">A Diplomacia do Cobre nos Planaltos Centrais</h3>
            </a>

            <a routerLink="/app/contents/impostos-kwanza" class="mt-4 block">
              <img src="https://commons.wikimedia.org/wiki/Special:FilePath/Foz%20do%20Rio%20Kwanza%20-%20panoramio.jpg?width=600" alt="Rio Kwanza ao pôr do sol" class="h-[141px] w-full rounded-[2px] object-cover object-center" />
              <p class="mt-2 text-[10px] font-bold uppercase text-[#8c6f36]">Geografia Histórica</p>
              <h3 class="font-display mt-1 text-[16px] font-extrabold leading-tight text-[#5c1e2f]">Navegação e Impostos no Rio Kwanza</h3>
            </a>

            <div class="mt-5 bg-[#6a1730] p-6 text-white">
              <h3 class="font-display text-[16px] font-medium">Torne-se um Académico</h3>
              <p class="mt-3 text-[12px] leading-5 text-white/82">Acesso ilimitado a textos exclusivos e webinários mensais.</p>
              <button type="button" class="mt-6 h-11 w-full bg-[#d4af37] text-[13px] font-medium text-[#5c1e2f]">Subscrever Premium</button>
            </div>
          </div>
        </aside>
      </main>

      <app-public-footer />
      <app-back-to-top />
    </section>
  `,
})
export class ContentDetailPage {
  private readonly route = inject(ActivatedRoute);
  readonly auth = inject(AuthStateService);
  readonly title = this.route.snapshot.params['id'] === 'create' ? 'Criar conteúdo' : 'Conteúdo editorial';
  readonly isPremiumContent = computed(() => ['imposto-reservas', 'diamantes-luanda-sul', 'politica-monetaria-angola'].includes(this.route.snapshot.params['id']));

  requireLogin(event: Event, operation: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.auth.requireLoginFor(operation);
  }
}

export const CONTENTS_ROUTES: Routes = [
  { path: '', component: ContentListPage },
  { path: 'create', canActivate: [adminGuard], component: ContentDetailPage },
  { path: ':id', component: ContentDetailPage },
  { path: ':id/edit', canActivate: [adminGuard], component: ContentDetailPage },
];




