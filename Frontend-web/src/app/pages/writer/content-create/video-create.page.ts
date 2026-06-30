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
  selector: 'app-video-create-page',
  imports: [AdminConsoleShellComponent],
  templateUrl: './video-create.page.html',
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
export class VideoCreatePage {
  readonly auth = inject(AuthStateService);
  private readonly router = inject(Router);
  private readonly contentService = inject(ContentService);
  private readonly categoryService = inject(CategoryService);
  private readonly contentTypeService = inject(ContentTypeService);

  readonly categories = signal<Category[]>([]);
  readonly contentTypes = signal<ContentTypeOption[]>([]);
  readonly sourceMode = signal<'url' | 'upload'>('url');
  readonly videoUrl = signal('');
  readonly videoUploaded = signal(false);
  readonly videoFile = signal<File | null>(null);
  readonly videoFileName = signal('');
  readonly title = signal('');
  readonly category = signal('História Económica');
  readonly duration = signal('45');
  readonly summary = signal('');
  readonly status = signal('Rascunho');
  readonly coverUploaded = signal(false);
  readonly coverPreview = signal<string | null>(null);
  readonly coverFile = signal<File | null>(null);
  readonly coverFileName = signal('');
  readonly previewOpen = signal(false);
  readonly currentStep = signal(1);
  readonly isSaving = signal(false);
  readonly formError = signal('');
  readonly steps = [
    { value: 1, title: 'Fonte' },
    { value: 2, title: 'Dados' },
    { value: 3, title: 'Foto' },
    { value: 4, title: 'Revisao' },
  ];

  readonly previewTitle = computed(() => this.title().trim() || 'A Economia Angolana no Seculo XVII');
  readonly previewSummary = computed(() => this.summary().trim() || 'O resumo para alunos aparece aqui como descricao curta da videoaula.');
  readonly durationLabel = computed(() => `${this.duration() || '45'} min`);
  readonly defaultFrameLabel = computed(() => this.previewTitle());

  readonly metrics = [
    { icon: 'link', value: 'URL', label: 'Fonte selecionada', badge: 'Origem', description: 'Pode alternar entre link externo e upload.' },
    { icon: 'schedule', value: '45', label: 'Minutos estimados', badge: 'Aula', description: 'Tempo previsto para conclusao.' },
    { icon: 'school', value: '3', label: 'Cursos disponíveis', badge: 'Destino', description: 'Associacao pedagogica da aula.' },
    { icon: 'verified_user', value: '64%', label: 'Pronto para revisão', badge: 'Editor', description: 'Metadados principaís em progresso.' },
  ];

  constructor() {
    void this.loadOptions();
  }

  get validationChecklist() {
    return [
      { label: 'Fonte do video definida', done: this.sourceMode() === 'url' ? this.videoUrl().trim().length > 0 : this.videoUploaded() },
      { label: 'Informacoes gerais iniciadas', done: this.title().trim().length > 0 && this.summary().trim().length > 0 },
      { label: 'Revisao editorial pendente', done: this.status() === 'Publicado' },
    ];
  }

  setVideoUrl(event: Event): void { this.videoUrl.set(this.eventValue(event)); }
  setTitle(event: Event): void { this.title.set(this.eventValue(event)); }
  setCategory(event: Event): void { this.category.set(this.eventValue(event)); }
  setDuration(event: Event): void { this.duration.set(this.eventValue(event)); }
  setSummary(event: Event): void { this.summary.set(this.eventValue(event)); }

  onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.videoFile.set(file);
    this.videoFileName.set(file.name);
    this.videoUploaded.set(true);
  }

  removeVideo(): void {
    this.videoFile.set(null);
    this.videoFileName.set('');
    this.videoUploaded.set(false);
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
    };
    reader.readAsDataURL(file);
  }

  clearCover(): void {
    this.coverPreview.set(null);
    this.coverFile.set(null);
    this.coverFileName.set('');
    this.coverUploaded.set(false);
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

      if (this.sourceMode() === 'upload' && this.videoFile()) {
        content = await this.contentService.uploadMedia(content.id, 'video', this.videoFile()!);
      }

      if (this.coverFile()) {
        content = await this.contentService.uploadMedia(content.id, 'image', this.coverFile()!);
      }

      this.status.set(asDraft ? 'Rascunho guardado' : 'Publicado');
      this.previewOpen.set(false);
      await this.router.navigate(['/app/contents/videos', content.id]);
    } catch (error) {
      this.status.set('Rascunho');
      this.formError.set(this.errorMessage(error));
    } finally {
      this.isSaving.set(false);
    }
  }

  private buildPayload(asDraft: boolean): ContentPayload {
    const contentType = this.resolveType('video');

    if (!contentType) {
      throw new Error('Content type "video" is not available.');
    }

    return {
      title: this.requireText(this.title(), 'titulo'),
      summary: this.summary().trim() || null,
      category_id: this.resolveCategoryId(this.category()),
      content_type_id: contentType.id,
      content: this.videoBody(),
      image_url: null,
      video_url: this.sourceMode() === 'url' ? this.requireText(this.videoUrl(), 'url do video') : null,
      visibility: asDraft ? 'private' : 'public',
    };
  }

  private videoBody(): string {
    const sourceNote = this.sourceMode() === 'upload'
      ? `<p><strong>Video:</strong> ${this.videoFileName() || 'ficheiro enviado'}</p>`
      : '';

    if (this.sourceMode() === 'upload' && !this.videoFile()) {
      throw new Error('Selecione um ficheiro de video.');
    }

    return [
      this.requireText(this.summary(), 'resumo'),
      `<p><strong>Duracao:</strong> ${this.durationLabel()}</p>`,
      sourceNote,
    ].filter(Boolean).join('\n');
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
      return 'Erro interno ao guardar o video. Confirme o log do backend.';
    }

    return 'Nao foi possivel guardar o video.';
  }
}
