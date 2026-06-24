import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Routes } from '@angular/router';
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

@Component({
  selector: 'app-content-list-page',
  imports: [PublicNavbarComponent, PublicFooterComponent, BackToTopComponent, ContentCardComponent],
  templateUrl: './content-list-page.html'
})
export class ContentListPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
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

    this.applyRouteFilters();
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
  readonly auth = inject(AuthStateService);
  readonly detail = signal<ContentDetail | null>(null);
  readonly comments = signal<CommentView[]>([]);
  readonly reactionCount = signal(0);
  readonly isLoading = signal(true);
  readonly isLoadingComments = signal(false);
  readonly isSavingComment = signal(false);
  readonly isSavingReaction = signal(false);
  readonly isCommentComposerOpen = signal(false);
  readonly commentError = signal('');
  readonly commentSuccess = signal('');
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

    try {
      await this.reactionService.create(contentId, 'like');
      await this.loadReactionCount(contentId);
    } finally {
      this.isSavingReaction.set(false);
    }
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
    const counts = await this.reactionService.getCountByType(contentId);
    this.reactionCount.set(counts.reduce((total, item) => total + Number(item.count || 0), 0));
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

