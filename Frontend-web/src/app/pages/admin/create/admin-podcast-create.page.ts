import { Component, computed, inject, signal } from '@angular/core';
import { AuthStateService } from '../../../services/auth-state.service';
import { AdminConsoleShellComponent } from '../components/admin-console-shell.component';
import { AdminEditorialSectionComponent } from '../components/admin-editorial-section.component';

@Component({
  selector: 'app-admin-podcast-create-page',
  imports: [AdminConsoleShellComponent, AdminEditorialSectionComponent],
  templateUrl: './admin-podcast-create.page.html',
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
export class AdminPodcastCreatePage {
  readonly auth = inject(AuthStateService);
  readonly title = signal('');
  readonly category = signal('Economia');
  readonly playlist = signal('');
  readonly duration = signal('');
  readonly description = signal('');
  readonly audioUploaded = signal(false);
  readonly uploadProgress = signal(68);
  readonly coverChanged = signal(false);
  readonly status = signal('Rascunho');
  readonly visibility = signal<'public' | 'premium' | 'private'>('public');
  readonly scheduled = signal(false);
  readonly scheduleDate = signal('');
  readonly scheduleTime = signal('');
  readonly toggle = (value: boolean) => !value;

  readonly progress = computed(() => {
    const checks = [this.title(), this.category(), this.duration(), this.description(), this.audioUploaded(), this.coverChanged()];
    return Math.round((checks.filter((value) => Boolean(String(value).trim())).length / checks.length) * 100);
  });

  readonly previewTitle = computed(() => this.title().trim() || 'O Impacto das Rotas Comerciais no Seculo XVII');
  readonly previewDescription = computed(() => this.description().trim() || 'Episodio sobre redes comerciais, circulacao monetaria e memoria social, preparado para publicacao com contexto histórico e leitura económica.');
  readonly durationLabel = computed(() => this.duration().trim() || '28 min');
  readonly visibilityLabel = computed(() => this.visibilityOptions.find((option) => option.value === this.visibility())?.plainLabel ?? 'Publico');

  readonly metrics = [
    { icon: 'graphic_eq', value: '68%', label: 'Audio processado', badge: 'Upload', description: 'Ficheiro carregado e em validacao tecnica.' },
    { icon: 'schedule', value: '28 min', label: 'Duracao prevista', badge: 'Aluno', description: 'Tempo estimado para escuta completa.' },
    { icon: 'library_music', value: 'Serie 1', label: 'Playlist', badge: 'Acervo', description: 'Episodio ligado a uma colecao editorial.' },
    { icon: 'verified_user', value: '72%', label: 'Pronto para revisão', badge: 'Editor', description: 'Checklist editorial parcialmente concluida.' },
  ];

  get validationChecklist() {
    return [
      { label: 'Detalhes editoriais preenchidos', done: this.title().trim().length > 0 && this.description().trim().length > 0 },
      { label: 'Audio enviado para processamento', done: this.audioUploaded() },
      { label: 'Capa do episodio definida', done: this.coverChanged() },
      { label: 'Agendamento configurado', done: !this.scheduled() || Boolean(this.scheduleDate() && this.scheduleTime()) },
      { label: 'Revisao editorial pendente', done: this.status() === 'Publicado' },
    ];
  }

  readonly visibilityOptions = [
    { value: 'public' as const, plainLabel: 'Publico', labelHtml: 'P&uacute;blico', descriptionHtml: 'Vis&iacute;vel para todos os visitantes do portal.' },
    { value: 'premium' as const, plainLabel: 'Premium', labelHtml: 'Premium Only', descriptionHtml: 'Exclusivo para subscritores de planos anuais.' },
    { value: 'private' as const, plainLabel: 'Privado', labelHtml: 'Privado', descriptionHtml: 'Apenas administradores podem acessar.' },
  ];

  setTitle(event: Event): void { this.title.set(this.eventValue(event)); }
  setCategory(event: Event): void { this.category.set(this.eventValue(event)); }
  setPlaylist(event: Event): void { this.playlist.set(this.eventValue(event)); }
  setDuration(event: Event): void { this.duration.set(this.eventValue(event)); }
  setDescription(event: Event): void { this.description.set(this.eventValue(event)); }
  setScheduleDate(event: Event): void { this.scheduleDate.set(this.eventValue(event)); }
  setScheduleTime(event: Event): void { this.scheduleTime.set(this.eventValue(event)); }

  simulateAudioUpload(): void {
    this.audioUploaded.set(true);
    this.uploadProgress.set(100);
  }

  removeAudio(): void {
    this.audioUploaded.set(false);
    this.uploadProgress.set(0);
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



