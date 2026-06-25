import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStateService } from '../../../services/auth-state.service';
import { AdminConsoleShellComponent } from '../components/admin-console-shell.component';

@Component({
  selector: 'app-admin-article-create-page',
  imports: [RouterLink, AdminConsoleShellComponent],
  templateUrl: './admin-article-create.page.html'
})
export class AdminArticleCreatePage {
  readonly auth = inject(AuthStateService);
  readonly title = signal('');
  readonly summary = signal('');
  readonly category = signal('Selecione uma categoria');
  readonly type = signal('Selecione o tipo');
  readonly readTime = signal('Selecione');
  readonly body = signal('');
  readonly visibility = signal<'publico' | 'analise' | 'privado'>('publico');
  readonly coverUploaded = signal(false);
  readonly currentStep = signal(1);
  readonly previewOpen = signal(false);
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
    this.previewOpen.set(false);
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

  private eventValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
  }
}
