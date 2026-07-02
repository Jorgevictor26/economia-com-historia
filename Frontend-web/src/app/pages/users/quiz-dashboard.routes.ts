import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Routes } from '@angular/router';
import { OnDestroy } from '@angular/core';
import { AuthStateService } from '../../services/auth-state.service';
import { QuizService, QuizSubmitResult } from '../../services/quiz.service';
import { ToastService } from '../../services/toast.service';
import { Quiz, QuizQuestion } from '../../models/quiz.model';
import { BackToTopComponent } from '../shared/back-to-top/back-to-top.component';
import { PublicNavbarComponent } from '../shared/public-navbar/public-navbar.component';

interface QuizProgressSnapshot {
  currentQuestionIndex: number;
  correctCount: number;
  elapsedSeconds: number;
  answers: Array<{ question_id: string; selected_option: 'a' | 'b' | 'c' | 'd' }>;
  questionOrder: string[];
}

@Component({
  selector: 'app-quiz-dashboard-page',
  imports: [RouterLink, PublicNavbarComponent, BackToTopComponent],
  templateUrl: './quiz-dashboard.page.html'
})
export class QuizDashboardPage {
  readonly quizService = inject(QuizService);
  readonly auth = inject(AuthStateService);
  private readonly toastService = inject(ToastService);
  readonly searchTerm = signal('');
  readonly selectedLevel = signal('Todos');
  readonly isLoading = signal(false);
  readonly loadError = signal('');
  readonly quizProgressById = signal<Record<string, number>>({});
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
    progress: this.quizProgress(quiz),
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
      this.toastService.error('Nao foi possivel carregar os quizzes.');
    } finally {
      this.isLoading.set(false);
    }

    if (this.auth.isAuthenticated()) {
      try {
        await this.quizService.loadMyStats();
        await this.loadQuizProgress();
      } catch {
        this.quizService.userStats.set({ score: 0, completedQuizzes: 0, completedQuizIds: [] });
        this.quizProgressById.set({});
      }
    }
  }

  private async loadQuizProgress(): Promise<void> {
    const progressItems = await this.quizService.getProgress(12);
    const progressByQuizId = progressItems.reduce<Record<string, number>>((result, item) => {
      result[String(item.quiz_id)] = Number(item.progress_percent ?? 0);

      return result;
    }, {});

    this.quizProgressById.set(progressByQuizId);
  }

  private quizProgress(quiz: Quiz): number {
    if (this.quizService.userStats().completedQuizIds.includes(quiz.id)) {
      return 100;
    }

    return this.quizProgressById()[quiz.id] ?? 0;
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
export class QuizPlayPage implements OnDestroy {
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
  readonly resumePromptOpen = signal(false);
  readonly savedProgress = signal<QuizProgressSnapshot | null>(null);
  readonly baseElapsedSeconds = signal(0);
  readonly attemptStartedAt = signal(Date.now());
  readonly startedAt = signal(new Date().toISOString());
  readonly nowTick = signal(Date.now());
  private readonly elapsedTimerId = window.setInterval(() => this.nowTick.set(Date.now()), 1000);

  readonly totalQuestions = computed(() => this.quiz()?.questions.length ?? 0);
  readonly currentQuestion = computed(() => this.quiz()!.questions[this.currentIndex()]);
  readonly progressPercent = computed(() => (this.totalQuestions() ? (this.selectedAnswers().length / this.totalQuestions()) * 100 : 0));
  readonly correctAnswer = computed(() => this.currentQuestion().options[this.currentQuestion().answerIndex]);
  readonly elapsedSeconds = computed(() => this.baseElapsedSeconds() + Math.floor((this.nowTick() - this.attemptStartedAt()) / 1000));
  readonly earnedXp = computed(() => this.submitResult()?.score ?? this.scoreFromCorrect(this.correctCount(), this.totalQuestions()));
  readonly wrongCount = computed(() => this.submitResult()?.wrong_answers ?? Math.max(this.totalQuestions() - this.correctCount(), 0));
  readonly aproveitamento = computed(() => this.submitResult()?.percentage ?? Math.round((this.correctCount() / Math.max(this.totalQuestions(), 1)) * 100));
  readonly bestScore = computed(() => this.submitResult()?.best_score ?? 0);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      void this.loadQuiz(id);
    }
  }

  ngOnDestroy(): void {
    window.clearInterval(this.elapsedTimerId);
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
    void this.savePartialProgress();
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
      const quiz = this.withQuestionOrder(await this.quizService.getById(id));
      this.quiz.set(quiz);
      await this.loadSavedProgress(id);
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
        started_at: this.startedAt(),
        elapsed_seconds: this.currentElapsedSeconds(),
        answers: this.selectedAnswers(),
      });
      this.submitResult.set(result);
      await this.saveCompletedProgress();
      await this.quizService.loadMyStats();
    } catch {
      this.submitError.set('Nao foi possivel enviar o resultado do quiz.');
    }
  }

  private async savePartialProgress(): Promise<void> {
    const quiz = this.quiz();

    if (!quiz || !this.totalQuestions()) {
      return;
    }

    try {
      await this.quizService.updateProgress(quiz.id, {
        progress_percent: Math.min(99, Math.round((this.selectedAnswers().length / this.totalQuestions()) * 100)),
        current_question_index: this.currentIndex(),
        answered_questions: this.selectedAnswers(),
        correct_count: this.correctCount(),
        elapsed_seconds: this.currentElapsedSeconds(),
        question_order: this.questionOrder(),
      });
    } catch {
      // Progress is useful for resume, but quiz answering must remain uninterrupted.
    }
  }

  private async saveCompletedProgress(): Promise<void> {
    const quiz = this.quiz();

    if (!quiz) {
      return;
    }

    try {
      await this.quizService.updateProgress(quiz.id, {
        progress_percent: 100,
        current_question_index: Math.max(this.totalQuestions() - 1, 0),
        answered_questions: this.selectedAnswers(),
        correct_count: this.correctCount(),
        elapsed_seconds: this.currentElapsedSeconds(),
        question_order: this.questionOrder(),
      });
    } catch {
      // The backend submission also marks quiz progress after saving the result.
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

  continueSavedQuiz(): void {
    const progress = this.savedProgress();

    if (!progress || !this.quiz()) {
      this.resumePromptOpen.set(false);
      return;
    }

    this.applyQuestionOrder(progress.questionOrder);
    this.selectedAnswers.set(progress.answers);
    this.correctCount.set(progress.correctCount);
    this.baseElapsedSeconds.set(progress.elapsedSeconds);
    this.attemptStartedAt.set(Date.now());
    this.startedAt.set(new Date(Date.now() - progress.elapsedSeconds * 1000).toISOString());
    this.currentIndex.set(this.nextQuestionIndex(progress));
    this.selectedIndex.set(null);
    this.answered.set(false);
    this.isCorrect.set(false);
    this.resumePromptOpen.set(false);
  }

  async restartQuiz(): Promise<void> {
    const quiz = this.quiz();

    if (!quiz) {
      return;
    }

    this.quiz.set(this.withQuestionOrder(quiz));
    this.currentIndex.set(0);
    this.selectedIndex.set(null);
    this.answered.set(false);
    this.correctCount.set(0);
    this.finished.set(false);
    this.isCorrect.set(false);
    this.submitResult.set(null);
    this.selectedAnswers.set([]);
    this.baseElapsedSeconds.set(0);
    this.attemptStartedAt.set(Date.now());
    this.startedAt.set(new Date().toISOString());
    this.resumePromptOpen.set(false);

    await this.quizService.updateProgress(quiz.id, {
      progress_percent: 0,
      current_question_index: 0,
      answered_questions: [],
      correct_count: 0,
      elapsed_seconds: 0,
      question_order: this.questionOrder(),
    }).catch(() => undefined);
  }

  formatDuration(seconds: number | null | undefined): string {
    const safeSeconds = Math.max(0, Math.floor(Number(seconds ?? 0)));
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  private async loadSavedProgress(quizId: string): Promise<void> {
    try {
      const progresses = await this.quizService.getProgress(12);
      const progress = progresses.find((item) => String(item.quiz_id) === String(quizId));

      if (!progress || Number(progress.progress_percent) <= 0 || Number(progress.progress_percent) >= 100) {
        return;
      }

      this.savedProgress.set(this.progressSnapshot(progress));
      this.resumePromptOpen.set(true);
    } catch {
      this.savedProgress.set(null);
    }
  }

  private progressSnapshot(progress: {
    current_question_index?: number | string | null;
    correct_count?: number | string | null;
    elapsed_seconds?: number | string | null;
    answered_questions?: Array<{ question_id: number | string; selected_option: 'a' | 'b' | 'c' | 'd' }> | null;
    question_order?: Array<number | string> | null;
  }): QuizProgressSnapshot {
    return {
      currentQuestionIndex: Number(progress.current_question_index ?? 0),
      correctCount: Number(progress.correct_count ?? 0),
      elapsedSeconds: Number(progress.elapsed_seconds ?? 0),
      answers: (progress.answered_questions ?? []).map((answer) => ({
        question_id: String(answer.question_id),
        selected_option: answer.selected_option,
      })),
      questionOrder: (progress.question_order ?? []).map((questionId) => String(questionId)),
    };
  }

  private nextQuestionIndex(progress: QuizProgressSnapshot): number {
    const answeredIds = new Set(progress.answers.map((answer) => String(answer.question_id)));
    const nextIndex = this.quiz()?.questions.findIndex((question) => !answeredIds.has(question.id)) ?? 0;

    return Math.max(nextIndex, 0);
  }

  private withQuestionOrder(quiz: Quiz): Quiz {
    return {
      ...quiz,
      questions: [...quiz.questions].sort(() => Math.random() - 0.5).slice(0, 10),
    };
  }

  private applyQuestionOrder(questionOrder: string[]): void {
    const quiz = this.quiz();

    if (!quiz || !questionOrder.length) {
      return;
    }

    const byId = new Map(quiz.questions.map((question) => [question.id, question] as const));
    const ordered = questionOrder
      .map((questionId) => byId.get(questionId))
      .filter((question): question is QuizQuestion => Boolean(question));

    if (ordered.length === quiz.questions.length) {
      this.quiz.set({ ...quiz, questions: ordered });
    }
  }

  private questionOrder(): string[] {
    return this.quiz()?.questions.map((question) => question.id) ?? [];
  }

  private currentElapsedSeconds(): number {
    return this.baseElapsedSeconds() + Math.floor((Date.now() - this.attemptStartedAt()) / 1000);
  }

  private scoreFromCorrect(correct: number, total: number): number {
    return (correct * 10) + (total === 10 && correct === total ? 10 : 0);
  }
}

export const QUIZ_DASHBOARD_ROUTES: Routes = [
  { path: '', component: QuizDashboardPage },
  { path: ':id/play', component: QuizPlayPage },
];

