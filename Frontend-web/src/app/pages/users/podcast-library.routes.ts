import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Routes } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';
import { BackendComment, CommentService } from '../../services/comment.service';
import { BackendContent, ContentService } from '../../services/content.service';
<<<<<<< HEAD
import { ToastService } from '../../services/toast.service';
=======
import { normalizeMediaUrl } from '../../services/media-url.util';
>>>>>>> c19bb649b34b5b916dffc58911f1153a834e80e4
import { BackToTopComponent } from '../shared/back-to-top/back-to-top.component';
import { PublicNavbarComponent } from '../shared/public-navbar/public-navbar.component';

interface PodcastView {
  id: string;
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
  author: string;
  authorInitials: string;
  authorPhotoUrl?: string;
  text: string;
  createdAt?: string | null;
  replies: PodcastCommentReplyView[];
}

interface PodcastCommentReplyView {
  id: string;
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

@Component({
  selector: 'app-podcast-library-page',
  imports: [RouterLink, PublicNavbarComponent, BackToTopComponent],
  templateUrl: './podcast-library.page.html'
})
export class PodcastLibraryPage {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthStateService);
  private readonly commentService = inject(CommentService);
  private readonly contentService = inject(ContentService);
  private readonly toastService = inject(ToastService);

  readonly isCommentComposerOpen = signal(false);
  readonly replyingToCommentId = signal<string | null>(null);
  readonly expandedReplies = signal<Record<string, boolean>>({});
  readonly podcast = signal<PodcastView | null>(null);
  readonly comments = signal<PodcastCommentView[]>([]);
  readonly relatedPodcasts = signal<RelatedPodcastView[]>([]);
  readonly isLoading = signal(false);
  readonly isLoadingComments = signal(false);
  readonly isSavingComment = signal(false);
  readonly isSavingReply = signal(false);
  readonly isLoadingRelated = signal(false);
  readonly loadError = signal('');
  readonly commentError = signal('');
  readonly commentSuccess = signal('');

  readonly currentPodcast = computed<PodcastView>(() => this.podcast() ?? {
    id: '',
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

    try {
      const content = await this.contentService.getById(id);

      this.podcast.set(this.toPodcastView(content));
      await Promise.all([
        this.loadComments(String(content.id)),
        this.loadRelatedPodcasts(content),
      ]);
    } catch {
      this.toastService.error('Nao foi possivel carregar este podcast.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private toPodcastView(content: BackendContent): PodcastView {
    const authorName = content.author?.name ?? content.user?.name ?? 'Autor';

    return {
      id: String(content.id),
      categoryId: content.category?.id,
      contentTypeId: content.content_type?.id,
      title: content.title,
      description: content.summary || this.stripHtml(content.content ?? '') || 'Sem descricao disponivel.',
      coverUrl: normalizeMediaUrl(content.image_url) ?? null,
      audioUrl: normalizeMediaUrl(content.audio_url) ?? null,
      authorName,
      authorInitials: this.initials(authorName),
      category: content.category?.name ?? 'Podcast',
      duration: this.extractDuration(content.content ?? ''),
      keyPoints: this.extractKeyPoints(content.content ?? content.summary ?? ''),
    };
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
      author: authorName,
      authorInitials: this.initials(authorName),
      authorPhotoUrl: normalizeMediaUrl(comment.user?.photo),
      text: comment.comment,
      createdAt: comment.created_at,
      replies: (comment.replies ?? []).map((reply) => {
        const replyAuthor = reply.user?.name ?? 'Utilizador';

        return {
          id: String(reply.id),
          author: replyAuthor,
          authorInitials: this.initials(replyAuthor),
          authorPhotoUrl: normalizeMediaUrl(reply.user?.photo),
          text: reply.reply,
          createdAt: reply.created_at,
        };
      }),
    };
  }

  private toRelatedPodcast(content: BackendContent): RelatedPodcastView {
    return {
      id: String(content.id),
      title: content.title,
      category: content.category?.name ?? content.content_type?.name ?? 'Podcast',
      coverUrl: normalizeMediaUrl(content.image_url) ?? null,
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
