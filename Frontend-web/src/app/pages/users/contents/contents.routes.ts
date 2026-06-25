import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, Routes } from '@angular/router';
import { adminGuard } from '../../../services/admin.guard';
import { Category } from '../../../models/category.model';
import { ContentTypeOption } from '../../../models/content-type.model';
import { AuthStateService } from '../../../services/auth-state.service';
import { CategoryService } from '../../../services/category.service';
import { BackendComment, CommentService } from '../../../services/comment.service';
import { BackendContent, ContentPagination, ContentService } from '../../../services/content.service';
import { ContentTypeService } from '../../../services/content-type.service';
import { QuizService } from '../../../services/quiz.service';
import { ReactionService } from '../../../services/reaction.service';
import { SavedContentService } from '../../../services/saved-content.service';
import { BackToTopComponent } from '../../shared/back-to-top/back-to-top.component';
import { PublicFooterComponent } from '../../shared/public-footer/public-footer.component';
import { PublicNavbarComponent } from '../../shared/public-navbar/public-navbar.component';
import { ContentCardComponent } from './components/content-card.component';
import { ContentListItem } from '../../../models/content-list-item.model';

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
  reactionsCount: number;
  commentsCount: number;
  likedByMe: boolean;
}

interface CommentView {
  id: string;
  author: string;
  authorInitials: string;
  text: string;
  createdAt?: string | null;
  replies: CommentReplyView[];
}

interface CommentReplyView {
  id: string;
  author: string;
  authorInitials: string;
  text: string;
  createdAt?: string | null;
}

interface VideoDetail {
  id: string;
  title: string;
  date: string;
  duration: string;
  frameUrl: string;
  author: string;
  authorInitials: string;
  authorRole: string;
  summary: string;
  quote: string;
}

interface RelatedResearch {
  title: string;
  meta: string;
  duration: string;
  imageUrl: string;
  route: string;
}

interface VideoComment {
  author: string;
  initials: string;
  time: string;
  text: string;
  likes: number;
}

@Component({
  selector: 'app-content-list-page',
  imports: [PublicNavbarComponent, PublicFooterComponent, BackToTopComponent, ContentCardComponent],
  templateUrl: './content-list-page.html'
})
export class ContentListPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly auth = inject(AuthStateService);
  private readonly categoryService = inject(CategoryService);
  private readonly contentService = inject(ContentService);
  private readonly contentTypeService = inject(ContentTypeService);
  private readonly reactionService = inject(ReactionService);
  private readonly savedContentService = inject(SavedContentService);
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
  readonly shareContentTarget = signal<ContentListItem | null>(null);
  readonly shareStatus = signal('');
  readonly saveStatus = signal('');
  readonly savingContentId = signal<string | null>(null);
  readonly shareUrl = computed(() => {
    const content = this.shareContentTarget();

    return content ? this.absoluteContentUrl(content.id) : '';
  });
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

    this.applyRouteFilters();
    await this.loadContents(1, true);
  }

  requireLogin(event: Event, operation: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.auth.requireLoginFor(operation);
  }

  async handleContentAction(payload: { event: Event; operation: string; content: ContentListItem }): Promise<void> {
    payload.event.preventDefault();
    payload.event.stopPropagation();

    if (payload.operation === 'partilhar') {
      this.openShareModal(payload.content);
      return;
    }

    if (payload.operation === 'comentar') {
      await this.router.navigate(['/app/contents', payload.content.id], { fragment: 'comments' });
      return;
    }

    if (payload.operation === 'gostar') {
      if (!this.auth.isAuthenticated()) {
        this.auth.requireLoginFor('gostar');
        return;
      }

      await this.likeContent(payload.content);
      return;
    }

    if (payload.operation === 'guardar') {
      if (!this.auth.isAuthenticated()) {
        this.auth.requireLoginFor('guardar');
        return;
      }

      await this.saveContent(payload.content);
      return;
    }

    this.auth.requireLoginFor(payload.operation);
  }

  openShareModal(content: ContentListItem): void {
    this.shareContentTarget.set(content);
    this.shareStatus.set('');
  }

  closeShareModal(): void {
    this.shareContentTarget.set(null);
    this.shareStatus.set('');
  }

  async copyShareLink(): Promise<void> {
    const url = this.shareUrl();

    if (!url) {
      return;
    }

    await navigator.clipboard?.writeText(url);
    this.shareStatus.set('Link copiado.');
  }

  async shareFromModal(platform: 'whatsapp' | 'facebook' | 'instagram'): Promise<void> {
    const content = this.shareContentTarget();
    const url = this.shareUrl();

    if (!content || !url) {
      return;
    }

    const title = `${content.title} - Economia com História`;

    if (platform === 'instagram') {
      await this.copyShareLink();
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
      return;
    }

    const encodedUrl = encodeURIComponent(url);
    const targets: Record<'whatsapp' | 'facebook', string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    };

    window.open(targets[platform], '_blank', 'noopener,noreferrer');
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

  clearSearch(): void {
    this.searchTerm.set('');
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

  private async saveContent(content: ContentListItem): Promise<void> {
    this.savingContentId.set(content.id);
    this.saveStatus.set('');

    try {
      await this.savedContentService.save(content.id);
      this.saveStatus.set(`"${content.title}" foi guardado.`);
    } catch {
      this.saveStatus.set('Não foi possível guardar este conteúdo.');
    } finally {
      this.savingContentId.set(null);
    }
  }

  private async likeContent(content: ContentListItem): Promise<void> {
    const currentCount = content.reactionsCount ?? 0;
    const currentLikedByMe = content.likedByMe ?? false;
    const nextLikedByMe = !currentLikedByMe;
    const nextCount = Math.max(0, currentCount + (nextLikedByMe ? 1 : -1));

    this.contents.update((items) =>
      items.map((item) =>
        item.id === content.id
          ? { ...item, reactionsCount: nextCount, likedByMe: nextLikedByMe }
          : item,
      ),
    );

    try {
      const response = await this.reactionService.toggle(content.id, 'like');
      const reacted = response.data.reacted;
      const reactionsCount = Number(response.data.reactions_count ?? nextCount);

      this.contents.update((items) =>
        items.map((item) =>
          item.id === content.id
            ? { ...item, reactionsCount, likedByMe: reacted }
            : item,
        ),
      );
    } catch {
      this.contents.update((items) =>
        items.map((item) =>
          item.id === content.id
            ? { ...item, reactionsCount: currentCount, likedByMe: currentLikedByMe }
            : item,
        ),
      );
    }
  }

  private absoluteContentUrl(contentId: string): string {
    return `${window.location.origin}/app/contents/${contentId}`;
  }

  private applyRouteFilters(): void {
    const params = this.route.snapshot.queryParamMap;
    const category = params.get('categoria') ?? params.get('category');
    const type = params.get('tipo') ?? params.get('type') ?? params.get('contentType');
    const query = params.get('q') ?? params.get('search');

    if (category) {
      const normalizedCategory = this.normalizeText(category);
      const matchingCategory = this.categories().find((item) => this.normalizeText(item.name) === normalizedCategory);

      this.selectedCategoryFilter.set(matchingCategory?.name ?? category);
    }

    if (type) {
      const normalizedType = this.normalizeText(type);
      const matchingType = this.contentTypes().find((item) =>
        this.normalizeText(item.name) === normalizedType || this.normalizeText(item.slug) === normalizedType,
      );

      this.selectedContentTypeFilter.set(matchingType?.name ?? type);
    }

    if (query) {
      this.searchTerm.set(query);
    }
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
      reactionsCount: Number(content.reactions_count ?? 0),
      commentsCount: Number(content.comments_count ?? 0),
      likedByMe: Boolean(content.liked_by_me),
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
      id: 'video-cafe',
      category: 'Economia',
      contentType: 'Video',
      meta: '12 Mar 2024 - 18 min video',
      title: 'Do Cafe ao Petroleo: ciclos economicos que mudaram Angola',
      excerpt:
        'Video-aula com imagens de arquivo, mapas e conceitos essenciais para acompanhar as viragens produtivas de Angola.',
      author: 'Dr. Arnaldo Santos',
      authorInitials: 'AS',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 'video-ferrovia',
      category: 'Economia',
      contentType: 'Video',
      meta: '18 Mar 2024 - 14 min video',
      title: 'Ferrovias, portos e mercados: a logistica que move Angola',
      excerpt:
        'Uma aula visual sobre corredores de transporte, exportacoes, portos e integracao regional no seculo XX.',
      author: 'Equipa EH',
      authorInitials: 'EH',
      imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=900&q=80',
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
        'Como a indústria extractiva redefiniu as classes sociais e o desenvolvimento urbano nas principaís capitais provínciais de Angola.',
      author: 'Dra. Sofia Bento',
      authorInitials: 'SB',
    },
    ];
  }
}

@Component({
  selector: 'app-content-detail-page',
  imports: [RouterLink, PublicNavbarComponent, PublicFooterComponent, BackToTopComponent],
  templateUrl: './content-detail-page.html'
})
export class ContentDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly commentService = inject(CommentService);
  private readonly contentService = inject(ContentService);
  private readonly quizService = inject(QuizService);
  private readonly reactionService = inject(ReactionService);
  private readonly savedContentService = inject(SavedContentService);
  readonly auth = inject(AuthStateService);
  readonly detail = signal<ContentDetail | null>(null);
  readonly comments = signal<CommentView[]>([]);
  readonly reactionCount = signal(0);
  readonly likedByMe = signal(false);
  readonly isLoading = signal(true);
  readonly isLoadingComments = signal(false);
  readonly isSavingComment = signal(false);
  readonly isSavingReaction = signal(false);
  readonly isSavingContent = signal(false);
  readonly isCommentComposerOpen = signal(false);
  readonly shareMenuOpen = signal(false);
  readonly commentError = signal('');
  readonly commentSuccess = signal('');
  readonly reactionError = signal('');
  readonly saveStatus = signal('');
  readonly shareStatus = signal('');
  readonly canUseNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;
  readonly relatedQuiz = computed(() => {
    const contentId = this.detail()?.id ?? this.route.snapshot.params['id'];

    return this.quizService.quizzes().find((quiz) => quiz.relatedContent.id === contentId);
  });
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
      await Promise.all([
        this.loadComments(String(content.id)),
        this.loadReactionCount(String(content.id)),
      ]);
    } finally {
      this.isLoading.set(false);
    }
  }

  requireLogin(event: Event, operation: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.auth.requireLoginFor(operation);
  }

  openCommentComposer(event: Event): void {
    if (!this.auth.isAuthenticated()) {
      this.requireLogin(event, 'comentar');
      return;
    }

    this.isCommentComposerOpen.set(true);
  }

  async react(event: Event): Promise<void> {
    if (!this.auth.isAuthenticated()) {
      this.requireLogin(event, 'reagir');
      return;
    }

    const contentId = this.detail()?.id;

    if (!contentId || this.isSavingReaction()) {
      return;
    }

    this.isSavingReaction.set(true);
    this.reactionError.set('');

    try {
      const response = await this.reactionService.toggle(contentId, 'like');
      this.likedByMe.set(response.data.reacted);
      this.reactionCount.set(Number(response.data.reactions_count ?? this.reactionCount()));
    } catch {
      this.reactionError.set('Não foi possível registar a reação.');
    } finally {
      this.isSavingReaction.set(false);
    }
  }

  async saveContent(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    if (!this.auth.isAuthenticated()) {
      this.auth.requireLoginFor('guardar');
      return;
    }

    const contentId = this.detail()?.id;

    if (!contentId || this.isSavingContent()) {
      return;
    }

    this.isSavingContent.set(true);
    this.saveStatus.set('');

    try {
      await this.savedContentService.save(contentId);
      this.saveStatus.set('Conteúdo guardado.');
    } catch {
      this.saveStatus.set('Não foi possível guardar este conteúdo.');
    } finally {
      this.isSavingContent.set(false);
    }
  }

  toggleShareMenu(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.shareStatus.set('');
    this.shareMenuOpen.set(!this.shareMenuOpen());
  }

  async shareTo(platform: 'native' | 'whatsapp' | 'linkedin' | 'facebook' | 'x' | 'copy', event?: Event): Promise<void> {
    event?.preventDefault();
    event?.stopPropagation();

    const detail = this.detail();

    if (!detail) {
      return;
    }

    const url = this.currentShareUrl();
    const title = `${detail.title} - Economia com História`;

    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({ title: detail.title, text: title, url });
        this.shareMenuOpen.set(false);
      } catch {
        this.shareMenuOpen.set(false);
      }

      return;
    }

    if (platform === 'copy') {
      await navigator.clipboard?.writeText(url);
      this.shareStatus.set('Link copiado.');
      return;
    }

    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const targets: Record<'whatsapp' | 'linkedin' | 'facebook' | 'x', string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      x: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    };

    window.open(targets[platform as keyof typeof targets], '_blank', 'noopener,noreferrer');
    this.shareMenuOpen.set(false);
  }

  async submitComment(value: string): Promise<void> {
    const contentId = this.detail()?.id;
    const comment = value.trim();

    this.commentError.set('');
    this.commentSuccess.set('');

    if (!contentId || !comment) {
      this.commentError.set('Escreva um comentário antes de publicar.');
      return;
    }

    this.isSavingComment.set(true);

    try {
      await this.commentService.create(contentId, comment);
      await this.loadComments(contentId);
      this.commentSuccess.set('Comentário publicado com sucesso.');
      this.isCommentComposerOpen.set(false);
    } catch {
      this.commentError.set('Não foi possível publicar o comentário.');
    } finally {
      this.isSavingComment.set(false);
    }
  }

  async submitReply(commentId: string, value: string): Promise<void> {
    const contentId = this.detail()?.id;
    const reply = value.trim();

    this.commentError.set('');
    this.commentSuccess.set('');

    if (!contentId || !reply) {
      this.commentError.set('Escreva uma resposta antes de publicar.');
      return;
    }

    try {
      await this.commentService.reply(commentId, reply);
      await this.loadComments(contentId);
      this.commentSuccess.set('Resposta publicada com sucesso.');
    } catch {
      this.commentError.set('Não foi possível publicar a resposta.');
    }
  }

  private async loadComments(contentId: string): Promise<void> {
    this.isLoadingComments.set(true);

    try {
      const comments = await this.commentService.getByContent(contentId);
      this.comments.set(comments.map((comment) => this.toCommentView(comment)));
    } finally {
      this.isLoadingComments.set(false);
    }
  }

  private async loadReactionCount(contentId: string): Promise<void> {
    try {
      const counts = await this.reactionService.getCountByType(contentId);
      this.reactionCount.set(counts.reduce((total, item) => total + Number(item.count || 0), 0));
    } catch {
      this.reactionCount.set(0);
    }
  }

  private currentShareUrl(): string {
    return window.location.href.split('#')[0];
  }

  private toCommentView(comment: BackendComment): CommentView {
    const authorName = comment.user?.name ?? 'Utilizador';

    return {
      id: String(comment.id),
      author: authorName,
      authorInitials: this.getInitials(authorName),
      text: comment.comment,
      createdAt: comment.created_at,
      replies: (comment.replies ?? []).map((reply) => {
        const replyAuthor = reply.user?.name ?? 'Utilizador';

        return {
          id: String(reply.id),
          author: replyAuthor,
          authorInitials: this.getInitials(replyAuthor),
          text: reply.reply,
          createdAt: reply.created_at,
        };
      }),
    };
  }

  formatDate(value: string | null | undefined): string {
    const date = value ? new Date(value) : null;

    if (!date || Number.isNaN(date.getTime())) {
      return 'Agora';
    }

    return new Intl.DateTimeFormat('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
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
      reactionsCount: Number(content.reactions_count ?? 0),
      commentsCount: Number(content.comments_count ?? 0),
      likedByMe: Boolean(content.liked_by_me),
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

@Component({
  selector: 'app-content-video-detail-page',
  imports: [RouterLink, PublicNavbarComponent, PublicFooterComponent, BackToTopComponent],
  templateUrl: './content-video-detail-page.html'
})
export class ContentVideoDetailPage {
  private readonly route = inject(ActivatedRoute);
  readonly auth = inject(AuthStateService);

  readonly video = computed(() => {
    const id = this.route.snapshot.params['id'] ?? 'video-cafe';
    return this.videos.find((item) => item.id === id) ?? this.videos[0];
  });

  readonly relatedResearch: RelatedResearch[] = [
    {
      title: 'A Arquitectura do Lobito: uma cidade portuaria em crise',
      meta: 'Arquivo - 4.5k visualizacoes',
      duration: '12:05',
      imageUrl: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=400&q=80',
      route: '/app/contents/videos/video-ferrovia',
    },
    {
      title: 'Mudancas cambiais na economia do pos-guerra',
      meta: 'Economia - 12k visualizacoes',
      duration: '8:45',
      imageUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=400&q=80',
      route: '/app/contents/videos/video-inflacao',
    },
    {
      title: 'Documento branco: infraestrutura investindo 1960-1970',
      meta: 'Pesquisa - 15 min',
      duration: 'PDF',
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80',
      route: '/app/contents/rotas-comerciais',
    },
  ];

  readonly comments: VideoComment[] = [];

  private readonly videos: VideoDetail[] = [
    {
      id: 'video-cafe',
      title: 'Do Cafe ao Petroleo: ciclos economicos que mudaram Angola',
      date: '12 Marco, 2024',
      duration: '18:32',
      frameUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      author: 'Dr. Arnaldo Santos',
      authorInitials: 'AS',
      authorRole: 'Historiador economico senior',
      summary:
        'Este ensaio visual explora a transicao da capital e das regioes produtivas de Angola entre economias agricolas, administracao colonial, industrializacao e dependencia petrolifera. Com imagens de arquivo e dados economicos, o video acompanha como infraestruturas, portos e trabalho moldaram a sociedade angolana moderna.',
      quote:
        'A passagem da dominancia agricola para a industrializacao nao foi apenas uma mudanca de moeda; foi o nascimento de uma nova classe social angolana.',
    },
    {
      id: 'video-ferrovia',
      title: 'Ferrovias, portos e mercados: a logistica que move Angola',
      date: '18 Marco, 2024',
      duration: '14:32',
      frameUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80',
      author: 'Equipa EH',
      authorInitials: 'EH',
      authorRole: 'Nucleo de arquivo e visualizacao',
      summary:
        'Uma aula visual sobre corredores ferroviarios, portos, exportacoes e integracao regional. O video mostra como as rotas de transporte alteraram mercados locais e ligaram o interior angolano a circuitos comerciais internacionais.',
      quote:
        'Cada linha ferroviaria tambem transportava decisoes politicas, expectativas de mercado e novas formas de ocupacao do territorio.',
    },
    {
      id: 'video-inflacao',
      title: 'Inflacao explicada com exemplos do quotidiano angolano',
      date: '22 Marco, 2024',
      duration: '11:18',
      frameUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1200&q=80',
      author: 'Nucleo Academico',
      authorInitials: 'NA',
      authorRole: 'Educacao economica aplicada',
      summary:
        'Conceitos de inflacao, poder de compra, moeda e precos sao apresentados a partir de exemplos familiares do quotidiano angolano, aproximando teoria economica e experiencia social.',
      quote:
        'A inflacao torna-se concreta quando o salario, o mercado e a memoria familiar deixam de contar a mesma historia.',
    },
  ];

  requireLogin(event: Event, operation: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.auth.requireLoginFor(operation);
  }

  share(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const video = this.video();
    const url = window.location.href.split('#')[0];
    const text = `${video.title} - Economia com História`;

    if (navigator.share) {
      void navigator.share({ title: video.title, text, url }).catch(() => undefined);
      return;
    }

    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      '_blank',
      'noopener,noreferrer',
    );
  }
}

export const CONTENTS_ROUTES: Routes = [
  { path: '', component: ContentListPage },
  { path: 'create', canActivate: [adminGuard], component: ContentDetailPage },
  { path: 'videos/:id', component: ContentVideoDetailPage },
  { path: ':id', component: ContentDetailPage },
  { path: ':id/edit', canActivate: [adminGuard], component: ContentDetailPage },
];
