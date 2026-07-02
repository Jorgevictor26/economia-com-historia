import { Component, computed, inject, signal } from '@angular/core';
import { BackendContent, ContentService } from '../../../services/content.service';
import { CreateQuestionPayload, QuizService } from '../../../services/quiz.service';
import { ToastService } from '../../../services/toast.service';
import { AdminConsoleShellComponent } from '../../admin/components/admin-console-shell.component';

type Difficulty = 'facil' | 'medio' | 'dificil';
type CorrectOption = 'A' | 'B' | 'C' | 'D';

interface ManualQuestion {
  title: string;
  explanation: string;
  options: Array<{ letter: CorrectOption; text: string; correct: boolean }>;
}

@Component({
  selector: 'app-quiz-create-page',
  imports: [AdminConsoleShellComponent],
  templateUrl: './quiz-create.page.html',
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
export class QuizCreatePage {
  private readonly contentService = inject(ContentService);
  private readonly quizService = inject(QuizService);
  private readonly toastService = inject(ToastService);

  readonly creationMode = signal<'ai' | 'manual'>('manual');
  readonly aiPrompt = signal('');
  readonly title = signal('');
  readonly description = signal('');
  readonly selectedContentId = signal('');
  readonly selectedDifficulty = signal<Difficulty>('medio');
  readonly manualQuestion = signal('');
  readonly manualExplanation = signal('');
  readonly manualCorrectOption = signal<CorrectOption>('A');
  readonly manualOptions = signal<Record<CorrectOption, string>>({ A: '', B: '', C: '', D: '' });
  readonly category = signal('Economia');
  readonly status = signal('Rascunho');
  readonly previewOpen = signal(false);
  readonly coverPreview = signal<string | null>(null);
  readonly coverFileName = signal('');
  readonly currentStep = signal(1);
  readonly contents = signal<BackendContent[]>([]);
  readonly isSaving = signal(false);
  readonly formError = signal('');
  readonly successMessage = signal('');
  readonly optionLetters: CorrectOption[] = ['A', 'B', 'C', 'D'];
  readonly minQuestions = 5;
  readonly maxQuestions = 15;
  readonly steps = [
    { value: 1, title: 'Modo' },
    { value: 2, title: 'Dados' },
    { value: 3, title: 'Perguntas' },
    { value: 4, title: 'Capa' },
    { value: 5, title: 'Revisao' },
  ];
  readonly promptSuggestions = ['Gerar com contexto historico', 'Focar conceitos economicos', 'Adicionar explicacoes curtas', 'Criar alternativas plausiveis'];
  readonly generationTags = ['Multipla escolha', 'Com feedback', 'Nivel medio'];

  readonly difficultyOptions = [
    { value: 'facil' as const, label: 'Fácil', xp: 10, timeSeconds: 30 },
    { value: 'medio' as const, label: 'Médio', xp: 20, timeSeconds: 20 },
    { value: 'dificil' as const, label: 'Difícil', xp: 30, timeSeconds: 15 },
  ];

  readonly defaultCoverLabel = computed(() => this.category().trim() || 'Quiz');

  readonly previewQuestions = signal<ManualQuestion[]>([]);
  readonly allQuestions = computed(() => this.currentQuestionReady()
    ? [...this.previewQuestions(), this.buildManualQuestion()]
    : this.previewQuestions(),
  );

  readonly selectedDifficultyConfig = computed(() =>
    this.difficultyOptions.find((option) => option.value === this.selectedDifficulty()) ?? this.difficultyOptions[1],
  );

  readonly progress = computed(() => Math.min(100, Math.round((this.allQuestions().length / this.maxQuestions) * 100)));

  readonly metrics = computed(() => [
    { icon: 'format_list_numbered', value: `${this.allQuestions().length}`, label: 'Perguntas', badge: this.creationMode() === 'ai' ? 'IA' : 'Manual', description: 'Perguntas prontas para publicar.' },
    { icon: 'speed', value: this.selectedDifficultyConfig().label, label: 'Dificuldade', badge: 'Base', description: 'Define XP e tempo limite automaticamente.' },
    { icon: 'workspace_premium', value: `${this.allQuestions().length * this.selectedDifficultyConfig().xp}`, label: 'XP total', badge: 'Auto', description: 'Calculado pelo backend.' },
    { icon: 'schedule', value: `${this.selectedDifficultyConfig().timeSeconds}s`, label: 'Tempo por pergunta', badge: 'Auto', description: 'Definido pelo backend.' },
  ]);

  constructor() {
    void this.loadContents();
  }

  get validationChecklist() {
    return [
      { label: 'Conteudo relacionado definido', done: Boolean(this.selectedContentId()) },
      { label: 'Titulo preenchido', done: this.title().trim().length > 0 },
      { label: `Entre ${this.minQuestions} e ${this.maxQuestions} perguntas`, done: this.allQuestions().length >= this.minQuestions && this.allQuestions().length <= this.maxQuestions },
      { label: 'Respostas corretas marcadas', done: this.allQuestions().every((question) => question.options.some((option) => option.correct)) },
      { label: 'Revisao editorial pendente', done: this.status() === 'Publicado' },
    ];
  }

  get quickStats() {
    return [
      { value: `${this.allQuestions().length}`, label: 'Perguntas prontas' },
      { value: `${this.allQuestions().length * this.selectedDifficultyConfig().xp}`, label: 'XP previsto' },
      { value: this.selectedDifficultyConfig().label, label: 'Dificuldade' },
      { value: `${this.selectedDifficultyConfig().timeSeconds}s`, label: 'Tempo/pergunta' },
    ];
  }

  setTitle(event: Event): void { this.title.set(this.eventValue(event)); }
  setDescription(event: Event): void { this.description.set(this.eventValue(event)); }
  setSelectedContent(event: Event): void { this.selectedContentId.set(this.eventValue(event)); }
  setSelectedDifficulty(event: Event): void { this.selectedDifficulty.set(this.eventValue(event) as Difficulty); }
  setAiPrompt(event: Event): void { this.aiPrompt.set(this.eventValue(event)); }
  setManualQuestion(event: Event): void { this.manualQuestion.set(this.eventValue(event)); }
  setManualExplanation(event: Event): void { this.manualExplanation.set(this.eventValue(event)); }

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
    };
    reader.readAsDataURL(file);
  }

  clearCover(): void {
    this.coverPreview.set(null);
    this.coverFileName.set('');
  }

  setManualOption(letter: CorrectOption, event: Event): void {
    this.manualOptions.update((options) => ({ ...options, [letter]: this.eventValue(event) }));
  }

  saveManualQuestion(): void {
    this.formError.set('');
    this.successMessage.set('');

    try {
      if (this.previewQuestions().length >= this.maxQuestions) {
        throw new Error(`O quiz pode ter no maximo ${this.maxQuestions} perguntas.`);
      }

      this.previewQuestions.update((questions) => [...questions, this.buildManualQuestion()]);
      this.status.set('Pergunta guardada');
      this.resetManualForm();
    } catch (error) {
      this.showError(this.errorMessage(error));
    }
  }

  useSuggestion(suggestion: string): void {
    const current = this.aiPrompt().trim();
    this.aiPrompt.set(current ? `${current}\n${suggestion}.` : `${suggestion}.`);
  }

  generateAiDraft(): void {
    if (this.previewQuestions().length >= this.maxQuestions) {
      this.showError(`O quiz pode ter no maximo ${this.maxQuestions} perguntas.`);
      return;
    }

    const base = this.aiPrompt().trim() || 'economia historica de Angola';
    this.previewQuestions.update((questions) => [
      ...questions,
      {
        title: `Pergunta gerada sobre ${base.slice(0, 72)}`,
        explanation: 'Resposta baseada no contexto do conteudo associado ao quiz.',
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

  editQuestion(index: number): void {
    const question = this.previewQuestions()[index];

    this.manualQuestion.set(question.title);
    this.manualCorrectOption.set(question.options.find((option) => option.correct)?.letter ?? 'A');
    this.manualOptions.set(Object.fromEntries(question.options.map((option) => [option.letter, option.text])) as Record<CorrectOption, string>);
    this.manualExplanation.set(question.explanation);
    this.previewQuestions.update((questions) => questions.filter((_, currentIndex) => currentIndex !== index));
  }

  removeQuestion(index: number): void {
    this.previewQuestions.update((questions) => questions.filter((_, currentIndex) => currentIndex !== index));
  }

  resetManualForm(): void {
    this.manualQuestion.set('');
    this.manualExplanation.set('');
    this.manualCorrectOption.set('A');
    this.manualOptions.set({ A: '', B: '', C: '', D: '' });
  }

  async saveDraft(): Promise<void> {
    this.captureCurrentQuestionIfPresent();
    await this.submit(true);
  }

  async publish(): Promise<void> {
    this.captureCurrentQuestionIfPresent();
    await this.submit(false);
  }

  nextStep(): void {
    this.formError.set('');

    if (this.currentStep() === 3 && !this.captureCurrentQuestionIfPresent()) {
      return;
    }

    this.currentStep.update((step) => Math.min(step + 1, this.steps.length));
  }

  previousStep(): void {
    this.currentStep.update((step) => Math.max(step - 1, 1));
  }

  openPreview(): void {
    this.captureCurrentQuestionIfPresent();
    this.previewOpen.set(true);
    this.status.set('Em revisao');
  }

  closePreview(): void {
    this.previewOpen.set(false);
  }

  private async loadContents(): Promise<void> {
    try {
      const page = await this.contentService.getAll();
      this.contents.set(page.data);
    } catch {
      this.showError('Nao foi possivel carregar os conteudos base.');
    }
  }

  private async submit(asDraft: boolean): Promise<void> {
    if (this.isSaving()) {
      return;
    }

    this.formError.set('');
    this.successMessage.set('');
    this.isSaving.set(true);
    this.status.set(asDraft ? 'A guardar rascunho...' : 'A publicar...');

    try {
      const quiz = await this.quizService.create({
        content_id: this.requireText(this.selectedContentId(), 'conteudo base'),
        category_id: this.requireContentCategoryId(),
        title: this.requireText(this.title(), 'titulo'),
        description: this.description().trim() || null,
        cover_url: this.coverPreview(),
        difficulty: this.selectedDifficultyConfig().value,
        status: asDraft ? 'inactive' : 'active',
      });

      for (const [index, question] of this.requiredQuestions().entries()) {
        await this.quizService.createQuestion(quiz.id, this.toQuestionPayload(question, index + 1));
      }

      this.status.set(asDraft ? 'Rascunho guardado' : 'Publicado');
      this.previewOpen.set(false);
      this.showSuccess(asDraft ? 'Quiz guardado com sucesso.' : 'Quiz criado com sucesso.');
    } catch (error) {
      this.status.set('Rascunho');
      this.showError(this.errorMessage(error));
    } finally {
      this.isSaving.set(false);
    }
  }

  private buildManualQuestion(): ManualQuestion {
    const question = this.requireText(this.manualQuestion(), 'pergunta');
    const options = this.manualOptions();

    (['A', 'B', 'C', 'D'] as CorrectOption[]).forEach((letter) => {
      this.requireText(options[letter], `alternativa ${letter}`);
    });

    return {
      title: question,
      explanation: this.manualExplanation().trim(),
      options: (['A', 'B', 'C', 'D'] as CorrectOption[]).map((letter) => ({
        letter,
        text: options[letter].trim(),
        correct: letter === this.manualCorrectOption(),
      })),
    };
  }

  private requiredQuestions(): ManualQuestion[] {
    const questions = this.allQuestions();

    if (questions.length < this.minQuestions) {
      throw new Error(`Adicione pelo menos ${this.minQuestions} perguntas.`);
    }

    if (questions.length > this.maxQuestions) {
      throw new Error(`O quiz pode ter no maximo ${this.maxQuestions} perguntas.`);
    }

    return questions;
  }

  private captureCurrentQuestionIfPresent(): boolean {
    if (!this.currentQuestionTouched()) {
      return true;
    }

    try {
      if (this.previewQuestions().length >= this.maxQuestions) {
        throw new Error(`O quiz pode ter no maximo ${this.maxQuestions} perguntas.`);
      }

      this.previewQuestions.update((questions) => [...questions, this.buildManualQuestion()]);
      this.resetManualForm();
      return true;
    } catch (error) {
      this.showError(this.errorMessage(error));
      return false;
    }
  }

  private currentQuestionTouched(): boolean {
    const options = this.manualOptions();

    return Boolean(
      this.manualQuestion().trim()
      || this.manualExplanation().trim()
      || options.A.trim()
      || options.B.trim()
      || options.C.trim()
      || options.D.trim(),
    );
  }

  private currentQuestionReady(): boolean {
    const options = this.manualOptions();

    return Boolean(
      this.manualQuestion().trim()
      && options.A.trim()
      && options.B.trim()
      && options.C.trim()
      && options.D.trim(),
    );
  }

  private toQuestionPayload(question: ManualQuestion, order: number): CreateQuestionPayload {
    return {
      question: question.title,
      order,
      alternatives: question.options.map((option) => ({
        text: option.text,
        is_correct: option.correct,
      })),
      explanation: question.explanation || null,
    };
  }

  private requireContentCategoryId(): number | string {
    const content = this.contents().find((item) => String(item.id) === this.selectedContentId());

    if (!content?.category?.id) {
      throw new Error('O conteudo base precisa ter categoria para criar o quiz.');
    }

    return content.category.id;
  }

  private eventValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
  }

  private requireText(value: string, field: string): string {
    const trimmed = value.trim();

    if (!trimmed) {
      throw new Error(`O campo ${field} e obrigatorio.`);
    }

    return trimmed;
  }

  private showSuccess(message: string): void {
    this.successMessage.set('');
    this.toastService.success(message);
  }

  private showError(message: string): void {
    this.formError.set('');
    this.toastService.error(message);
  }

  private errorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    const response = error as { error?: { message?: string; errors?: Record<string, string[]> }; status?: number };
    const validationErrors = response.error?.errors;

    if (validationErrors) {
      return Object.values(validationErrors).flat().join(' ');
    }

    if (response.error?.message) {
      return response.error.message;
    }

    if (response.status === 500) {
      return 'Erro interno ao guardar o quiz. Confirme o log do backend.';
    }

    return 'Nao foi possivel guardar o quiz.';
  }
}
