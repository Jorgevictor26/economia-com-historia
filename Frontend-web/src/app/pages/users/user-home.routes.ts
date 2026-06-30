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
  readonly isLoadingSuggestions = signal(false);
  readonly suggestionsError = signal('');
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

  readonly quizResume: DailyContent = {
    id: 'quiz-moeda',
    type: 'Quiz',
    title: 'Quiz: moeda, inflacao e memoria social',
    summary: 'Continuar de onde parou: faltam perguntas sobre Kwanza, poder de compra e política monetária.',
    author: 'Nucleo academico',
    route: '/app/quizzes',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
    meta: '6 de 10 perguntas',
    progress: 60,
  };

  readonly podcastResume: DailyContent = {
    id: 'podcast-diamantes',
    type: 'Podcast',
    title: 'Diamantes na Lunda Sul: cadeia de valor e historia local',
    summary: 'Retome o episodio no ponto em que ficou e acompanhe a discussao sobre economia mineira regional.',
    author: 'Podcast EH',
    route: '/app/podcasts',
    imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=900&q=80',
    meta: '24:18',
    progress: 48,
  };

  readonly resumeItems: DailyContent[] = [this.quizResume, this.podcastResume];

  readonly videoContent: DailyContent[] = [
    {
      id: 'video-ferrovia',
      type: 'Video',
      title: 'Ferrovias, portos e mercados: a logistica que move Angola',
      summary: 'Aula visual sobre corredores de transporte, exportações e integração regional.',
      author: 'Equipa EH',
      route: '/app/contents/videos/video-ferrovia',
      imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=900&q=80',
      meta: 'Video 14 min',
      progress: 36,
    },
    {
      id: 'video-inflacao',
      type: 'Video',
      title: 'Inflacao explicada com exemplos do quotidiano angolano',
      summary: 'Conceitos de poder de compra, moeda e precos apresentados de forma aplicada.',
      author: 'Equipa EH',
      route: '/app/contents/videos/video-inflacao',
      imageUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=900&q=80',
      meta: 'Video 11 min',
      progress: 64,
    },
  ];

  readonly featuredResumeVideo: DailyContent = this.videoContent[1];

  ngOnInit(): void {
    if (this.auth.consumeWelcomeForHome()) {
      this.showWelcome.set(true);
      this.welcomeTimer = window.setTimeout(() => this.showWelcome.set(false), 4200);
    }

    void this.loadSuggestions();
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
      imageUrl: normalizeMediaUrl(content.image_url) ?? '/assets/bna-hero.jpg',
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

