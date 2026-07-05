import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink, Routes } from '@angular/router';
import { BackendContent, ContentService } from '../../services/content.service';
import { AuthStateService } from '../../services/auth-state.service';
import { normalizeMediaUrl } from '../../services/media-url.util';
import { BackToTopComponent } from '../shared/back-to-top/back-to-top.component';
import { PublicFooterComponent } from '../shared/public-footer/public-footer.component';
import { PublicNavbarComponent } from '../shared/public-navbar/public-navbar.component';

interface DailyContent {
  id: string;
  type: 'Artigo' | 'Video' | 'Podcast' | 'Quiz' | 'Jindungo' | 'Forum';
  title: string;
  summary: string;
  author: string;
  route: string;
  imageUrl: string;
  meta: string;
  premium?: boolean;
  progress?: number;
}

@Component({
  selector: 'app-user-home-page',
  imports: [RouterLink, PublicNavbarComponent, PublicFooterComponent, BackToTopComponent],
  templateUrl: './user-home.page.html'
})
export class UserHomePage implements OnInit, OnDestroy {
  readonly auth = inject(AuthStateService);
  private readonly contentService = inject(ContentService);
  readonly showWelcome = signal(false);
  readonly activeHighlightIndex = signal(0);
  readonly recommendedContent = signal<DailyContent[]>([]);
  readonly featuredJindungo = signal<DailyContent | null>(null);
  readonly isLoadingSuggestions = signal(false);
  readonly isLoadingJindungo = signal(false);
  readonly suggestionsError = signal('');
  readonly jindungoError = signal('');
  readonly quickQueue = computed(() => this.recommendedContent().slice(1, 5));
  private welcomeTimer?: ReturnType<typeof window.setTimeout>;
  private carouselTimer?: ReturnType<typeof window.setInterval>;

  readonly highlights: DailyContent[] = [
    {
      id: 'jindungo-reservas',
      type: 'Jindungo',
      title: 'Jindungo: Reservas internacionais e soberania monetaria',
      summary: 'Uma leitura premium sobre cambio, importacoes, memoria inflacionaria e as decisoes que moldam o Kwanza.',
      author: 'Jindungo Lab',
      route: '/app/contents/imposto-reservas',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80',
      meta: 'Premium',
      premium: true,
      progress: 74,
    },
    {
      id: 'video-cafe',
      type: 'Video',
      title: 'Do cafe ao petroleo: ciclos economicos que mudaram Angola',
      summary: 'Video-aula com mapas, imagens de arquivo e conceitos essenciais para entender a economia angolana.',
      author: 'Equipa EH',
      route: '/app/contents/videos/video-cafe',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80',
      meta: '18 min',
      progress: 42,
    },
    {
      id: 'podcast-lobito',
      type: 'Podcast',
      title: 'Corredor do Lobito e a nova geografia das exportações',
      summary: 'Conversa sobre portos, caminho-de-ferro, mineiros, agricultores e mercados regionais.',
      author: 'Podcast EH',
      route: '/app/podcasts',
      imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1400&q=80',
      meta: '42 min',
      progress: 58,
    },
  ];

  ngOnInit(): void {
    if (this.auth.consumeWelcomeForHome()) {
      this.showWelcome.set(true);
      this.welcomeTimer = window.setTimeout(() => this.showWelcome.set(false), 4200);
    }

    void this.loadSuggestions();
    void this.loadFeaturedJindungo();
    this.carouselTimer = window.setInterval(() => this.nextHighlight(), 3600);
  }

  ngOnDestroy(): void {
    if (this.welcomeTimer) {
      window.clearTimeout(this.welcomeTimer);
    }

    if (this.carouselTimer) {
      window.clearInterval(this.carouselTimer);
    }
  }

  userName(): string {
    return this.auth.user()?.name || 'Estudante Angola';
  }

  activeHighlight(): DailyContent {
    return this.highlights[this.activeHighlightIndex()] ?? this.highlights[0];
  }

  setHighlight(index: number): void {
    this.activeHighlightIndex.set(index);
  }

  private nextHighlight(): void {
    this.activeHighlightIndex.update((index) => (index + 1) % this.highlights.length);
  }

  private async loadSuggestions(): Promise<void> {
    this.isLoadingSuggestions.set(true);
    this.suggestionsError.set('');

    try {
      const suggestions = await this.contentService.getSuggestions(9);

      this.recommendedContent.set(suggestions.map((content) => this.toDailyContent(content)));
    } catch {
      this.recommendedContent.set([]);
      this.suggestionsError.set('Não foi possível carregar sugestões agora.');
    } finally {
      this.isLoadingSuggestions.set(false);
    }
  }

  private async loadFeaturedJindungo(): Promise<void> {
    this.isLoadingJindungo.set(true);
    this.jindungoError.set('');

    try {
      this.featuredJindungo.set(this.toDailyContent(await this.contentService.getFeaturedJindungo()));
    } catch {
      this.featuredJindungo.set(null);
      this.jindungoError.set('Nenhum texto Jindungo disponível agora.');
    } finally {
      this.isLoadingJindungo.set(false);
    }
  }

  private toDailyContent(content: BackendContent): DailyContent {
    const contentType = content.content_type?.name ?? 'Artigo';
    const contentTypeSlug = this.normalizeText(content.content_type?.slug ?? contentType);
    const reactionsCount = Number(content.reactions_count ?? 0);

    return {
      id: String(content.id),
      type: this.toContentTypeLabel(contentType, contentTypeSlug),
      title: content.title,
      summary: content.summary || this.toPlainText(content.content) || 'Conteúdo disponível na biblioteca Economia com História.',
      author: content.author?.name ?? content.user?.name ?? 'Equipa editorial',
      route: this.contentRoute(content, contentTypeSlug),
      imageUrl: normalizeMediaUrl(content.image_url, { contentId: content.id, mediaType: 'image' }) ?? '/assets/bna-hero.jpg',
      meta: reactionsCount === 1 ? '1 gosto' : `${reactionsCount} gostos`,
      premium: contentTypeSlug === 'jindungo',
    };
  }

  private contentRoute(content: BackendContent, contentTypeSlug: string): string {
    const id = String(content.id);

    if (contentTypeSlug.includes('podcast')) {
      return `/app/podcasts/${id}`;
    }

    if (contentTypeSlug.includes('video') || contentTypeSlug.includes('video-aula')) {
      return `/app/contents/videos/${id}`;
    }

    return `/app/contents/${id}`;
  }

  private toContentTypeLabel(contentType: string, contentTypeSlug: string): DailyContent['type'] {
    if (contentTypeSlug.includes('podcast')) {
      return 'Podcast';
    }

    if (contentTypeSlug.includes('video') || contentTypeSlug.includes('video-aula')) {
      return 'Video';
    }

    if (contentTypeSlug === 'jindungo') {
      return 'Jindungo';
    }

    return contentType.toLowerCase().includes('quiz') ? 'Quiz' : 'Artigo';
  }

  private toPlainText(value: string | null | undefined): string {
    return (value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private normalizeText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}

export const USER_HOME_ROUTES: Routes = [{ path: '', component: UserHomePage }];

