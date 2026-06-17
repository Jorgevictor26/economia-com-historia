import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Routes } from '@angular/router';
import { AuthStateService } from '../../../services/auth-state.service';
import { QuizService } from '../../../services/quiz.service';
import { BackToTopComponent } from '../../../components/back-to-top/back-to-top.component';
import { PublicFooterComponent } from '../../../components/public-footer/public-footer.component';
import { PublicNavbarComponent } from '../../../components/public-navbar/public-navbar.component';

@Component({
  selector: 'app-quizzes-page',
  imports: [RouterLink, PublicNavbarComponent, PublicFooterComponent, BackToTopComponent],
  template: `
    <section class="-m-6 min-h-dvh bg-[#f7f8f8] text-[#2c2729]">
      <app-public-navbar />

      <main class="w-full px-5 pb-12 pt-7">
        <section class="grid overflow-hidden rounded-[8px] border border-[#ded7da] bg-white shadow-[0_1px_4px_rgba(22,19,21,0.04)] lg:grid-cols-[minmax(0,1fr)_minmax(420px,42vw)]">
          <div class="flex min-h-[430px] flex-col justify-center px-8 py-8 md:px-12">
            <span class="w-fit rounded-[4px] bg-[#d4af37] px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#5c1e2f]">
              Destaque da semana
            </span>
            <h2 class="mt-5 max-w-[520px] font-display text-[32px] font-extrabold leading-[1.04] text-[#5c1e2f] md:text-[38px]">
              A Economia do Café em Angola: Do Império à Independência
            </h2>
            <p class="mt-5 max-w-[520px] text-[13px] leading-6 text-[#5f575b]">
              Explore as raízes estruturais da produção cafeeira e seu impacto na formação da infraestrutura logística angolana durante o século XX.
            </p>
            <div class="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-[#6f686b]">
              <span class="inline-flex items-center gap-2"><span class="text-[#5c1e2f]">▣</span>Nível Académico</span>
              <span class="inline-flex items-center gap-2"><span class="text-[#5c1e2f]">◷</span>25 Minutos</span>
              <span class="inline-flex items-center gap-2"><span class="text-[#5c1e2f]">▤</span>15 Questões</span>
            </div>
            <div class="mt-8">
              @if (auth.isAuthenticated()) {
                <a [routerLink]="[featuredQuiz().id, 'play']" class="inline-flex h-11 items-center justify-center rounded-[2px] bg-[#5c1e2f] px-7 text-[12px] font-extrabold text-white transition hover:bg-[#40081a]">
                  Começar Avaliação →
                </a>
              } @else {
                <button type="button" class="inline-flex h-11 items-center justify-center rounded-[2px] bg-[#5c1e2f] px-7 text-[12px] font-extrabold text-white transition hover:bg-[#40081a]" (click)="auth.requireLoginFor('fazer quiz')">
                  Começar Avaliação →
                </button>
              }
            </div>
          </div>

          <figure class="min-h-[320px] bg-[#d7d2c5] p-3 lg:min-h-[430px]">
            <img
              src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=80"
              alt="Plantação de café"
              class="h-full w-full object-cover"
            />
          </figure>
        </section>

        <section class="mt-8">
          <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 class="font-display text-[22px] font-extrabold text-[#40081a]">Avaliações Académicas</h2>
              <p class="mt-1 text-[12px] text-[#6f686b]">Teste os seus conhecimentos com rigor a nossas metodologias.</p>
            </div>

            <label class="relative w-full md:w-[300px]">
              <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#8a8587]">⌕</span>
              <input
                type="search"
                class="h-9 w-full rounded-[2px] border border-[#ded7da] bg-white pl-9 pr-3 text-[11px] text-[#2c2729] outline-none transition placeholder:text-[#8a8587] focus:border-[#8a4055] focus:ring-2 focus:ring-[#f1d8df]"
                placeholder="Procurar temas ou tópicos..."
                [value]="searchTerm()"
                (input)="searchTerm.set($any($event.target).value)"
              />
            </label>
          </div>

          <div class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            @for (quiz of filteredQuizzes(); track quiz.title) {
              <article class="flex min-h-[292px] flex-col rounded-[2px] border border-[#ded7da] bg-white shadow-[0_1px_2px_rgba(22,19,21,0.03)] transition hover:-translate-y-0.5 hover:shadow-lg">
                <div class="border-t-4 border-[#d4af37] px-6 pb-5 pt-4" [class.border-[#2a9d8f]]="quiz.accent === 'green'" [class.border-[#8a4055]]="quiz.accent === 'wine'">
                  <div class="flex items-start justify-between gap-4">
                    <span class="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#735c00]">{{ quiz.area }}</span>
                    <span class="text-[12px] text-[#6f686b]">{{ quiz.level }}</span>
                  </div>

                  <div class="mt-4 grid size-10 place-items-center rounded-[4px] bg-[#f7edef] text-[18px] text-[#5c1e2f]">{{ quiz.icon }}</div>

                  <h3 class="mt-4 min-h-[54px] font-display text-[21px] font-extrabold leading-tight text-[#40081a]">{{ quiz.title }}</h3>
                  <p class="mt-3 line-clamp-2 min-h-[48px] text-[13px] leading-6 text-[#5f575b]">{{ quiz.summary }}</p>

                  <div class="mt-4">
                    <div class="h-2 overflow-hidden rounded-full bg-[#ece8ea]">
                      <span class="block h-full rounded-full bg-[#2a9d8f]" [style.width.%]="quiz.progress"></span>
                    </div>
                    <div class="mt-2 flex justify-between text-[11px] text-[#8a8587]">
                      <span>Progresso Atual</span>
                      <span>{{ quiz.progress }}%</span>
                    </div>
                  </div>
                </div>

                <div class="mt-auto flex items-center justify-between gap-3 border-t border-[#f0ecee] px-6 py-4">
                  <span class="text-[12px] text-[#6f686b]">▦ {{ quiz.questions }} Perguntas</span>

                  @if (auth.isAuthenticated()) {
                    <a [routerLink]="[quiz.quizId, 'play']" class="text-[12px] font-extrabold text-[#5c1e2f] hover:underline">{{ quiz.action }} →</a>
                  } @else {
                    <button type="button" class="text-[12px] font-extrabold text-[#5c1e2f] hover:underline" (click)="auth.requireLoginFor('fazer quiz')">{{ quiz.action }} →</button>
                  }
                </div>
              </article>
            } @empty {
              <article class="rounded-[8px] border border-dashed border-[#ded7da] bg-white p-8 text-center md:col-span-2 xl:col-span-3">
                <h3 class="font-display text-[18px] font-extrabold text-[#40081a]">Nenhum quiz encontrado</h3>
                <p class="mt-2 text-[13px] text-[#6f686b]">Experimente procurar por outro tema ou dificuldade.</p>
              </article>
            }

            <article class="grid min-h-[292px] place-items-center rounded-[2px] border border-dashed border-[#cfc7cb] bg-white p-6 text-center">
              <div>
                <div class="mx-auto grid size-12 place-items-center text-[34px] text-[#c8c2c5]">⌂</div>
                <h3 class="mt-3 font-display text-[18px] font-extrabold text-[#c8c2c5]">Novas Avaliações</h3>
                <p class="mt-1 text-[13px] leading-5 text-[#b0aaad]">Disponíveis em Breve</p>
                <p class="mt-1 text-[12px] text-[#c8c2c5]">Próximos temas: A Era do Petróleo</p>
              </div>
            </article>
          </div>
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
  readonly searchTerm = signal('');

  readonly quizCards = [
    {
      quizId: 'reino-kongo',
      area: 'História Imperial',
      level: 'Intermédio',
      icon: '♜',
      title: 'O Reino do Congo e a Diplomacia Europeia',
      summary: 'Analise duas instituições diplomáticas entre a corte do Manicongo e as potências europeias.',
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
          <a routerLink="/app/quizzes" class="mt-5 inline-flex h-9 items-center justify-center rounded-[8px] bg-[#5c1e2f] px-4 text-[12px] font-bold text-white">Ver quizzes</a>
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
