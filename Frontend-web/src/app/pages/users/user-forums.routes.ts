import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, Routes } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';
import { ConfirmService } from '../../services/confirm.service';
import { authGuard } from '../../services/auth.guard';
import { ContentService } from '../../services/content.service';
import { BackendForum, BackendForumReply, BackendForumTopic, ForumService } from '../../services/forum.service';
import { SavedContentService } from '../../services/saved-content.service';
import { ShareService } from '../../services/share.service';
import { ToastService } from '../../services/toast.service';
import { ForumRoom } from '../../models/forum.model';
import { BackToTopComponent } from '../shared/back-to-top/back-to-top.component';
import { PublicNavbarComponent } from '../shared/public-navbar/public-navbar.component';

type ForumReportReason = 'spam' | 'offensive_comment' | 'fake_information' | 'copyright' | 'other';

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

type PrivateForumAccessStatus = 'none' | 'pending' | 'invited' | 'member' | 'rejected' | 'invitation_rejected';

interface ForumTopicPreview {
  id: string;
  title: string;
  author: string;
  ownerId?: string;
  replies: number;
  lastActivity: string;
}

interface ForumReplyView {
  id: string;
  ownerId?: string;
  author: string;
  initials: string;
  text: string;
  createdAt: string;
}

interface ForumCommentView {
  id: string;
  ownerId?: string;
  author: string;
  initials: string;
  title: string;
  text: string;
  createdAt: string;
  repliesCount: number;
  replies: ForumReplyView[];
  replyComposerOpen: boolean;
  isLoadingReplies: boolean;
  isSavingReply: boolean;
  editing: boolean;
  editingReplyId: string | null;
}

interface ForumReportTarget {
  id: string;
  author: string;
  text: string;
}

interface PendingMember {
  id: string;
  name: string;
  initials: string;
  requestedAt: string;
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
  readonly confirmService = inject(ConfirmService);
  readonly contentService = inject(ContentService);
  readonly forumService = inject(ForumService);
  private readonly toastService = inject(ToastService);

  readonly categories = ['Economia', 'Hist\u00f3ria', 'Jindungo', 'Podcast'];
  readonly selectedCategory = signal(this.categories[0]);
  readonly privacy = signal<'public' | 'private'>('public');
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
      const forum = await this.forumService.create({
        name: title,
        description: objective,
        rules: objective,
        category: this.selectedCategory(),
        visibility: this.privacy(),
        access_code: null,
        join_approval_required: this.privacy() === 'private',
        content_permission: 'public',
        allow_attachments: false,
        content_ids: linkedContents
          .map((content) => Number(content.id))
          .filter((id) => !Number.isNaN(id)),
        invite_emails: this.inviteEmails().filter(Boolean),
      });

      this.forumService.rooms.update((rooms) => [this.toForumRoom(forum), ...rooms.filter((room) => room.id !== String(forum.id))]);
      titleInput.value = '';
      objectiveInput.value = '';
      this.inviteEmails.set([]);
      this.selectedContentIds.set([]);
      this.privacy.set('public');
      this.showAllResources.set(false);
      this.createModalOpen.set(false);
      this.returnToSourceContentIfNeeded();
      this.showToast('Fórum criado com sucesso.', 'success');
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : (error as { error?: { message?: string } }).error?.message ?? 'Não foi possível criar a sala de debate.';

      this.showToast(message, 'error');
    }
  }

  private async loadForums(): Promise<void> {
    try {
      const forums = await this.forumService.getAll();

      this.forumService.rooms.set(forums.map((forum) => this.toForumRoom(forum)));
      this.forumPage.set(1);
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
      creatorName: forum.user?.name,
      name: forum.name,
      visibility: forum.visibility === 'private' ? 'private' as const : 'public' as const,
      accessCode: forum.access_code ?? null,
      joinApprovalRequired: Boolean(forum.join_approval_required),
      members: Number(forum.members_count ?? 0),
      activeDebates: forum.topics_count ?? 0,
      description: forum.description ?? forum.rules ?? 'Sem descrição.',
      category: forum.category ?? 'Fórum',
      objective: forum.description ?? forum.rules ?? '',
      inviteEmails: forum.invite_emails ?? [],
      accessStatus: forum.access_status ?? (forum.visibility === 'private' ? 'none' : 'member'),
      canView: Boolean(forum.can_view ?? forum.visibility !== 'private'),
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
  readonly confirmService = inject(ConfirmService);
  readonly forumService = inject(ForumService);
  private readonly savedContentService = inject(SavedContentService);
  private readonly shareService = inject(ShareService);
  readonly likedByMe = signal(false);
  readonly commentComposerOpen = signal(false);
  readonly editingForum = signal(false);
  readonly isSavingForum = signal(false);
  readonly forumFeedback = signal('');
  readonly forumComments = signal<ForumCommentView[]>([]);
  readonly isLoadingForumComments = signal(false);
  readonly isSavingForumComment = signal(false);
  readonly accessRequestStatus = signal('');
  readonly privateAccessStatus = signal<PrivateForumAccessStatus>('none');
  readonly invitationNoticeOpen = signal(false);
  readonly forumTopicPreviews = signal<ForumTopicPreview[]>([]);
  readonly reportTarget = signal<ForumReportTarget | null>(null);
  readonly reportReason = signal<ForumReportReason>('offensive_comment');
  readonly reportDescription = signal('');
  readonly reportError = signal('');
  readonly isSubmittingReport = signal(false);
  private readonly forumLikeStoragePrefix = 'economia-com-historia.forum-like.v1';
  readonly pendingMembers = signal<PendingMember[]>([]);
  readonly isLoadingPendingMembers = signal(false);
  readonly room = computed(() => {
    const roomId = this.route.snapshot.paramMap.get('id');

    return this.forumService.rooms().find((room) => room.id === roomId) ?? null;

  });

  readonly privateTeaserActive = computed(() => {
    const room = this.room();

    return Boolean(room && room.visibility === 'private' && !this.canEnterPrivateForum());
  });

  readonly accessNotice = computed(() => {
    const room = this.room();

    if (!room || room.visibility !== 'private' || this.canEnterPrivateForum()) {
      return '';
    }

    return 'Este fórum é privado. Pode conhecer a proposta da comunidade antes de solicitar participação.';
  });

  readonly canManageForum = computed(() => {
    const room = this.room();
    const userId = this.auth.user()?.id;

    return this.auth.canManagePlatform() || Boolean(room?.ownerId && userId && room.ownerId === String(userId));
  });

  constructor() {
    const roomId = this.route.snapshot.paramMap.get('id');

    if (roomId) {
      void this.prepareForum(roomId);
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

  async loadPendingMembers(): Promise<void> {
    const room = this.room();

    if (!room || !this.canManageForum()) {
      this.pendingMembers.set([]);
      return;
    }

    this.isLoadingPendingMembers.set(true);

    try {
      // Frontend-only for now. When the API is available, replace this with:
      // const members = await this.forumService.getPendingMembers(room.id);
      // this.pendingMembers.set(members.map((member) => this.toPendingMember(member)));
      this.pendingMembers.set([]);
    } catch {
      this.pendingMembers.set([]);
      this.forumFeedback.set('Não foi possível carregar os pedidos de adesão.');
    } finally {
      this.isLoadingPendingMembers.set(false);
    }
  }

  async approveMember(id: string): Promise<void> {
    const room = this.room();

    if (!room || !this.canManageForum()) {
      this.forumFeedback.set('Não tens permissão para aceitar membros neste fórum.');
      return;
    }

    try {
      // Frontend-only for now. When the API is available, replace this with:
      // await this.forumService.approveMember(room.id, id);
      this.pendingMembers.update((members) => members.filter((member) => member.id !== id));
      this.forumFeedback.set('Membro aceite com sucesso.');
    } catch {
      this.forumFeedback.set('Não foi possível aceitar este membro.');
    }
  }

  async rejectMember(id: string): Promise<void> {
    const room = this.room();

    if (!room || !this.canManageForum()) {
      this.forumFeedback.set('Não tens permissão para recusar pedidos neste fórum.');
      return;
    }

    try {
      // Frontend-only for now. When the API is available, replace this with:
      // await this.forumService.rejectMember(room.id, id);
      this.pendingMembers.update((members) => members.filter((member) => member.id !== id));
      this.forumFeedback.set('Pedido recusado.');
    } catch {
      this.forumFeedback.set('Não foi possível recusar este pedido.');
    }
  }

  requireLogin(event: Event, operation: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.auth.requireLoginFor(operation);
  }

  canEnterPrivateForum(): boolean {
    const room = this.room();

    if (!room) {
      return false;
    }

    if (room.visibility === 'public') {
      return true;
    }

    return Boolean(room.canView) || this.privateAccessStatus() === 'member';
  }

  async requestParticipation(): Promise<void> {
    if (!this.auth.isAuthenticated()) {
      this.auth.requireLoginFor('solicitar participação no fórum');
      return;
    }

    const room = this.room();

    if (!room) {
      return;
    }

    try {
      const forum = await this.forumService.requestJoin(room.id);
      const updatedRoom = this.toForumRoom(forum);
      this.replaceForumRoom(updatedRoom);
      this.privateAccessStatus.set(this.resolvePrivateAccessStatus(updatedRoom));
      this.accessRequestStatus.set(
        updatedRoom.canView
          ? 'Acesso confirmado. Já pode entrar no fórum.'
          : 'Pedido enviado. Aguarde a permissão para entrar no fórum.',
      );

      if (updatedRoom.canView) {
        await this.loadForumTopics(updatedRoom.id);
      }
    } catch {
      this.accessRequestStatus.set('Não foi possível enviar o pedido de participação.');
    }
  }

  async acceptInvitation(): Promise<void> {
    if (!this.auth.isAuthenticated()) {
      this.auth.requireLoginFor('aceitar convite do fórum');
      return;
    }

    const room = this.room();

    if (!room) {
      return;
    }

    try {
      const forum = await this.forumService.acceptInvitation(room.id);
      const updatedRoom = this.toForumRoom(forum);
      this.replaceForumRoom(updatedRoom);
      this.privateAccessStatus.set(this.resolvePrivateAccessStatus(updatedRoom));
      this.invitationNoticeOpen.set(false);
      this.accessRequestStatus.set('');
      await this.loadForumTopics(updatedRoom.id);
    } catch {
      this.accessRequestStatus.set('Não foi possível aceitar este convite.');
    }
  }

  rejectInvitation(): void {
    this.privateAccessStatus.set('invitation_rejected');
    this.invitationNoticeOpen.set(false);
    this.accessRequestStatus.set('Convite recusado. Pode solicitar participação mais tarde se mudar de ideia.');
  }

  enterPrivateForum(): void {
    if (!this.canEnterPrivateForum()) {
      this.accessRequestStatus.set('Solicite participação ou aceite o convite para entrar neste fórum.');
      return;
    }

    this.accessRequestStatus.set('');
  }

  primaryAccessButtonLabel(): string {
    switch (this.privateAccessStatus()) {
      case 'pending':
        return 'Pedido enviado';
      case 'member':
        return 'Entrar no fórum';
      case 'rejected':
      case 'invitation_rejected':
        return 'Solicitar novamente';
      case 'invited':
        return 'Aceitar convite';
      default:
        return 'Solicitar participação';
    }
  }

  primaryAccessButtonDisabled(): boolean {
    return this.privateAccessStatus() === 'pending';
  }

  handlePrimaryPrivateAction(): void {
    switch (this.privateAccessStatus()) {
      case 'member':
        this.enterPrivateForum();
        return;
      case 'invited':
        void this.acceptInvitation();
        return;
      case 'pending':
        return;
      default:
        void this.requestParticipation();
    }
  }

  memberPreviewAvatars(roomName: string): string[] {
    const room = this.room();
    const initials = this.roomInitials(room?.creatorName || roomName);
    const topicInitials = this.forumComments()
      .map((comment) => comment.initials)
      .filter(Boolean);

    return Array.from(new Set([initials, ...topicInitials])).slice(0, 5);
  }

  remainingMemberCount(members: number): number {
    return Math.max(0, members - 5);
  }

  activeParticipantAvatars(room: ForumRoom): string[] {
    const creatorInitials = this.roomInitials(room.creatorName || room.name);
    const topicInitials = this.forumComments()
      .map((comment) => comment.initials)
      .filter(Boolean);

    return Array.from(new Set([creatorInitials, ...topicInitials])).slice(0, 4);
  }

  activeParticipantOverflow(room: ForumRoom): number {
    return Math.max(0, room.members - this.activeParticipantAvatars(room).length);
  }

  sharedResources(room: ForumRoom): { title: string; icon: string; route?: string[] }[] {
    const linked = room.linkedContents.slice(0, 3).map((content) => ({
      title: content.title,
      icon: this.resourceIcon(content.type),
      route: ['/app/contents', content.id],
    }));

    return linked;
  }

  resourceIcon(type: string | undefined): string {
    const normalized = (type ?? '').toLowerCase();

    if (normalized.includes('video')) {
      return 'play_circle';
    }

    if (normalized.includes('podcast')) {
      return 'headphones';
    }

    if (normalized.includes('quiz')) {
      return 'quiz';
    }

    return 'description';
  }

  forumValueProposition(): string {
    const room = this.room();
    const category = room?.category || 'Economia e História de Angola';
    const activity = (room?.activeDebates ?? 0) > 10 ? 'alto movimento' : 'discussões focadas';

    return `Debates sobre ${category.toLowerCase()}, com ${activity}, análise histórica e troca de ideias entre membros interessados no propósito da plataforma.`;
  }

  likeForum(event: Event): void {
    if (!this.auth.isAuthenticated()) {
      this.requireLogin(event, 'gostar do f\u00f3rum');
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.likedByMe.update((liked) => {
      const next = !liked;
      this.writeForumLike(next);
      return next;
    });
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

    const result = await this.shareService.share({ title, url }, 'native');

    if (result === 'copied') {
      this.forumFeedback.set('Link do f\u00f3rum copiado.');
    }
  }

  openReportTopic(event: Event, topic: ForumCommentView): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.auth.isAuthenticated()) {
      this.auth.requireLoginFor('denunciar tópico');
      return;
    }

    if (this.canEditTopic(topic)) {
      this.forumFeedback.set('Não podes denunciar o teu próprio tópico.');
      return;
    }

    this.reportTarget.set({ id: topic.id, author: topic.author, text: topic.text });
    this.reportReason.set('offensive_comment');
    this.reportDescription.set('');
    this.reportError.set('');
  }

  openReportReply(event: Event, reply: ForumReplyView): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.auth.isAuthenticated()) {
      this.auth.requireLoginFor('denunciar resposta');
      return;
    }

    if (this.canEditReply(reply)) {
      this.forumFeedback.set('Não podes denunciar a tua própria resposta.');
      return;
    }

    this.reportTarget.set({ id: reply.id, author: reply.author, text: reply.text });
    this.reportReason.set('offensive_comment');
    this.reportDescription.set('');
    this.reportError.set('');
  }

  closeReportModal(): void {
    this.reportTarget.set(null);
    this.reportError.set('');
    this.reportDescription.set('');
  }

  updateReportReason(event: Event): void {
    this.reportReason.set((event.target as HTMLSelectElement).value as ForumReportReason);
  }

  updateReportDescription(event: Event): void {
    this.reportDescription.set((event.target as HTMLTextAreaElement).value);
  }

  async submitCommentReport(): Promise<void> {
    const target = this.reportTarget();

    if (!target) {
      return;
    }

    this.isSubmittingReport.set(true);

    try {
      await Promise.resolve();
      this.reportTarget.set(null);
      this.reportDescription.set('');
      this.forumFeedback.set('Denúncia enviada para moderação.');
    } catch {
      this.reportError.set('Não foi possível enviar a denúncia.');
    } finally {
      this.isSubmittingReport.set(false);
    }
  }

  async saveForum(event: Event): Promise<void> {
    if (!this.auth.isAuthenticated()) {
      this.requireLogin(event, 'guardar f\u00f3rum');
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const room = this.room();
    const linkedContents = room?.linkedContents ?? [];

    if (!linkedContents.length) {
      this.forumFeedback.set('Este f\u00f3rum n\u00e3o tem conte\u00fados ligados para guardar.');
      return;
    }

    try {
      await Promise.all(linkedContents.map((content) => this.savedContentService.save(content.id)));
      this.forumFeedback.set(linkedContents.length === 1 ? 'Conte\u00fado do f\u00f3rum guardado.' : 'Conte\u00fados do f\u00f3rum guardados.');
    } catch {
      this.forumFeedback.set('N\u00e3o foi poss\u00edvel guardar os conte\u00fados deste f\u00f3rum.');
    }
  }

  requestPrivateAccess(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.auth.isAuthenticated()) {
      this.auth.requireLoginFor('pedir acesso ao fórum');
      return;
    }

    const room = this.room();
    if (!room || room.visibility !== 'private') {
      return;
    }

    void this.requestParticipation();
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
        ownerId: user?.id ? String(user.id) : undefined,
        author,
        initials: this.roomInitials(author),
        title,
        text,
        createdAt: 'Agora',
        repliesCount: 0,
        replies: [],
        replyComposerOpen: false,
        isLoadingReplies: false,
        isSavingReply: false,
        editing: false,
        editingReplyId: null,
      },
      ...comments,
    ]);
    this.commentComposerOpen.set(false);
    this.forumFeedback.set('');
  }

  private async prepareForum(roomId: string): Promise<void> {
    if (!this.room() && this.isBackendForumId(roomId)) {
      await this.loadSingleForumForDirectAccess(roomId);
    }

    if (!this.room()) {
      await this.loadForumListForDirectAccess();
    }

    const room = this.room();
    if (!room) {
      return;
    }

    this.privateAccessStatus.set(this.resolvePrivateAccessStatus(room));
    this.likedByMe.set(this.readForumLike(room.id));
    this.invitationNoticeOpen.set(room.visibility === 'private' && this.privateAccessStatus() === 'invited');
    await this.loadPendingMembers();

    if (this.isBackendForumId(roomId) && this.canEnterPrivateForum()) {
      await this.loadForumTopics(roomId);
    } else if (room.visibility === 'private') {
      this.forumComments.set([]);
      this.forumTopicPreviews.set([]);
    }
  }

  private async loadForumListForDirectAccess(): Promise<void> {
    try {
      const forums = await this.forumService.getAll();

      this.forumService.rooms.set(forums.map((forum) => this.toForumRoom(forum)));
    } catch {
      this.forumService.rooms.set(this.forumService.rooms());
    }
  }

  private async loadSingleForumForDirectAccess(roomId: string): Promise<void> {
    try {
      const forum = await this.forumService.getById(roomId);
      const room = this.toForumRoom(forum);

      this.forumService.rooms.update((rooms) => [room, ...rooms.filter((item) => item.id !== room.id)]);
    } catch {
      // Missing or inaccessible forum; keep the standard not-found state.
    }
  }

  private async loadForumTopics(roomId: string): Promise<void> {
    const room = this.room();

    if (room?.visibility === 'private' && !this.canEnterPrivateForum()) {
      this.forumComments.set([]);
      this.forumTopicPreviews.set([]);
      return;
    }

    this.isLoadingForumComments.set(true);

    try {
      const topics = await this.forumService.getTopics(roomId);

      this.forumComments.set(topics.map((topic) => this.toForumComment(topic, topic.replies ?? [])));
      this.forumTopicPreviews.set(topics.map((topic) => this.toForumTopicPreview(topic)));
      this.forumService.rooms.update((rooms) =>
        rooms.map((room) => room.id === roomId ? { ...room, activeDebates: topics.length } : room),
      );
    } catch {
      this.forumComments.set([]);
      this.forumTopicPreviews.set([]);
    } finally {
      this.isLoadingForumComments.set(false);
    }
  }

  private toForumComment(topic: BackendForumTopic, replies: BackendForumReply[] = []): ForumCommentView {
    const author = topic.user?.name ?? 'Utilizador';

    return {
      id: String(topic.id),
      ownerId: topic.user_id === undefined || topic.user_id === null ? (topic.user?.id === undefined || topic.user?.id === null ? undefined : String(topic.user.id)) : String(topic.user_id),
      author,
      initials: this.roomInitials(author),
      title: topic.title,
      text: topic.content,
      createdAt: this.formatForumDate(topic.created_at),
      repliesCount: Number(topic.replies_count ?? replies.length),
      replies: replies.map((reply) => this.toForumReply(reply)),
      replyComposerOpen: false,
      isLoadingReplies: false,
      isSavingReply: false,
      editing: false,
      editingReplyId: null,
    };
  }

  private toForumReply(reply: BackendForumReply): ForumReplyView {
    const author = reply.user?.name ?? 'Utilizador';

    return {
      id: String(reply.id),
      ownerId: reply.user_id === undefined || reply.user_id === null ? (reply.user?.id === undefined || reply.user?.id === null ? undefined : String(reply.user.id)) : String(reply.user_id),
      author,
      initials: this.roomInitials(author),
      text: reply.reply,
      createdAt: this.formatForumDate(reply.created_at),
    };
  }

  private toForumTopicPreview(topic: BackendForumTopic): ForumTopicPreview {
    return {
      id: String(topic.id),
      title: topic.title,
      author: topic.user?.name ?? 'Utilizador',
      ownerId: topic.user_id === undefined || topic.user_id === null ? (topic.user?.id === undefined || topic.user?.id === null ? undefined : String(topic.user.id)) : String(topic.user_id),
      replies: Number(topic.replies_count ?? 0),
      lastActivity: this.formatForumDate(topic.created_at),
    };
  }

  canEditTopic(comment: ForumCommentView): boolean {
    const userId = this.auth.user()?.id;

    return Boolean(comment.ownerId && userId && String(comment.ownerId) === String(userId));
  }

  canDeleteTopic(comment: ForumCommentView): boolean {
    const userId = this.auth.user()?.id;

    return this.auth.canManagePlatform() || Boolean(comment.ownerId && userId && String(comment.ownerId) === String(userId));
  }

  canEditReply(reply: ForumReplyView): boolean {
    const userId = this.auth.user()?.id;

    return Boolean(reply.ownerId && userId && String(reply.ownerId) === String(userId));
  }

  canDeleteReply(reply: ForumReplyView): boolean {
    const userId = this.auth.user()?.id;

    return this.auth.canManagePlatform() || Boolean(reply.ownerId && userId && String(reply.ownerId) === String(userId));
  }

  openTopicReplyComposer(topicId: string): void {
    if (!this.auth.isAuthenticated()) {
      this.auth.requireLoginFor('responder no fórum');
      return;
    }

    this.forumComments.update((comments) =>
      comments.map((comment) =>
        comment.id === topicId
          ? { ...comment, replyComposerOpen: !comment.replyComposerOpen, editingReplyId: null }
          : comment,
      ),
    );
  }

  async submitTopicReply(topicId: string, value: string): Promise<void> {
    const text = value.trim();

    if (!this.auth.isAuthenticated()) {
      this.auth.requireLoginFor('responder no fórum');
      return;
    }

    if (!text) {
      this.forumFeedback.set('Escreva uma resposta antes de publicar.');
      return;
    }

    this.forumComments.update((comments) =>
      comments.map((comment) => comment.id === topicId ? { ...comment, isSavingReply: true } : comment),
    );

    try {
      const reply = await this.forumService.createReply(topicId, text);
      const mappedReply = this.toForumReply(reply);

      this.forumComments.update((comments) =>
        comments.map((comment) =>
          comment.id === topicId
            ? {
              ...comment,
              replies: [...comment.replies, mappedReply],
              repliesCount: Math.max(comment.repliesCount + 1, comment.replies.length + 1),
              replyComposerOpen: false,
              isSavingReply: false,
            }
            : comment,
        ),
      );
      this.refreshTopicReplyCount(topicId, 1);
      this.forumFeedback.set('');
    } catch {
      this.forumComments.update((comments) =>
        comments.map((comment) => comment.id === topicId ? { ...comment, isSavingReply: false } : comment),
      );
      this.forumFeedback.set('Não foi possível publicar a resposta.');
    }
  }

  openEditTopic(topicId: string): void {
    this.forumComments.update((comments) =>
      comments.map((comment) => comment.id === topicId ? { ...comment, editing: true, replyComposerOpen: false } : comment),
    );
  }

  closeEditTopic(topicId: string): void {
    this.forumComments.update((comments) =>
      comments.map((comment) => comment.id === topicId ? { ...comment, editing: false } : comment),
    );
  }

  async saveEditedTopic(topicId: string, titleInput: HTMLInputElement, contentInput: HTMLTextAreaElement): Promise<void> {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title || !content) {
      this.forumFeedback.set('Preencha o título e o conteúdo do tópico.');
      return;
    }

    try {
      const updated = await this.forumService.updateTopic(topicId, title, content);
      const current = this.forumComments().find((comment) => comment.id === topicId);
      const mapped = {
        ...this.toForumComment(updated),
        replies: current?.replies ?? [],
      };

      this.forumComments.update((comments) => comments.map((comment) => comment.id === topicId ? mapped : comment));
      this.forumTopicPreviews.update((topics) =>
        topics.map((topic) => topic.id === topicId ? { ...topic, title: mapped.title, lastActivity: mapped.createdAt } : topic),
      );
      this.forumFeedback.set('Tópico atualizado.');
    } catch {
      this.forumFeedback.set('Não foi possível atualizar este tópico.');
    }
  }

  async deleteTopic(topicId: string): Promise<void> {
    const confirmed = await this.confirmService.confirm('Apagar este tópico e as respetivas respostas?');
    if (!confirmed) {
      return;
    }

    try {
      await this.forumService.deleteTopic(topicId);
      this.forumComments.update((comments) => comments.filter((comment) => comment.id !== topicId));
      this.forumTopicPreviews.update((topics) => topics.filter((topic) => topic.id !== topicId));
      this.forumService.rooms.update((rooms) =>
        rooms.map((room) =>
          room.id === this.route.snapshot.paramMap.get('id')
            ? { ...room, activeDebates: Math.max(0, room.activeDebates - 1) }
            : room,
        ),
      );
      this.forumFeedback.set('Tópico apagado.');
    } catch {
      this.forumFeedback.set('Não foi possível apagar este tópico.');
    }
  }

  openEditReply(topicId: string, replyId: string): void {
    this.forumComments.update((comments) =>
      comments.map((comment) => comment.id === topicId ? { ...comment, editingReplyId: replyId, replyComposerOpen: false } : comment),
    );
  }

  closeEditReply(topicId: string): void {
    this.forumComments.update((comments) =>
      comments.map((comment) => comment.id === topicId ? { ...comment, editingReplyId: null } : comment),
    );
  }

  async saveEditedReply(topicId: string, replyId: string, replyInput: HTMLTextAreaElement): Promise<void> {
    const text = replyInput.value.trim();

    if (!text) {
      this.forumFeedback.set('Escreva a resposta antes de guardar.');
      return;
    }

    try {
      const updated = await this.forumService.updateReply(replyId, text);
      const mapped = this.toForumReply(updated);

      this.forumComments.update((comments) =>
        comments.map((comment) =>
          comment.id === topicId
            ? {
              ...comment,
              replies: comment.replies.map((reply) => reply.id === replyId ? mapped : reply),
              editingReplyId: null,
            }
            : comment,
        ),
      );
      this.forumFeedback.set('Resposta atualizada.');
    } catch {
      this.forumFeedback.set('Não foi possível atualizar esta resposta.');
    }
  }

  async deleteReply(topicId: string, replyId: string): Promise<void> {
    const confirmed = await this.confirmService.confirm('Apagar esta resposta?');
    if (!confirmed) {
      return;
    }

    try {
      await this.forumService.deleteReply(replyId);
      this.forumComments.update((comments) =>
        comments.map((comment) =>
          comment.id === topicId
            ? { ...comment, replies: comment.replies.filter((reply) => reply.id !== replyId) }
            : comment,
        ),
      );
      this.refreshTopicReplyCount(topicId, -1);
      this.forumFeedback.set('Resposta apagada.');
    } catch {
      this.forumFeedback.set('Não foi possível apagar esta resposta.');
    }
  }

  private refreshTopicReplyCount(topicId: string, delta: number): void {
    this.forumTopicPreviews.update((topics) =>
      topics.map((topic) => topic.id === topicId ? { ...topic, replies: Math.max(0, topic.replies + delta) } : topic),
    );
    this.forumComments.update((comments) =>
      comments.map((comment) =>
        comment.id === topicId ? { ...comment, repliesCount: Math.max(0, comment.repliesCount + delta) } : comment,
      ),
    );
  }

  private toForumRoom(forum: BackendForum): ForumRoom {
    return {
      id: String(forum.id),
      ownerId: forum.user_id === undefined || forum.user_id === null ? (forum.user?.id === undefined || forum.user?.id === null ? undefined : String(forum.user.id)) : String(forum.user_id),
      creatorName: forum.user?.name,
      name: forum.name,
      visibility: forum.visibility === 'private' ? 'private' : 'public',
      accessCode: forum.access_code ?? null,
      joinApprovalRequired: Boolean(forum.join_approval_required),
      members: Number(forum.members_count ?? 0),
      activeDebates: forum.topics_count ?? forum.topics?.length ?? 0,
      description: forum.description ?? forum.rules ?? 'Sem descrição.',
      category: forum.category ?? 'Fórum',
      objective: forum.description ?? forum.rules ?? '',
      inviteEmails: forum.invite_emails ?? [],
      accessStatus: forum.access_status ?? (forum.visibility === 'private' ? 'none' : 'member'),
      canView: Boolean(forum.can_view ?? forum.visibility !== 'private'),
      protectedByPassword: forum.visibility === 'private',
      linkedContents: (forum.contents ?? []).map((content) => ({
        id: String(content.id),
        title: content.title,
        type: content.content_type?.name ?? 'Conteúdo',
        meta: content.category?.name ?? '',
      })),
    };
  }

  private resolvePrivateAccessStatus(room: ForumRoom): PrivateForumAccessStatus {
    if (room.visibility === 'public') {
      return 'member';
    }

    const backendStatus = room.accessStatus as PrivateForumAccessStatus | undefined;

    if (backendStatus) {
      return backendStatus;
    }

    const user = this.auth.user();
    const invitedById = Boolean(user?.invitedForumIds?.includes(room.id));
    const invitedByEmail = Boolean(user?.email && room.inviteEmails?.some((email) => email.toLowerCase() === user.email.toLowerCase()));

    return invitedById || invitedByEmail ? 'invited' : 'none';
  }

  private replaceForumRoom(room: ForumRoom): void {
    this.forumService.rooms.update((rooms) => [room, ...rooms.filter((item) => item.id !== room.id)]);
  }

  private writeForumLike(liked: boolean): void {
    const room = this.room();

    if (!room) {
      return;
    }

    try {
      window.localStorage.setItem(this.forumLikeStorageKey(room.id), liked ? '1' : '0');
    } catch {
      // Local preference only; failing to persist must not block the action.
    }
  }

  private readForumLike(roomId: string): boolean {
    try {
      return window.localStorage.getItem(this.forumLikeStorageKey(roomId)) === '1';
    } catch {
      return false;
    }
  }

  private forumLikeStorageKey(roomId: string): string {
    return `${this.forumLikeStoragePrefix}.${this.auth.user()?.id ?? 'guest'}.${roomId}`;
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

    const confirmed = await this.confirmService.confirm(`Apagar "${room.name}"?`);
    if (!confirmed) {
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
