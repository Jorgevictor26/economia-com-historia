import { Component, computed, signal } from '@angular/core';
import { AdminConsoleShellComponent } from '../../admin/components/admin-console-shell.component';

@Component({
  selector: 'app-admin-quiz-create-page',
  imports: [AdminConsoleShellComponent],
  templateUrl: './admin-quiz-create.page.html',
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
  readonly manualKind = signal('Múltipla escolha');
  readonly selectedDifficulty = signal('Médio');
  readonly manualXp = signal(15);
  readonly manualCorrectOption = signal('A');
  readonly manualOptions = signal<Record<string, string>>({ A: '', B: '', C: '', D: '' });
  readonly status = signal('Rascunho');
  readonly coverUploaded = signal(false);
  readonly coverPreview = signal<string | null>(null);
  readonly coverFileName = signal('');
  readonly previewOpen = signal(false);
  readonly currentStep = signal(1);
  readonly steps = [
    { value: 1, title: 'Modo' },
    { value: 2, title: 'Perguntas' },
    { value: 3, title: 'Foto' },
    { value: 4, title: 'Acesso' },
    { value: 5, title: 'Revisao' },
  ];
  readonly visibleForStudents = signal(false);
  readonly requireLogin = signal(true);
  readonly rankingEnabled = signal(true);
  readonly toggle = (value: boolean) => !value;

  readonly progress = computed(() => Math.min(100, Math.round((this.previewQuestions().length / 8) * 100)));

  readonly metrics = [
    { icon: 'format_list_numbered', value: '8', label: 'Numero de perguntas', badge: 'IA', description: 'Quantidade sugerida para avaliacao curta.' },
    { icon: 'speed', value: 'Médio', label: 'Dificuldade', badge: 'Base', description: 'Equilibrado para aprendizagem progressiva.' },
    { icon: 'workspace_premium', value: '120', label: 'XP total', badge: 'Ranking', description: 'Pontuacao distribuida por pergunta.' },
    { icon: 'schedule', value: '10 min', label: 'Tempo estimado', badge: 'Aluno', description: 'Tempo medio para responder com calma.' },
  ];

  readonly promptSuggestions = ['Gerar com contexto histórico', 'Focar conceitos economicos', 'Adicionar explicações curtas', 'Criar alternativas plausiveis'];
  readonly generationTags = ['Múltipla escolha', 'Aplicação', 'Com feedback', 'Nível medio'];

  readonly previewQuestions = signal([
    {
      kind: 'Múltipla escolha',
      difficulty: 'Médio',
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
      kind: 'Aplicação',
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
        kind: 'Múltipla escolha',
        difficulty: 'Médio',
        xp: 15,
        title: `Pergunta gerada sobre ${base.slice(0, 72)}`,
        options: [
          { letter: 'A', text: 'Interpretação económica contextualizada', correct: true },
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
    this.manualKind.set('Múltipla escolha');
    this.selectedDifficulty.set('Médio');
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
    this.previewOpen.set(false);
  }

  nextStep(): void {
    this.currentStep.update((step) => Math.min(step + 1, this.steps.length));
  }

  previousStep(): void {
    this.currentStep.update((step) => Math.max(step - 1, 1));
  }

  openPreview(): void {
    this.previewOpen.set(true);
    this.status.set('Em revisao');
  }

  closePreview(): void {
    this.previewOpen.set(false);
  }

  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.coverPreview.set(reader.result as string);
      this.coverFileName.set(file.name);
      this.coverUploaded.set(true);
    };
    reader.readAsDataURL(file);
  }

  clearCover(): void {
    this.coverPreview.set(null);
    this.coverFileName.set('');
    this.coverUploaded.set(false);
  }

  private eventValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
  }
}



