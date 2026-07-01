import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '../../../models/category.model';
import { ContentTypeOption } from '../../../models/content-type.model';
import { AuthStateService } from '../../../services/auth-state.service';
import { CategoryService } from '../../../services/category.service';
import { ContentPayload, ContentService } from '../../../services/content.service';
import { ContentTypeService } from '../../../services/content-type.service';
import { ToastService } from '../../../services/toast.service';
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
  private readonly maxAudioSizeMb = 50;
  readonly auth = inject(AuthStateService);
  private readonly router = inject(Router);
  private readonly categoryService = inject(CategoryService);
  private readonly contentService = inject(ContentService);
  private readonly contentTypeService = inject(ContentTypeService);
  private readonly toastService = inject(ToastService);

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
    { value: 2, title: 'Audio e capa' },
    { value: 3, title: 'Revisao' },
  ];
  readonly previewTitle = computed(() => this.title().trim() || 'O Impacto das Rotas Comerciais no Seculo XVII');
  readonly previewDescription = computed(() => this.description().trim() || 'Episodio sobre redes comerciais, circulacao monetaria e memoria social, preparado para publicacao com contexto histórico e leitura económica.');
  readonly durationLabel = computed(() => this.duration().trim() || 'Duracao por calcular');
  readonly visibilityLabel = computed(() => 'Publico para utilizadores autenticados');

  constructor() {
    void this.loadOptions();
  }

  setTitle(event: Event): void { this.title.set(this.eventValue(event)); }
  setCategory(event: Event): void { this.category.set(this.eventValue(event)); }
  setPlaylist(event: Event): void { this.playlist.set(this.eventValue(event)); }
  setDescription(event: Event): void { this.description.set(this.eventValue(event)); }

  onAudioSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > this.maxAudioSizeMb * 1024 * 1024) {
      this.formError.set(`O audio selecionado excede ${this.maxAudioSizeMb}MB.`);
      input.value = '';
      return;
    }

    this.formError.set('');
    this.audioFile.set(file);
    this.audioFileName.set(file.name);
    this.audioUploaded.set(true);
    this.uploadProgress.set(100);
    this.duration.set('');
    void this.readAudioDuration(file);
  }

  removeAudio(): void {
    this.audioFile.set(null);
    this.audioFileName.set('');
    this.audioUploaded.set(false);
    this.uploadProgress.set(0);
    this.duration.set('');
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
      this.showError('Nao foi possivel carregar categorias e tipos de conteudo.');
    }
  }

  private async submit(asDraft: boolean): Promise<void> {
    if (this.isSaving()) {
      return;
    }

    this.formError.set('');
    this.isSaving.set(true);
    this.status.set(asDraft ? 'A guardar rascunho...' : 'A publicar...');
    let createdContentId: number | string | null = null;

    try {
      let content = await this.contentService.create(this.buildPayload(asDraft));
      createdContentId = content.id;

      content = await this.contentService.uploadMedia(content.id, 'audio', this.audioFile()!);

      if (this.coverFile()) {
        content = await this.contentService.uploadMedia(content.id, 'image', this.coverFile()!);
      }

      this.status.set(asDraft ? 'Rascunho guardado' : 'Publicado');
      this.previewOpen.set(false);
      await this.router.navigate(['/app/podcasts', content.id]);
    } catch (error) {
      if (createdContentId) {
        await this.deleteCreatedContent(createdContentId);
      }

      this.status.set('Rascunho');
      this.showError(this.errorMessage(error));
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
      visibility: asDraft ? 'private' : 'public',
    };
  }

  private async deleteCreatedContent(contentId: number | string): Promise<void> {
    try {
      await this.contentService.delete(contentId);
    } catch {
      // If cleanup fails, keep the original upload error visible to the user.
    }
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

<<<<<<< HEAD
  private showError(message: string): void {
    this.formError.set('');
    this.toastService.error(message);
=======
  private async readAudioDuration(file: File): Promise<void> {
    if (typeof Audio === 'undefined' || typeof URL === 'undefined') {
      return;
    }

    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = 'metadata';

    await new Promise<void>((resolve) => {
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        const seconds = Number.isFinite(audio.duration) ? audio.duration : 0;

        if (seconds > 0) {
          this.duration.set(this.formatDuration(seconds));
        }

        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.src = url;
    });
  }

  private formatDuration(totalSeconds: number): string {
    const minutes = Math.max(1, Math.round(totalSeconds / 60));

    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
>>>>>>> c19bb649b34b5b916dffc58911f1153a834e80e4
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

    if (response.status === 422 && response.error?.message?.toLowerCase().includes('upload')) {
      return 'O audio nao foi enviado. O PHP local esta provavelmente limitado por upload_max_filesize/post_max_size.';
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
