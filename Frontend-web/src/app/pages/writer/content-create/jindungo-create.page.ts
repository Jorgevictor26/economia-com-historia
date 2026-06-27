import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminConsoleShellComponent } from '../../admin/components/admin-console-shell.component';

@Component({
  selector: 'app-jindungo-create-page',
  imports: [RouterLink, AdminConsoleShellComponent],
  templateUrl: './jindungo-create.page.html',
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
export class JindungoCreatePage {
  readonly currentStep = signal(1);
  readonly steps = [
    { value: 1, title: 'Conteudo' },
    { value: 2, title: 'Barreira' },
    { value: 3, title: 'Definicoes' },
    { value: 4, title: 'Capa' },
    { value: 5, title: 'Revisao' },
  ];

  readonly title = signal('');
  readonly excerpt = signal('');
  readonly body = signal('');
  readonly barrierTitle = signal('Artigo exclusivo para membros');
  readonly barrierDescription = signal('Para ler a analise completa e acessar ao arquivo historico do Economia com Historia, subscreva o Plano Premium.');
  readonly category = signal('Jindungo (Analise)');
  readonly access = signal('Plano Premium');
  readonly status = signal('Rascunho');
  readonly previewOpen = signal(false);
  readonly coverUploaded = signal(false);
  readonly coverPreview = signal<string | null>(null);
  readonly coverFileName = signal('');
  readonly tags = signal(['Macroeconomia', 'HistoriaAngola', 'Petroleo']);

  readonly previewTitle = computed(() => this.title().trim() || 'Texto com Jindungo');
  readonly previewExcerpt = computed(() => this.excerpt().trim() || 'Comece por escrever o resumo aberto do texto.');
  readonly previewBody = computed(() => this.body().trim() || 'O conteudo premium completo aparecera aqui para revisao.');

  readonly accessOptions = ['Plano Premium', 'Apenas subscritores', 'Publico (Demo)'];
  readonly categoryOptions = ['Jindungo (Analise)', 'Economia critica', 'Historia economica'];

  setTitle(event: Event): void {
    this.title.set(this.eventValue(event));
  }

  setExcerpt(event: Event): void {
    this.excerpt.set(this.eventValue(event));
  }

  setBody(event: Event): void {
    this.body.set(this.eventValue(event));
  }

  setBarrierTitle(event: Event): void {
    this.barrierTitle.set(this.eventValue(event));
  }

  setBarrierDescription(event: Event): void {
    this.barrierDescription.set(this.eventValue(event));
  }

  setCategory(event: Event): void {
    this.category.set(this.eventValue(event));
  }

  setTag(index: number, event: Event): void {
    const value = this.eventValue(event);
    this.tags.update((tags) => tags.map((tag, currentIndex) => (currentIndex === index ? value : tag)));
  }

  addTag(): void {
    this.tags.update((tags) => [...tags, '']);
  }

  removeTag(index: number): void {
    this.tags.update((tags) => tags.filter((_, currentIndex) => currentIndex !== index));
  }

  saveDraft(): void {
    this.status.set('Rascunho guardado');
  }

  publish(): void {
    this.status.set('Publicado');
    this.previewOpen.set(false);
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
}
