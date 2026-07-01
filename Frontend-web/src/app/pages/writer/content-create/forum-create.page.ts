import { Component, computed, inject, signal } from '@angular/core';
import { BackendContent, ContentService } from '../../../services/content.service';
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
  private readonly forumService = inject(ForumService);
  private readonly contentService = inject(ContentService);
  private readonly toastService = inject(ToastService);

  readonly title = signal('');
  readonly rules = signal('');
  readonly category = signal('Economia Política');
  readonly availableContents = signal<BackendContent[]>([]);
  readonly selectedContentIds = signal<Array<number | string>>([]);
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
    void this.loadContents();
  }

  readonly previewTitle = computed(() => this.title().trim() || 'Mantenha a moderacao activa para garantir rigor.');
  readonly previewRules = computed(() => this.rules().trim() || 'O rigor histórico e a clareza para uma economia sustentavel serao apresentados como pontos de partida do debate.');
  readonly progress = computed(() => {
    const checks = [this.title(), this.rules(), this.category(), this.selectedContentIds().length, this.publicVisible()];
    return Math.round((checks.filter((value) => Boolean(String(value).trim())).length / checks.length) * 100);
  });

  readonly metrics = [
    { icon: 'forum', value: 'Aberto', label: 'Tipo de debate', badge: 'Acesso', description: 'Visivel para todos os utilizadores.' },
    { icon: 'attach_file', value: 'PDF', label: 'Anexos permitidos', badge: 'Fontes', description: 'Documentos academicos para apoio.' },
    { icon: 'hub', value: '2', label: 'Conteúdos ligados', badge: 'Base', description: 'Materiais para orientar a discussao.' },
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
      { label: 'Visibilidade publica', description: 'Acessivel a todos os utilizadores', checked: this.publicVisible, toggle: () => this.publicVisible.update((value) => !value) },
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
      { label: 'Conteudo base selecionado', done: this.selectedContentIds().length > 0 },
      { label: 'Categoria definida', done: this.category().trim().length > 0 },
      { label: 'Moderacao revisada', done: this.publicVisible() || this.allowAttachments() },
      { label: 'Publicacao autorizada', done: this.status() === 'Publicado' },
    ];
  }

  setTitle(event: Event): void { this.title.set(this.eventValue(event)); }
  setRules(event: Event): void { this.rules.set(this.eventValue(event)); }
  setCategory(event: Event): void { this.category.set(this.eventValue(event)); }

  toggleContent(contentId: number | string): void {
    this.selectedContentIds.update((ids) =>
      ids.includes(contentId) ? ids.filter((id) => id !== contentId) : [...ids, contentId],
    );
  }

  saveDraft(): void {
    this.showError('O backend ainda nao tem rascunho para forum. Use Publicar forum para enviar para aprovacao.');
  }

  async publish(): Promise<void> {
    if (this.isSaving()) {
      return;
    }

    this.formError.set('');
    this.isSaving.set(true);
    this.status.set('A enviar para aprovacao...');

    try {
      await this.forumService.create({
        name: this.requireText(this.title(), 'titulo'),
        description: this.requireText(this.rules(), 'regras'),
        rules: this.requireText(this.rules(), 'regras'),
        category: this.category(),
        image: this.coverPreview(),
        visibility: this.publicVisible() ? 'public' : 'private',
        content_permission: this.contentPermission(),
        allow_attachments: this.allowAttachments(),
        content_ids: this.selectedContentIds(),
      });

      this.status.set('Enviado para aprovacao');
      this.previewOpen.set(false);
      this.toastService.success('Forum enviado para aprovacao.');
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
      this.selectedContentIds.set(response.data.slice(0, 2).map((content) => content.id));
    } catch {
      this.showError('Nao foi possivel carregar os conteudos base.');
    }
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
