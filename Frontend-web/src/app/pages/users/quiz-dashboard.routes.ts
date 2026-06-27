import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Routes } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';
import { QuizService } from '../../services/quiz.service';
import { BackToTopComponent } from '../shared/back-to-top/back-to-top.component';
import { PublicNavbarComponent } from '../shared/public-navbar/public-navbar.component';

@Component({
  selector: 'app-quiz-dashboard-page',
  imports: [RouterLink, PublicNavbarComponent, BackToTopComponent],
  templateUrl: './quiz-dashboard.page.html'
})
export class QuizDashboardPage {
  readonly quizService = inject(QuizService);
  readonly auth = inject(AuthStateService);
  readonly searchTerm = signal('');
  readonly selectedLevel = signal('Todos');
  readonly quizPage = signal(1);
  readonly quizzesPerPage = 4;
  readonly levelFilters = ['Todos', 'Iniciante', 'Interm\u00e9dio', 'Avan\u00e7ado'];
  readonly userQuizStats = [
    { label: 'Pontua\u00e7\u00e3o', value: '1.240 XP', icon: 'military_tech' },
    { label: 'Ranking', value: '#8', icon: 'leaderboard' },
    { label: 'Quiz Completados', value: '14', icon: 'trophy' },
  ];
  readonly topFive = [
    { position: 1, name: 'Isabel Marques', score: 1960 },
    { position: 2, name: 'Carlos Tchipia', score: 1840 },
    { position: 3, name: 'Jussana Paim', score: 1795 },
    { position: 4, name: 'David Jaspe', score: 1710 },
    { position: 5, name: 'L\u00edria B\u00e1', score: 1650 },
  ];

  readonly quizCards = [
    {
      quizId: 'reino-kongo',
      area: 'Hist\u00f3ria Imperial',
      level: 'Interm\u00e9dio',
      icon: 'castle',
      title: 'O Reino do Congo e a Diplomacia Europeia',
      summary: 'Analise duas institui\u00e7\u00f5es diplom\u00e1ticas entre a corte do Manicongo e as pot\u00eancias europeias.',
      coverImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=80',
      coverAlt: 'Arquitetura hist\u00f3rica em pedra',
      progress: 40,
      questions: 12,
      action: 'Continuar',
      accent: 'green',
    },
    {
      quizId: 'angola-mercados',
      area: 'Macroeconomia',
      level: 'Avan\u00e7ado',
      icon: 'analytics',
      title: 'Pol\u00edticas Monet\u00e1rias no P\u00f3s-Independ\u00eancia',
      summary: 'Estude sobre a transi\u00e7\u00e3o cambial e a estabiliza\u00e7\u00e3o do Kwanza nos primeiros anos.',
      coverImage: '/assets/bna-hero.jpg',
      coverAlt: 'Banco Nacional de Angola',
      progress: 0,
      questions: 20,
      action: 'Iniciar',
      accent: 'wine',
    },
    {
      quizId: 'cafe-dende',
      area: 'Sociedade & Economia',
      level: 'Iniciante',
      icon: 'groups',
      title: 'Demografia e Mercados Locais',
      summary: 'Como os movimentos migrat\u00f3rios internos moldaram o com\u00e9rcio informal e as redes de troca.',
      progress: 100,
      questions: 0,
      action: 'Rever',
      accent: 'green',
    },
    {
      quizId: 'cafe-dende',
      area: 'Hist\u00f3ria Econ\u00f3mica',
      level: 'Interm\u00e9dio',
      icon: 'route',
      title: 'O Caminho de Ferro de Benguela',
      summary: 'O impacto do CFB na estrutura mineira do Katanga e no desenvolvimento regional do Lobito.',
      coverImage: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=900&q=80',
      coverAlt: 'Comboio em linha ferrovi\u00e1ria',
      progress: 15,
      questions: 18,
      action: 'Continuar',
      accent: 'green',
    },
    {
      quizId: 'reino-kongo',
      area: 'Institui\u00e7\u00f5es',
      level: 'Avan\u00e7ado',
      icon: 'account_balance',
      title: 'Arquitetura das Institui\u00e7\u00f5es Coloniais',
      summary: 'Exame cr\u00edtico sobre a forma\u00e7\u00e3o do aparelho administrativo e seu legado na governan\u00e7a.',
      progress: 0,
      questions: 25,
      action: 'Iniciar',
      accent: 'wine',
    },
  ];

  readonly featuredQuiz = computed(() => this.quizService.quizzes()[1] ?? this.quizService.quizzes()[0]);
  readonly availableChallenges = computed(() => this.quizCards.filter((quiz) => quiz.progress < 100).slice(0, 3));
  readonly filteredQuizzes = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const level = this.selectedLevel();

    return this.quizCards.filter((quiz) => {
      const matchesTerm = !term || [quiz.title, quiz.summary, quiz.area, quiz.level]
        .join(' ')
        .toLowerCase()
        .includes(term);
      const matchesLevel = level === 'Todos' || quiz.level === level;

      return matchesTerm && matchesLevel;
    });
  });
  readonly quizTotalPages = computed(() => Math.max(1, Math.ceil(this.filteredQuizzes().length / this.quizzesPerPage)));
  readonly currentQuizPage = computed(() => Math.min(this.quizPage(), this.quizTotalPages()));
  readonly paginatedQuizzes = computed(() => {
    const start = (this.currentQuizPage() - 1) * this.quizzesPerPage;

    return this.filteredQuizzes().slice(start, start + this.quizzesPerPage);
  });
  readonly hasPreviousQuizPage = computed(() => this.currentQuizPage() > 1);
  readonly hasNextQuizPage = computed(() => this.currentQuizPage() < this.quizTotalPages());

  updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.quizPage.set(1);
  }

  selectLevel(event: Event): void {
    this.selectedLevel.set((event.target as HTMLSelectElement).value);
    this.quizPage.set(1);
  }

  goToPreviousQuizPage(): void {
    this.quizPage.update((page) => Math.max(1, page - 1));
  }

  goToNextQuizPage(): void {
    this.quizPage.update((page) => Math.min(this.quizTotalPages(), page + 1));
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.quizPage.set(1);
  }
}

@Component({
  selector: 'app-quiz-play-page',
  imports: [RouterLink],
  templateUrl: './quiz-play.page.html'
})
export class QuizPlayPage {
  private readonly route = inject(ActivatedRoute);
  readonly quizService = inject(QuizService);
  readonly auth = inject(AuthStateService);

  readonly quiz = computed(() => this.quizService.findQuiz(this.route.snapshot.paramMap.get('id')));
  readonly currentIndex = signal(0);
  readonly selectedIndex = signal<number | null>(null);
  readonly answered = signal(false);
  readonly correctCount = signal(0);
  readonly finished = signal(false);
  readonly isCorrect = signal(false);

  readonly totalQuestions = computed(() => this.quiz()?.questions.length ?? 0);
  readonly currentQuestion = computed(() => this.quiz()!.questions[this.currentIndex()]);
  readonly progressPercent = computed(() => (this.totalQuestions() ? (this.correctCount() / this.totalQuestions()) * 100 : 0));
  readonly correctAnswer = computed(() => this.currentQuestion().options[this.currentQuestion().answerIndex]);
  readonly earnedXp = computed(() => Math.round(((this.correctCount() / Math.max(this.totalQuestions(), 1)) * (this.quiz()?.xp ?? 0))));

  selectOption(index: number): void {
    if (!this.answered()) {
      this.selectedIndex.set(index);
    }
  }

  submitAnswer(): void {
    const selected = this.selectedIndex();
    if (selected === null) {
      return;
    }

    const correct = selected === this.currentQuestion().answerIndex;
    this.isCorrect.set(correct);
    this.answered.set(true);
    if (correct) {
      this.correctCount.update((count) => count + 1);
    }
    this.playFeedbackSound(correct);
  }

  nextQuestion(): void {
    if (this.currentIndex() + 1 >= this.totalQuestions()) {
      this.finished.set(true);
      return;
    }

    this.currentIndex.update((index) => index + 1);
    this.selectedIndex.set(null);
    this.answered.set(false);
    this.isCorrect.set(false);
  }

  private playFeedbackSound(correct: boolean): void {
    const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      return;
    }

    const context = new AudioContextCtor();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(correct ? 660 : 220, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(correct ? 880 : 140, context.currentTime + 0.14);
    gain.gain.setValueAtTime(0.001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.22);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.24);
  }
}

export const QUIZ_DASHBOARD_ROUTES: Routes = [
  { path: '', component: QuizDashboardPage },
  { path: ':id/play', component: QuizPlayPage },
];
