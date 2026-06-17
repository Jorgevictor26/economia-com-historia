import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminConsoleShellComponent } from '../components/admin-console-shell.component';

@Component({
  selector: 'app-admin-video-create-page',
  imports: [RouterLink, AdminConsoleShellComponent],
  templateUrl: './admin-video-create.page.html',
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
export class AdminVideoCreatePage {
  readonly sourceMode = signal<'url' | 'upload'>('url');
  readonly videoUrl = signal('');
  readonly videoUploaded = signal(false);
  readonly title = signal('');
  readonly category = signal('História Económica');
  readonly duration = signal('45');
  readonly summary = signal('');
  readonly selectedCourse = signal('Economia de Angola');
  readonly selectedModule = signal('Módulo 1: Introdução e Contexto');
  readonly status = signal('Rascunho');

  readonly previewTitle = computed(() => this.title().trim() || 'A Economia Angolana no Seculo XVII');
  readonly previewSummary = computed(() => this.summary().trim() || 'O resumo para alunos aparece aqui como descricao curta da videoaula.');
  readonly durationLabel = computed(() => `${this.duration() || '45'} min`);

  readonly metrics = [
    { icon: 'link', value: 'URL', label: 'Fonte selecionada', badge: 'Origem', description: 'Pode alternar entre link externo e upload.' },
    { icon: 'schedule', value: '45', label: 'Minutos estimados', badge: 'Aula', description: 'Tempo previsto para conclusao.' },
    { icon: 'school', value: '3', label: 'Cursos disponíveis', badge: 'Destino', description: 'Associacao pedagogica da aula.' },
    { icon: 'verified_user', value: '64%', label: 'Pronto para revisão', badge: 'Editor', description: 'Metadados principaís em progresso.' },
  ];

  readonly courses = [
    { label: 'Economia de Angola' },
    { label: 'História das Instituições' },
    { label: 'Financas Publicas' },
  ];

  get validationChecklist() {
    return [
      { label: 'Fonte do video definida', done: this.sourceMode() === 'url' ? this.videoUrl().trim().length > 0 : this.videoUploaded() },
      { label: 'Informacoes gerais iniciadas', done: this.title().trim().length > 0 && this.summary().trim().length > 0 },
      { label: 'Curso associado', done: this.selectedCourse().trim().length > 0 },
      { label: 'Módulo confirmado', done: this.selectedModule().trim().length > 0 },
      { label: 'Revisao editorial pendente', done: this.status() === 'Publicado' },
    ];
  }

  setVideoUrl(event: Event): void { this.videoUrl.set(this.eventValue(event)); }
  setTitle(event: Event): void { this.title.set(this.eventValue(event)); }
  setCategory(event: Event): void { this.category.set(this.eventValue(event)); }
  setDuration(event: Event): void { this.duration.set(this.eventValue(event)); }
  setSummary(event: Event): void { this.summary.set(this.eventValue(event)); }
  setSelectedModule(event: Event): void { this.selectedModule.set(this.eventValue(event)); }

  uploadVideo(): void {
    this.videoUploaded.set(true);
  }

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



