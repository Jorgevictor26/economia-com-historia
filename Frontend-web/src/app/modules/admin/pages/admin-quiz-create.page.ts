import { Component, computed, signal } from '@angular/core';
import { AdminConsoleShellComponent } from '../components/admin-console-shell.component';

@Component({
  selector: 'app-admin-quiz-create-page',
  imports: [AdminConsoleShellComponent],
  template: `
    <app-admin-console-shell activeItem="quiz">
      <main class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <section class="min-w-0">
          <header class="overflow-hidden rounded-[8px] border border-[#eadfe3] bg-white shadow-[0_18px_45px_rgba(27,22,30,0.05)]">
            <div class="grid gap-6 p-7 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div>
                <p class="inline-flex items-center gap-2 rounded-[999px] bg-[#f7edef] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8a1238]">
                  <span class="material-icon" aria-hidden="true">auto_awesome</span>
                  Criacao assistida
                </p>
                <h1 class="mt-4 font-display text-[32px] font-extrabold leading-tight text-[#5c1e2f]">Geracao de Quiz</h1>
                <p class="mt-3 max-w-[680px] text-[14px] leading-6 text-[#534345]">
                  Construa avaliacoes ligadas a conteudos academicos com apoio de IA, revisao editorial e parametros de aprendizagem.
                </p>
              </div>

              <section class="rounded-[8px] border border-[#e6dde1] bg-[#fbfaf7] p-4">
                <p class="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8a8587]">Conteudo selecionado</p>
                <h2 class="mt-2 font-display text-[20px] font-extrabold leading-tight text-[#3a232b]">Moeda, inflacao e memoria social</h2>
                <div class="mt-4 grid grid-cols-2 gap-3 text-[12px]">
                  <span class="rounded-[8px] bg-white px-3 py-2 text-[#534345]"><b class="block text-[#5c1e2f]">Categoria</b>Economia</span>
                  <span class="rounded-[8px] bg-white px-3 py-2 text-[#534345]"><b class="block text-[#5c1e2f]">Leitura</b>10 min</span>
                  <span class="rounded-[8px] bg-white px-3 py-2 text-[#534345]"><b class="block text-[#5c1e2f]">Perguntas</b>{{ previewQuestions().length }} criadas</span>
                  <span class="rounded-[8px] bg-white px-3 py-2 text-[#534345]"><b class="block text-[#5c1e2f]">Nivel</b>{{ selectedDifficulty() }}</span>
                </div>
              </section>
            </div>
          </header>

          <section class="mt-6 grid gap-4 md:grid-cols-4">
            @for (metric of metrics; track metric.label) {
              <article class="rounded-[8px] border border-[#eadfe3] bg-white p-5 shadow-[0_12px_30px_rgba(27,22,30,0.045)]">
                <div class="flex items-center justify-between gap-3">
                  <span class="grid size-10 place-items-center rounded-[8px] bg-[#f7edef] text-[#8a1238]">
                    <span class="material-icon" aria-hidden="true">{{ metric.icon }}</span>
                  </span>
                  <span class="text-[11px] font-extrabold uppercase text-[#8a8587]">{{ metric.badge }}</span>
                </div>
                <strong class="mt-4 block font-display text-[27px] font-extrabold leading-none text-[#5c1e2f]">{{ metric.value }}</strong>
                <p class="mt-2 text-[13px] font-bold text-[#3a3236]">{{ metric.label }}</p>
                <p class="mt-1 text-[12px] leading-5 text-[#6f686b]">{{ metric.description }}</p>
              </article>
            }
          </section>

          <section class="mt-6 rounded-[8px] border border-[#eadfe3] bg-white p-6 shadow-[0_18px_45px_rgba(27,22,30,0.05)]">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p class="inline-flex items-center gap-2 rounded-[999px] bg-[#fff7df] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#735c00]">
                  <span class="material-icon" aria-hidden="true">{{ creationMode() === 'ai' ? 'neurology' : 'edit_note' }}</span>
                  {{ creationMode() === 'ai' ? 'Assistente IA premium' : 'Criacao manual' }}
                </p>
                <h2 class="mt-3 font-display text-[24px] font-extrabold text-[#5c1e2f]">{{ creationMode() === 'ai' ? 'Gerar com IA' : 'Criar quiz manualmente' }}</h2>
                <p class="mt-2 max-w-[680px] text-[13px] leading-6 text-[#6f686b]">
                  {{ creationMode() === 'ai'
                    ? 'Descreva o foco da avaliacao e deixe a plataforma sugerir perguntas, alternativas e niveis de dificuldade.'
                    : 'Monte perguntas uma a uma, defina as alternativas e marque a resposta correta antes da revisao editorial.' }}
                </p>
              </div>
              <div class="flex rounded-[8px] border border-[#eadfe3] bg-[#fbfaf7] p-1">
                <button
                  type="button"
                  class="inline-flex h-10 items-center gap-2 rounded-[6px] px-4 text-[12px] font-extrabold transition"
                  [class.bg-[#5c1e2f]]="creationMode() === 'ai'"
                  [class.text-white]="creationMode() === 'ai'"
                  [class.text-[#5c1e2f]]="creationMode() !== 'ai'"
                  (click)="creationMode.set('ai')"
                >
                  <span class="material-icon" aria-hidden="true">auto_awesome</span>
                  Gerar por IA
                </button>
                <button
                  type="button"
                  class="inline-flex h-10 items-center gap-2 rounded-[6px] px-4 text-[12px] font-extrabold transition"
                  [class.bg-[#5c1e2f]]="creationMode() === 'manual'"
                  [class.text-white]="creationMode() === 'manual'"
                  [class.text-[#5c1e2f]]="creationMode() !== 'manual'"
                  (click)="creationMode.set('manual')"
                >
                  <span class="material-icon" aria-hidden="true">edit_square</span>
                  Manual
                </button>
              </div>
            </div>

            @if (creationMode() === 'ai') {
              <textarea
                class="mt-5 min-h-[170px] w-full resize-y rounded-[8px] border border-[#ded8dd] bg-[#fbfaf7] px-4 py-4 text-[14px] leading-6 text-[#2c2729] outline-none placeholder:text-[#9a949d] focus:border-[#5c1e2f] focus:shadow-[0_0_0_3px_rgba(227,212,216,0.65)]"
                placeholder="Ex: Gerar perguntas sobre instrumentos monetarios, impacto da inflacao no consumo familiar e papel do banco central, com alternativas plausiveis e uma explicacao curta para cada resposta."
                [value]="aiPrompt()"
                (input)="setAiPrompt($event)"
              ></textarea>

              <div class="mt-4 flex flex-wrap gap-2">
                @for (suggestion of promptSuggestions; track suggestion) {
                  <button type="button" (click)="useSuggestion(suggestion)" class="rounded-[999px] border border-[#eadfe3] bg-white px-3 py-2 text-[12px] font-bold text-[#5c1e2f] hover:bg-[#f7edef]">{{ suggestion }}</button>
                }
              </div>

              <div class="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#f0e8eb] pt-5">
                <div class="flex flex-wrap gap-2">
                  @for (tag of generationTags; track tag) {
                    <span class="rounded-[999px] bg-[#f7edef] px-3 py-1 text-[11px] font-extrabold text-[#8a1238]">{{ tag }}</span>
                  }
                </div>
                <button type="button" (click)="generateAiDraft()" class="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-[#5c1e2f] px-6 text-[13px] font-extrabold text-white shadow-[0_14px_28px_rgba(92,30,47,0.22)] hover:bg-[#471525]">
                  <span class="material-icon" aria-hidden="true">auto_awesome</span>
                  Gerar rascunho do quiz
                </button>
              </div>
            } @else {
              <form class="mt-5 grid gap-4" (submit)="$event.preventDefault()">
                <label class="grid gap-2">
                  <span class="text-[12px] font-extrabold text-[#534345]">Pergunta</span>
                  <textarea
                    class="min-h-[110px] resize-y rounded-[8px] border border-[#ded8dd] bg-[#fbfaf7] px-4 py-3 text-[14px] leading-6 text-[#2c2729] outline-none placeholder:text-[#9a949d] focus:border-[#5c1e2f] focus:shadow-[0_0_0_3px_rgba(227,212,216,0.65)]"
                    placeholder="Escreva a pergunta que o estudante deve responder..."
                    [value]="manualQuestion()"
                    (input)="setManualQuestion($event)"
                  ></textarea>
                </label>

                <div class="grid gap-4 md:grid-cols-3">
                  <label class="grid gap-2">
                    <span class="text-[12px] font-extrabold text-[#534345]">Tipo</span>
                    <select [value]="manualKind()" (change)="setManualKind($event)" class="h-11 rounded-[8px] border border-[#ded8dd] bg-white px-3 text-[13px] text-[#534345] outline-none focus:border-[#5c1e2f]">
                      <option>Multipla escolha</option>
                      <option>Verdadeiro/Falso</option>
                      <option>Aplicacao</option>
                    </select>
                  </label>
                  <label class="grid gap-2">
                    <span class="text-[12px] font-extrabold text-[#534345]">Dificuldade</span>
                    <select [value]="selectedDifficulty()" (change)="setSelectedDifficulty($event)" class="h-11 rounded-[8px] border border-[#ded8dd] bg-white px-3 text-[13px] text-[#534345] outline-none focus:border-[#5c1e2f]">
                      <option>Basico</option>
                      <option>Medio</option>
                      <option>Avancado</option>
                    </select>
                  </label>
                  <label class="grid gap-2">
                    <span class="text-[12px] font-extrabold text-[#534345]">XP atribuido</span>
                    <input type="number" [value]="manualXp()" (input)="setManualXp($event)" class="h-11 rounded-[8px] border border-[#ded8dd] bg-white px-3 text-[13px] text-[#534345] outline-none focus:border-[#5c1e2f]" />
                  </label>
                </div>

                <section class="rounded-[8px] border border-[#eadfe3] bg-[#fbfaf7] p-4">
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <h3 class="text-[13px] font-extrabold text-[#5c1e2f]">Alternativas</h3>
                    <span class="text-[11px] font-bold text-[#8a8587]">Marque uma resposta correta</span>
                  </div>
                  <div class="mt-4 grid gap-3 md:grid-cols-2">
                    @for (letter of ['A', 'B', 'C', 'D']; track letter) {
                      <label class="flex min-h-12 items-center gap-3 rounded-[8px] border border-[#e5dde2] bg-white px-3">
                        <input type="radio" name="manualCorrectOption" class="accent-bordeaux" [checked]="manualCorrectOption() === letter" (change)="manualCorrectOption.set(letter)" />
                        <span class="grid size-7 shrink-0 place-items-center rounded-full border border-[#5c1e2f] text-[11px] font-extrabold text-[#5c1e2f]">{{ letter }}</span>
                        <input type="text" [value]="manualOptions()[letter]" (input)="setManualOption(letter, $event)" [placeholder]="'Alternativa ' + letter" class="min-w-0 flex-1 border-0 bg-transparent px-0 text-[13px] text-[#534345] outline-none" />
                      </label>
                    }
                  </div>
                </section>

                <div class="flex flex-wrap items-center justify-between gap-4 border-t border-[#f0e8eb] pt-5">
                  <button type="button" (click)="resetManualForm()" class="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-[#5c1e2f] bg-white px-5 text-[13px] font-extrabold text-[#5c1e2f]">
                    <span class="material-icon" aria-hidden="true">add</span>
                    Adicionar outra pergunta
                  </button>
                  <button type="submit" (click)="saveManualQuestion()" class="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-[#5c1e2f] px-6 text-[13px] font-extrabold text-white shadow-[0_14px_28px_rgba(92,30,47,0.22)] hover:bg-[#471525]">
                    <span class="material-icon" aria-hidden="true">playlist_add_check</span>
                    Guardar pergunta
                  </button>
                </div>
              </form>
            }
          </section>

          <section class="mt-6 rounded-[8px] border border-[#eadfe3] bg-white p-6 shadow-[0_18px_45px_rgba(27,22,30,0.05)]">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 class="font-display text-[24px] font-extrabold text-[#5c1e2f]">Pre-visualizacao do Quiz</h2>
                <p class="mt-2 text-[13px] leading-6 text-[#6f686b]">Amostra editorial das perguntas que serao revistas antes da publicacao.</p>
              </div>
              <span class="rounded-[999px] bg-[#fbfaf7] px-3 py-1 text-[11px] font-extrabold uppercase text-[#735c00]">{{ previewQuestions().length }} de 8 perguntas</span>
            </div>

            <div class="mt-5 grid gap-4">
              @for (question of previewQuestions(); track question.title; let i = $index) {
                <article class="rounded-[8px] border border-[#eadfe3] bg-[#fbfaf7] p-5">
                  <div class="flex flex-wrap items-start justify-between gap-4">
                    <div class="flex min-w-0 gap-4">
                      <span class="grid size-10 shrink-0 place-items-center rounded-full bg-[#5c1e2f] text-[13px] font-extrabold text-white">Q{{ i + 1 }}</span>
                      <div class="min-w-0">
                        <div class="flex flex-wrap gap-2">
                          <span class="rounded-[999px] bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#5c1e2f]">{{ question.kind }}</span>
                          <span class="rounded-[999px] bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#735c00]">{{ question.difficulty }}</span>
                          <span class="rounded-[999px] bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#6f686b]">{{ question.xp }} XP</span>
                        </div>
                        <h3 class="mt-3 text-[16px] font-extrabold leading-6 text-[#2c2729]">{{ question.title }}</h3>
                      </div>
                    </div>
                    <button type="button" (click)="editQuestion(i)" class="grid size-9 place-items-center rounded-[8px] border border-[#eadfe3] bg-white text-[#5c1e2f]" aria-label="Editar pergunta">
                      <span class="material-icon" aria-hidden="true">edit</span>
                    </button>
                  </div>

                  <div class="mt-4 grid gap-2 md:grid-cols-2">
                    @for (option of question.options; track option.text) {
                      <div
                        class="flex min-h-11 items-center gap-3 rounded-[8px] border bg-white px-3 text-[13px]"
                        [class.border-[#5c1e2f]]="option.correct"
                        [class.text-[#5c1e2f]]="option.correct"
                        [class.border-[#e5dde2]]="!option.correct"
                        [class.text-[#534345]]="!option.correct"
                      >
                        <span class="grid size-6 shrink-0 place-items-center rounded-full border border-current text-[10px] font-extrabold">{{ option.letter }}</span>
                        {{ option.text }}
                      </div>
                    }
                  </div>
                </article>
              }
            </div>
          </section>
        </section>

        <aside class="grid content-start gap-5">
          <section class="rounded-[8px] border border-[#eadfe3] bg-white p-5 shadow-[0_18px_45px_rgba(27,22,30,0.05)]">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8a8587]">Estado do quiz</p>
                <strong class="mt-1 block font-display text-[25px] font-extrabold text-[#5c1e2f]">{{ status() }}</strong>
              </div>
              <span class="grid size-11 place-items-center rounded-[8px] bg-[#fff7df] text-[#735c00]">
                <span class="material-icon" aria-hidden="true">pending_actions</span>
              </span>
            </div>

            <div class="mt-5">
              <div class="flex items-center justify-between text-[12px] font-bold text-[#534345]">
                <span>Progresso editorial</span>
                <span>{{ progress() }}%</span>
              </div>
              <div class="mt-2 h-2 overflow-hidden rounded-full bg-[#eee6e9]">
                <span class="block h-full rounded-full bg-[#5c1e2f]" [style.width.%]="progress()"></span>
              </div>
            </div>
          </section>

          <section class="rounded-[8px] border border-[#eadfe3] bg-white p-5 shadow-[0_18px_45px_rgba(27,22,30,0.05)]">
            <h2 class="font-display text-[18px] font-extrabold text-[#5c1e2f]">Centro de controlo</h2>
            <div class="mt-4 grid gap-3">
              @for (item of validationChecklist; track item.label) {
                <p class="flex items-center gap-3 text-[13px] font-semibold text-[#534345]">
                  <span class="grid size-7 place-items-center rounded-full" [class.bg-[#f7edef]]="item.done" [class.text-[#5c1e2f]]="item.done" [class.bg-[#f0eef0]]="!item.done" [class.text-[#8a8587]]="!item.done">
                    <span class="material-icon text-[18px]" aria-hidden="true">{{ item.done ? 'check' : 'radio_button_unchecked' }}</span>
                  </span>
                  {{ item.label }}
                </p>
              }
            </div>
          </section>

          <section class="rounded-[8px] border border-[#eadfe3] bg-white p-5 shadow-[0_18px_45px_rgba(27,22,30,0.05)]">
            <h2 class="font-display text-[18px] font-extrabold text-[#5c1e2f]">Publicacao</h2>
            <div class="mt-4 grid gap-3 text-[13px] font-semibold text-[#534345]">
              <label class="flex items-center justify-between gap-4">Visivel para estudantes <input type="checkbox" [checked]="visibleForStudents()" (change)="visibleForStudents.update(toggle)" class="accent-bordeaux" /></label>
              <label class="flex items-center justify-between gap-4">Exigir login <input type="checkbox" [checked]="requireLogin()" (change)="requireLogin.update(toggle)" class="accent-bordeaux" /></label>
              <label class="flex items-center justify-between gap-4">Entrar no ranking <input type="checkbox" [checked]="rankingEnabled()" (change)="rankingEnabled.update(toggle)" class="accent-bordeaux" /></label>
            </div>
            <div class="mt-5 grid gap-3">
              <button type="button" (click)="publish()" class="h-11 rounded-[8px] bg-[#5c1e2f] px-4 text-[13px] font-extrabold text-white shadow-[0_12px_24px_rgba(92,30,47,0.2)]">Publicar quiz</button>
              <button type="button" (click)="saveDraft()" class="h-11 rounded-[8px] border border-[#5c1e2f] bg-white px-4 text-[13px] font-extrabold text-[#5c1e2f]">Guardar rascunho</button>
            </div>
          </section>

          <section class="rounded-[8px] border border-[#eadfe3] bg-white p-5 shadow-[0_18px_45px_rgba(27,22,30,0.05)]">
            <h2 class="font-display text-[18px] font-extrabold text-[#5c1e2f]">Estatisticas rapidas</h2>
            <div class="mt-4 grid grid-cols-2 gap-3">
              @for (stat of quickStats; track stat.label) {
                <div class="rounded-[8px] bg-[#fbfaf7] p-3">
                  <strong class="block font-display text-[20px] font-extrabold text-[#5c1e2f]">{{ stat.value }}</strong>
                  <span class="mt-1 block text-[11px] font-semibold text-[#6f686b]">{{ stat.label }}</span>
                </div>
              }
            </div>
          </section>
        </aside>
      </main>
    </app-admin-console-shell>
  `,
  styles: [
    `
      .material-icon {
        display: inline-grid;
        place-items: center;
        font-family: 'Material Symbols Outlined';
        font-size: 20px;
        font-style: normal;
        font-weight: 400;
        line-height: 1;
        text-transform: none;
        white-space: nowrap;
        font-feature-settings: 'liga';
        -webkit-font-feature-settings: 'liga';
        font-variation-settings: 'FILL' 0, 'wght' 430, 'GRAD' 0, 'opsz' 24;
      }
    `,
  ],
})
export class AdminQuizCreatePage {
  readonly creationMode = signal<'ai' | 'manual'>('ai');
  readonly aiPrompt = signal('');
  readonly manualQuestion = signal('');
  readonly manualKind = signal('Multipla escolha');
  readonly selectedDifficulty = signal('Medio');
  readonly manualXp = signal(15);
  readonly manualCorrectOption = signal('A');
  readonly manualOptions = signal<Record<string, string>>({ A: '', B: '', C: '', D: '' });
  readonly status = signal('Rascunho');
  readonly visibleForStudents = signal(false);
  readonly requireLogin = signal(true);
  readonly rankingEnabled = signal(true);
  readonly toggle = (value: boolean) => !value;

  readonly progress = computed(() => Math.min(100, Math.round((this.previewQuestions().length / 8) * 100)));

  readonly metrics = [
    { icon: 'format_list_numbered', value: '8', label: 'Numero de perguntas', badge: 'IA', description: 'Quantidade sugerida para avaliacao curta.' },
    { icon: 'speed', value: 'Medio', label: 'Dificuldade', badge: 'Base', description: 'Equilibrado para aprendizagem progressiva.' },
    { icon: 'workspace_premium', value: '120', label: 'XP total', badge: 'Ranking', description: 'Pontuacao distribuida por pergunta.' },
    { icon: 'schedule', value: '10 min', label: 'Tempo estimado', badge: 'Aluno', description: 'Tempo medio para responder com calma.' },
  ];

  readonly promptSuggestions = ['Gerar com contexto historico', 'Focar conceitos economicos', 'Adicionar explicacoes curtas', 'Criar alternativas plausiveis'];
  readonly generationTags = ['Multipla escolha', 'Aplicacao', 'Com feedback', 'Nivel medio'];

  readonly previewQuestions = signal([
    {
      kind: 'Multipla escolha',
      difficulty: 'Medio',
      xp: 15,
      title: 'Qual instrumento ajuda o banco central a controlar a liquidez na economia?',
      options: [
        { letter: 'A', text: 'Operacoes de mercado aberto', correct: true },
        { letter: 'B', text: 'Aumento da importacao privada', correct: false },
        { letter: 'C', text: 'Reducao da memoria fiscal', correct: false },
        { letter: 'D', text: 'Fixacao cultural de precos', correct: false },
      ],
    },
    {
      kind: 'Aplicacao',
      difficulty: 'Intermedio',
      xp: 20,
      title: 'Como a inflacao persistente altera o poder de compra das familias?',
      options: [
        { letter: 'A', text: 'Aumenta o consumo real automaticamente', correct: false },
        { letter: 'B', text: 'Reduz a quantidade de bens comprados com a mesma renda', correct: true },
        { letter: 'C', text: 'Elimina a necessidade de poupanca', correct: false },
        { letter: 'D', text: 'Mantem todos os salarios indexados', correct: false },
      ],
    },
  ]);

  get validationChecklist() {
    return [
      { label: 'Conteudo relacionado definido', done: true },
      { label: 'Perguntas com alternativas', done: this.previewQuestions().length > 0 },
      { label: 'Respostas corretas marcadas', done: this.previewQuestions().every((question) => question.options.some((option) => option.correct)) },
      { label: 'Revisao editorial pendente', done: this.status() === 'Publicado' },
      { label: 'Publicacao autorizada', done: this.visibleForStudents() && this.requireLogin() },
    ];
  }

  get quickStats() {
    return [
      { value: `${this.previewQuestions().length}/8`, label: 'Perguntas prontas' },
      { value: `${this.previewQuestions().reduce((total, question) => total + question.xp, 0)}`, label: 'XP criado' },
      { value: `${this.generationTags.length}`, label: 'Tags ativas' },
      { value: `${this.progress()}%`, label: 'Qualidade' },
    ];
  }

  setAiPrompt(event: Event): void { this.aiPrompt.set(this.eventValue(event)); }
  setManualQuestion(event: Event): void { this.manualQuestion.set(this.eventValue(event)); }
  setManualKind(event: Event): void { this.manualKind.set(this.eventValue(event)); }
  setSelectedDifficulty(event: Event): void { this.selectedDifficulty.set(this.eventValue(event)); }
  setManualXp(event: Event): void { this.manualXp.set(Number(this.eventValue(event)) || 0); }

  setManualOption(letter: string, event: Event): void {
    this.manualOptions.update((options) => ({ ...options, [letter]: this.eventValue(event) }));
  }

  useSuggestion(suggestion: string): void {
    const current = this.aiPrompt().trim();
    this.aiPrompt.set(current ? `${current}\n${suggestion}.` : `${suggestion}.`);
  }

  generateAiDraft(): void {
    const base = this.aiPrompt().trim() || 'instrumentos monetarios, inflacao e memoria social';
    this.previewQuestions.update((questions) => [
      ...questions,
      {
        kind: 'Multipla escolha',
        difficulty: 'Medio',
        xp: 15,
        title: `Pergunta gerada sobre ${base.slice(0, 72)}`,
        options: [
          { letter: 'A', text: 'Interpretacao economica contextualizada', correct: true },
          { letter: 'B', text: 'Resposta sem relacao historica', correct: false },
          { letter: 'C', text: 'Hipotese sem evidencia documental', correct: false },
          { letter: 'D', text: 'Conclusao fora do tema central', correct: false },
        ],
      },
    ]);
    this.status.set('Rascunho gerado');
  }

  saveManualQuestion(): void {
    const options = this.manualOptions();
    const hasText = this.manualQuestion().trim().length > 0;
    if (!hasText) {
      this.status.set('Pergunta incompleta');
      return;
    }

    this.previewQuestions.update((questions) => [
      ...questions,
      {
        kind: this.manualKind(),
        difficulty: this.selectedDifficulty(),
        xp: this.manualXp(),
        title: this.manualQuestion(),
        options: ['A', 'B', 'C', 'D'].map((letter) => ({
          letter,
          text: options[letter]?.trim() || `Alternativa ${letter}`,
          correct: letter === this.manualCorrectOption(),
        })),
      },
    ]);
    this.status.set('Pergunta guardada');
    this.resetManualForm();
  }

  editQuestion(index: number): void {
    const question = this.previewQuestions()[index];
    this.creationMode.set('manual');
    this.manualQuestion.set(question.title);
    this.manualKind.set(question.kind);
    this.selectedDifficulty.set(question.difficulty);
    this.manualXp.set(question.xp);
    this.manualCorrectOption.set(question.options.find((option) => option.correct)?.letter ?? 'A');
    this.manualOptions.set(Object.fromEntries(question.options.map((option) => [option.letter, option.text])));
    this.previewQuestions.update((questions) => questions.filter((_, currentIndex) => currentIndex !== index));
  }

  resetManualForm(): void {
    this.manualQuestion.set('');
    this.manualKind.set('Multipla escolha');
    this.selectedDifficulty.set('Medio');
    this.manualXp.set(15);
    this.manualCorrectOption.set('A');
    this.manualOptions.set({ A: '', B: '', C: '', D: '' });
  }

  saveDraft(): void {
    this.status.set('Rascunho guardado');
  }

  publish(): void {
    this.status.set('Publicado');
    this.visibleForStudents.set(true);
  }

  private eventValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
  }
}
