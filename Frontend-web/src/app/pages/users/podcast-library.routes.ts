import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Routes } from '@angular/router';
import { BackendContent, ContentService } from '../../services/content.service';
import { BackToTopComponent } from '../shared/back-to-top/back-to-top.component';
import { PublicNavbarComponent } from '../shared/public-navbar/public-navbar.component';

interface PodcastView {
  id: string;
  title: string;
  description: string;
  coverUrl: string | null;
  audioUrl: string | null;
  authorName: string;
  authorInitials: string;
  category: string;
  duration: string;
}

@Component({
  selector: 'app-podcast-library-page',
  imports: [RouterLink, PublicNavbarComponent, BackToTopComponent],
  templateUrl: './podcast-library.page.html'
})
export class PodcastLibraryPage {
  private readonly route = inject(ActivatedRoute);
  private readonly contentService = inject(ContentService);

  readonly isCommentComposerOpen = signal(false);
  readonly expandedReplies = signal<Record<string, boolean>>({});
  readonly podcast = signal<PodcastView | null>(null);
  readonly isLoading = signal(false);
  readonly loadError = signal('');

  readonly currentPodcast = computed<PodcastView>(() => this.podcast() ?? {
    id: 'mock',
    title: 'Ep. 24: A Heranca do Imperio Lunda',
    description: 'Uma analise profunda sobre a organizacao economica e politica de um dos maiores imperios da historia angolana, e como o seu legado molda o comercio regional ate aos dias de hoje.',
    coverUrl: null,
    audioUrl: null,
    authorName: 'Dr. Manuel Cassule',
    authorInitials: 'MC',
    category: 'Podcast',
    duration: '28 min',
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
    this.isCommentComposerOpen.set(true);
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

  private async loadPodcast(id: string): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set('');

    try {
      this.podcast.set(this.toPodcastView(await this.contentService.getById(id)));
    } catch {
      this.loadError.set('Nao foi possivel carregar este podcast.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private toPodcastView(content: BackendContent): PodcastView {
    const authorName = content.author?.name ?? content.user?.name ?? 'Autor';

    return {
      id: String(content.id),
      title: content.title,
      description: content.summary || this.stripHtml(content.content ?? '') || 'Sem descricao disponivel.',
      coverUrl: content.image_url ?? null,
      audioUrl: content.audio_url ?? null,
      authorName,
      authorInitials: this.initials(authorName),
      category: content.category?.name ?? 'Podcast',
      duration: this.extractDuration(content.content ?? ''),
    };
  }

  private stripHtml(value: string): string {
    return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private extractDuration(value: string): string {
    const text = this.stripHtml(value);
    const match = text.match(/Duracao:\s*([^\.]+)/i);

    return match?.[1]?.trim() || 'Podcast';
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
