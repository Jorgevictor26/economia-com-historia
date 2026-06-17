import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminConsoleShellComponent } from '../components/admin-console-shell.component';

@Component({
  selector: 'app-admin-forum-create-page',
  imports: [RouterLink, AdminConsoleShellComponent],
  templateUrl: './admin-forum-create.page.html',
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
export class AdminForumCreatePage {
  readonly title = signal('');
  readonly rules = signal('');
  readonly category = signal('Economia Política');
  readonly selectedContent = signal('Módulo: A História do Kwanza');
  readonly publicVisible = signal(true);
  readonly allowAttachments = signal(false);
  readonly status = signal('Rascunho');

  readonly previewTitle = computed(() => this.title().trim() || 'Mantenha a moderacao activa para garantir rigor.');
  readonly previewRules = computed(() => this.rules().trim() || 'O rigor histórico e a clareza para uma economia sustentavel serao apresentados como pontos de partida do debate.');
  readonly progress = computed(() => {
    const checks = [this.title(), this.rules(), this.category(), this.selectedContent(), this.publicVisible()];
    return Math.round((checks.filter((value) => Boolean(String(value).trim())).length / checks.length) * 100);
  });

  readonly metrics = [
    { icon: 'forum', value: 'Aberto', label: 'Tipo de debate', badge: 'Acesso', description: 'Visivel para todos os utilizadores.' },
    { icon: 'attach_file', value: 'PDF', label: 'Anexos permitidos', badge: 'Fontes', description: 'Documentos academicos para apoio.' },
    { icon: 'hub', value: '2', label: 'Conteúdos ligados', badge: 'Base', description: 'Materiais para orientar a discussao.' },
    { icon: 'verified_user', value: '36%', label: 'Configuracao pronta', badge: 'Editor', description: 'Regras e acesso em progresso.' },
  ];

  readonly linkedContents = [
    { icon: 'menu_book', title: 'Curso: Macroeconomia I', meta: 'Economia Política' },
    { icon: 'history_edu', title: 'Módulo: A História do Kwanza', meta: 'Economia de Angola' },
  ];

  get accessSettings() {
    return [
      { label: 'Visibilidade publica', description: 'Acessivel a todos os utilizadores', checked: this.publicVisible, toggle: () => this.publicVisible.update((value) => !value) },
      { label: 'Permitir anexos', description: 'Upload de PDFs academicos', checked: this.allowAttachments, toggle: () => this.allowAttachments.update((value) => !value) },
    ];
  }

  get validationChecklist() {
    return [
      { label: 'Titulo e regras iniciados', done: this.title().trim().length > 0 && this.rules().trim().length > 0 },
      { label: 'Conteudo base selecionado', done: this.selectedContent().trim().length > 0 },
      { label: 'Categoria definida', done: this.category().trim().length > 0 },
      { label: 'Moderacao revisada', done: this.publicVisible() || this.allowAttachments() },
      { label: 'Publicacao autorizada', done: this.status() === 'Publicado' },
    ];
  }

  setTitle(event: Event): void { this.title.set(this.eventValue(event)); }
  setRules(event: Event): void { this.rules.set(this.eventValue(event)); }
  setCategory(event: Event): void { this.category.set(this.eventValue(event)); }

  saveDraft(): void {
    this.status.set('Rascunho guardado');
  }

  publish(): void {
    this.status.set('Publicado');
  }

  private eventValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
  }
}



