import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BackendContent, ContentService } from '../../../services/content.service';
import { Category } from '../../../models/category.model';
import { CategoryService } from '../../../services/category.service';
import { ForumService } from '../../../services/forum.service';
import { ToastService } from '../../../services/toast.service';
import { AdminConsoleShellComponent } from '../../admin/components/admin-console-shell.component';

@Component({
  selector: 'app-forum-create-page',
  imports: [AdminConsoleShellComponent],
  templateUrl: './forum-create.page.html',
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
export class ForumCreatePage {
  private readonly router = inject(Router);
  private readonly forumService = inject(ForumService);
  private readonly contentService = inject(ContentService);
  private readonly categoryService = inject(CategoryService);
  private readonly toastService = inject(ToastService);

  readonly title = signal('');
  readonly rules = signal('');
  readonly category = signal('Economia Política');
  readonly categories = signal<Category[]>([]);
  readonly availableContents = signal<BackendContent[]>([]);
  readonly selectedContentIds = signal<Array<number | string>>([]);
  readonly privateAccessCode = signal('');
  readonly publicVisible = signal(true);
  readonly contentPermission = signal<'public' | 'subscribers'>('public');
  readonly allowAttachments = signal(false);
  readonly status = signal('Rascunho');
  readonly coverUploaded = signal(false);
  readonly coverPreview = signal<string | null>(null);
  readonly coverFileName = signal('');
  readonly previewOpen = signal(false);
  readonly currentStep = signal(1);
  readonly isSaving = signal(false);
  readonly formError = signal('');
  readonly steps = [
    { value: 1, title: 'Dados' },
    { value: 2, title: 'Regras' },
    { value: 3, title: 'Foto' },
    { value: 4, title: 'Acesso' },
    { value: 5, title: 'Revisao' },
  ];

  constructor() {
    void this.loadCategories();
    void this.loadContents();
  }

  readonly previewTitle = computed(() => this.title().trim() || 'Mantenha a moderacao activa para garantir rigor.');
  readonly previewRules = computed(() => this.rules().trim() || 'O rigor histórico e a clareza para uma economia sustentavel serao apresentados como pontos de partida do debate.');
  readonly progress = computed(() => {
    const checks = [this.title(), this.rules(), this.category(), this.publicVisible()];
    return Math.round((checks.filter((value) => Boolean(String(value).trim())).length / checks.length) * 100);
  });

  readonly metrics = [
    { icon: 'forum', value: 'Aberto', label: 'Tipo de debate', badge: 'Acesso', description: 'Visivel para todos os utilizadores.' },
    { icon: 'attach_file', value: 'PDF', label: 'Anexos permitidos', badge: 'Fontes', description: 'Documentos academicos para apoio.' },
    { icon: 'hub', value: 'Opcional', label: 'Conteúdos ligados', badge: 'Base', description: 'Materiais podem orientar a discussao, mas nao sao obrigatorios.' },
    { icon: 'verified_user', value: '36%', label: 'Configuracao pronta', badge: 'Editor', description: 'Regras e acesso em progresso.' },
  ];

  readonly linkedContents = computed(() => this.availableContents().map((content) => ({
    id: content.id,
    icon: content.content_type?.slug === 'video' ? 'play_circle' : 'menu_book',
    title: content.title,
    meta: content.category?.name ?? content.content_type?.name ?? 'Conteudo',
  })));

  get accessSettings() {
    return [
      { label: 'Visibilidade publica', description: 'Acessivel a todos os utilizadores', checked: this.publicVisible, toggle: () => this.setPublicVisible(!this.publicVisible()) },
      {
        label: 'Conteudos para subscritores',
        description: 'Apenas utilizadores com acesso aos conteudos subscritos podem ler os recursos vinculados',
        checked: computed(() => this.contentPermission() === 'subscribers'),
        toggle: () => this.contentPermission.update((value) => value === 'public' ? 'subscribers' : 'public'),
      },
      { label: 'Permitir anexos', description: 'Upload de PDFs academicos', checked: this.allowAttachments, toggle: () => this.allowAttachments.update((value) => !value) },
    ];
  }

  get validationChecklist() {
    return [
      { label: 'Titulo e regras iniciados', done: this.title().trim().length > 0 && this.rules().trim().length > 0 },
      { label: 'Conteudo base opcional', done: true },
      { label: 'Categoria definida', done: this.category().trim().length > 0 },
      { label: 'Moderacao revisada', done: this.publicVisible() || this.allowAttachments() },
      { label: 'Publicacao autorizada', done: this.status() === 'Publicado' },
    ];
  }

  setTitle(event: Event): void { this.title.set(this.eventValue(event)); }
  setRules(event: Event): void { this.rules.set(this.eventValue(event)); }
  setCategory(event: Event): void { this.category.set(this.eventValue(event)); }

  setPublicVisible(value: boolean): void {
    this.publicVisible.set(value);

    if (!value && !this.privateAccessCode()) {
      this.privateAccessCode.set(this.generateAccessCode());
    }
  }

  toggleContent(contentId: number | string): void {
    this.selectedContentIds.update((ids) =>
      ids.includes(contentId) ? ids.filter((id) => id !== contentId) : [...ids, contentId],
    );
  }

  saveDraft(): void {
    this.showError('O backend ainda nao tem rascunho para forum. Use Publicar forum para publicar agora.');
  }

  async publish(): Promise<void> {
    if (this.isSaving()) {
      return;
    }

    this.formError.set('');
    this.isSaving.set(true);
    this.status.set('A publicar forum...');

    try {
      const forum = await this.forumService.create({
        name: this.requireText(this.title(), 'titulo'),
        description: this.requireText(this.rules(), 'regras'),
        rules: this.requireText(this.rules(), 'regras'),
        category: this.category(),
        image: this.coverPreview(),
        visibility: this.publicVisible() ? 'public' : 'private',
        access_code: this.publicVisible() ? null : this.privateAccessCode(),
        join_approval_required: !this.publicVisible(),
        content_permission: this.contentPermission(),
        allow_attachments: this.allowAttachments(),
        content_ids: this.selectedContentIds(),
      });

      this.status.set('Publicado');
      this.previewOpen.set(false);
      this.toastService.success('Forum publicado com sucesso.');
      await this.router.navigate(['/app/forums', forum.id]);
    } catch (error) {
      this.status.set('Rascunho');
      this.showError(this.errorMessage(error));
    } finally {
      this.isSaving.set(false);
    }
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

  private async loadContents(): Promise<void> {
    try {
      const response = await this.contentService.getAll();
      this.availableContents.set(response.data);
    } catch {
      this.showError('Nao foi possivel carregar os conteudos base.');
    }
  }

  private async loadCategories(): Promise<void> {
    try {
      const categories = await this.categoryService.getAll();
      this.categories.set(categories);

      if (categories.length) {
        this.category.set(categories[0].name);
      }
    } catch {
      this.categories.set([]);
    }
  }

  private generateAccessCode(): string {
    return `EH-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }

  private requireText(value: string, field: string): string {
    const trimmed = value.trim();

    if (!trimmed) {
      throw new Error(`O campo ${field} e obrigatorio.`);
    }

    return trimmed;
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
      return 'Erro interno ao criar o forum. Confirme o log do backend.';
    }

    return 'Nao foi possivel criar o forum.';
  }
}

