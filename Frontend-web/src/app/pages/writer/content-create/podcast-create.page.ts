import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '../../../models/category.model';
import { ContentTypeOption } from '../../../models/content-type.model';
import { AuthStateService } from '../../../services/auth-state.service';
import { CategoryService } from '../../../services/category.service';
import { ContentPayload, ContentService } from '../../../services/content.service';
import { ContentTypeService } from '../../../services/content-type.service';
import { AdminConsoleShellComponent } from '../../admin/components/admin-console-shell.component';

@Component({
  selector: 'app-podcast-create-page',
  imports: [AdminConsoleShellComponent],
  templateUrl: './podcast-create.page.html',
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
export class PodcastCreatePage {
  readonly auth = inject(AuthStateService);
  private readonly router = inject(Router);
  private readonly categoryService = inject(CategoryService);
  private readonly contentService = inject(ContentService);
  private readonly contentTypeService = inject(ContentTypeService);

  readonly categories = signal<Category[]>([]);
  readonly contentTypes = signal<ContentTypeOption[]>([]);
  readonly title = signal('');
  readonly category = signal('Economia');
  readonly playlist = signal('');
  readonly duration = signal('');
  readonly description = signal('');
  readonly audioUploaded = signal(false);
  readonly audioFile = signal<File | null>(null);
  readonly audioFileName = signal('');
  readonly uploadProgress = signal(0);
  readonly coverChanged = signal(false);
  readonly coverUploaded = signal(false);
  readonly coverPreview = signal<string | null>(null);
  readonly coverFile = signal<File | null>(null);
  readonly coverFileName = signal('');
  readonly previewOpen = signal(false);
  readonly status = signal('Rascunho');
  readonly currentStep = signal(1);
  readonly isSaving = signal(false);
  readonly formError = signal('');
  readonly steps = [
    { value: 1, title: 'Detalhes' },
    { value: 2, title: 'Audio' },
    { value: 3, title: 'Capa' },
    { value: 4, title: 'Publicacao' },
  ];
  readonly visibility = signal<'public' | 'premium' | 'private'>('public');
  readonly scheduled = signal(false);
  readonly scheduleDate = signal('');
  readonly scheduleTime = signal('');
  readonly toggle = (value: boolean) => !value;

  readonly progress = computed(() => {
    const checks = [this.title(), this.category(), this.duration(), this.description(), this.audioUploaded(), this.coverUploaded()];
    return Math.round((checks.filter((value) => Boolean(String(value).trim())).length / checks.length) * 100);
  });

  readonly previewTitle = computed(() => this.title().trim() || 'O Impacto das Rotas Comerciais no Seculo XVII');
  readonly previewDescription = computed(() => this.description().trim() || 'Episodio sobre redes comerciais, circulacao monetaria e memoria social, preparado para publicacao com contexto histórico e leitura económica.');
  readonly durationLabel = computed(() => this.duration().trim() || '28 min');
  readonly visibilityLabel = computed(() => this.visibilityOptions.find((option) => option.value === this.visibility())?.plainLabel ?? 'Publico');

  readonly metrics = [
    { icon: 'graphic_eq', value: '68%', label: 'Audio processado', badge: 'Upload', description: 'Ficheiro carregado e em validacao tecnica.' },
    { icon: 'schedule', value: '28 min', label: 'Duracao prevista', badge: 'Aluno', description: 'Tempo estimado para escuta completa.' },
    { icon: 'library_music', value: 'Serie 1', label: 'Playlist', badge: 'Acervo', description: 'Episodio ligado a uma colecao editorial.' },
    { icon: 'verified_user', value: '72%', label: 'Pronto para revisão', badge: 'Editor', description: 'Checklist editorial parcialmente concluida.' },
  ];

  get validationChecklist() {
    return [
      { label: 'Detalhes editoriais preenchidos', done: this.title().trim().length > 0 && this.description().trim().length > 0 },
      { label: 'Audio enviado para processamento', done: this.audioUploaded() },
      { label: 'Capa do episodio definida', done: this.coverChanged() },
      { label: 'Agendamento configurado', done: !this.scheduled() || Boolean(this.scheduleDate() && this.scheduleTime()) },
      { label: 'Revisao editorial pendente', done: this.status() === 'Publicado' },
    ];
  }

  readonly visibilityOptions = [
    { value: 'public' as const, plainLabel: 'Publico', labelHtml: 'P&uacute;blico', descriptionHtml: 'Vis&iacute;vel para todos os visitantes do portal.' },
    { value: 'premium' as const, plainLabel: 'Premium', labelHtml: 'Premium Only', descriptionHtml: 'Exclusivo para subscritores de planos anuais.' },
    { value: 'private' as const, plainLabel: 'Privado', labelHtml: 'Privado', descriptionHtml: 'Apenas administradores podem acessar.' },
  ];

  constructor() {
    void this.loadOptions();
  }

  setTitle(event: Event): void { this.title.set(this.eventValue(event)); }
  setCategory(event: Event): void { this.category.set(this.eventValue(event)); }
  setPlaylist(event: Event): void { this.playlist.set(this.eventValue(event)); }
  setDuration(event: Event): void { this.duration.set(this.eventValue(event)); }
  setDescription(event: Event): void { this.description.set(this.eventValue(event)); }
  setScheduleDate(event: Event): void { this.scheduleDate.set(this.eventValue(event)); }
  setScheduleTime(event: Event): void { this.scheduleTime.set(this.eventValue(event)); }

  onAudioSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.audioFile.set(file);
    this.audioFileName.set(file.name);
    this.audioUploaded.set(true);
    this.uploadProgress.set(100);
  }

  removeAudio(): void {
    this.audioFile.set(null);
    this.audioFileName.set('');
    this.audioUploaded.set(false);
    this.uploadProgress.set(0);
  }

  async saveDraft(): Promise<void> {
    await this.submit(true);
  }

  async publish(): Promise<void> {
    await this.submit(false);
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
      this.coverFile.set(file);
      this.coverFileName.set(file.name);
      this.coverUploaded.set(true);
      this.coverChanged.set(true);
    };
    reader.readAsDataURL(file);
  }

  clearCover(): void {
    this.coverPreview.set(null);
    this.coverFile.set(null);
    this.coverFileName.set('');
    this.coverUploaded.set(false);
    this.coverChanged.set(false);
  }

  private eventValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
  }

  private async loadOptions(): Promise<void> {
    try {
      const [categories, contentTypes] = await Promise.all([
        this.categoryService.getAll(),
        this.contentTypeService.getAll(),
      ]);

      this.categories.set(categories);
      this.contentTypes.set(contentTypes);
    } catch {
      this.formError.set('Nao foi possivel carregar categorias e tipos de conteudo.');
    }
  }

  private async submit(asDraft: boolean): Promise<void> {
    if (this.isSaving()) {
      return;
    }

    this.formError.set('');
    this.isSaving.set(true);
    this.status.set(asDraft ? 'A guardar rascunho...' : 'A publicar...');

    try {
      let content = await this.contentService.create(this.buildPayload(asDraft));

      content = await this.contentService.uploadMedia(content.id, 'audio', this.audioFile()!);

      if (this.coverFile()) {
        content = await this.contentService.uploadMedia(content.id, 'image', this.coverFile()!);
      }

      this.status.set(asDraft ? 'Rascunho guardado' : 'Publicado');
      this.previewOpen.set(false);
      await this.router.navigate(['/app/podcasts', content.id]);
    } catch (error) {
      this.status.set('Rascunho');
      this.formError.set(this.errorMessage(error));
    } finally {
      this.isSaving.set(false);
    }
  }

  private buildPayload(asDraft: boolean): ContentPayload {
    const contentType = this.resolveType('podcast');

    if (!contentType) {
      throw new Error('O tipo de conteudo "podcast" nao existe no backend. Rode o seeder de tipos de conteudo.');
    }

    return {
      title: this.requireText(this.title(), 'titulo'),
      summary: this.description().trim() || null,
      category_id: this.resolveCategoryId(this.category()),
      content_type_id: contentType.id,
      content: this.podcastBody(),
      image_url: null,
      video_url: null,
      visibility: asDraft ? 'private' : this.mapVisibility(),
    };
  }

  private podcastBody(): string {
    if (!this.audioFile()) {
      throw new Error('Selecione um ficheiro de audio.');
    }

    return [
      this.requireText(this.description(), 'descricao'),
      this.playlist().trim() ? `<p><strong>Serie:</strong> ${this.playlist().trim()}</p>` : '',
      this.duration().trim() ? `<p><strong>Duracao:</strong> ${this.duration().trim()}</p>` : '',
      `<p><strong>Audio:</strong> ${this.audioFileName() || 'ficheiro enviado'}</p>`,
      this.scheduled() && this.scheduleDate() && this.scheduleTime()
        ? `<p><strong>Agendado para:</strong> ${this.scheduleDate()} ${this.scheduleTime()}</p>`
        : '',
    ].filter(Boolean).join('\n');
  }

  private mapVisibility(): 'public' | 'private' | 'followers' {
    if (this.visibility() === 'private') {
      return 'private';
    }

    if (this.visibility() === 'premium') {
      return 'followers';
    }

    return 'public';
  }

  private resolveCategoryId(label: string): number | null {
    const normalizedLabel = this.normalize(label);
    const category = this.categories().find((item) => this.normalize(item.name) === normalizedLabel)
      ?? this.categories().find((item) => normalizedLabel.includes(this.normalize(item.name)));

    return category?.id ?? null;
  }

  private resolveType(slug: string): ContentTypeOption | undefined {
    return this.contentTypes().find((item) => this.normalize(item.slug) === this.normalize(slug));
  }

  private requireText(value: string, field: string): string {
    const trimmed = value.trim();

    if (!trimmed) {
      throw new Error(`O campo ${field} e obrigatorio.`);
    }

    return trimmed;
  }

  private normalize(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
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
      return 'Erro interno ao guardar o podcast. Confirme o log do backend.';
    }

    return 'Nao foi possivel guardar o podcast.';
  }
}

