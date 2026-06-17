import { Component, computed, signal } from '@angular/core';
import { AdminConsoleShellComponent } from '../components/admin-console-shell.component';

@Component({
  selector: 'app-admin-forum-create-page',
  imports: [AdminConsoleShellComponent],
  templateUrl: './admin-forum-create.page.html',
  styleUrl: './admin-forum-create.page.scss',
})
export class AdminForumCreatePage {
  readonly title = signal('');
  readonly rules = signal('');
  readonly category = signal('Economia Política');
  readonly selectedContent = signal('Modulo: A Historia do Kwanza');
  readonly publicVisible = signal(true);
  readonly allowAttachments = signal(false);
  readonly status = signal('Rascunho');

  readonly previewTitle = computed(() => this.title().trim() || 'Mantenha a moderacao activa para garantir rigor.');
  readonly previewRules = computed(() => this.rules().trim() || 'O rigor historico e a clareza para uma economia sustentavel serao apresentados como pontos de partida do debate.');
  readonly progress = computed(() => {
    const checks = [this.title(), this.rules(), this.category(), this.selectedContent(), this.publicVisible()];
    return Math.round((checks.filter((value) => Boolean(String(value).trim())).length / checks.length) * 100);
  });

  readonly metrics = [
    { icon: 'forum', value: 'Aberto', label: 'Tipo de debate', badge: 'Acesso', description: 'Visivel para todos os utilizadores.' },
    { icon: 'attach_file', value: 'PDF', label: 'Anexos permitidos', badge: 'Fontes', description: 'Documentos academicos para apoio.' },
    { icon: 'hub', value: '2', label: 'Conteudos ligados', badge: 'Base', description: 'Materiais para orientar a discussao.' },
    { icon: 'verified_user', value: '36%', label: 'Configuracao pronta', badge: 'Editor', description: 'Regras e acesso em progresso.' },
  ];

  readonly linkedContents = [
    { icon: 'menu_book', title: 'Curso: Macroeconomia I', meta: 'Economia Politica' },
    { icon: 'history_edu', title: 'Modulo: A Historia do Kwanza', meta: 'Economia de Angola' },
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
