import { Component, computed, signal } from '@angular/core';
import { AdminConsoleShellComponent } from '../components/admin-console-shell.component';

@Component({
  selector: 'app-admin-article-create-page',
  imports: [AdminConsoleShellComponent],
  templateUrl: './admin-article-create.page.html',
})
export class AdminArticleCreatePage {
  readonly currentStep = signal(1);
  readonly title = signal('');
  readonly summary = signal('');
  readonly category = signal('Selecione uma categoria');
  readonly type = signal('Selecione o tipo');
  readonly readTime = signal('Selecione');
  readonly body = signal('');
  readonly visibility = signal<'publico' | 'analise' | 'privado'>('publico');
  readonly coverUploaded = signal(false);
  readonly showPreview = signal(false);
  readonly status = signal('Rascunho');

  readonly progress = computed(() => {
    const checks = [
      this.title().trim().length > 0,
      this.summary().trim().length > 0,
      this.category() !== 'Selecione uma categoria',
      this.type() !== 'Selecione o tipo',
      this.readTime() !== 'Selecione',
      this.body().trim().length > 0,
      this.coverUploaded(),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  });

  readonly previewTitle = computed(() => this.title().trim() || 'Novo artigo academico');
  readonly previewSummary = computed(() => this.summary().trim() || 'O resumo academico aparece aqui para revisao antes da publicacao.');
  readonly categoryLabel = computed(() => (this.category() === 'Selecione uma categoria' ? 'Sem categoria' : this.category()));
  readonly typeLabel = computed(() => (this.type() === 'Selecione o tipo' ? 'Sem tipo' : this.type()));
  readonly readTimeLabel = computed(() => (this.readTime() === 'Selecione' ? 'Tempo indefinido' : this.readTime()));
  readonly coverPreview = signal<string | null>(null);
  readonly stepTitle = computed(() => this.steps.find((step) => step.value === this.currentStep())?.title ?? 'Criar artigo');

  readonly steps = [
    { value: 1, title: 'Dados principais' },
    { value: 2, title: 'Conteúdo' },
    { value: 3, title: 'Capa' },
    { value: 4, title: 'Acesso' },
    { value: 5, title: 'Revisão' },
  ];
 
  setTitle(event: Event): void {
    this.title.set(this.eventValue(event));
  }

  setSummary(event: Event): void {
    this.summary.set(this.eventValue(event));
  }

  setCategory(event: Event): void {
    this.category.set(this.eventValue(event));
  }

  setType(event: Event): void {
    this.type.set(this.eventValue(event));
  }

  setReadTime(event: Event): void {
    this.readTime.set(this.eventValue(event));
  }

  setBody(event: Event): void {
    this.body.set(this.eventValue(event));
  }

  saveDraft(): void {
    this.status.set('Rascunho guardado');
  }

  publish(): void {
    this.status.set('Publicado');
  }

  togglePreview(): void {
    this.showPreview.update((value) => !value);
    this.status.set('Em revisao');
  }

  nextStep(): void {
    this.currentStep.update((step) => Math.min(step + 1, this.steps.length));
  }

  previousStep(): void {
    this.currentStep.update((step) => Math.max(step - 1, 1));
  }

  private eventValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
  }

  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];

    const reader = new FileReader();

    reader.onload = () => {
      this.coverPreview.set(reader.result as string);
      this.coverUploaded.set(true);
    };

    reader.readAsDataURL(file);
  }
}
