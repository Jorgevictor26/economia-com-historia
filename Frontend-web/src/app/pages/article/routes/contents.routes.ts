import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Routes } from '@angular/router';
import { adminGuard } from '../../../components/guards/admin.guard';
import { Category } from '../../../models/category.model';
import { ContentTypeOption } from '../../../models/content-type.model';
import { AuthStateService } from '../../../services/auth-state.service';
import { CategoryService } from '../../../services/category.service';
import { BackendContent, ContentPagination, ContentService } from '../../../services/content.service';
import { ContentTypeService } from '../../../services/content-type.service';
import { BackToTopComponent } from '../../../components/back-to-top/back-to-top.component';
import { PublicFooterComponent } from '../../../components/public-footer/public-footer.component';
import { PublicNavbarComponent } from '../../../components/public-navbar/public-navbar.component';
import { ContentCardComponent } from '../components/content-card.component';
import { ContentListItem } from '../models/content-list-item.model';

interface ContentDetail {
  id: string;
  category: string;
  contentType: string;
  meta: string;
  title: string;
  summary: string;
  body: string;
  author: string;
  authorInitials: string;
  authorBio?: string;
  imageUrl?: string;
  premium: boolean;
}

@Component({
  selector: 'app-content-list-page',
  imports: [PublicNavbarComponent, PublicFooterComponent, BackToTopComponent, ContentCardComponent],
  template: `
    <section class="-m-6 min-h-dvh bg-[#f7f8f8] text-[#2c2729]">
      <app-public-navbar />

      <main class="fluid-container pb-14 pt-6">
        <section class="mb-8">
          <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_310px] lg:items-end">
            <div>
              <p class="text-[11px] font-bold uppercase tracking-[0.16em] text-[#735c00]">Biblioteca editorial</p>
              <h1 class="mt-3 font-display text-[34px] font-extrabold leading-tight text-[#40081a]">Explorar Conteúdos</h1>
              <p class="mt-3 max-w-[690px] text-[15px] leading-7 text-[#534345]">
                Encontre artigos, podcasts, vídeos e textos com Jindungo por tema, formato ou palavra-chave.
              </p>
            </div>

            <div class="rounded-[8px] bg-[#f8f9fa] p-4">
              <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a8587]">Resultado atual</p>
              <strong class="mt-2 block font-display text-[26px] font-extrabold text-[#8a4055]">{{ filteredContents().length }}</strong>
              <span class="text-[12px] text-[#6f686b]">{{ filteredContents().length === 1 ? 'conteúdo encontrado' : 'conteúdos encontrados' }}</span>
            </div>
          </div>

          <div class="mt-7 grid gap-4 rounded-[12px] border border-[#ddd8da] bg-white p-3 md:grid-cols-[minmax(0,1.7fr)_minmax(190px,0.85fr)_minmax(190px,0.85fr)]">
            <label class="flex min-h-[46px] items-center gap-3 rounded-[8px] bg-[#f1f1f3] px-4 text-[#89909d]">
              <span class="relative size-4 shrink-0 rounded-full border-2 border-current after:absolute after:-bottom-1 after:-right-1 after:h-2 after:w-0.5 after:rotate-[-45deg] after:bg-current"></span>
              <input
                class="w-full bg-transparent text-[14px] text-[#3b3437] outline-none placeholder:text-[#7d8490]"
                type="search"
                placeholder="Pesquisar conteúdos..."
                [value]="searchTerm()"
                (input)="updateSearch($event)"
              />
            </label>

            <label class="relative flex min-h-[46px] items-center rounded-[8px] bg-[#f1f1f3]">
              <select
                class="h-full w-full appearance-none rounded-[8px] bg-transparent px-4 pr-10 text-[13px] font-semibold text-[#121212] outline-none"
                [value]="selectedCategoryFilter()"
                (change)="selectCategoryFilter($any($event.target).value)"
              >
                @for (filter of categoryFilters(); track filter) {
                  <option [value]="filter">{{ filter === 'Todos' ? 'Todas as categorias' : filter }}</option>
                }
              </select>
              <span class="pointer-events-none absolute right-4 text-[#a0a5af]">⌄</span>
            </label>

            <label class="relative flex min-h-[46px] items-center rounded-[8px] bg-[#f1f1f3]">
              <select
                class="h-full w-full appearance-none rounded-[8px] bg-transparent px-4 pr-10 text-[13px] font-semibold text-[#121212] outline-none"
                [value]="selectedContentTypeFilter()"
                (change)="selectContentTypeFilter($any($event.target).value)"
              >
                @for (filter of contentTypeFilters(); track filter) {
                  <option [value]="filter">{{ filter === 'Todos os formatos' ? 'Todos os tipos' : filter }}</option>
                }
              </select>
              <span class="pointer-events-none absolute right-4 text-[#a0a5af]">⌄</span>
            </label>
          </div>
        </section>

        @if (filteredContents().length === 0) {
          <section class="rounded-[8px] border border-[#e3d4d8] bg-white px-6 py-12 text-center">
            <h2 class="font-display text-[22px] font-extrabold text-[#5c1e2f]">Conteúdo não encontrado</h2>
            <p class="mx-auto mt-3 max-w-[460px] text-[13px] leading-6 text-[#6f686b]">Não encontramos conteúdos para a pesquisa ou filtro aplicado.</p>
          </section>
        }

        <div class="grid items-stretch gap-8 md:grid-cols-2 xl:grid-cols-3">
          @for (content of filteredContents(); track content.id) {
            <app-content-card
              [content]="content"
              [canReadPremium]="auth.canReadJindungo()"
              (gatedAction)="requireLogin($event.event, $event.operation)"
            />
          }
        </div>

        <div class="mt-16 flex flex-col items-center gap-3">
          <div class="inline-grid min-h-[64px] overflow-hidden rounded-full border border-[#d8d3d6] bg-white shadow-[0_16px_40px_rgba(64,8,26,0.07)] sm:grid-cols-[220px_96px_220px]">
            <button
              type="button"
              class="flex items-center justify-center gap-4 px-7 text-[20px] font-extrabold text-[#6b3344] transition hover:bg-[#fff6f8] disabled:cursor-not-allowed disabled:text-[#c7bdc1]"
              [disabled]="!hasPreviousPage() || isLoadingContents()"
              (click)="goToPreviousPage()"
            >
              <span class="text-[30px] leading-none" aria-hidden="true">&larr;</span>
              Anterior
            </button>

            <div class="grid place-items-center border-x border-[#d8d3d6] px-5">
              <span class="grid size-14 place-items-center rounded-[14px] bg-[#6b3344] text-[26px] font-extrabold text-white">
                {{ pagination().currentPage }}
              </span>
            </div>

            <button
              type="button"
              class="flex items-center justify-center gap-4 px-7 text-[20px] font-extrabold text-[#6b3344] transition hover:bg-[#fff6f8] disabled:cursor-not-allowed disabled:text-[#c7bdc1]"
              [disabled]="!hasMoreContents() || isLoadingContents()"
              (click)="goToNextPage()"
            >
              Próximo
              <span class="text-[30px] leading-none" aria-hidden="true">&rarr;</span>
            </button>
          </div>

          <p class="text-[12px] font-semibold text-[#7f777b]">{{ contentCountMessage() }}</p>
        </div>
      </main>

      <app-public-footer />
      <app-back-to-top />
    </section>
  `,
})
export class ContentListPage implements OnInit {
  readonly auth = inject(AuthStateService);
  private readonly categoryService = inject(CategoryService);
  private readonly contentService = inject(ContentService);
  private readonly contentTypeService = inject(ContentTypeService);
  private loadRequestId = 0;
  private readonly fallbackCategories: Category[] = [
    { id: 1, name: 'História' },
    { id: 2, name: 'Economia' },
  ];
  private readonly fallbackContentTypes: ContentTypeOption[] = [
    { id: 1, name: 'Texto', slug: 'texto' },
    { id: 2, name: 'Podcast', slug: 'podcast' },
    { id: 3, name: 'Video', slug: 'video' },
    { id: 4, name: 'Jindungo', slug: 'jindungo' },
  ];

  readonly categories = signal<Category[]>(this.fallbackCategories);
  readonly contentTypes = signal<ContentTypeOption[]>(this.fallbackContentTypes);
  readonly contents = signal<ContentListItem[]>(this.getFallbackContents());
  readonly pagination = signal<ContentPagination>({
    currentPage: 1,
    lastPage: 1,
    perPage: this.getFallbackContents().length,
    total: this.getFallbackContents().length,
    from: 1,
    to: this.getFallbackContents().length,
  });
  readonly isLoadingContents = signal(false);
  readonly categoryFilters = computed(() => ['Todos', ...this.categories().map((category) => category.name)]);
  readonly contentTypeFilters = computed(() => ['Todos os formatos', ...this.contentTypes().map((contentType) => contentType.name)]);
  readonly selectedCategoryFilter = signal('Todos');
  readonly selectedContentTypeFilter = signal('Todos os formatos');
  readonly searchTerm = signal('');
  readonly hasPreviousPage = computed(() => this.pagination().currentPage > 1);
  readonly hasMoreContents = computed(() => this.pagination().currentPage < this.pagination().lastPage);
  readonly activeFilterCount = computed(() => {
    let total = 0;

    if (this.selectedCategoryFilter() !== 'Todos') {
      total += 1;
    }

    if (this.selectedContentTypeFilter() !== 'Todos os formatos') {
      total += 1;
    }

    if (this.searchTerm().trim()) {
      total += 1;
    }

    return total;
  });
  readonly contentCountMessage = computed(() => {
    const total = this.pagination().total;
    const shown = this.contents().length;
    const label = total === 1 ? 'conteúdo' : 'conteúdos';

    return `A mostrar ${shown} de ${total} ${label}`;
  });
  readonly filteredContents = computed(() => {
    const categoryFilter = this.selectedCategoryFilter();
    const contentTypeFilter = this.selectedContentTypeFilter();
    const query = this.normalizeText(this.searchTerm());

    let results = this.contents();

    if (categoryFilter !== 'Todos') {
      const normalizedCategory = this.normalizeText(categoryFilter);
      results = results.filter((content) => this.normalizeText(content.category).includes(normalizedCategory));
    }

    if (contentTypeFilter !== 'Todos os formatos') {
      const normalizedContentType = this.normalizeText(contentTypeFilter);
      results = results.filter((content) => this.normalizeText(content.contentType) === normalizedContentType);
    }

    if (!query) {
      return results;
    }

    return results.filter((content) =>
      [content.title, content.excerpt, content.author, content.category, content.contentType, content.meta, content.searchText ?? '']
        .map((value) => this.normalizeText(value))
        .some((value) => value.includes(query)),
    );
  });

  async ngOnInit(): Promise<void> {
    try {
      const categories = await this.categoryService.getAll();

      if (categories.length > 0) {
        this.categories.set(categories);
      }
    } catch {
      this.categories.set(this.fallbackCategories);
    }

    try {
      const contentTypes = await this.contentTypeService.getAll();

      if (contentTypes.length > 0) {
        this.contentTypes.set(contentTypes);
      }
    } catch {
      this.contentTypes.set(this.fallbackContentTypes);
    }

    await this.loadContents(1, true);
  }

  requireLogin(event: Event, operation: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.auth.requireLoginFor(operation);
  }

  selectCategoryFilter(filter: string): void {
    this.selectedCategoryFilter.set(filter);
    void this.loadContents(1, true);
  }

  selectContentTypeFilter(filter: string): void {
    this.selectedContentTypeFilter.set(filter);
    void this.loadContents(1, true);
  }

  updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    void this.loadContents(1, true);
  }

  clearFilters(): void {
    this.selectedCategoryFilter.set('Todos');
    this.selectedContentTypeFilter.set('Todos os formatos');
    this.searchTerm.set('');
    void this.loadContents(1, true);
  }

  loadMoreContents(): void {
    if (!this.hasMoreContents() || this.isLoadingContents()) {
      return;
    }

    void this.loadContents(this.pagination().currentPage + 1, false);
  }

  goToPreviousPage(): void {
    if (!this.hasPreviousPage() || this.isLoadingContents()) {
      return;
    }

    void this.loadContents(this.pagination().currentPage - 1, true);
  }

  goToNextPage(): void {
    if (!this.hasMoreContents() || this.isLoadingContents()) {
      return;
    }

    void this.loadContents(this.pagination().currentPage + 1, true);
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private toHomeContent(content: BackendContent): ContentListItem {
    const contentType = content.content_type?.name ?? 'Texto';
    const contentTypeSlug = content.content_type?.slug ?? this.normalizeText(contentType);
    const premium = contentTypeSlug === 'jindungo';
    const authorName = content.author?.name ?? content.user?.name ?? 'Equipa editorial';

    return {
      id: String(content.id),
      category: content.category?.name ?? 'Sem categoria',
      contentType,
      meta: this.buildMeta(content.updated_at ?? content.created_at, contentType),
      title: content.title,
      excerpt: content.summary || this.toExcerpt(content.content),
      author: authorName,
      authorInitials: this.getInitials(authorName),
      imageUrl: content.image || undefined,
      premium,
      searchText: content.content || '',
    };
  }

  private async loadContents(page: number, replace: boolean): Promise<void> {
    const requestId = ++this.loadRequestId;

    this.isLoadingContents.set(true);

    try {
      const response = await this.contentService.getAll({
        page,
        search: this.searchTerm().trim(),
        categoryId: this.selectedCategoryId(),
        contentTypeId: this.selectedContentTypeId(),
      });

      if (requestId !== this.loadRequestId) {
        return;
      }

      const mappedContents = response.data.map((content) => this.toHomeContent(content));

      this.contents.set(replace ? mappedContents : [...this.contents(), ...mappedContents]);
      this.pagination.set(response.pagination);
    } catch {
      if (replace) {
        const fallbackContents = this.getFallbackContents();

        this.contents.set(fallbackContents);
        this.pagination.set({
          currentPage: 1,
          lastPage: 1,
          perPage: fallbackContents.length,
          total: fallbackContents.length,
          from: fallbackContents.length > 0 ? 1 : 0,
          to: fallbackContents.length,
        });
      }
    } finally {
      if (requestId === this.loadRequestId) {
        this.isLoadingContents.set(false);
      }
    }
  }

  private selectedCategoryId(): number | string | undefined {
    const filter = this.selectedCategoryFilter();

    if (filter === 'Todos') {
      return undefined;
    }

    return this.categories().find((category) => category.name === filter)?.id;
  }

  private selectedContentTypeId(): number | string | undefined {
    const filter = this.selectedContentTypeFilter();

    if (filter === 'Todos os formatos') {
      return undefined;
    }

    return this.contentTypes().find((contentType) => contentType.name === filter)?.id;
  }

  private buildMeta(createdAt: string | null | undefined, contentType: string): string {
    const date = createdAt ? new Date(createdAt) : null;
    const formattedDate =
      date && !Number.isNaN(date.getTime())
        ? new Intl.DateTimeFormat('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
        : 'Sem data';

    return `${formattedDate} - ${contentType}`;
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  private toExcerpt(value: string | null | undefined): string {
    if (!value) {
      return 'Conteúdo disponível na biblioteca Economia com História.';
    }

    return value.replace(/<[^>]*>/g, '').slice(0, 180);
  }

  private getFallbackContents(): ContentListItem[] {
    return [
    {
      id: 'rotas-comerciais',
      category: 'História',
      contentType: 'Texto',
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
      category: 'Economia',
      contentType: 'Jindungo',
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
      contentType: 'Texto',
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
      contentType: 'Podcast',
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
      category: 'Economia',
      contentType: 'Jindungo',
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
      contentType: 'Texto',
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
      contentType: 'Texto',
      meta: '22 Set 2024 - 10 min leitura',
      title: 'A Evolução do Comércio no Reino do Kongo',
      excerpt:
        'Um estudo cronológico sobre a transformação das redes comerciais e a influência das moedas tradicionais na região.',
      author: 'Dr. António Manuel',
      authorInitials: 'AM',
    },
    {
      id: 'politica-monetaria-angola',
      category: 'Economia',
      contentType: 'Jindungo',
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
      contentType: 'Texto',
      meta: '10 Set 2024 - 25 min leitura',
      title: 'O Impacto do Petróleo na Estrutura Social',
      excerpt:
        'Como a indústria extractiva redefiniu as classes sociais e o desenvolvimento urbano nas principais capitais provinciais de Angola.',
      author: 'Dra. Sofia Bento',
      authorInitials: 'SB',
    },
    ];
  }
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
              <div class="mx-auto grid size-[70px] place-items-center rounded-[8px] bg-[#f5dce4] font-display text-[20px] font-extrabold text-[#8a4055]">
                {{ detail()?.authorInitials || 'EH' }}
              </div>
              <h2 class="font-display mt-5 text-[13px] font-medium text-[#5c1e2f]">{{ detail()?.author || 'Equipa editorial' }}</h2>
              @if (detail()?.authorBio) {
                <p class="mx-auto mt-2 max-w-[138px] text-[9px] leading-[1.35] text-[#5f575b]">
                  {{ detail()?.authorBio }}
                </p>
              }
              <div class="mt-5 flex justify-center gap-4 text-[#5f575b]">
                <span class="text-[24px] leading-none">⌘</span>
                <span class="text-[24px] leading-none">♧</span>
              </div>
            </section>

            <section class="mt-7 border-t border-[#ded7da] pt-6">
              <h3 class="mb-5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#8a8587]">Métricas</h3>
              <div class="grid gap-4 text-[11px] text-[#5f575b]">
                <p class="flex items-center gap-3"><span class="text-[18px]">▷</span>{{ detail()?.contentType || 'Texto' }}</p>
                <p class="flex items-center gap-3"><span class="text-[18px]">⊙</span>4.2k visualizações</p>
              </div>
            </section>
          </div>
        </aside>

        <article class="px-0 pb-12 pt-0">
          <div class="mb-4 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#8c6f36]">
            {{ detail()?.category || 'Conteúdo' }} - {{ detail()?.meta || 'A carregar...' }}
          </div>

          <h1 class="font-display max-w-[540px] text-[34px] font-extrabold leading-[1.08] text-[#5c1e2f]">
            {{ title() }}
          </h1>

          <p class="mt-6 max-w-[510px] border-l-4 border-[#d4af37] pl-7 font-display text-[14px] italic leading-7 text-[#81787c]">
            {{ detail()?.summary || 'A carregar o resumo do conteúdo...' }}
          </p>

          <div class="hidden">
            <span>Por <strong class="text-[#5c1e2f]">{{ detail()?.author || 'Equipa editorial' }}</strong></span>
            <span class="flex items-center gap-4">♡ 66 □ 12 ↗ ⚑</span>
          </div>

          @if (detail()?.imageUrl) {
          <figure class="mt-7">
            <img
              [src]="detail()?.imageUrl"
              [alt]="detail()?.title || 'Imagem do conteúdo'"
              class="h-[310px] w-full object-cover"
            />
            <figcaption class="mt-2 text-center text-[10px] text-[#8a8587]">
              Imagem associada ao conteúdo.
            </figcaption>
          </figure>
          }

          @if (isLoading()) {
            <div class="mt-8 space-y-4 text-[14px] leading-7 text-[#6f686b]">
              <p>A carregar o conteúdo...</p>
            </div>
          } @else {
            <div class="mt-8 space-y-6 text-[16px] leading-8 text-[#2f292c]" [innerHTML]="detail()?.body"></div>
          }

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
  private readonly contentService = inject(ContentService);
  readonly auth = inject(AuthStateService);
  readonly detail = signal<ContentDetail | null>(null);
  readonly isLoading = signal(true);
  readonly title = computed(() => this.detail()?.title ?? (this.route.snapshot.params['id'] === 'create' ? 'Criar conteúdo' : 'Conteúdo editorial'));
  readonly isPremiumContent = computed(() => this.detail()?.premium ?? ['imposto-reservas', 'diamantes-luanda-sul', 'politica-monetaria-angola'].includes(this.route.snapshot.params['id']));

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.params['id'];

    if (!id || id === 'create') {
      this.isLoading.set(false);
      return;
    }

    try {
      const content = await this.contentService.getById(id);
      this.detail.set(this.toContentDetail(content));
    } finally {
      this.isLoading.set(false);
    }
  }

  requireLogin(event: Event, operation: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.auth.requireLoginFor(operation);
  }

  private toContentDetail(content: BackendContent): ContentDetail {
    const contentType = content.content_type?.name ?? 'Texto';
    const contentTypeSlug = content.content_type?.slug ?? this.normalizeText(contentType);
    const authorName = content.author?.name ?? content.user?.name ?? 'Equipa editorial';

    return {
      id: String(content.id),
      category: content.category?.name ?? 'Sem categoria',
      contentType,
      meta: this.buildMeta(content.updated_at ?? content.created_at, contentType),
      title: content.title,
      summary: content.summary || this.toExcerpt(content.content),
      body: content.content || '<p>Conteúdo indisponível.</p>',
      author: authorName,
      authorInitials: this.getInitials(authorName),
      authorBio: content.author?.bio || content.user?.bio || undefined,
      imageUrl: content.image || undefined,
      premium: contentTypeSlug === 'jindungo',
    };
  }

  private buildMeta(createdAt: string | null | undefined, contentType: string): string {
    const date = createdAt ? new Date(createdAt) : null;
    const formattedDate =
      date && !Number.isNaN(date.getTime())
        ? new Intl.DateTimeFormat('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
        : 'Sem data';

    return `${formattedDate} - ${contentType}`;
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  private toExcerpt(value: string | null | undefined): string {
    if (!value) {
      return 'Conteúdo disponível na biblioteca Economia com História.';
    }

    return value.replace(/<[^>]*>/g, '').slice(0, 180);
  }
}

export const CONTENTS_ROUTES: Routes = [
  { path: '', component: ContentListPage },
  { path: 'create', canActivate: [adminGuard], component: ContentDetailPage },
  { path: ':id', component: ContentDetailPage },
  { path: ':id/edit', canActivate: [adminGuard], component: ContentDetailPage },
];
