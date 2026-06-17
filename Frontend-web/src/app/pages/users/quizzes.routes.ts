import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Routes } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';
import { QuizService } from '../../services/quiz.service';
import { BackToTopComponent } from '../shared/back-to-top/back-to-top.component';
import { PublicFooterComponent } from '../shared/public-footer/public-footer.component';
import { PublicNavbarComponent } from '../shared/public-navbar/public-navbar.component';

@Component({
  selector: 'app-quizzes-page',
  imports: [RouterLink, PublicNavbarComponent, PublicFooterComponent, BackToTopComponent],
  templateUrl: './quizzes-page.html'
})
export class QuizzesPage {
  readonly quizService = inject(QuizService);
  readonly auth = inject(AuthStateService);
  readonly searchTerm = signal('');

  readonly quizCards = [
    {
      quizId: 'reino-kongo',
      area: 'História Imperial',
      level: 'Intermédio',
      icon: '♜',
      title: 'O Reino do Congo e a Diplomacia Europeia',
      summary: 'Análise duas instituições diplomáticas entre a corte do Manicongo e as potências europeias.',
      progress: 40,
      questions: 12,
      action: 'Continuar',
      accent: 'green',
    },
    {
      quizId: 'angola-mercados',
      area: 'Macroeconomia',
      level: 'Avançado',
      icon: '▣',
      title: 'Políticas Monetárias no Pós-Independência',
      summary: 'Estude sobre a transição cambial e a estabilização do Kwanza nos primeiros anos.',
      progress: 0,
      questions: 20,
      action: 'Iniciar',
      accent: 'wine',
    },
    {
      quizId: 'cafe-dende',
      area: 'Sociedade & Economia',
      level: 'Iniciante',
      icon: '♟',
      title: 'Demografia e Mercados Locais',
      summary: 'Como os movimentos migratórios internos moldaram o comércio informal e as redes de troca.',
      progress: 100,
      questions: 0,
      action: 'Rever',
      accent: 'green',
    },
    {
      quizId: 'cafe-dende',
      area: 'História Económica',
      level: 'Intermédio',
      icon: '✦',
      title: 'O Caminho de Ferro de Benguela',
      summary: 'O impacto do CFB na estrutura mineira do Katanga e no desenvolvimento regional do Lobito.',
      progress: 15,
      questions: 18,
      action: 'Continuar',
      accent: 'green',
    },
    {
      quizId: 'reino-kongo',
      area: 'Instituições',
      level: 'Avançado',
      icon: '▥',
      title: 'Arquitetura das Instituições Coloniais',
      summary: 'Exame crítico sobre a formação do aparelho administrativo e seu legado na governança.',
      progress: 0,
      questions: 25,
      action: 'Iniciar',
      accent: 'wine',
    },
  ];

  readonly featuredQuiz = computed(() => this.quizService.quizzes()[1] ?? this.quizService.quizzes()[0]);
  readonly filteredQuizzes = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.quizCards;
    }

    return this.quizCards.filter((quiz) =>
      [quiz.title, quiz.summary, quiz.area, quiz.level]
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  });
}
@Component({
  selector: 'app-quiz-play-page',
  imports: [RouterLink],
  templateUrl: './quiz-play-page.html'
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

export const QUIZZES_ROUTES: Routes = [
  { path: '', component: QuizzesPage },
  { path: ':id/play', component: QuizPlayPage },
];



