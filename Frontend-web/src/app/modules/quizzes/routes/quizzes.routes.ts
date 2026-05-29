import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Routes } from '@angular/router';
import { AuthStateService } from '../../../services/auth-state.service';
import { QuizService } from '../../../services/quiz.service';
import { BackToTopComponent } from '../../../shared/back-to-top/back-to-top.component';
import { PublicFooterComponent } from '../../../shared/public-footer/public-footer.component';
import { PublicNavbarComponent } from '../../../shared/public-navbar/public-navbar.component';

@Component({
  selector: 'app-quizzes-page',
  imports: [RouterLink, PublicNavbarComponent, PublicFooterComponent, BackToTopComponent],
  template: `
    <section class="-m-6 min-h-dvh bg-[#f7f8f8] text-[#2c2729]">
      <app-public-navbar />

      <main class="fluid-container pb-16 pt-8">
        <section class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <p class="text-[11px] font-bold uppercase tracking-[0.16em] text-[#735c00]">Avaliações Académicas</p>
            <h1 class="mt-3 font-display text-[34px] font-extrabold leading-tight text-[#40081a]">Quiz</h1>
            <p class="mt-4 max-w-[620px] text-[15px] leading-7 text-[#5e5e5f]">
              Veja todos os quizzes disponíveis, leia o conteúdo relacionado e teste o seu domínio quando estiver autenticado.
            </p>
          </div>

          <aside class="rounded-[8px] border border-[#d8c1c4]/60 bg-white p-5">
            <div class="flex items-center justify-between gap-4">
              <div>
                <h2 class="font-display text-[20px] font-bold text-[#40081a]">Ranking</h2>
                <p class="mt-1 text-[12px] text-[#6f686b]">Melhores pontuações da semana</p>
              </div>
              <span class="grid size-10 place-items-center rounded-[100%] bg-[#5c1e2f] text-[14px] font-bold text-white">#</span>
            </div>
            <ol class="mt-5 grid gap-3">
              @for (row of ranking; track row.position) {
                <li class="flex items-center justify-between gap-3 rounded-[8px] bg-[#f7f8f8] px-4 py-3">
                  <span class="flex min-w-0 items-center gap-3">
                    <strong class="grid size-7 place-items-center rounded-[100%] bg-[#f1d8df] text-[11px] text-[#5c1e2f]">{{ row.position }}</strong>
                    <span class="min-w-0">
                      <span class="block truncate text-[13px] font-bold text-[#2c2729]">{{ row.name }}</span>
                      <span class="text-[11px] text-[#7a7276]">{{ row.streak }} dias de sequência</span>
                    </span>
                  </span>
                  <strong class="text-[12px] text-[#735c00]">{{ row.xp }} XP</strong>
                </li>
              }
            </ol>
          </aside>
        </section>

        <section class="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:gap-8">
          @for (quiz of quizService.quizzes(); track quiz.id) {
            <article class="grid min-h-[330px] rounded-[8px] border border-[#ded7da] bg-white p-6 shadow-[0_1px_2px_rgba(22,19,21,0.03)]">
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <span class="rounded-[4px] bg-[#d4af37] px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#5c1e2f]">{{ quiz.difficulty }}</span>
                  <span class="text-[11px] font-bold text-[#735c00]">{{ quiz.xp }} XP</span>
                  <span class="text-[11px] text-[#7a7276]">{{ quiz.estimatedMinutes }} min</span>
                </div>
                <h2 class="mt-4 font-display text-[23px] font-extrabold leading-tight text-[#5c1e2f]">{{ quiz.title }}</h2>
                <p class="mt-3 text-[13px] leading-6 text-[#5f575b]">{{ quiz.summary }}</p>
              </div>

              <div class="mt-6 rounded-[8px] border border-[#ece8ea] bg-[#f7f8f8] p-4">
                <p class="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a8587]">Conteúdo relacionado</p>
                <a [routerLink]="quiz.relatedContent.route" class="mt-2 block font-display text-[16px] font-bold leading-snug text-[#40081a] hover:underline">
                  {{ quiz.relatedContent.title }}
                </a>
                <p class="mt-1 text-[11px] text-[#735c00]">{{ quiz.relatedContent.category }}</p>
              </div>

              <div class="mt-auto flex flex-wrap gap-3 pt-6">
                <a [routerLink]="quiz.relatedContent.route" class="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#d8c1c4] px-4 text-[12px] font-bold text-[#5c1e2f]">
                  Ler conteúdo
                </a>

                @if (auth.isAuthenticated()) {
                  <a [routerLink]="[quiz.id, 'play']" class="inline-flex h-10 items-center justify-center rounded-[8px] bg-[#5c1e2f] px-5 text-[12px] font-bold text-white">
                    Fazer quiz
                  </a>
                } @else {
                  <button type="button" class="inline-flex h-10 items-center justify-center rounded-[8px] bg-[#5c1e2f] px-5 text-[12px] font-bold text-white" (click)="auth.requireLoginFor('fazer quiz')">
                    Fazer quiz
                  </button>
                }
              </div>
            </article>
          }
        </section>
      </main>

      <app-public-footer />
      <app-back-to-top />
    </section>
  `,
})
export class QuizzesPage {
  readonly quizService = inject(QuizService);
  readonly auth = inject(AuthStateService);

  readonly ranking = [
    { position: 1, name: 'Marta Ribeiro', xp: 2480, streak: 18 },
    { position: 2, name: 'João Santos', xp: 2310, streak: 15 },
    { position: 3, name: 'Ana Paula', xp: 2195, streak: 12 },
    { position: 4, name: 'Carlos Bumba', xp: 1980, streak: 9 },
  ];
}

@Component({
  selector: 'app-quiz-play-page',
  imports: [RouterLink],
  template: `
    @if (!auth.isAuthenticated()) {
      <main class="-m-6 grid min-h-dvh place-items-center bg-[#f7f8f8] px-5 text-[#2c2729]">
        <section class="w-full max-w-[420px] rounded-[8px] border border-[#d8c1c4] bg-white p-7 text-center shadow-xl">
          <p class="text-[11px] font-bold uppercase tracking-[0.16em] text-[#735c00]">Login obrigatório</p>
          <h1 class="mt-3 font-display text-[28px] font-extrabold text-[#5c1e2f]">Entre para fazer o quiz</h1>
          <p class="mt-3 text-[14px] leading-6 text-[#5f575b]">Pode ver os quizzes e ler os conteúdos relacionados, mas precisa iniciar sessão para responder.</p>
          <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a routerLink="/auth/login" class="inline-flex h-11 items-center justify-center rounded-[8px] bg-[#5c1e2f] px-6 text-[13px] font-bold text-white">Entrar</a>
            <a routerLink="/app/quizzes" class="inline-flex h-11 items-center justify-center rounded-[8px] border border-[#d8c1c4] px-6 text-[13px] font-bold text-[#5c1e2f]">Voltar</a>
          </div>
        </section>
      </main>
    } @else if (!quiz()) {
      <main class="-m-6 grid min-h-dvh place-items-center bg-[#f7f8f8] px-5">
        <section class="rounded-[8px] border border-[#d8c1c4] bg-white p-7 text-center">
          <h1 class="font-display text-[24px] font-extrabold text-[#5c1e2f]">Quiz não encontrado</h1>
          <a routerLink="/app/quizzes" class="mt-5 inline-flex h-10 items-center justify-center rounded-[8px] bg-[#5c1e2f] px-5 text-[12px] font-bold text-white">Ver quizzes</a>
        </section>
      </main>
    } @else {
      <main class="-m-6 min-h-dvh bg-[#f7f8f8] text-[#2c2729]">
        <header class="sticky top-0 z-30 border-b border-[#ece8ea] bg-white/95 backdrop-blur">
          <div class="mx-auto flex h-16 max-w-5xl items-center gap-4 px-5">
            <a routerLink="/app/quizzes" class="grid size-10 place-items-center rounded-[100%] border border-[#d8c1c4] text-[20px] text-[#5c1e2f]" aria-label="Sair do quiz">×</a>
            <div class="min-w-0 flex-1">
              <div class="h-3 overflow-hidden rounded-[999px] bg-[#e8e1e4]">
                <span class="block h-full rounded-[999px] bg-[#5c1e2f] transition-all duration-300" [style.width.%]="progressPercent()"></span>
              </div>
              <div class="mt-2 flex justify-between gap-3 text-[11px] font-bold text-[#7a7276]">
                <span>Pergunta {{ currentIndex() + 1 }} de {{ totalQuestions() }}</span>
                <span>{{ correctCount() }} acertos</span>
              </div>
            </div>
          </div>
        </header>

        <section class="mx-auto grid min-h-[calc(100dvh-64px)] max-w-5xl content-start px-5 py-8">
          @if (!finished()) {
            <div class="mx-auto w-full max-w-2xl">
              <p class="text-[11px] font-bold uppercase tracking-[0.16em] text-[#735c00]">{{ quiz()!.topic }}</p>
              <h1 class="mt-4 font-display text-[28px] font-extrabold leading-tight text-[#40081a]">{{ currentQuestion().prompt }}</h1>

              <div class="mt-8 grid gap-3">
                @for (option of currentQuestion().options; track option; let index = $index) {
                  <button
                    type="button"
                    class="min-h-14 rounded-[8px] border-2 bg-white px-5 text-left text-[15px] font-bold transition"
                    [class.border-[#5c1e2f]]="selectedIndex() === index"
                    [class.bg-[#f9dbe4]]="selectedIndex() === index"
                    [class.border-[#d8c1c4]]="selectedIndex() !== index"
                    [class.opacity-70]="answered() && selectedIndex() !== index"
                    [disabled]="answered()"
                    (click)="selectOption(index)"
                  >
                    {{ option }}
                  </button>
                }
              </div>

              @if (!answered()) {
                <button
                  type="button"
                  class="mt-8 h-12 w-full rounded-[8px] bg-[#5c1e2f] px-6 text-[13px] font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
                  [disabled]="selectedIndex() === null"
                  (click)="submitAnswer()"
                >
                  Confirmar
                </button>
              }
            </div>
          } @else {
            <section class="mx-auto w-full max-w-xl rounded-[8px] border border-[#d8c1c4] bg-white p-7 text-center shadow-xl">
              <p class="text-[11px] font-bold uppercase tracking-[0.16em] text-[#735c00]">Quiz concluído</p>
              <h1 class="mt-3 font-display text-[32px] font-extrabold text-[#5c1e2f]">{{ correctCount() }} de {{ totalQuestions() }} acertos</h1>
              <p class="mt-3 text-[14px] leading-6 text-[#5f575b]">
                Ganhou {{ earnedXp() }} XP. Revise o conteúdo relacionado para consolidar o que aprendeu.
              </p>
              <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <a [routerLink]="quiz()!.relatedContent.route" class="inline-flex h-11 items-center justify-center rounded-[8px] border border-[#d8c1c4] px-5 text-[13px] font-bold text-[#5c1e2f]">Rever conteúdo</a>
                <a routerLink="/app/quizzes" class="inline-flex h-11 items-center justify-center rounded-[8px] bg-[#5c1e2f] px-5 text-[13px] font-bold text-white">Ver ranking</a>
              </div>
            </section>
          }
        </section>

        @if (answered() && !finished()) {
          <section class="fixed inset-x-0 bottom-0 z-40 border-t bg-white shadow-[0_-18px_45px_rgba(22,19,21,0.12)]" [class.border-[#b7dfc0]]="isCorrect()" [class.border-[#efb7bd]]="!isCorrect()">
            <div class="mx-auto grid max-w-5xl gap-5 px-5 py-5 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p class="font-display text-[22px] font-extrabold" [class.text-[#237a3a]]="isCorrect()" [class.text-[#9f2437]]="!isCorrect()">
                  {{ isCorrect() ? 'Acertou!' : 'Ainda não.' }}
                </p>
                <p class="mt-2 text-[14px] leading-6 text-[#4f474a]">
                  Resposta certa: <strong>{{ correctAnswer() }}</strong>. {{ currentQuestion().explanation }}
                </p>
                <p class="mt-2 text-[12px] leading-5 text-[#7a7276]">
                  Encontra isto em: <a [routerLink]="quiz()!.relatedContent.route" class="font-bold text-[#5c1e2f] underline">{{ currentQuestion().contentLocation }}</a>
                </p>
              </div>
              <button type="button" class="h-12 rounded-[8px] bg-[#5c1e2f] px-8 text-[13px] font-extrabold text-white" (click)="nextQuestion()">
                Continuar
              </button>
            </div>
          </section>
        }
      </main>
    }
  `,
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
