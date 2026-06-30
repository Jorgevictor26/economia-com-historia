import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Routes } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';
import { QuizService, QuizSubmitResult } from '../../services/quiz.service';
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
  readonly isLoading = signal(false);
  readonly loadError = signal('');
  readonly quizPage = signal(1);
  readonly quizzesPerPage = 4;
  readonly levelFilters = ['Todos', 'Fácil', 'Médio', 'Difícil'];
  readonly userQuizStats = computed(() => {
    const stats = this.quizService.userStats();

    return [
      { label: 'Pontuação', value: `${stats.score} XP`, icon: 'military_tech' },
      { label: 'Ranking', value: '#8', icon: 'leaderboard' },
      { label: 'Quiz Completados', value: `${stats.completedQuizzes}`, icon: 'trophy' },
    ];
  });
  readonly topFive = [
    { position: 1, name: 'Isabel Marques', score: 1960, icon: 'emoji_events' },
    { position: 2, name: 'Carlos Tchipia', score: 1840, icon: 'workspace_premium' },
    { position: 3, name: 'Jussana Paim', score: 1795, icon: 'military_tech' },
    { position: 4, name: 'David Jaspe', score: 1710, icon: 'stars' },
    { position: 5, name: 'L\u00edria B\u00e1', score: 1650, icon: 'auto_awesome' },
  ];

  readonly featuredQuiz = computed(() => this.quizService.quizzes()[1] ?? this.quizService.quizzes()[0]);
  readonly quizCards = computed(() => this.quizService.quizzes().map((quiz, index) => ({
    quizId: quiz.id,
    area: quiz.topic,
    level: this.levelLabel(quiz.difficulty),
    icon: 'quiz',
    title: quiz.title,
    summary: quiz.summary,
    coverImage: quiz.coverUrl ?? '',
    coverAlt: quiz.title,
    progress: this.quizService.userStats().completedQuizIds.includes(quiz.id) ? 100 : 0,
    questions: this.questionCount(quiz),
    action: 'Iniciar',
    accent: index % 2 === 0 ? 'green' : 'wine',
  })));
  readonly availableChallenges = computed(() => this.quizCards().filter((quiz) => quiz.progress < 100).slice(0, 3));
  readonly filteredQuizzes = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const level = this.selectedLevel();

    return this.quizCards().filter((quiz) => {
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

  selectLevelFilter(level: string): void {
    this.selectedLevel.set(level);
    this.quizPage.set(1);
  }

  goToPreviousQuizPage(): void {
    this.quizPage.update((page) => Math.max(1, page - 1));
  }

  goToNextQuizPage(): void {
    this.quizPage.update((page) => Math.min(this.quizTotalPages(), page + 1));
  }

  constructor() {
    void this.loadQuizzes();
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.quizPage.set(1);
  }

  private async loadQuizzes(): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set('');

    try {
      await this.quizService.loadAll();
    } catch {
      this.loadError.set('Nao foi possivel carregar os quizzes.');
    } finally {
      this.isLoading.set(false);
    }

    if (this.auth.isAuthenticated()) {
      try {
        await this.quizService.loadMyStats();
      } catch {
        this.quizService.userStats.set({ score: 0, completedQuizzes: 0, completedQuizIds: [] });
      }
    }
  }

  private levelLabel(level: 'facil' | 'medio' | 'dificil'): string {
    const labels = {
      facil: 'Fácil',
      medio: 'Médio',
      dificil: 'Difícil',
    };

    return labels[level];
  }

  private questionCount(quiz: { questions: unknown[]; xp: number; difficulty: 'facil' | 'medio' | 'dificil' }): number {
    if (quiz.questions.length) {
      return quiz.questions.length;
    }

    const xpPerQuestion = quiz.difficulty === 'facil' ? 10 : quiz.difficulty === 'medio' ? 15 : 20;

    return Math.max(Math.round(quiz.xp / xpPerQuestion), 0);
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

  readonly quiz = signal(this.quizService.findQuiz(this.route.snapshot.paramMap.get('id')));
  readonly currentIndex = signal(0);
  readonly selectedIndex = signal<number | null>(null);
  readonly answered = signal(false);
  readonly correctCount = signal(0);
  readonly finished = signal(false);
  readonly isCorrect = signal(false);
  readonly isLoading = signal(false);
  readonly submitError = signal('');
  readonly submitResult = signal<QuizSubmitResult | null>(null);
  readonly selectedAnswers = signal<Array<{ question_id: string; selected_option: 'a' | 'b' | 'c' | 'd' }>>([]);
  readonly startedAt = new Date().toISOString();

  readonly totalQuestions = computed(() => this.quiz()?.questions.length ?? 0);
  readonly currentQuestion = computed(() => this.quiz()!.questions[this.currentIndex()]);
  readonly progressPercent = computed(() => (this.totalQuestions() ? (this.correctCount() / this.totalQuestions()) * 100 : 0));
  readonly correctAnswer = computed(() => this.currentQuestion().options[this.currentQuestion().answerIndex]);
  readonly earnedXp = computed(() => this.submitResult()?.earned_xp ?? Math.round(((this.correctCount() / Math.max(this.totalQuestions(), 1)) * (this.quiz()?.xp ?? 0))));

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      void this.loadQuiz(id);
    }
  }

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

    this.selectedAnswers.update((answers) => [
      ...answers.filter((answer) => answer.question_id !== this.currentQuestion().id),
      {
        question_id: this.currentQuestion().id,
        selected_option: (['a', 'b', 'c', 'd'] as const)[selected],
      },
    ]);
    this.playFeedbackSound(correct);
  }

  async nextQuestion(): Promise<void> {
    if (this.currentIndex() + 1 >= this.totalQuestions()) {
      this.finished.set(true);
      await this.submitQuiz();
      return;
    }

    this.currentIndex.update((index) => index + 1);
    this.selectedIndex.set(null);
    this.answered.set(false);
    this.isCorrect.set(false);
  }

  private async loadQuiz(id: string): Promise<void> {
    this.isLoading.set(true);

    try {
      this.quiz.set(await this.quizService.getById(id));
    } catch {
      this.quiz.set(undefined);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async submitQuiz(): Promise<void> {
    const quiz = this.quiz();

    if (!quiz) {
      return;
    }

    this.submitError.set('');

    try {
      const result = await this.quizService.submit(quiz.id, {
        started_at: this.startedAt,
        answers: this.selectedAnswers(),
      });
      this.submitResult.set(result);
      await this.quizService.loadMyStats();
    } catch {
      this.submitError.set('Nao foi possivel enviar o resultado do quiz.');
    }
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
