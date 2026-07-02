import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, Routes } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';
import { authGuard } from '../../services/auth.guard';
import { ContentService } from '../../services/content.service';
import { BackendForum, BackendForumTopic, ForumService } from '../../services/forum.service';
import { ToastService } from '../../services/toast.service';
import { BackToTopComponent } from '../shared/back-to-top/back-to-top.component';
import { PublicNavbarComponent } from '../shared/public-navbar/public-navbar.component';

interface PageToast {
  message: string;
  kind: 'success' | 'error' | 'info';
}

interface ForumContentOption {
  id: string;
  title: string;
  type: string;
  meta: string;
}

@Component({
  selector: 'app-user-forums-page',
  standalone: true,
  imports: [RouterLink, PublicNavbarComponent, BackToTopComponent],
  templateUrl: './user-forums.page.html',
})
export class UserForumsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly auth = inject(AuthStateService);
  readonly contentService = inject(ContentService);
  readonly forumService = inject(ForumService);
  private readonly toastService = inject(ToastService);

  readonly categories = ['Economia', 'Hist\u00f3ria', 'Jindungo', 'Podcast'];
  readonly selectedCategory = signal(this.categories[0]);
  readonly privacy = signal<'public' | 'private'>('public');
  readonly privateAccessCode = signal('');
  readonly inviteEmails = signal<string[]>([]);
  readonly selectedContentIds = signal<string[]>([]);
  readonly contentOptions = signal<ForumContentOption[]>([]);
  readonly showAllResources = signal(false);
  readonly createModalOpen = signal(false);
  readonly resourceError = signal(false);
  readonly toast = signal<PageToast | null>(null);
  readonly forumPage = signal(1);
  readonly forumPageSize = 8;
  private toastTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    void this.loadContentOptions();
    void this.loadForums();
  }

  readonly selectedResources = computed(() =>
    this.contentOptions().filter((content) => this.selectedContentIds().includes(content.id)),
  );

  readonly visibleResources = computed(() =>
    this.showAllResources() ? this.contentOptions() : this.selectedResources(),
  );

  readonly forumTotalPages = computed(() => Math.max(1, Math.ceil(this.forumService.rooms().length / this.forumPageSize)));
  readonly pagedRooms = computed(() => {
    const start = (this.forumPage() - 1) * this.forumPageSize;

    return this.forumService.rooms().slice(start, start + this.forumPageSize);
  });
  readonly hasPreviousForumPage = computed(() => this.forumPage() > 1);
  readonly hasNextForumPage = computed(() => this.forumPage() < this.forumTotalPages());

  ngOnInit(): void {
    const contentId = this.route.snapshot.queryParamMap.get('content');

    if (!contentId) {
      return;
    }

    this.selectedContentIds.set([contentId]);
    this.showAllResources.set(false);

    if (this.auth.isAuthenticated()) {
      this.createModalOpen.set(true);
      return;
    }

    this.auth.requireLoginFor('criar discuss\u00e3o');
  }

  openCreateModal(): void {
    if (!this.auth.isAuthenticated()) {
      this.auth.requireLoginFor('criar discuss\u00e3o');
      return;
    }

    this.resourceError.set(false);
    this.createModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.createModalOpen.set(false);
    this.returnToSourceContentIfNeeded();
  }

  setPrivacy(privacy: 'public' | 'private'): void {
    this.privacy.set(privacy);

    if (privacy === 'private' && !this.privateAccessCode()) {
      this.privateAccessCode.set(this.generateAccessCode());
    }
  }

  toggleResource(contentId: string): void {
    this.selectedContentIds.update((ids) =>
      ids.includes(contentId) ? ids.filter((id) => id !== contentId) : [...ids, contentId],
    );
    this.resourceError.set(false);
  }

  addInvite(emailInput: HTMLInputElement): void {
    const email = emailInput.value.trim();

    if (!email) {
      return;
    }

    this.inviteEmails.update((emails) => (emails.includes(email) ? emails : [...emails, email]));
    emailInput.value = '';
  }

  removeInvite(email: string): void {
    this.inviteEmails.update((emails) => emails.filter((item) => item !== email));
  }

  async createDebateRoom(titleInput: HTMLInputElement, objectiveInput: HTMLTextAreaElement): Promise<void> {
    if (!this.auth.isAuthenticated()) {
      this.auth.requireLoginFor('criar discuss\u00e3o');
      return;
    }

    const title = titleInput.value.trim();
    const objective = objectiveInput.value.trim();
    const linkedContents = this.selectedResources().map((content) => this.toLinkedContent(content));

    this.resourceError.set(false);

    if (!title || !objective) {
      this.showToast('Preencha o título e o objetivo da discussão.', 'error');
      return;
    }

    try {
      await this.forumService.create({
        name: title,
        description: objective,
        rules: objective,
        category: this.selectedCategory(),
        visibility: this.privacy(),
        access_code: this.privacy() === 'private' ? this.privateAccessCode() : null,
        join_approval_required: this.privacy() === 'private',
        content_permission: 'public',
        allow_attachments: false,
        content_ids: linkedContents.map((content) => content.id),
      });

      titleInput.value = '';
      objectiveInput.value = '';
      this.inviteEmails.set([]);
      this.selectedContentIds.set([]);
      this.privacy.set('public');
      this.privateAccessCode.set('');
      this.showAllResources.set(false);
      this.createModalOpen.set(false);
      this.returnToSourceContentIfNeeded();
      this.showToast('Sala de debate enviada para aprovação.', 'success');
    } catch {
      this.showToast('Não foi possível criar a sala de debate.', 'error');
    }
  }

  private async loadForums(): Promise<void> {
    try {
      const forums = await this.forumService.getAll();

      if (forums.length > 0) {
        this.forumService.rooms.set(forums.map((forum) => this.toForumRoom(forum)));
        this.forumPage.set(1);
      }
    } catch {
      this.showToast('Não foi possível carregar os fóruns.', 'error');
    }
  }

  private async loadContentOptions(): Promise<void> {
    try {
      const response = await this.contentService.getAll();
      this.contentOptions.set(response.data.map((content) => ({
        id: String(content.id),
        title: content.title,
        type: content.content_type?.name ?? 'Conteúdo',
        meta: content.category?.name ?? content.content_type?.name ?? 'Biblioteca',
      })));
    } catch {
      this.contentOptions.set([]);
    }
  }

  goToPreviousForumPage(): void {
    this.forumPage.update((page) => Math.max(1, page - 1));
  }

  goToNextForumPage(): void {
    this.forumPage.update((page) => Math.min(this.forumTotalPages(), page + 1));
  }

  private showToast(message: string, kind: PageToast['kind'] = 'info'): void {
    this.toastService[kind](message);
  }

  private returnToSourceContentIfNeeded(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    if (!returnUrl) {
      return;
    }

    void this.router.navigateByUrl(returnUrl, { replaceUrl: true });
  }

  private toForumRoom(forum: BackendForum) {
    return {
      id: String(forum.id),
      ownerId: forum.user_id === undefined || forum.user_id === null ? (forum.user?.id === undefined || forum.user?.id === null ? undefined : String(forum.user.id)) : String(forum.user_id),
      name: forum.name,
      visibility: forum.visibility === 'private' ? 'private' as const : 'public' as const,
      accessCode: forum.access_code ?? null,
      joinApprovalRequired: Boolean(forum.join_approval_required),
      members: 0,
      activeDebates: forum.topics_count ?? 0,
      description: forum.description ?? forum.rules ?? 'Sem descrição.',
      category: forum.category ?? 'Fórum',
      objective: forum.description ?? forum.rules ?? '',
      inviteEmails: [],
      protectedByPassword: forum.visibility === 'private',
      linkedContents: (forum.contents ?? []).map((content) => ({
        id: String(content.id),
        title: content.title,
        type: content.content_type?.name ?? 'Conteúdo',
        meta: content.category?.name ?? '',
      })),
    };
  }

  roomInitials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'EH';
  }

  private toLinkedContent(content: ForumContentOption) {
    return {
      id: content.id,
      title: content.title,
      type: content.type,
      meta: content.meta,
    };
  }

  private generateAccessCode(): string {
    return `EH-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }
}

@Component({
  selector: 'app-user-forum-detail-page',
  standalone: true,
  imports: [RouterLink, PublicNavbarComponent, BackToTopComponent],
  templateUrl: './user-forum-detail.page.html',
})
export class UserForumDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly auth = inject(AuthStateService);
  readonly forumService = inject(ForumService);
  readonly likedByMe = signal(false);
  readonly commentComposerOpen = signal(false);
  readonly editingForum = signal(false);
  readonly isSavingForum = signal(false);
  readonly forumFeedback = signal('');
  readonly forumComments = signal<Array<{ id: string; author: string; initials: string; title: string; text: string; createdAt: string }>>([]);
  readonly isLoadingForumComments = signal(false);
  readonly isSavingForumComment = signal(false);
  readonly accessRequestCode = signal('');
  readonly accessRequestStatus = signal('');

  readonly room = computed(() => {
    const roomId = this.route.snapshot.paramMap.get('id');

    return this.forumService.rooms().find((room) => room.id === roomId) ?? null;
  });

  readonly accessNotice = computed(() => {
    const room = this.room();

    if (!room || room.visibility !== 'private' || this.auth.canAccessForum(room.id, room.visibility)) {
      return '';
    }

    return 'Este fórum é privado. Para entrar, use o código do fórum e aguarde aprovação.';
  });

  readonly canManageForum = computed(() => {
    const ownerId = this.room()?.ownerId;
    const userId = this.auth.user()?.id;

    return this.auth.canManagePlatform() || Boolean(ownerId && userId && String(ownerId) === String(userId));
  });

  constructor() {
    const roomId = this.route.snapshot.paramMap.get('id');

    if (roomId && this.isBackendForumId(roomId)) {
      void this.loadForumTopics(roomId);
    }
  }

  roomInitials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'EH';
  }

  requireLogin(event: Event, operation: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.auth.requireLoginFor(operation);
  }

  likeForum(event: Event): void {
    if (!this.auth.isAuthenticated()) {
      this.requireLogin(event, 'gostar do f\u00f3rum');
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.likedByMe.update((liked) => !liked);
    this.forumFeedback.set('');
  }

  openCommentComposer(event: Event): void {
    if (!this.auth.isAuthenticated()) {
      this.requireLogin(event, 'comentar no f\u00f3rum');
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.commentComposerOpen.set(true);
    this.forumFeedback.set('');
  }

  async shareForum(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const room = this.room();
    const url = window.location.href.split('#')[0];
    const title = `${room?.name ?? 'F\u00f3rum'} - Economia com Hist\u00f3ria`;

    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => undefined);
      return;
    }

    await navigator.clipboard?.writeText(url);
    this.forumFeedback.set('Link do f\u00f3rum copiado.');
  }

  saveForum(event: Event): void {
    if (!this.auth.isAuthenticated()) {
      this.requireLogin(event, 'guardar f\u00f3rum');
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.forumFeedback.set('F\u00f3rum guardado.');
  }

  requestPrivateAccess(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.auth.isAuthenticated()) {
      this.auth.requireLoginFor('pedir acesso ao fórum');
      return;
    }

    const room = this.room();
    const code = this.accessRequestCode().trim().toUpperCase();

    if (!room || room.visibility !== 'private') {
      return;
    }

    if (!code) {
      this.accessRequestStatus.set('Informe o código de entrada.');
      return;
    }

    if (room.accessCode && code !== room.accessCode.toUpperCase()) {
      this.accessRequestStatus.set('Código inválido para este fórum.');
      return;
    }

    this.accessRequestStatus.set('Pedido enviado. A entrada fica pendente de aprovação.');
  }

  async submitForumComment(value: string): Promise<void> {
    const room = this.room();
    const text = value.trim();

    if (!this.auth.isAuthenticated()) {
      return;
    }

    if (!room || !text) {
      this.forumFeedback.set('Escreva uma resposta antes de publicar.');
      return;
    }

    if (this.isSavingForumComment()) {
      return;
    }

    const user = this.auth.user();
    const author = user?.name ?? 'Utilizador';
    const title = text.length > 70 ? `${text.slice(0, 67)}...` : text;

    if (this.isBackendForumId(room.id)) {
      this.isSavingForumComment.set(true);

      try {
        await this.forumService.createTopic(room.id, title, text);
        await this.loadForumTopics(room.id);
        this.commentComposerOpen.set(false);
        this.forumFeedback.set('');
      } catch {
        this.forumFeedback.set('Não foi possível publicar a resposta.');
      } finally {
        this.isSavingForumComment.set(false);
      }

      return;
    }

    this.forumComments.update((comments) => [
      {
        id: `${room.id}-${Date.now()}`,
        author,
        initials: this.roomInitials(author),
        title,
        text,
        createdAt: 'Agora',
      },
      ...comments,
    ]);
    this.commentComposerOpen.set(false);
    this.forumFeedback.set('');
  }

  private async loadForumTopics(roomId: string): Promise<void> {
    this.isLoadingForumComments.set(true);

    try {
      const topics = await this.forumService.getTopics(roomId);
      this.forumComments.set(topics.map((topic) => this.toForumComment(topic)));
    } catch {
      this.forumComments.set([]);
    } finally {
      this.isLoadingForumComments.set(false);
    }
  }

  private toForumComment(topic: BackendForumTopic) {
    const author = topic.user?.name ?? 'Utilizador';

    return {
      id: String(topic.id),
      author,
      initials: this.roomInitials(author),
      title: topic.title,
      text: topic.content,
      createdAt: this.formatForumDate(topic.created_at),
    };
  }

  private isBackendForumId(value: string): boolean {
    return /^\d+$/.test(value);
  }

  private formatForumDate(value: string | null | undefined): string {
    const date = value ? new Date(value) : null;

    if (!date || Number.isNaN(date.getTime())) {
      return 'Agora';
    }

    return new Intl.DateTimeFormat('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  }

  reportForum(event: Event): void {
    if (!this.auth.isAuthenticated()) {
      this.requireLogin(event, 'denunciar f\u00f3rum');
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.forumFeedback.set('Den\u00fancia enviada. A equipa vai rever.');
  }

  openEditForum(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.canManageForum()) {
      this.forumFeedback.set('Apenas o dono ou a moderação podem editar este fórum.');
      return;
    }

    this.editingForum.set(true);
    this.forumFeedback.set('');
  }

  closeEditForum(): void {
    this.editingForum.set(false);
  }

  async saveEditedForum(
    nameInput: HTMLInputElement,
    descriptionInput: HTMLTextAreaElement,
    categoryInput: HTMLInputElement,
    visibilityInput: HTMLSelectElement,
  ): Promise<void> {
    const room = this.room();
    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!room || !this.canManageForum()) {
      this.forumFeedback.set('Não tens permissão para editar este fórum.');
      return;
    }

    if (!name || !description) {
      this.forumFeedback.set('Preencha o título e a descrição do fórum.');
      return;
    }

    this.isSavingForum.set(true);

    try {
      await this.forumService.update(room.id, {
        name,
        description,
        rules: description,
        category: categoryInput.value.trim() || room.category || 'Fórum',
      visibility: visibilityInput.value === 'private' ? 'private' : 'public',
        access_code: visibilityInput.value === 'private' ? (room.accessCode ?? `EH-${Date.now().toString(36).toUpperCase()}`) : null,
        join_approval_required: visibilityInput.value === 'private',
        content_permission: 'public',
      });

      this.forumService.rooms.update((rooms) =>
        rooms.map((item) =>
          item.id === room.id
            ? {
                ...item,
                name,
                description,
                objective: description,
                category: categoryInput.value.trim() || item.category,
                visibility: visibilityInput.value === 'private' ? 'private' : 'public',
                accessCode: visibilityInput.value === 'private' ? (item.accessCode ?? `EH-${Date.now().toString(36).toUpperCase()}`) : null,
                joinApprovalRequired: visibilityInput.value === 'private',
              }
            : item,
        ),
      );
      this.editingForum.set(false);
      this.forumFeedback.set('Fórum atualizado.');
    } catch {
      this.forumFeedback.set('Não foi possível atualizar este fórum.');
    } finally {
      this.isSavingForum.set(false);
    }
  }

  async deleteForum(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const room = this.room();

    if (!room || !this.canManageForum()) {
      this.forumFeedback.set('Não tens permissão para apagar este fórum.');
      return;
    }

    if (!window.confirm(`Apagar "${room.name}"?`)) {
      return;
    }

    try {
      await this.forumService.delete(room.id);
      this.forumService.rooms.update((rooms) => rooms.filter((item) => item.id !== room.id));
      await this.router.navigate(['/app/forums']);
    } catch {
      this.forumFeedback.set('Não foi possível apagar este fórum.');
    }
  }

}

export const USER_FORUMS_ROUTES: Routes = [
  { path: '', component: UserForumsPage },
  { path: ':id', canActivate: [authGuard], data: { loginOperation: 'ver detalhes do fórum' }, component: UserForumDetailPage },
];

