import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink, Routes } from '@angular/router';
import { adminGuard } from '../../../services/admin.guard';
import { Category } from '../../../models/category.model';
import { ContentTypeOption } from '../../../models/content-type.model';
import { AuthStateService } from '../../../services/auth-state.service';
import { CategoryService } from '../../../services/category.service';
import { BackendComment, CommentService } from '../../../services/comment.service';
import { BackendContent, ContentPagination, ContentService } from '../../../services/content.service';
import { ContentTypeService } from '../../../services/content-type.service';
import { CommentReportReason, CommentReportService } from '../../../services/comment-report.service';
import { ConfirmService } from '../../../services/confirm.service';
import { QuizService } from '../../../services/quiz.service';
import { ReactionService } from '../../../services/reaction.service';
import { SavedContentService } from '../../../services/saved-content.service';
import { SharePlatform, ShareService } from '../../../services/share.service';
import { ToastService } from '../../../services/toast.service';
import { ContentSubscriptionService } from '../../../services/content-subscription.service';
import { SubscriptionService } from '../../../services/subscription.service';
import { normalizeMediaUrl } from '../../../services/media-url.util';
import { BackToTopComponent } from '../../shared/back-to-top/back-to-top.component';
import { ContentForumActionComponent } from '../../shared/content-forum-action/content-forum-action.component';
import { PublicNavbarComponent } from '../../shared/public-navbar/public-navbar.component';
import { ContentCardComponent } from './components/content-card.component';
import { ContentListItem } from '../../../models/content-list-item.model';

interface ContentDetail {
  id: string;
  ownerId?: string;
  categoryId?: number | string;
  contentTypeId?: number | string;
  category: string;
  contentType: string;
  meta: string;
  title: string;
  summary: string;
  body: string;
  author: string;
  authorInitials: string;
  authorPhotoUrl?: string;
  authorBio?: string;
  imageUrl?: string;
  premium: boolean;
  canReadPremium?: boolean;
  reactionsCount: number;
  commentsCount: number;
  sharesCount: number;
  likedByMe: boolean;
  viewsCount: number;
}

interface CommentView {
  id: string;
  ownerId?: string;
  author: string;
  authorInitials: string;
  authorPhotoUrl?: string;
  text: string;
  createdAt?: string | null;
  replies: CommentReplyView[];
}

interface CommentReplyView {
  id: string;
  ownerId?: string;
  author: string;
  authorInitials: string;
  authorPhotoUrl?: string;
  text: string;
  createdAt?: string | null;
}

interface CommentReportTarget {
  id: string;
  author: string;
  text: string;
}

interface VideoDetail {
  id: string;
  ownerId?: string;
  categoryId?: number | string;
  contentTypeId?: number | string;
  title: string;
  date: string;
  duration: string;
  frameUrl?: string;
  videoUrl?: string;
  author: string;
  authorInitials: string;
  authorPhotoUrl?: string;
  authorRole: string;
  summary: string;
  quote: string;
}

interface VideoCommentView {
  id: string;
  ownerId?: string;
  author: string;
  authorInitials: string;
  authorPhotoUrl?: string;
  text: string;
  createdAt?: string | null;
  replies: VideoCommentReplyView[];
}

interface VideoCommentReplyView {
  id: string;
  ownerId?: string;
  author: string;
  authorInitials: string;
  authorPhotoUrl?: string;
  text: string;
  createdAt?: string | null;
}

interface CommentReportTarget {
  id: string;
  author: string;
  text: string;
}

interface PageToast {
  message: string;
  kind: 'success' | 'error' | 'info';
}

function contentAuthorPhotoUrl(content: BackendContent): string | undefined {
  const author = content.author ?? content.user;

  return normalizeMediaUrl(
    content.author_photo_url
      ?? content.authorPhotoUrl
      ?? content.author_photo
      ?? content.user_photo
      ?? content.user_photo_url
      ?? content.userPhotoUrl
      ?? content.photo
      ?? content.avatar_url
      ?? content.avatarUrl
      ?? content.avatar
      ?? author?.photo
      ?? author?.avatar_url
      ?? author?.avatarUrl
      ?? author?.profile_photo
      ?? author?.profilePhoto
      ?? author?.avatar,
  );
}

function contentAuthorId(content: BackendContent): string | undefined {
  const id = content.author?.id ?? content.user?.id;

  return id === undefined || id === null ? undefined : String(id);
}

function contentSharesCount(content: BackendContent): number {
  return Number(content.shares_count ?? content.share_count ?? content.shared_count ?? 0);
}

@Component({
  selector: 'app-content-library-page',
  imports: [PublicNavbarComponent, BackToTopComponent, ContentCardComponent],
  templateUrl: './content-library.page.html'
})
export class ContentLibraryPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly auth = inject(AuthStateService);
  private readonly categoryService = inject(CategoryService);
  private readonly contentService = inject(ContentService);
  private readonly contentTypeService = inject(ContentTypeService);
  private readonly reactionService = inject(ReactionService);
  private readonly savedContentService = inject(SavedContentService);
  private readonly shareService = inject(ShareService);
  private readonly toastService = inject(ToastService);
  private readonly contentSubscriptionService = inject(ContentSubscriptionService);
  private readonly subscriptionService = inject(SubscriptionService);
  readonly confirmService = inject(ConfirmService);
  private loadRequestId = 0;
  readonly categories = signal<Category[]>([]);
  readonly contentTypes = signal<ContentTypeOption[]>([]);
  readonly contents = signal<ContentListItem[]>([]);
  readonly pagination = signal<ContentPagination>({
    currentPage: 1,
    lastPage: 1,
    perPage: 0,
    total: 0,
    from: 0,
    to: 0,
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
  readonly toast = signal<PageToast | null>(null);
  readonly savingContentId = signal<string | null>(null);
  readonly jindungoPromptTarget = signal<ContentListItem | null>(null);
  readonly jindungoPromptFeedback = signal('');
  readonly isRequestingJindungo = signal(false);
  readonly approvedJindungoContentIds = signal<Set<string>>(new Set());
  private toastTimeout?: ReturnType<typeof setTimeout>;
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
      this.categories.set([]);
    }

    try {
      const contentTypes = await this.contentTypeService.getAll();

      if (contentTypes.length > 0) {
        this.contentTypes.set(contentTypes);
      }
    } catch {
      this.contentTypes.set([]);
    }

    this.applyRouteFilters();
    await this.loadContents(1, true);
  }

  ngOnDestroy(): void {
    this.clearToastTimeout();
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

    if (payload.operation === 'subscrever ao Jindungo' || payload.operation === 'pedir subscrição Jindungo') {
      if (!this.auth.isAuthenticated()) {
        this.auth.requireLoginFor('subscrever ao Jindungo');
        return;
      }

      this.openJindungoPrompt(payload.content);
      return;
    }

    this.auth.requireLoginFor(payload.operation);
  }

  openJindungoPrompt(content: ContentListItem): void {
    this.jindungoPromptTarget.set(content);
    this.jindungoPromptFeedback.set('');
  }

  closeJindungoPrompt(): void {
    this.jindungoPromptTarget.set(null);
    this.jindungoPromptFeedback.set('');
    this.isRequestingJindungo.set(false);
  }

  async requestJindungoSubscription(): Promise<void> {
    const content = this.jindungoPromptTarget();
    const user = this.auth.user();

    if (!content) {
      return;
    }

    if (!user) {
      this.auth.requireLoginFor('subscrever ao Jindungo');
      return;
    }

    this.isRequestingJindungo.set(true);

    try {
      const subscription = await this.contentSubscriptionService.request(content.id);

      if (subscription.status === 'approved') {
        this.approvedJindungoContentIds.update((ids) => new Set(ids).add(String(content.id)));
        this.contents.update((items) =>
          items.map((item) => item.id === content.id ? { ...item, canReadPremium: true } : item),
        );
        this.jindungoPromptFeedback.set('Subscrição aprovada. O texto já está desbloqueado nos conteúdos.');
        this.showToast('Texto com Jindungo desbloqueado.', 'success');
        return;
      }

      this.jindungoPromptFeedback.set('O seu pedido está a ser processado. Aguarde a aprovação para aceder a este texto.');
      this.showToast('Pedido de subscrição enviado para processamento.', 'success');
    } catch {
      this.jindungoPromptFeedback.set('Não foi possível enviar o pedido de subscrição.');
      this.showToast('Não foi possível enviar o pedido de subscrição.', 'error');
    } finally {
      this.isRequestingJindungo.set(false);
    }
  }

  private legacyRequestJindungoSubscription(): void {
    const content = this.jindungoPromptTarget();
    const user = this.auth.user();

    if (!content) {
      return;
    }

    if (!user) {
      this.auth.requireLoginFor('subscrever ao Jindungo');
      return;
    }

    this.isRequestingJindungo.set(true);
    this.subscriptionService.requestTextSubscription(
      {
        id: content.id,
        title: content.title,
        excerpt: content.excerpt,
        subscribedAt: '',
        readingMinutes: 0,
        route: `/app/contents/${content.id}`,
        imageUrl: content.imageUrl,
        author: content.author,
      },
      user.name,
      user.email,
    );
    this.jindungoPromptFeedback.set('O seu pedido está a ser processado. Aguarde a aprovação para aceder a este texto.');
    this.showToast('Pedido de subscrição enviado para processamento.', 'success');
    this.isRequestingJindungo.set(false);
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

    await this.shareService.copy(url);
    this.incrementContentShareCount(this.shareContentTarget()?.id);
    this.showToast('Link copiado.', 'success');
  }

  async shareFromModal(platform: 'whatsapp' | 'facebook' | 'instagram'): Promise<void> {
    const content = this.shareContentTarget();
    const url = this.shareUrl();

    if (!content || !url) {
      return;
    }

    const title = `${content.title} - Economia com História`;

    const result = await this.shareService.share({ title: content.title, text: title, url }, platform);

    if (result !== 'cancelled') {
      this.incrementContentShareCount(content.id);
    }

    if (result === 'copied') {
      this.showToast(platform === 'instagram' ? 'Link copiado para partilhar no Instagram.' : 'Link copiado.', 'success');
    }
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
      this.showToast(`"${content.title}" foi guardado.`, 'success');
    } catch {
      this.showToast('Não foi possível guardar este conteúdo.', 'error');
    } finally {
      this.savingContentId.set(null);
    }
  }

  private showToast(message: string, kind: PageToast['kind'] = 'info'): void {
    this.toastService[kind](message);
  }

  private clearToastTimeout(): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = undefined;
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
      if (this.isOwnedByCurrentUser(content.ownerId)) {
        this.showToast(nextLikedByMe ? 'Gosto registado.' : 'Gosto removido.', 'success');
        return;
      }

      this.contents.update((items) =>
        items.map((item) =>
          item.id === content.id
            ? { ...item, reactionsCount: currentCount, likedByMe: currentLikedByMe }
            : item,
        ),
      );
      this.showToast('Não foi possível registar o gosto.', 'error');
    }
  }

  private incrementContentShareCount(contentId: string | undefined): void {
    if (!contentId) {
      return;
    }

    this.contents.update((items) =>
      items.map((item) =>
        item.id === contentId
          ? { ...item, sharesCount: (item.sharesCount ?? 0) + 1 }
          : item,
      ),
    );

    const target = this.shareContentTarget();
    if (target?.id === contentId) {
      this.shareContentTarget.set({ ...target, sharesCount: (target.sharesCount ?? 0) + 1 });
    }
  }

  private absoluteContentUrl(contentId: string): string {
    return `${window.location.origin}/app/contents/${contentId}`;
  }

  private isOwnedByCurrentUser(ownerId: string | undefined): boolean {
    const userId = this.auth.user()?.id;

    return Boolean(ownerId && userId && String(ownerId) === String(userId));
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
    const authorId = contentAuthorId(content);

    return {
      id: String(content.id),
      ownerId: this.contentOwnerId(content),
      category: content.category?.name ?? 'Sem categoria',
      contentType,
      meta: this.buildMeta(content.updated_at ?? content.created_at, contentType),
      title: content.title,
      excerpt: content.summary || this.toExcerpt(content.content),
      authorId,
      author: authorName,
      authorInitials: this.getInitials(authorName),
      authorPhotoUrl: contentAuthorPhotoUrl(content) ?? this.authenticatedAuthorPhotoUrl(authorId),
      imageUrl: normalizeMediaUrl(content.image_url, { contentId: content.id, mediaType: 'image' }),
      premium,
      reactionsCount: Number(content.reactions_count ?? 0),
      commentsCount: Number(content.comments_count ?? 0),
      sharesCount: contentSharesCount(content),
      likedByMe: Boolean(content.liked_by_me),
      searchText: content.content || '',
      canReadPremium: !premium || this.canReadJindungoContent(content),
    };
  }

  private async loadContents(page: number, replace: boolean): Promise<void> {
    const requestId = ++this.loadRequestId;

    this.isLoadingContents.set(true);

    try {
      await this.loadApprovedJindungoContentIds();
      const response = await this.contentService.getAll({
        page,
        perPage: 9,
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
        this.contents.set([]);
        this.pagination.set({
          currentPage: 1,
          lastPage: 1,
          perPage: 0,
          total: 0,
          from: 0,
          to: 0,
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

    return formattedDate;
  }

  private async loadApprovedJindungoContentIds(): Promise<void> {
    if (!this.auth.isAuthenticated() || this.auth.canReadJindungo()) {
      this.approvedJindungoContentIds.set(new Set());
      return;
    }

    try {
      const subscriptions = await this.contentSubscriptionService.mine();
      this.approvedJindungoContentIds.set(
        new Set(
          subscriptions
            .filter((subscription) => subscription.status === 'approved')
            .map((subscription) => String(subscription.content_id)),
        ),
      );
    } catch {
      this.approvedJindungoContentIds.set(new Set());
    }
  }

  private canReadJindungoContent(content: BackendContent): boolean {
    return this.auth.canReadJindungo()
      || Boolean(content.can_access)
      || content.subscription_status === 'approved'
      || this.approvedJindungoContentIds().has(String(content.id));
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

  private contentOwnerId(content: BackendContent): string | undefined {
    const ownerId = content.user_id ?? content.author_id ?? content.user?.id ?? content.author?.id;

    return ownerId === undefined || ownerId === null ? undefined : String(ownerId);
  }

  private toExcerpt(value: string | null | undefined): string {
    if (!value) {
      return 'Conteúdo disponível na biblioteca Economia com História.';
    }

    return value.replace(/<[^>]*>/g, '').slice(0, 180);
  }

  private authenticatedAuthorPhotoUrl(authorId: string | undefined): string | undefined {
    const user = this.auth.user();

    return authorId && user?.id === authorId ? user.avatarUrl : undefined;
  }

}

@Component({
  selector: 'app-content-detail-page',
  imports: [RouterLink, PublicNavbarComponent, BackToTopComponent, ContentForumActionComponent],
  templateUrl: './content-detail.page.html'
})
export class ContentDetailPage implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly commentService = inject(CommentService);
  private readonly commentReportService = inject(CommentReportService);
  private readonly contentService = inject(ContentService);
  private readonly quizService = inject(QuizService);
  private readonly reactionService = inject(ReactionService);
  private readonly savedContentService = inject(SavedContentService);
  private readonly shareService = inject(ShareService);
  private readonly toastService = inject(ToastService);
  readonly auth = inject(AuthStateService);
  readonly confirmService = inject(ConfirmService);
  readonly detail = signal<ContentDetail | null>(null);
  readonly comments = signal<CommentView[]>([]);
  readonly reactionCount = signal(0);
  readonly shareCount = signal(0);
  readonly likedByMe = signal(false);
  readonly isLoading = signal(true);
  readonly isJindungoBlocked = signal(false);
  readonly jindungoBlockedMessage = signal('');
  readonly isLoadingComments = signal(false);
  readonly isSavingComment = signal(false);
  readonly isSavingReaction = signal(false);
  readonly isSavingContent = signal(false);
  readonly isCommentComposerOpen = signal(false);
  readonly replyingToCommentId = signal<string | null>(null);
  readonly editingCommentId = signal<string | null>(null);
  readonly editingReplyId = signal<string | null>(null);
  readonly shareMenuOpen = signal(false);
  readonly commentError = signal('');
  readonly commentSuccess = signal('');
  readonly reportTarget = signal<CommentReportTarget | null>(null);
  readonly reportReason = signal<CommentReportReason>('offensive_comment');
  readonly reportDescription = signal('');
  readonly reportError = signal('');
  readonly reportSuccess = signal('');
  readonly isSubmittingReport = signal(false);
  readonly reactionError = signal('');
  readonly saveStatus = signal('');
  readonly shareStatus = signal('');
  readonly relatedContents = signal<ContentListItem[]>([]);
  readonly isLoadingRelated = signal(false);
  readonly toast = signal<PageToast | null>(null);
  readonly canUseNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;
  private toastTimeout?: ReturnType<typeof setTimeout>;
  readonly relatedQuiz = computed(() => {
    const contentId = this.detail()?.id ?? this.route.snapshot.params['id'];

    return this.quizService.quizzes().find((quiz) => quiz.relatedContent.id === contentId);
  });
  readonly title = computed(() => this.detail()?.title ?? (this.isPremiumContent() ? 'Texto com Jindungo' : this.route.snapshot.params['id'] === 'create' ? 'Criar conteúdo' : 'Conteúdo editorial'));
  readonly isPremiumContent = computed(() => {
    if (this.detail()?.premium) {
      return true;
    }

    const routeId = String(this.route.snapshot.params['id'] ?? '').toLowerCase();
    return routeId.includes('jindungo');
  });
  readonly canReadCurrentPremium = computed(() => {
    const detail = this.detail();

    return this.auth.canReadJindungo() || Boolean(detail?.canReadPremium);
  });
  readonly isEditMode = computed(() => this.route.snapshot.url.some((segment) => segment.path === 'edit'));
  readonly canManageDetail = computed(() => {
    const ownerId = this.detail()?.ownerId;
    const userId = this.auth.user()?.id;

    return Boolean(ownerId && userId && String(ownerId) === String(userId));
  });

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.params['id'];

    if (!id || id === 'create') {
      this.isLoading.set(false);
      return;
    }

    try {
      const content = await this.contentService.getById(id);
      const detail = this.toContentDetail(content);

      this.detail.set(detail);
      this.reactionCount.set(detail.reactionsCount);
      this.shareCount.set(detail.sharesCount);
      this.likedByMe.set(detail.likedByMe);
      await Promise.all([
        this.loadComments(String(content.id)),
        this.loadRelatedContents(content),
      ]);
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 403) {
        await this.router.navigate(['/app/subscriptions'], {
          queryParams: { contentId: id },
        });
        return;

        this.isJindungoBlocked.set(true);
        this.jindungoBlockedMessage.set(
          'Este texto com Jindungo exige uma subscrição ativa. Subscreva e aguarde aprovação do SuperAdmin para desbloquear o artigo.',
        );
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.clearToastTimeout();
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

  toggleReplyComposer(event: Event, commentId: string): void {
    if (!this.auth.isAuthenticated()) {
      this.requireLogin(event, 'responder');
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.commentError.set('');
    this.commentSuccess.set('');
    this.replyingToCommentId.set(this.replyingToCommentId() === commentId ? null : commentId);
  }

  canManageComment(comment: CommentView): boolean {
    const userId = this.auth.user()?.id;

    return Boolean(comment.ownerId && userId && String(comment.ownerId) === String(userId));
  }

  openEditComment(comment: CommentView): void {
    if (!this.canManageComment(comment)) {
      this.showToast('Apenas o dono pode editar este comentário.', 'error');
      return;
    }

    this.commentError.set('');
    this.commentSuccess.set('');
    this.replyingToCommentId.set(null);
    this.editingCommentId.set(comment.id);
  }

  cancelEditComment(): void {
    this.editingCommentId.set(null);
  }

  async saveEditedComment(commentId: string, value: string): Promise<void> {
    const contentId = this.detail()?.id;
    const comment = value.trim();

    this.commentError.set('');
    this.commentSuccess.set('');

    if (!contentId || !comment || this.isSavingComment()) {
      this.commentError.set('Escreva um comentário antes de guardar.');
      return;
    }

    this.isSavingComment.set(true);

    try {
      await this.commentService.update(commentId, comment);
      await this.loadComments(contentId);
      this.commentSuccess.set('Comentário atualizado com sucesso.');
      this.editingCommentId.set(null);
    } catch {
      this.commentError.set('Não foi possível atualizar o comentário.');
    } finally {
      this.isSavingComment.set(false);
    }
  }

  async deleteComment(comment: CommentView): Promise<void> {
    const contentId = this.detail()?.id;

    if (!contentId || !this.canManageComment(comment)) {
      this.showToast('Apenas o dono pode apagar este comentário.', 'error');
      return;
    }

    const confirmed = await this.confirmService.confirm('Apagar este comentário?');
    if (!confirmed) {
      return;
    }

    try {
      await this.commentService.delete(comment.id);
      await this.loadComments(contentId);
      this.commentSuccess.set('Comentário apagado com sucesso.');
    } catch {
      this.commentError.set('Não foi possível apagar o comentário.');
    }
  }

  canManageReply(reply: CommentReplyView): boolean {
    const userId = this.auth.user()?.id;

    return Boolean(reply.ownerId && userId && String(reply.ownerId) === String(userId));
  }

  openEditReply(comment: CommentView, reply: CommentReplyView): void {
    if (!this.canManageReply(reply)) {
      this.showToast('Apenas o dono pode editar esta resposta.', 'error');
      return;
    }

    this.replyingToCommentId.set(null);
    this.editingReplyId.set(reply.id);
  }

  cancelEditReply(): void {
    this.editingReplyId.set(null);
  }

  async saveEditedReply(commentId: string, replyId: string, value: string): Promise<void> {
    const contentId = this.detail()?.id;
    const reply = value.trim();

    this.commentError.set('');
    this.commentSuccess.set('');

    if (!contentId || !reply || this.isSavingComment()) {
      this.commentError.set('Escreva uma resposta antes de guardar.');
      return;
    }

    this.isSavingComment.set(true);

    try {
      await this.commentService.updateReply(replyId, reply);
      await this.loadComments(contentId);
      this.commentSuccess.set('Resposta atualizada com sucesso.');
      this.editingReplyId.set(null);
    } catch {
      this.commentError.set('Não foi possível atualizar a resposta.');
    } finally {
      this.isSavingComment.set(false);
    }
  }

  async deleteReply(comment: CommentView, reply: CommentReplyView): Promise<void> {
    const contentId = this.detail()?.id;

    if (!contentId || !this.canManageReply(reply)) {
      this.showToast('Apenas o dono pode apagar esta resposta.', 'error');
      return;
    }

    const confirmed = await this.confirmService.confirm('Apagar esta resposta?');
    if (!confirmed) {
      return;
    }

    try {
      await this.commentService.deleteReply(reply.id);
      await this.loadComments(contentId);
      this.commentSuccess.set('Resposta apagada com sucesso.');
    } catch {
      this.commentError.set('Não foi possível apagar a resposta.');
    }
  }

  openReportReply(event: Event, reply: CommentReplyView): void {
    if (!this.auth.isAuthenticated()) {
      event.preventDefault();
      event.stopPropagation();
      this.requireLogin(event, 'denunciar comentário');
      return;
    }

    if (!this.canManageReply(reply)) {
      this.reportTarget.set({ id: reply.id, author: reply.author, text: reply.text });
      this.reportReason.set('offensive_comment');
      this.reportDescription.set('');
      this.reportError.set('');
      return;
    }

    this.showToast('Não podes denunciar a tua própria resposta.', 'error');
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
    const previousLikedByMe = this.likedByMe();
    const previousReactionCount = this.reactionCount();
    const nextLikedByMe = !previousLikedByMe;

    this.likedByMe.set(nextLikedByMe);
    this.reactionCount.set(Math.max(0, previousReactionCount + (nextLikedByMe ? 1 : -1)));

    try {
      const response = await this.reactionService.toggle(contentId, 'like');
      this.likedByMe.set(response.data.reacted);
      this.reactionCount.set(Number(response.data.reactions_count ?? this.reactionCount()));
    } catch {
      if (this.canManageDetail()) {
        this.showToast(nextLikedByMe ? 'Gosto registado.' : 'Gosto removido.', 'success');
        return;
      }

      this.likedByMe.set(previousLikedByMe);
      this.reactionCount.set(previousReactionCount);
      this.showToast('Não foi possível registar a reação.', 'error');
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
      this.showToast('Conteúdo guardado.', 'success');
    } catch {
      this.showToast('Não foi possível guardar este conteúdo.', 'error');
    } finally {
      this.isSavingContent.set(false);
    }
  }

  editContentRoute(): string[] {
    const detail = this.detail();

    return detail ? ['/app/contents', detail.id, 'edit'] : ['/app/contents'];
  }

  async saveEditedContent(title: string, summary: string, body: string): Promise<void> {
    const detail = this.detail();

    if (!detail || !this.canManageDetail()) {
      this.showToast('Apenas o dono pode editar este conteúdo.', 'error');
      return;
    }

    const nextTitle = title.trim();
    const nextSummary = summary.trim();
    const nextBody = body.trim();

    if (!nextTitle || !nextBody) {
      this.showToast('Preencha o título e o conteúdo.', 'error');
      return;
    }

    try {
      const updated = await this.contentService.update(detail.id, {
        title: nextTitle,
        summary: nextSummary || null,
        content: nextBody,
        category_id: detail.categoryId ? Number(detail.categoryId) : null,
        content_type_id: Number(detail.contentTypeId),
        visibility: 'public',
      });

      this.detail.set(this.toContentDetail(updated));
      this.showToast('Conteúdo atualizado.', 'success');
    } catch {
      this.showToast('Não foi possível atualizar este conteúdo.', 'error');
    }
  }

  async deleteCurrentContent(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const detail = this.detail();

    if (!detail || !this.canManageDetail()) {
      this.showToast('Apenas o dono pode apagar este conteúdo.', 'error');
      return;
    }

    const confirmed = await this.confirmService.confirm(`Apagar "${detail.title}"?`);
    if (!confirmed) {
      return;
    }

    try {
      await this.contentService.delete(detail.id);
      await this.router.navigate(['/app/contents']);
    } catch {
      this.showToast('Não foi possível apagar este conteúdo.', 'error');
    }
  }

  toggleShareMenu(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.shareStatus.set('');
    this.shareMenuOpen.set(!this.shareMenuOpen());
  }

  async shareTo(platform: SharePlatform, event?: Event): Promise<void> {
    event?.preventDefault();
    event?.stopPropagation();

    const detail = this.detail();

    if (!detail) {
      return;
    }

    const url = this.currentShareUrl();
    const title = `${detail.title} - Economia com História`;

    const result = await this.shareService.share({ title: detail.title, text: title, url }, platform);

    if (result !== 'cancelled') {
      this.shareCount.update((count) => count + 1);
    }

    if (result === 'copied') {
      this.showToast(platform === 'instagram' ? 'Link copiado para partilhar no Instagram.' : 'Link copiado.', 'success');
    }

    this.shareMenuOpen.set(false);
  }

  async submitComment(value: string): Promise<void> {
    const contentId = this.detail()?.id;
    const comment = value.trim();

    this.commentError.set('');
    this.commentSuccess.set('');

    if (!contentId || !comment) {
      this.showToast('Escreva um comentário antes de publicar.', 'error');
      return;
    }

    this.isSavingComment.set(true);

    try {
      await this.commentService.create(contentId, comment);
      await this.loadComments(contentId);
      this.showToast('Comentário publicado com sucesso.', 'success');
      this.isCommentComposerOpen.set(false);
    } catch {
      this.showToast('Não foi possível publicar o comentário.', 'error');
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
      this.showToast('Escreva uma resposta antes de publicar.', 'error');
      return;
    }

    try {
      await this.commentService.reply(commentId, reply);
      await this.loadComments(contentId);
      this.showToast('Resposta publicada com sucesso.', 'success');
      this.replyingToCommentId.set(null);
    } catch {
      this.showToast('Não foi possível publicar a resposta.', 'error');
    }
  }

  openReportModal(event: Event, comment: CommentView): void {
    if (!this.auth.isAuthenticated()) {
      this.requireLogin(event, 'denunciar comentário');
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    if (this.canManageComment(comment)) {
      this.showToast('Não podes denunciar o teu próprio comentário.', 'error');
      return;
    }

    this.reportTarget.set({
      id: comment.id,
      author: comment.author,
      text: comment.text,
    });
    this.reportReason.set('offensive_comment');
    this.reportDescription.set('');
    this.reportError.set('');
    this.reportSuccess.set('');
  }

  closeReportModal(): void {
    this.reportTarget.set(null);
    this.reportError.set('');
  }

  updateReportReason(event: Event): void {
    this.reportReason.set((event.target as HTMLSelectElement).value as CommentReportReason);
  }

  updateReportDescription(event: Event): void {
    this.reportDescription.set((event.target as HTMLTextAreaElement).value);
  }

  async submitCommentReport(): Promise<void> {
    const target = this.reportTarget();

    if (!target || this.isSubmittingReport()) {
      return;
    }

    this.isSubmittingReport.set(true);
    this.reportError.set('');
    this.reportSuccess.set('');

    try {
      await this.commentReportService.create(target.id, this.reportReason(), this.reportDescription());
      this.showToast('Comentário denunciado. A equipa vai rever.', 'success');
      this.reportTarget.set(null);
    } catch (error) {
      this.reportError.set(error instanceof Error ? this.translateReportError(error.message) : 'Não foi possível enviar a denúncia.');
    } finally {
      this.isSubmittingReport.set(false);
    }
  }

  private translateReportError(message: string): string {
    const translations: Record<string, string> = {
      'You cannot report your own comment': 'Não podes denunciar o teu próprio comentário.',
      'You have already reported this comment': 'Já denunciaste este comentário.',
      'Comment not found': 'Comentário não encontrado.',
    };

    return translations[message] ?? message;
  }

  private showToast(message: string, kind: PageToast['kind'] = 'info'): void {
    this.toastService[kind](message);
  }

  private clearToastTimeout(): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = undefined;
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

  private async loadRelatedContents(content: BackendContent): Promise<void> {
    const contentId = String(content.id);
    const categoryId = content.category?.id;
    const contentTypeId = content.content_type?.id;
    const related = new Map<string, ContentListItem>();

    this.isLoadingRelated.set(true);

    try {
      if (categoryId) {
        const response = await this.contentService.getAll({ categoryId });

        response.data
          .filter((item) => String(item.id) !== contentId)
          .forEach((item) => related.set(String(item.id), this.toRelatedContent(item)));
      }

      if (related.size < 6 && contentTypeId) {
        const response = await this.contentService.getAll({ contentTypeId });

        response.data
          .filter((item) => String(item.id) !== contentId)
          .forEach((item) => related.set(String(item.id), this.toRelatedContent(item)));
      }

      this.relatedContents.set([...related.values()].slice(0, 3));
    } catch {
      this.relatedContents.set([]);
    } finally {
      this.isLoadingRelated.set(false);
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

  currentShareUrl(): string {
    return window.location.href.split('#')[0];
  }

  private toCommentView(comment: BackendComment): CommentView {
    const authorName = comment.user?.name ?? 'Utilizador';

    return {
      id: String(comment.id),
      ownerId: this.commentOwnerId(comment),
      author: authorName,
      authorInitials: this.getInitials(authorName),
      authorPhotoUrl: normalizeMediaUrl(comment.user?.photo),
      text: comment.comment,
      createdAt: comment.created_at,
      replies: (comment.replies ?? []).map((reply) => {
        const replyAuthor = reply.user?.name ?? 'Utilizador';

        return {
          id: String(reply.id),
          ownerId: reply.user?.id ? String(reply.user.id) : undefined,
          author: replyAuthor,
          authorInitials: this.getInitials(replyAuthor),
          authorPhotoUrl: normalizeMediaUrl(reply.user?.photo),
          text: reply.reply,
          createdAt: reply.created_at,
        };
      }),
    };
  }

  private commentOwnerId(comment: BackendComment): string | undefined {
    const ownerId = comment.user_id ?? comment.user?.id;

    return ownerId === undefined || ownerId === null ? undefined : String(ownerId);
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
    const authorId = contentAuthorId(content);

    return {
      id: String(content.id),
      ownerId: this.detailOwnerId(content),
      categoryId: content.category?.id,
      contentTypeId: content.content_type?.id,
      category: content.category?.name ?? 'Sem categoria',
      contentType,
      meta: this.buildMeta(content.updated_at ?? content.created_at, contentType),
      title: content.title,
      summary: content.summary || this.toExcerpt(content.content),
      body: content.content || '<p>Conteúdo indisponível.</p>',
      author: authorName,
      authorInitials: this.getInitials(authorName),
      authorPhotoUrl: contentAuthorPhotoUrl(content) ?? this.authenticatedAuthorPhotoUrl(authorId),
      authorBio: content.author?.bio || content.user?.bio || undefined,
      imageUrl: normalizeMediaUrl(content.image_url, { contentId: content.id, mediaType: 'image' }),
      premium: contentTypeSlug === 'jindungo',
      canReadPremium: contentTypeSlug !== 'jindungo' || this.canReadJindungoContent(content),
      reactionsCount: Number(content.reactions_count ?? 0),
      commentsCount: Number(content.comments_count ?? 0),
      sharesCount: contentSharesCount(content),
      likedByMe: Boolean(content.liked_by_me),
      viewsCount: Number(content.views_count ?? 0),
    };
  }

  relatedContentRoute(content: ContentListItem): string[] {
    const type = this.normalizeText(content.contentType);

    if (type === 'video') {
      return ['/app/contents/videos', content.id];
    }

    return ['/app/contents', content.id];
  }

  private toRelatedContent(content: BackendContent): ContentListItem {
    const contentType = content.content_type?.name ?? 'Texto';
    const authorName = content.author?.name ?? content.user?.name ?? 'Equipa editorial';
    const authorId = contentAuthorId(content);

    return {
      id: String(content.id),
      ownerId: this.detailOwnerId(content),
      category: content.category?.name ?? 'Sem categoria',
      contentType,
      meta: this.buildMeta(content.updated_at ?? content.created_at, contentType),
      title: content.title,
      excerpt: content.summary || this.toExcerpt(content.content),
      authorId,
      author: authorName,
      authorInitials: this.getInitials(authorName),
      authorPhotoUrl: contentAuthorPhotoUrl(content) ?? this.authenticatedAuthorPhotoUrl(authorId),
      imageUrl: normalizeMediaUrl(content.image_url, { contentId: content.id, mediaType: 'image' }),
      premium: this.normalizeText(content.content_type?.slug ?? contentType) === 'jindungo',
      canReadPremium: this.normalizeText(content.content_type?.slug ?? contentType) !== 'jindungo' || this.canReadJindungoContent(content),
      reactionsCount: Number(content.reactions_count ?? 0),
      commentsCount: Number(content.comments_count ?? 0),
      sharesCount: contentSharesCount(content),
      likedByMe: Boolean(content.liked_by_me),
      searchText: content.content || '',
    };
  }

  formatCompactNumber(value: number | null | undefined): string {
    return new Intl.NumberFormat('pt-AO', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value ?? 0);
  }

  private buildMeta(createdAt: string | null | undefined, contentType: string): string {
    const date = createdAt ? new Date(createdAt) : null;
    const formattedDate =
      date && !Number.isNaN(date.getTime())
        ? new Intl.DateTimeFormat('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
        : 'Sem data';

    return formattedDate;
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private canReadJindungoContent(content: BackendContent): boolean {
    return this.auth.canReadJindungo()
      || Boolean(content.can_access)
      || content.subscription_status === 'approved';
  }

  private detailOwnerId(content: BackendContent): string | undefined {
    const ownerId = content.user_id ?? content.author_id ?? content.user?.id ?? content.author?.id;

    return ownerId === undefined || ownerId === null ? undefined : String(ownerId);
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

  private authenticatedAuthorPhotoUrl(authorId: string | undefined): string | undefined {
    const user = this.auth.user();

    return authorId && user?.id === authorId ? user.avatarUrl : undefined;
  }
}

@Component({
  selector: 'app-video-content-detail-page',
  imports: [RouterLink, PublicNavbarComponent, BackToTopComponent, ContentForumActionComponent],
  templateUrl: './video-content-detail.page.html'
})
export class VideoContentDetailPage implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly commentService = inject(CommentService);
  private readonly commentReportService = inject(CommentReportService);
  private readonly contentService = inject(ContentService);
  private readonly reactionService = inject(ReactionService);
  private readonly savedContentService = inject(SavedContentService);
  private readonly shareService = inject(ShareService);
  private readonly toastService = inject(ToastService);
  readonly confirmService = inject(ConfirmService);
  readonly auth = inject(AuthStateService);
  readonly saveStatus = signal('');
  readonly toast = signal<PageToast | null>(null);
  readonly videoLiked = signal(false);
  readonly videoReactionCount = signal(0);
  readonly videoShareCount = signal(0);
  readonly isSavingVideoReaction = signal(false);
  readonly isVideoCommentComposerOpen = signal(false);
  readonly isSavingVideoComment = signal(false);
  readonly isSavingVideoReply = signal(false);
  readonly editingVideoCommentId = signal<string | null>(null);
  readonly isSavingEditedReply = signal(false);
  readonly isLoadingComments = signal(false);
  readonly replyingToCommentId = signal<string | null>(null);
  readonly editingReplyId = signal<string | null>(null);
  readonly commentError = signal('');
  readonly commentSuccess = signal('');
  readonly reportTarget = signal<CommentReportTarget | null>(null);
  readonly reportReason = signal<CommentReportReason>('offensive_comment');
  readonly reportDescription = signal('');
  readonly reportError = signal('');
  readonly isSubmittingReport = signal(false);
  readonly isLoading = signal(false);
  readonly loadError = signal('');
  readonly loadedVideo = signal<VideoDetail | null>(null);
  readonly relatedContents = signal<ContentListItem[]>([]);
  readonly isLoadingRelated = signal(false);
  readonly videoPlaying = signal(false);
  readonly videoReady = signal(false);
  readonly videoLoadError = signal(false);
  private toastTimeout?: ReturnType<typeof setTimeout>;

  readonly video = computed(() => {
    return this.loadedVideo();
  });
  readonly canManageVideo = computed(() => {
    const ownerId = this.video()?.ownerId;
    const userId = this.auth.user()?.id;

    return Boolean(ownerId && userId && String(ownerId) === String(userId));
  });

  ngOnDestroy(): void {
    this.clearToastTimeout();
  }
  readonly comments = signal<VideoCommentView[]>([]);

  constructor() {
    void this.loadVideo();
  }

  async toggleVideoPlayback(video: HTMLVideoElement): Promise<void> {
    if (video.paused) {
      try {
        if (video.readyState === video.HAVE_NOTHING) {
          video.load();
        }
        await video.play();
      } catch {
        this.videoPlaying.set(false);
        this.videoLoadError.set(true);
      }
      return;
    }

    video.pause();
  }

  seekVideo(video: HTMLVideoElement, seconds: number): void {
    if (video.readyState === video.HAVE_NOTHING || !this.videoReady()) {
      return;
    }

    const duration = Number.isFinite(video.duration) ? video.duration : Number.POSITIVE_INFINITY;
    const nextTime = Math.max(0, Math.min(duration, video.currentTime + seconds));

    video.currentTime = nextTime;
  }

  markVideoReady(): void {
    this.videoReady.set(true);
    this.videoLoadError.set(false);
  }

  markVideoPlaying(): void {
    this.videoPlaying.set(true);
    this.videoLoadError.set(false);
  }

  markVideoStopped(): void {
    this.videoPlaying.set(false);
  }

  markVideoError(): void {
    if (!this.video()?.videoUrl || this.videoLoadError()) {
      return;
    }

    this.videoPlaying.set(false);
    this.videoLoadError.set(true);
  }

  private async loadVideo(): Promise<void> {
    const id = this.route.snapshot.params['id'];

    if (!id) {
      return;
    }

    this.isLoading.set(true);
    this.loadError.set('');
    this.videoReady.set(false);
    this.videoLoadError.set(false);

    try {
      const content = await this.contentService.getById(id);
      const contentTypeSlug = this.normalizeText(content.content_type?.slug ?? content.content_type?.name ?? '');

      if (contentTypeSlug && contentTypeSlug !== 'video') {
        this.showToast('Este conteúdo não é um vídeo.', 'error');
        return;
      }

      this.loadedVideo.set(this.toVideoDetail(content));
      this.videoReactionCount.set(Number(content.reactions_count ?? 0));
      this.videoShareCount.set(contentSharesCount(content));
      this.videoLiked.set(Boolean(content.liked_by_me));
      await Promise.all([
        this.loadVideoComments(String(content.id)),
        this.loadRelatedContents(content),
      ]);
    } catch {
      this.showToast('Não foi possível carregar este vídeo.', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  requireLogin(event: Event, operation: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.auth.requireLoginFor(operation);
  }

  async likeVideo(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    if (!this.auth.isAuthenticated()) {
      this.requireLogin(event, 'gostar');
      return;
    }

    const contentId = this.video()?.id;

    if (!contentId || this.isSavingVideoReaction()) {
      return;
    }

    const previous = this.videoLiked();
    const previousCount = this.videoReactionCount();
    const nextLikedByMe = !previous;
    this.videoLiked.set(!previous);
    this.videoReactionCount.set(Math.max(0, previousCount + (nextLikedByMe ? 1 : -1)));
    this.isSavingVideoReaction.set(true);

    try {
      const response = await this.reactionService.toggle(contentId, 'like');
      this.videoLiked.set(response.data.reacted);
      this.videoReactionCount.set(Number(response.data.reactions_count ?? this.videoReactionCount()));
    } catch {
      if (this.canManageVideo()) {
        this.showToast(!previous ? 'Gosto registado.' : 'Gosto removido.', 'success');
        return;
      }

      this.videoLiked.set(previous);
      this.videoReactionCount.set(previousCount);
      this.showToast('Não foi possível registar o gosto.', 'error');
    } finally {
      this.isSavingVideoReaction.set(false);
    }
  }

  openVideoCommentComposer(event: Event): void {
    if (!this.auth.isAuthenticated()) {
      this.requireLogin(event, 'comentar');
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.isVideoCommentComposerOpen.set(true);
  }

  async submitVideoComment(value: string): Promise<void> {
    const contentId = this.video()?.id;
    const comment = value.trim();

    if (!contentId || !comment || this.isSavingVideoComment()) {
      this.showToast('Escreva um comentário antes de publicar.', 'error');
      return;
    }

    this.isSavingVideoComment.set(true);

    try {
      await this.commentService.create(contentId, comment);
      await this.loadVideoComments(contentId);
      this.isVideoCommentComposerOpen.set(false);
      this.commentSuccess.set('Comentário publicado com sucesso.');
    } catch {
      this.commentError.set('Não foi possível publicar o comentário.');
    } finally {
      this.isSavingVideoComment.set(false);
    }
  }

  toggleReplyComposer(event: Event, commentId: string): void {
    if (!this.auth.isAuthenticated()) {
      this.requireLogin(event, 'responder');
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.commentError.set('');
    this.commentSuccess.set('');
    this.replyingToCommentId.set(this.replyingToCommentId() === commentId ? null : commentId);
  }

  canManageVideoComment(comment: VideoCommentView): boolean {
    const userId = this.auth.user()?.id;

    return Boolean(comment.ownerId && userId && String(comment.ownerId) === String(userId));
  }

  openEditVideoComment(comment: VideoCommentView): void {
    if (!this.canManageVideoComment(comment)) {
      this.showToast('Apenas o dono pode editar este comentário.', 'error');
      return;
    }

    this.commentError.set('');
    this.commentSuccess.set('');
    this.replyingToCommentId.set(null);
    this.editingVideoCommentId.set(comment.id);
  }

  cancelEditVideoComment(): void {
    this.editingVideoCommentId.set(null);
  }

  async saveEditedVideoComment(commentId: string, value: string): Promise<void> {
    const contentId = this.video()?.id;
    const comment = value.trim();

    this.commentError.set('');
    this.commentSuccess.set('');

    if (!contentId || !comment || this.isSavingVideoComment()) {
      this.commentError.set('Escreva um comentário antes de guardar.');
      return;
    }

    this.isSavingVideoComment.set(true);

    try {
      await this.commentService.update(commentId, comment);
      await this.loadVideoComments(contentId);
      this.commentSuccess.set('Comentário atualizado com sucesso.');
      this.editingVideoCommentId.set(null);
    } catch {
      this.commentError.set('Não foi possível atualizar o comentário.');
    } finally {
      this.isSavingVideoComment.set(false);
    }
  }

  async deleteVideoComment(comment: VideoCommentView): Promise<void> {
    const contentId = this.video()?.id;

    if (!contentId || !this.canManageVideoComment(comment)) {
      this.showToast('Apenas o dono pode apagar este comentário.', 'error');
      return;
    }

    const confirmed = await this.confirmService.confirm('Apagar este comentário?');
    if (!confirmed) {
      return;
    }

    try {
      await this.commentService.delete(comment.id);
      await this.loadVideoComments(contentId);
      this.commentSuccess.set('Comentário apagado com sucesso.');
    } catch {
      this.commentError.set('Não foi possível apagar o comentário.');
    }
  }

  canManageReply(reply: VideoCommentReplyView): boolean {
    const userId = this.auth.user()?.id;

    return Boolean(reply.ownerId && userId && String(reply.ownerId) === String(userId));
  }

  openEditReply(comment: VideoCommentView, reply: VideoCommentReplyView): void {
    if (!this.canManageReply(reply)) {
      this.showToast('Apenas o dono pode editar esta resposta.', 'error');
      return;
    }

    this.replyingToCommentId.set(null);
    this.editingReplyId.set(reply.id);
  }

  cancelEditReply(): void {
    this.editingReplyId.set(null);
  }

  async saveEditedReply(commentId: string, replyId: string, value: string): Promise<void> {
    const contentId = this.video()?.id;
    const reply = value.trim();

    this.commentError.set('');
    this.commentSuccess.set('');

    if (!contentId || !reply || this.isSavingEditedReply()) {
      this.commentError.set('Escreva uma resposta antes de guardar.');
      return;
    }

    this.isSavingEditedReply.set(true);

    try {
      await this.commentService.updateReply(replyId, reply);
      await this.loadVideoComments(contentId);
      this.commentSuccess.set('Resposta atualizada com sucesso.');
      this.editingReplyId.set(null);
    } catch {
      this.commentError.set('Não foi possível atualizar a resposta.');
    } finally {
      this.isSavingEditedReply.set(false);
    }
  }

  async deleteReply(comment: VideoCommentView, reply: VideoCommentReplyView): Promise<void> {
    const contentId = this.video()?.id;

    if (!contentId || !this.canManageReply(reply)) {
      this.showToast('Apenas o dono pode apagar esta resposta.', 'error');
      return;
    }

    const confirmed = await this.confirmService.confirm('Apagar esta resposta?');
    if (!confirmed) {
      return;
    }

    try {
      await this.commentService.deleteReply(reply.id);
      await this.loadVideoComments(contentId);
      this.commentSuccess.set('Resposta apagada com sucesso.');
    } catch {
      this.commentError.set('Não foi possível apagar a resposta.');
    }
  }

  async submitReply(commentId: string, value: string): Promise<void> {
    const contentId = this.video()?.id;
    const reply = value.trim();

    this.commentError.set('');
    this.commentSuccess.set('');

    if (!contentId || !reply || this.isSavingVideoReply()) {
      this.commentError.set('Escreva uma resposta antes de publicar.');
      return;
    }

    this.isSavingVideoReply.set(true);

    try {
      await this.commentService.reply(commentId, reply);
      await this.loadVideoComments(contentId);
      this.commentSuccess.set('Resposta publicada com sucesso.');
      this.replyingToCommentId.set(null);
    } catch {
      this.commentError.set('Não foi possível publicar a resposta.');
    } finally {
      this.isSavingVideoReply.set(false);
    }
  }

  openReportModal(event: Event, comment: VideoCommentView): void {
    if (!this.auth.isAuthenticated()) {
      this.requireLogin(event, 'denunciar comentário');
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    if (this.canManageVideoComment(comment)) {
      this.showToast('Não podes denunciar o teu próprio comentário.', 'error');
      return;
    }

    this.reportTarget.set({
      id: comment.id,
      author: comment.author,
      text: comment.text,
    });
    this.reportReason.set('offensive_comment');
    this.reportDescription.set('');
    this.reportError.set('');
    this.commentSuccess.set('');
  }

  openReportReply(event: Event, reply: VideoCommentReplyView): void {
    if (!this.auth.isAuthenticated()) {
      event.preventDefault();
      event.stopPropagation();
      this.requireLogin(event, 'denunciar comentário');
      return;
    }

    if (!this.canManageReply(reply)) {
      this.reportTarget.set({
        id: reply.id,
        author: reply.author,
        text: reply.text,
      });
      this.reportReason.set('offensive_comment');
      this.reportDescription.set('');
      this.reportError.set('');
      this.commentSuccess.set('');
      return;
    }

    this.showToast('Não podes denunciar a tua própria resposta.', 'error');
  }

  closeReportModal(): void {
    this.reportTarget.set(null);
    this.reportError.set('');
  }

  updateReportReason(event: Event): void {
    this.reportReason.set((event.target as HTMLSelectElement).value as CommentReportReason);
  }

  updateReportDescription(event: Event): void {
    this.reportDescription.set((event.target as HTMLTextAreaElement).value);
  }

  async submitCommentReport(): Promise<void> {
    const target = this.reportTarget();

    if (!target || this.isSubmittingReport()) {
      return;
    }

    this.isSubmittingReport.set(true);
    this.reportError.set('');

    try {
      await this.commentReportService.create(target.id, this.reportReason(), this.reportDescription());
      this.showToast('Comentário denunciado. A equipa vai rever.', 'success');
      this.reportTarget.set(null);
    } catch (error) {
      this.reportError.set(error instanceof Error ? this.translateReportError(error.message) : 'Não foi possível enviar a denúncia.');
    } finally {
      this.isSubmittingReport.set(false);
    }
  }

  async share(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const video = this.video();

    if (!video) {
      return;
    }

    const url = window.location.href.split('#')[0];
    const text = `${video.title} - Economia com História`;

    const result = await this.shareService.share({ title: video.title, text, url }, 'native');

    if (result !== 'cancelled') {
      this.videoShareCount.update((count) => count + 1);
    }

    if (result === 'copied') {
      this.showToast('Link copiado.', 'success');
    }
  }

  async saveVideoContent(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    if (!this.auth.isAuthenticated()) {
      this.auth.requireLoginFor('guardar');
      return;
    }

    const contentId = this.route.snapshot.params['id'];

    if (!contentId) {
      return;
    }

    try {
      await this.savedContentService.save(contentId);
      this.showToast('Conteúdo guardado.', 'success');
    } catch {
      this.showToast('Não foi possível guardar este conteúdo.', 'error');
    }
  }

  editVideoRoute(): string[] {
    const video = this.video();

    return video ? ['/app/contents', video.id, 'edit'] : ['/app/contents'];
  }

  async deleteVideoContent(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const video = this.video();

    if (!video || !this.canManageVideo()) {
      this.showToast('Apenas o dono pode apagar este conteúdo.', 'error');
      return;
    }

    const confirmed = await this.confirmService.confirm(`Apagar "${video.title}"?`);
    if (!confirmed) {
      return;
    }

    try {
      await this.contentService.delete(video.id);
      await this.router.navigate(['/app/contents']);
    } catch {
      this.showToast('Não foi possível apagar este conteúdo.', 'error');
    }
  }

  private showToast(message: string, kind: PageToast['kind'] = 'info'): void {
    this.toastService[kind](message);
  }

  private clearToastTimeout(): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = undefined;
    }
  }

  private async loadVideoComments(contentId: string): Promise<void> {
    this.isLoadingComments.set(true);

    try {
      const comments = await this.commentService.getByContent(contentId);
      this.comments.set(comments.map((comment) => this.toVideoComment(comment)));
    } finally {
      this.isLoadingComments.set(false);
    }
  }

  private toVideoComment(comment: BackendComment): VideoCommentView {
    const authorName = comment.user?.name ?? 'Utilizador';

    return {
      id: String(comment.id),
      ownerId: this.commentOwnerId(comment),
      author: authorName,
      authorInitials: this.initials(authorName),
      authorPhotoUrl: normalizeMediaUrl(comment.user?.photo),
      text: comment.comment,
      createdAt: comment.created_at,
      replies: (comment.replies ?? []).map((reply) => {
        const replyAuthor = reply.user?.name ?? 'Utilizador';

        return {
          id: String(reply.id),
          ownerId: reply.user?.id ? String(reply.user.id) : undefined,
          author: replyAuthor,
          authorInitials: this.initials(replyAuthor),
          authorPhotoUrl: normalizeMediaUrl(reply.user?.photo),
          text: reply.reply,
          createdAt: reply.created_at,
        };
      }),
    };
  }

  private commentOwnerId(comment: BackendComment): string | undefined {
    const ownerId = comment.user_id ?? comment.user?.id;

    return ownerId === undefined || ownerId === null ? undefined : String(ownerId);
  }

  private translateReportError(message: string): string {
    const translations: Record<string, string> = {
      'You cannot report your own comment': 'Não podes denunciar o teu próprio comentário.',
      'You have already reported this comment': 'Já denunciaste este comentário.',
      'Comment not found': 'Comentário não encontrado.',
    };

    return translations[message] ?? message;
  }

  formatDate(value: string | null | undefined): string {
    const date = value ? new Date(value) : null;

    if (!date || Number.isNaN(date.getTime())) {
      return 'Agora';
    }

    return new Intl.DateTimeFormat('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  }

  private toVideoDetail(content: BackendContent): VideoDetail {
    const authorName = content.author?.name ?? content.user?.name ?? 'Equipa editorial';
    const createdAt = content.created_at ? new Date(content.created_at) : null;
    const authorId = contentAuthorId(content);

    return {
      id: String(content.id),
      ownerId: this.videoOwnerId(content),
      categoryId: content.category?.id,
      contentTypeId: content.content_type?.id,
      title: content.title,
      date: createdAt && !Number.isNaN(createdAt.getTime())
        ? createdAt.toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' })
        : 'Data indisponível',
      duration: this.extractDuration(content.content) ?? '00:00',
      frameUrl: normalizeMediaUrl(content.image_url, { contentId: content.id, mediaType: 'image' }),
      videoUrl: normalizeMediaUrl(content.video_url, { contentId: content.id, mediaType: 'video' }),
      author: authorName,
      authorInitials: this.initials(authorName),
      authorPhotoUrl: contentAuthorPhotoUrl(content) ?? this.authenticatedAuthorPhotoUrl(authorId),
      authorRole: 'Autor',
      summary: content.summary || this.toPlainText(content.content) || 'Sem resumo disponível.',
      quote: this.toPlainText(content.content) || content.summary || '',
    };
  }

  private async loadRelatedContents(content: BackendContent): Promise<void> {
    const contentId = String(content.id);
    const categoryId = content.category?.id;
    const contentTypeId = content.content_type?.id;
    const related = new Map<string, ContentListItem>();

    this.isLoadingRelated.set(true);

    try {
      if (categoryId) {
        const response = await this.contentService.getAll({ categoryId });

        response.data
          .filter((item) => String(item.id) !== contentId)
          .forEach((item) => related.set(String(item.id), this.toRelatedContent(item)));
      }

      if (related.size < 6 && contentTypeId) {
        const response = await this.contentService.getAll({ contentTypeId });

        response.data
          .filter((item) => String(item.id) !== contentId)
          .forEach((item) => related.set(String(item.id), this.toRelatedContent(item)));
      }

      this.relatedContents.set([...related.values()].slice(0, 3));
    } catch {
      this.relatedContents.set([]);
    } finally {
      this.isLoadingRelated.set(false);
    }
  }

  relatedContentRoute(content: ContentListItem): string[] {
    const type = this.normalizeText(content.contentType);

    if (type === 'video') {
      return ['/app/contents/videos', content.id];
    }

    return ['/app/contents', content.id];
  }

  private toRelatedContent(content: BackendContent): ContentListItem {
    const contentType = content.content_type?.name ?? 'Texto';
    const authorName = content.author?.name ?? content.user?.name ?? 'Equipa editorial';
    const authorId = contentAuthorId(content);

    return {
      id: String(content.id),
      ownerId: this.videoOwnerId(content),
      category: content.category?.name ?? 'Sem categoria',
      contentType,
      meta: this.formatMeta(content.updated_at ?? content.created_at, contentType),
      title: content.title,
      excerpt: content.summary || this.toPlainText(content.content).slice(0, 180),
      authorId,
      author: authorName,
      authorInitials: this.initials(authorName),
      authorPhotoUrl: contentAuthorPhotoUrl(content) ?? this.authenticatedAuthorPhotoUrl(authorId),
      imageUrl: normalizeMediaUrl(content.image_url, { contentId: content.id, mediaType: 'image' }),
      premium: this.normalizeText(content.content_type?.slug ?? contentType) === 'jindungo',
      canReadPremium: this.normalizeText(content.content_type?.slug ?? contentType) !== 'jindungo' || this.canReadJindungoContent(content),
      reactionsCount: Number(content.reactions_count ?? 0),
      commentsCount: Number(content.comments_count ?? 0),
      sharesCount: contentSharesCount(content),
      likedByMe: Boolean(content.liked_by_me),
      searchText: content.content || '',
    };
  }

  private formatMeta(createdAt: string | null | undefined, contentType: string): string {
    const date = createdAt ? new Date(createdAt) : null;
    const formattedDate =
      date && !Number.isNaN(date.getTime())
        ? new Intl.DateTimeFormat('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
        : 'Sem data';

    return formattedDate;
  }

  private formatCommentDate(value: string | null | undefined): string {
    const date = value ? new Date(value) : null;

    if (!date || Number.isNaN(date.getTime())) {
      return 'Agora';
    }

    return new Intl.DateTimeFormat('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  }

  private extractDuration(content: string | null | undefined): string | null {
    const value = content?.match(/<strong>Duracao:<\/strong>\s*([^<]+)/i)?.[1]?.trim();

    return value || null;
  }

  private toPlainText(value: string | null | undefined): string {
    return (value ?? '').replace(/<[^>]*>/g, '').trim();
  }

  private authenticatedAuthorPhotoUrl(authorId: string | undefined): string | undefined {
    const user = this.auth.user();

    return authorId && user?.id === authorId ? user.avatarUrl : undefined;
  }

  private initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'EH';
  }

  private normalizeText(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  private canReadJindungoContent(content: BackendContent): boolean {
    return this.auth.canReadJindungo()
      || Boolean(content.can_access)
      || content.subscription_status === 'approved';
  }

  private videoOwnerId(content: BackendContent): string | undefined {
    const ownerId = content.user_id ?? content.author_id ?? content.user?.id ?? content.author?.id;

    return ownerId === undefined || ownerId === null ? undefined : String(ownerId);
  }

  isDirectVideoUrl(url: string | undefined): boolean {
    if (!url) {
      return false;
    }

    return /(\.(mp4|mov|webm)(\?|$))|\/storage\//i.test(url);
  }
}

export const CONTENT_LIBRARY_ROUTES: Routes = [
  { path: '', component: ContentLibraryPage },
  { path: 'create', canActivate: [adminGuard], component: ContentDetailPage },
  { path: 'videos/:id', component: VideoContentDetailPage },
  { path: ':id/edit', component: ContentDetailPage },
  { path: ':id', component: ContentDetailPage },
];

