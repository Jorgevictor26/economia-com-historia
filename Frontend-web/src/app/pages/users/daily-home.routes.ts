import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RouterLink, Routes } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';
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
  selector: 'app-daily-home-page',
  imports: [RouterLink, PublicNavbarComponent, PublicFooterComponent, BackToTopComponent],
  templateUrl: './daily-home-page.html'
})
export class DailyHomePage implements OnInit, OnDestroy {
  readonly auth = inject(AuthStateService);
  readonly showWelcome = signal(true);
  readonly activeHighlightIndex = signal(0);
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
      route: '/app/contents',
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
      route: '/app/contents',
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
      route: '/app/contents',
      imageUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=900&q=80',
      meta: 'Video 11 min',
      progress: 64,
    },
  ];

  readonly recommendedContent: DailyContent[] = [
    ...this.highlights,
    ...this.videoContent,
    this.podcastResume,
    {
      id: 'artigo-planalto',
      type: 'Artigo',
      title: 'A economia do cafe no planalto angolano',
      summary: 'Uma leitura historica sobre exportacao, trabalho, ferrovias e transformacao regional no planalto.',
      author: 'Equipa editorial',
      route: '/app/contents/rotas-comerciais',
      imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
      meta: 'Leitura 8 min',
    },
  ];

  readonly quickQueue = this.recommendedContent.slice(1, 5);

  ngOnInit(): void {
    this.welcomeTimer = window.setTimeout(() => this.showWelcome.set(false), 4200);
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
}

export const DAILY_HOME_ROUTES: Routes = [{ path: '', component: DailyHomePage }];



