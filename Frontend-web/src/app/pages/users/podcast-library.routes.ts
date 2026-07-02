import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Routes } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';
import { ConfirmService } from '../../services/confirm.service';
import { CommentReportReason, CommentReportService } from '../../services/comment-report.service';
import { BackendComment, CommentService } from '../../services/comment.service';
import { BackendContent, ContentService } from '../../services/content.service';
import { ReactionService } from '../../services/reaction.service';
import { SavedContentService } from '../../services/saved-content.service';
import { ToastService } from '../../services/toast.service';
import { normalizeMediaUrl } from '../../services/media-url.util';
import { BackToTopComponent } from '../shared/back-to-top/back-to-top.component';
import { ContentForumActionComponent } from '../shared/content-forum-action/content-forum-action.component';
import { PublicNavbarComponent } from '../shared/public-navbar/public-navbar.component';

interface PodcastView {
  id: string;
  ownerId?: string;
  categoryId?: number | string;
  contentTypeId?: number | string;
  title: string;
  description: string;
  coverUrl: string | null;
  audioUrl: string | null;
  authorName: string;
  authorInitials: string;
  category: string;
  duration: string;
  keyPoints: string[];
}

interface PodcastCommentView {
  id: string;
  ownerId?: string;
  author: string;
  authorInitials: string;
  authorPhotoUrl?: string;
  text: string;
  createdAt?: string | null;
  replies: PodcastCommentReplyView[];
}

interface PodcastCommentReplyView {
  id: string;
  ownerId?: string;
  author: string;
  authorInitials: string;
  authorPhotoUrl?: string;
  text: string;
  createdAt?: string | null;
}

interface RelatedPodcastView {
  id: string;
  title: string;
  category: string;
  coverUrl: string | null;
}

interface CommentReportTarget {
  id: string;
  author: string;
  text: string;
}

@Component({
  selector: 'app-podcast-library-page',
  imports: [RouterLink, PublicNavbarComponent, BackToTopComponent, ContentForumActionComponent],
  templateUrl: './podcast-library.page.html'
})
export class PodcastLibraryPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthStateService);
  private readonly commentService = inject(CommentService);
  private readonly commentReportService = inject(CommentReportService);
  private readonly contentService = inject(ContentService);
  private readonly reactionService = inject(ReactionService);
  private readonly savedContentService = inject(SavedContentService);
  private readonly toastService = inject(ToastService);
  readonly confirmService = inject(ConfirmService);

  readonly isCommentComposerOpen = signal(false);
  readonly replyingToCommentId = signal<string | null>(null);
  readonly editingCommentId = signal<string | null>(null);
  readonly expandedReplies = signal<Record<string, boolean>>({});
  readonly podcast = signal<PodcastView | null>(null);
  readonly comments = signal<PodcastCommentView[]>([]);
  readonly relatedPodcasts = signal<RelatedPodcastView[]>([]);
  readonly isLoading = signal(false);
  readonly isLoadingComments = signal(false);
  readonly isSavingComment = signal(false);
  readonly isSavingEditedComment = signal(false);
  readonly isSavingReply = signal(false);
  readonly editingReplyId = signal<string | null>(null);
  readonly isSavingReaction = signal(false);
  readonly isSavingContent = signal(false);
  readonly podcastLiked = signal(false);
  readonly isLoadingRelated = signal(false);
  readonly loadError = signal('');
  readonly commentError = signal('');
  readonly commentSuccess = signal('');
  readonly reportTarget = signal<CommentReportTarget | null>(null);
  readonly reportReason = signal<CommentReportReason>('offensive_comment');
  readonly reportDescription = signal('');
  readonly reportError = signal('');
  readonly isSubmittingReport = signal(false);
  readonly audioPlaying = signal(false);
  readonly audioReady = signal(false);
  readonly audioEnded = signal(false);
  readonly audioLoop = signal(false);
  readonly audioLoadError = signal(false);
  readonly audioProgressText = signal('00:00 / 00:00');
  readonly audioCurrentTimeText = signal('0:00');
  readonly audioRemainingTimeText = signal('-0:00');
  readonly audioProgressPercent = signal(0);
  readonly audioStatusText = computed(() => {
    if (!this.currentPodcast().audioUrl) {
      return 'Áudio indisponível';
    }

    if (this.audioLoadError()) {
      return 'Não foi possível carregar o áudio';
    }

    if (!this.audioReady()) {
      return 'A preparar áudio';
    }

    if (this.audioPlaying()) {
      return 'A reproduzir';
    }

    if (this.audioEnded()) {
      return 'Reprodução terminada';
    }

    return 'Em pausa';
  });
  readonly canManagePodcast = computed(() => {
    const ownerId = this.currentPodcast().ownerId;
    const userId = this.auth.user()?.id;

    return Boolean(ownerId && userId && String(ownerId) === String(userId));
  });

  readonly currentPodcast = computed<PodcastView>(() => this.podcast() ?? {
    id: '',
    ownerId: undefined,
    title: 'Podcast',
    description: '',
    coverUrl: null,
    audioUrl: null,
    authorName: 'Autor',
    authorInitials: 'AU',
    category: 'Podcast',
    duration: 'Podcast',
    keyPoints: [],
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (id) {
        void this.loadPodcast(id);
      }
    });
  }

  openCommentComposer(): void {
    if (!this.auth.isAuthenticated()) {
      this.auth.requireLoginFor('comentar');
      return;
    }

    this.isCommentComposerOpen.set(true);
  }

  async likePodcast(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    if (!this.auth.isAuthenticated()) {
      this.auth.requireLoginFor('gostar');
      return;
    }

    const contentId = this.podcast()?.id;

    if (!contentId || this.isSavingReaction()) {
      return;
    }

    const previous = this.podcastLiked();
    this.podcastLiked.set(!previous);
    this.isSavingReaction.set(true);

    try {
      const response = await this.reactionService.toggle(contentId, 'like');
      this.podcastLiked.set(response.data.reacted);
    } catch {
      this.podcastLiked.set(previous);
      this.toastService.error('Não foi possível registar o gosto.');
    } finally {
      this.isSavingReaction.set(false);
    }
  }

  async savePodcast(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    if (!this.auth.isAuthenticated()) {
      this.auth.requireLoginFor('guardar');
      return;
    }

    const contentId = this.podcast()?.id;

    if (!contentId || this.isSavingContent()) {
      return;
    }

    this.isSavingContent.set(true);

    try {
      await this.savedContentService.save(contentId);
      this.toastService.success('Podcast guardado.');
    } catch {
      this.toastService.error('Não foi possível guardar este podcast.');
    } finally {
      this.isSavingContent.set(false);
    }
  }

  async sharePodcast(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const podcast = this.podcast();

    if (!podcast) {
      return;
    }

    const url = window.location.href.split('#')[0];
    const text = `${podcast.title} - Economia com História`;

    if (navigator.share) {
      await navigator.share({ title: podcast.title, text, url }).catch(() => undefined);
      return;
    }

    await navigator.clipboard?.writeText(url);
    this.toastService.success('Link copiado.');
  }

  toggleReplyComposer(commentId: string): void {
    if (!this.auth.isAuthenticated()) {
      this.auth.requireLoginFor('responder');
      return;
    }

    this.commentError.set('');
    this.commentSuccess.set('');
    this.replyingToCommentId.set(this.replyingToCommentId() === commentId ? null : commentId);
  }

  toggleReplies(commentId: string): void {
    this.expandedReplies.update((state) => ({
      ...state,
      [commentId]: !state[commentId],
    }));
  }

  areRepliesOpen(commentId: string): boolean {
    return this.expandedReplies()[commentId] ?? false;
  }

  canManageComment(comment: PodcastCommentView): boolean {
    const userId = this.auth.user()?.id;

    return Boolean(comment.ownerId && userId && String(comment.ownerId) === String(userId));
  }

  canReportComment(comment: PodcastCommentView): boolean {
    return !this.canManageComment(comment);
  }

  openEditComment(comment: PodcastCommentView): void {
    if (!this.canManageComment(comment)) {
      this.toastService.error('Apenas o dono pode editar este comentário.');
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
    const contentId = this.podcast()?.id;
    const comment = value.trim();

    this.commentError.set('');
    this.commentSuccess.set('');

    if (!contentId || !comment || this.isSavingEditedComment()) {
      this.commentError.set('Escreva um comentário antes de guardar.');
      return;
    }

    this.isSavingEditedComment.set(true);

    try {
      await this.commentService.update(commentId, comment);
      await this.loadComments(contentId);
      this.commentSuccess.set('Comentário atualizado com sucesso.');
      this.editingCommentId.set(null);
    } catch {
      this.commentError.set('Não foi possível atualizar o comentário.');
    } finally {
      this.isSavingEditedComment.set(false);
    }
  }

  async deleteComment(comment: PodcastCommentView): Promise<void> {
    const contentId = this.podcast()?.id;

    if (!contentId || !this.canManageComment(comment)) {
      this.toastService.error('Apenas o dono pode apagar este comentário.');
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

  openReportModal(event: Event, comment: PodcastCommentView): void {
    if (!this.auth.isAuthenticated()) {
      event.preventDefault();
      event.stopPropagation();
      this.auth.requireLoginFor('denunciar comentário');
      return;
    }

    if (!this.canReportComment(comment)) {
      this.toastService.error('Não podes denunciar o teu próprio comentário.');
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.reportTarget.set({
      id: comment.id,
      author: comment.author,
      text: comment.text,
    });
    this.reportReason.set('offensive_comment');
    this.reportDescription.set('');
    this.reportError.set('');
  }

  openEditReply(comment: PodcastCommentView, reply: PodcastCommentReplyView): void {
    const userId = this.auth.user()?.id;

    if (!reply || !reply.ownerId || !userId || String(reply.ownerId) !== String(userId)) {
      this.toastService.error('Apenas o dono pode editar esta resposta.');
      return;
    }

    this.replyingToCommentId.set(null);
    this.editingReplyId.set(reply.id);
  }

  canManageReply(reply: PodcastCommentReplyView): boolean {
    const userId = this.auth.user()?.id;

    return Boolean(reply.ownerId && userId && String(reply.ownerId) === String(userId));
  }

  openReportReply(event: Event, reply: PodcastCommentReplyView): void {
    if (!this.auth.isAuthenticated()) {
      event.preventDefault();
      event.stopPropagation();
      this.auth.requireLoginFor('denunciar comentário');
      return;
    }

    if (!this.canManageReply(reply)) {
      event.preventDefault();
      event.stopPropagation();
      this.reportTarget.set({ id: reply.id, author: reply.author, text: reply.text });
      this.reportReason.set('offensive_comment');
      this.reportDescription.set('');
      this.reportError.set('');
      return;
    }

    this.toastService.error('Não podes denunciar a tua própria resposta.');
  }

  cancelEditReply(): void {
    this.editingReplyId.set(null);
  }

  async saveEditedReply(commentId: string, replyId: string, value: string): Promise<void> {
    const contentId = this.podcast()?.id;
    const reply = value.trim();

    this.commentError.set('');
    this.commentSuccess.set('');

    if (!contentId || !reply || this.isSavingEditedComment()) {
      this.commentError.set('Escreva uma resposta antes de guardar.');
      return;
    }

    this.isSavingEditedComment.set(true);

    try {
      await this.commentService.updateReply(replyId, reply);
      await this.loadComments(contentId);
      this.commentSuccess.set('Resposta atualizada com sucesso.');
      this.editingReplyId.set(null);
    } catch {
      this.commentError.set('Não foi possível atualizar a resposta.');
    } finally {
      this.isSavingEditedComment.set(false);
    }
  }

  async deleteReply(comment: PodcastCommentView, reply: PodcastCommentReplyView): Promise<void> {
    const contentId = this.podcast()?.id;

    if (!contentId || !reply || !reply.ownerId) {
      this.toastService.error('Não foi possível apagar esta resposta.');
      return;
    }

    const userId = this.auth.user()?.id;

    if (!userId || String(reply.ownerId) !== String(userId)) {
      this.toastService.error('Apenas o dono pode apagar esta resposta.');
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
      this.toastService.success('Comentário denunciado. A equipa vai rever.');
      this.reportTarget.set(null);
    } catch (error) {
      this.reportError.set(error instanceof Error ? this.translateReportError(error.message) : 'Não foi possível enviar a denúncia.');
    } finally {
      this.isSubmittingReport.set(false);
    }
  }

  async toggleAudio(audio: HTMLAudioElement): Promise<void> {
    const audioUrl = this.currentPodcast().audioUrl;

    if (!audioUrl) {
      return;
    }

    if (audio.paused) {
      try {
        this.prepareAudioElement(audio, audioUrl);
        await audio.play();
      } catch {
        this.audioPlaying.set(false);
        this.audioLoadError.set(true);
      }
      return;
    }

    audio.pause();
  }

  toggleAudioLoop(audio: HTMLAudioElement): void {
    const nextValue = !this.audioLoop();

    this.audioLoop.set(nextValue);
    audio.loop = nextValue;
  }

  skipAudio(audio: HTMLAudioElement, seconds: number): void {
    const audioUrl = this.currentPodcast().audioUrl;

    if (!audioUrl) {
      return;
    }

    const duration = Number.isFinite(audio.duration) ? audio.duration : Number.POSITIVE_INFINITY;
    const nextTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));

    audio.currentTime = nextTime;
    this.audioEnded.set(false);
    this.syncAudioProgress(audio);
  }

  markAudioPlaying(): void {
    this.audioPlaying.set(true);
    this.audioEnded.set(false);
  }

  markAudioStopped(): void {
    this.audioPlaying.set(false);
  }

  markAudioReady(audio: HTMLAudioElement): void {
    this.audioReady.set(true);
    this.audioLoadError.set(false);
    audio.loop = this.audioLoop();
    this.syncAudioProgress(audio);
  }

  markAudioEnded(audio: HTMLAudioElement): void {
    this.audioPlaying.set(false);
    this.audioEnded.set(true);
    this.syncAudioProgress(audio);
  }

  syncAudioProgress(audio: HTMLAudioElement): void {
    const current = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;

    this.audioProgressText.set(`${this.formatAudioTime(current)} / ${this.formatAudioTime(duration)}`);
    this.audioCurrentTimeText.set(this.formatAudioTime(current));
    this.audioRemainingTimeText.set(`-${this.formatAudioTime(Math.max(duration - current, 0))}`);
    this.audioProgressPercent.set(duration > 0 ? Math.min(100, Math.max(0, (current / duration) * 100)) : 0);
  }

  markAudioError(): void {
    if (!this.currentPodcast().audioUrl || this.audioLoadError()) {
      return;
    }

    this.audioPlaying.set(false);
    this.audioReady.set(false);
    this.audioLoadError.set(true);
  }

  editPodcastRoute(): string[] {
    const podcast = this.podcast();

    return podcast ? ['/app/contents', podcast.id, 'edit'] : ['/app/contents'];
  }

  async deletePodcastContent(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const podcast = this.podcast();

    if (!podcast || !this.canManagePodcast()) {
      this.toastService.error('Apenas o dono pode apagar este conteúdo.');
      return;
    }

    const confirmed = await this.confirmService.confirm(`Apagar "${podcast.title}"?`);
    if (!confirmed) {
      return;
    }

    try {
      await this.contentService.delete(podcast.id);
      await this.router.navigate(['/app/contents']);
    } catch {
      this.toastService.error('Não foi possível apagar este conteúdo.');
    }
  }

  private formatAudioTime(totalSeconds: number): string {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private resetAudioState(): void {
    this.audioPlaying.set(false);
    this.audioReady.set(false);
    this.audioEnded.set(false);
    this.audioLoop.set(false);
    this.audioLoadError.set(false);
    this.audioProgressText.set('00:00 / 00:00');
    this.audioCurrentTimeText.set('0:00');
    this.audioRemainingTimeText.set('-0:00');
    this.audioProgressPercent.set(0);
  }

  private prepareAudioElement(audio: HTMLAudioElement, audioUrl: string): void {
    if (audio.currentSrc !== audioUrl && audio.getAttribute('src') !== audioUrl) {
      audio.src = audioUrl;
      audio.load();
    }

    this.audioLoadError.set(false);
  }

  async submitComment(value: string): Promise<void> {
    const contentId = this.podcast()?.id;
    const comment = value.trim();

    this.commentError.set('');
    this.commentSuccess.set('');

    if (!contentId || !comment || this.isSavingComment()) {
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
    const contentId = this.podcast()?.id;
    const reply = value.trim();

    this.commentError.set('');
    this.commentSuccess.set('');

    if (!contentId || !reply || this.isSavingReply()) {
      this.commentError.set('Escreva uma resposta antes de publicar.');
      return;
    }

    this.isSavingReply.set(true);

    try {
      await this.commentService.reply(commentId, reply);
      await this.loadComments(contentId);
      this.commentSuccess.set('Resposta publicada com sucesso.');
      this.replyingToCommentId.set(null);
      this.expandedReplies.update((state) => ({ ...state, [commentId]: true }));
    } catch {
      this.commentError.set('Não foi possível publicar a resposta.');
    } finally {
      this.isSavingReply.set(false);
    }
  }

  private async loadPodcast(id: string): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set('');
    this.podcast.set(null);
    this.comments.set([]);
    this.relatedPodcasts.set([]);
    this.resetAudioState();

    try {
      const content = await this.contentService.getById(id);

      this.podcast.set(this.toPodcastView(content));
      this.podcastLiked.set(Boolean(content.liked_by_me));
      await Promise.all([
        this.loadComments(String(content.id)),
        this.loadRelatedPodcasts(content),
      ]);
    } catch {
      this.toastService.error('Não foi possível carregar este podcast.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private toPodcastView(content: BackendContent): PodcastView {
    const authorName = content.author?.name ?? content.user?.name ?? 'Autor';

    return {
      id: String(content.id),
      ownerId: this.contentOwnerId(content),
      categoryId: content.category?.id,
      contentTypeId: content.content_type?.id,
      title: content.title,
      description: content.summary || this.stripHtml(content.content ?? '') || 'Sem descrição disponível.',
      coverUrl: normalizeMediaUrl(content.image_url, { contentId: content.id, mediaType: 'image' }) ?? null,
      audioUrl: normalizeMediaUrl(content.audio_url, { contentId: content.id, mediaType: 'audio' }) ?? null,
      authorName,
      authorInitials: this.initials(authorName),
      category: content.category?.name ?? 'Podcast',
      duration: this.extractDuration(content.content ?? ''),
      keyPoints: this.extractKeyPoints(content.content ?? content.summary ?? ''),
    };
  }

  private contentOwnerId(content: BackendContent): string | undefined {
    const ownerId = content.user_id ?? content.author_id ?? content.user?.id ?? content.author?.id;

    return ownerId === undefined || ownerId === null ? undefined : String(ownerId);
  }

  private async loadComments(contentId: string): Promise<void> {
    this.isLoadingComments.set(true);

    try {
      const comments = await this.commentService.getByContent(contentId);
      this.comments.set(comments.map((comment) => this.toCommentView(comment)));
    } catch {
      this.comments.set([]);
      this.commentError.set('Não foi possível carregar os comentários.');
    } finally {
      this.isLoadingComments.set(false);
    }
  }

  private async loadRelatedPodcasts(content: BackendContent): Promise<void> {
    const contentId = String(content.id);
    const related = new Map<string, RelatedPodcastView>();

    this.isLoadingRelated.set(true);

    try {
      if (content.content_type?.id) {
        const response = await this.contentService.getAll({ contentTypeId: content.content_type.id });

        response.data
          .filter((item) => String(item.id) !== contentId)
          .forEach((item) => related.set(String(item.id), this.toRelatedPodcast(item)));
      }

      if (related.size < 3 && content.category?.id) {
        const response = await this.contentService.getAll({ categoryId: content.category.id });

        response.data
          .filter((item) => String(item.id) !== contentId)
          .forEach((item) => related.set(String(item.id), this.toRelatedPodcast(item)));
      }

      this.relatedPodcasts.set([...related.values()].slice(0, 3));
    } catch {
      this.relatedPodcasts.set([]);
    } finally {
      this.isLoadingRelated.set(false);
    }
  }

  private toCommentView(comment: BackendComment): PodcastCommentView {
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

  private toRelatedPodcast(content: BackendContent): RelatedPodcastView {
    return {
      id: String(content.id),
      title: content.title,
      category: content.category?.name ?? content.content_type?.name ?? 'Podcast',
      coverUrl: normalizeMediaUrl(content.image_url, { contentId: content.id, mediaType: 'image' }) ?? null,
    };
  }

  formatDate(value: string | null | undefined): string {
    const date = value ? new Date(value) : null;

    if (!date || Number.isNaN(date.getTime())) {
      return 'Agora';
    }

    return new Intl.DateTimeFormat('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  }

  private stripHtml(value: string): string {
    return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private extractDuration(value: string): string {
    const text = this.stripHtml(value);
    const match = text.match(/Duracao:\s*([^\.]+)/i);

    return match?.[1]?.trim() || 'Podcast';
  }

  private extractKeyPoints(value: string): string[] {
    return this.stripHtml(value)
      .replace(/Duracao:\s*[^\.]+\.?/i, '')
      .split(/[.!?]\s+/)
      .map((point) => point.trim())
      .filter((point) => point.length > 24)
      .slice(0, 4);
  }

  private translateReportError(message: string): string {
    const translations: Record<string, string> = {
      'You cannot report your own comment': 'Não podes denunciar o teu próprio comentário.',
      'You have already reported this comment': 'Já denunciaste este comentário.',
      'Comment not found': 'Comentário não encontrado.',
    };

    return translations[message] ?? message;
  }

  private initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'AU';
  }
}

export const PODCAST_LIBRARY_ROUTES: Routes = [
  { path: '', component: PodcastLibraryPage },
  { path: ':id', component: PodcastLibraryPage },
];

