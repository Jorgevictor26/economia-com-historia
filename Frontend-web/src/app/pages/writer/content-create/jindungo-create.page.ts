import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Category } from '../../../models/category.model';
import { ContentTypeOption } from '../../../models/content-type.model';
import { CategoryService } from '../../../services/category.service';
import { ContentPayload, ContentService } from '../../../services/content.service';
import { ContentTypeService } from '../../../services/content-type.service';
import { AdminConsoleShellComponent } from '../../admin/components/admin-console-shell.component';

@Component({
  selector: 'app-jindungo-create-page',
  imports: [RouterLink, AdminConsoleShellComponent],
  templateUrl: './jindungo-create.page.html',
})
export class JindungoCreatePage {
  private readonly router = inject(Router);
  private readonly contentService = inject(ContentService);
  private readonly categoryService = inject(CategoryService);
  private readonly contentTypeService = inject(ContentTypeService);

  readonly categories = signal<Category[]>([]);
  readonly contentTypes = signal<ContentTypeOption[]>([]);
  readonly title = signal('');
  readonly summary = signal('');
  readonly category = signal('Selecione uma categoria');
  readonly body = signal('');
  readonly references = signal('');
  readonly coverUploaded = signal(false);
  readonly coverPreview = signal<string | null>(null);
  readonly coverFile = signal<File | null>(null);
  readonly coverFileName = signal('');
  readonly currentStep = signal(1);
  readonly previewOpen = signal(false);
  readonly status = signal('Rascunho');
  readonly isSaving = signal(false);
  readonly formError = signal('');

  constructor() {
    void this.loadOptions();
  }

  readonly previewTitle = computed(() => this.title().trim() || 'Texto com Jindungo');
  readonly previewSummary = computed(() => this.summary().trim() || 'O resumo aparece aqui para revisao antes da publicacao.');
  readonly categoryLabel = computed(() => (this.category() === 'Selecione uma categoria' ? 'Sem categoria' : this.category()));

  setTitle(event: Event): void { this.title.set(this.eventValue(event)); }
  setSummary(event: Event): void { this.summary.set(this.eventValue(event)); }
  setCategory(event: Event): void { this.category.set(this.eventValue(event)); }
  setBody(event: Event): void { this.body.set(this.eventValue(event)); }
  setReferences(event: Event): void { this.references.set(this.eventValue(event)); }

  async saveDraft(): Promise<void> {
    await this.submit(true);
  }

  async publish(): Promise<void> {
    await this.submit(false);
  }

  nextStep(): void {
    this.currentStep.update((step) => Math.min(step + 1, 3));
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

      if (this.coverFile()) {
        content = await this.contentService.uploadMedia(content.id, 'image', this.coverFile()!);
      }

      this.status.set(asDraft ? 'Rascunho guardado' : 'Publicado');
      this.previewOpen.set(false);
      await this.router.navigate(['/app/contents', content.id]);
    } catch (error) {
      this.status.set('Rascunho');
      this.formError.set(this.errorMessage(error));
    } finally {
      this.isSaving.set(false);
    }
  }

  private buildPayload(asDraft: boolean): ContentPayload {
    const contentType = this.resolveType('jindungo');

    if (!contentType) {
      throw new Error('Content type "jindungo" is not available.');
    }

    return {
      title: this.requireText(this.title(), 'titulo'),
      summary: this.summary().trim() || null,
      category_id: this.resolveCategoryId(this.category()),
      content_type_id: contentType.id,
      content: this.jindungoBody(),
      image_url: null,
      video_url: null,
      visibility: asDraft ? 'private' : 'public',
    };
  }

  private jindungoBody(): string {
    const references = this.references().trim();
    const body = this.requireText(this.body(), 'conteudo');

    return [
      body,
      references ? `<h3>Referencias</h3><p>${references}</p>` : '',
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

    if (response.status === 403) {
      return 'Apenas SuperAdmin pode criar conteudo Jindungo.';
    }

    if (response.status === 500) {
      return 'Erro interno ao guardar o Jindungo. Confirme o log do backend.';
    }

    return 'Nao foi possivel guardar o Jindungo.';
  }
}
