import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminConsoleShellComponent } from '../components/admin-console-shell.component';
import { AdminEditorialSectionComponent } from '../components/admin-editorial-section.component';

@Component({
  selector: 'app-admin-podcast-create-page',
  imports: [RouterLink, AdminConsoleShellComponent, AdminEditorialSectionComponent],
  template: `
    <app-admin-console-shell activeItem="contents">
      <main class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <section class="min-w-0">
          <header class="overflow-hidden rounded-[8px] border border-[#eadfe3] bg-white shadow-[0_18px_45px_rgba(27,22,30,0.05)]">
            <div class="grid gap-6 p-7 lg:grid-cols-[minmax(0,1fr)_330px]">
              <div>
                <a routerLink="/admin" class="inline-flex items-center gap-2 text-[13px] font-semibold text-[#5f5861]">
                  <span aria-hidden="true" class="text-[18px] leading-none">&larr;</span>
                  Voltar a conte&uacute;dos
                </a>
                <p class="mt-6 inline-flex items-center gap-2 rounded-[999px] bg-[#f7edef] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8a1238]">
                  <span class="material-icon" aria-hidden="true">podcasts</span>
                  Criacao de episodio
                </p>
                <h1 class="mt-4 font-display text-[32px] font-extrabold leading-tight text-[#5c1e2f]">Novo podcast editorial</h1>
                <p class="mt-3 max-w-[680px] text-[14px] leading-6 text-[#534345]">
                  Organize o episodio com capa, audio, contexto historico e configuracoes de publicacao antes de enviar para revisao.
                </p>
              </div>

              <section class="rounded-[8px] border border-[#e6dde1] bg-[#fbfaf7] p-4">
                <p class="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8a8587]">Resumo do episodio</p>
                <h2 class="mt-2 font-display text-[20px] font-extrabold leading-tight text-[#3a232b]">{{ previewTitle() }}</h2>
                <div class="mt-4 grid grid-cols-2 gap-3 text-[12px]">
                  <span class="rounded-[8px] bg-white px-3 py-2 text-[#534345]"><b class="block text-[#5c1e2f]">Formato</b>Audio</span>
                  <span class="rounded-[8px] bg-white px-3 py-2 text-[#534345]"><b class="block text-[#5c1e2f]">Estado</b>{{ status() }}</span>
                  <span class="rounded-[8px] bg-white px-3 py-2 text-[#534345]"><b class="block text-[#5c1e2f]">Upload</b>{{ uploadProgress() }}%</span>
                  <span class="rounded-[8px] bg-white px-3 py-2 text-[#534345]"><b class="block text-[#5c1e2f]">Acesso</b>{{ visibilityLabel() }}</span>
                </div>
              </section>
            </div>
          </header>

          <section class="mt-6 grid gap-4 md:grid-cols-4">
            @for (metric of metrics; track metric.label) {
              <article class="rounded-[8px] border border-[#eadfe3] bg-white p-5 shadow-[0_12px_30px_rgba(27,22,30,0.045)]">
                <div class="flex items-center justify-between gap-3">
                  <span class="grid size-10 place-items-center rounded-[8px] bg-[#f7edef] text-[#8a1238]">
                    <span class="material-icon" aria-hidden="true">{{ metric.icon }}</span>
                  </span>
                  <span class="text-[11px] font-extrabold uppercase text-[#8a8587]">{{ metric.badge }}</span>
                </div>
                <strong class="mt-4 block font-display text-[24px] font-extrabold leading-none text-[#5c1e2f]">{{ metric.value }}</strong>
                <p class="mt-2 text-[13px] font-bold text-[#3a3236]">{{ metric.label }}</p>
                <p class="mt-1 text-[12px] leading-5 text-[#6f686b]">{{ metric.description }}</p>
              </article>
            }
          </section>

          <section class="mt-6 overflow-hidden rounded-[8px] border border-[#eadfe3] bg-white shadow-[0_18px_45px_rgba(27,22,30,0.05)]">
            <form class="grid gap-0" (submit)="$event.preventDefault()">
              <app-admin-editorial-section title="Detalhes Editoriais" icon="&#9758;" [bordered]="true">
                <label class="grid gap-2">
                  <span class="text-[13px] font-extrabold text-[#534345]">T&iacute;tulo do Epis&oacute;dio <b class="text-[#c43f58]">*</b></span>
                  <input
                    type="text"
                    placeholder="Ex: O Impacto das Rotas Comerciais no S&eacute;culo XVII"
                    maxlength="120"
                    [value]="title()"
                    (input)="setTitle($event)"
                    class="h-12 rounded-[8px] border border-[#ded8dd] bg-white px-4 text-[14px] text-[#2c2729] outline-none placeholder:text-[#9c9699] focus:border-[#5c1e2f] focus:shadow-[0_0_0_3px_rgba(227,212,216,0.65)]"
                  />
                  <span class="-mt-1 text-right text-[12px] text-[#89828b]">{{ title().length }}/120</span>
                </label>

                <div class="grid gap-4 md:grid-cols-3">
                  <label class="grid gap-2">
                    <span class="text-[13px] font-extrabold text-[#534345]">Categoria Principal</span>
                    <select [value]="category()" (change)="setCategory($event)" class="h-11 rounded-[8px] border border-[#ded8dd] bg-white px-3 text-[13px] text-[#534345] outline-none focus:border-[#5c1e2f]">
                      <option>Economia</option>
                      <option>Hist&oacute;ria</option>
                      <option>Textos com Jindungo</option>
                    </select>
                  </label>
                  <label class="grid gap-2">
                    <span class="text-[13px] font-extrabold text-[#534345]">S&eacute;rie / Playlist</span>
                    <input
                      type="text"
                      placeholder="Nome da Cole&ccedil;&atilde;o (Opcional)"
                      [value]="playlist()"
                      (input)="setPlaylist($event)"
                      class="h-11 rounded-[8px] border border-[#ded8dd] bg-white px-3 text-[13px] text-[#534345] outline-none placeholder:text-[#aaa4a7] focus:border-[#5c1e2f]"
                    />
                  </label>
                  <label class="grid gap-2">
                    <span class="text-[13px] font-extrabold text-[#534345]">Duracao estimada</span>
                    <input
                      type="text"
                      placeholder="Ex: 28 min"
                      [value]="duration()"
                      (input)="setDuration($event)"
                      class="h-11 rounded-[8px] border border-[#ded8dd] bg-white px-3 text-[13px] text-[#534345] outline-none placeholder:text-[#aaa4a7] focus:border-[#5c1e2f]"
                    />
                  </label>
                </div>

                <label class="grid gap-2">
                  <span class="text-[13px] font-extrabold text-[#534345]">Descri&ccedil;&atilde;o Editorial</span>
                  <textarea
                    placeholder="Escreva uma breve sinopse do epis&oacute;dio real&ccedil;ando o contexto hist&oacute;rico e os conceitos econ&ocirc;micos abordados..."
                    maxlength="600"
                    [value]="description()"
                    (input)="setDescription($event)"
                    class="min-h-[128px] resize-y rounded-[8px] border border-[#ded8dd] bg-[#fbfaf7] px-4 py-3 text-[14px] leading-6 text-[#2c2729] outline-none placeholder:text-[#8d878b] focus:border-[#5c1e2f] focus:shadow-[0_0_0_3px_rgba(227,212,216,0.65)]"
                  ></textarea>
                  <span class="-mt-1 text-right text-[12px] text-[#89828b]">{{ description().length }}/600</span>
                </label>
              </app-admin-editorial-section>

              <app-admin-editorial-section title="Ficheiro de &Aacute;udio" icon="&#9635;">
                <button type="button" (click)="simulateAudioUpload()" class="grid min-h-[168px] place-items-center rounded-[8px] border border-dashed border-[#cfc7ce] bg-[#fbfaf7] text-center transition hover:border-[#5c1e2f] hover:bg-white">
                  <span>
                    <span class="mx-auto grid size-12 place-items-center rounded-[8px] bg-[#f7edef] text-[#8a1238]">
                      <span class="material-icon text-[30px]" aria-hidden="true">cloud_upload</span>
                    </span>
                    <strong class="mt-4 block text-[14px] font-extrabold text-[#5c1e2f]">{{ audioUploaded() ? 'Audio carregado' : 'Carregar ficheiro MP3 ou WAV' }}</strong>
                    <small class="mt-1 block text-[12px] text-[#8a8587]">{{ audioUploaded() ? 'Clique para reiniciar o processamento' : 'Arraste o seu ficheiro de &aacute;udio para aqui ou clique para procurar' }}</small>
                    <small class="mt-1 block text-[11px] text-[#b0aaad]">M&aacute;ximo 200MB</small>
                  </span>
                </button>

                <div class="flex min-h-[68px] items-center gap-3 rounded-[8px] border border-[#eadfe3] bg-[#fbfaf7] px-4">
                  <span class="grid size-10 shrink-0 place-items-center rounded-[8px] bg-[#5c1e2f] text-white">
                    <span class="material-icon" aria-hidden="true">graphic_eq</span>
                  </span>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-4 text-[12px]">
                      <span class="truncate font-extrabold text-[#2c2729]">{{ audioUploaded() ? 'episodio_jindungo_demo.mp3' : 'demo_vinil_ep04.mp3' }}</span>
                      <span class="shrink-0 font-bold text-[#735c00]">{{ uploadProgress() === 100 ? 'Pronto' : 'A processar...' }} {{ uploadProgress() }}%</span>
                    </div>
                    <div class="mt-2 h-2 overflow-hidden rounded-full bg-[#eee6e9]">
                      <span class="block h-full rounded-full bg-[#5c1e2f]" [style.width.%]="uploadProgress()"></span>
                    </div>
                  </div>
                  <button type="button" aria-label="Remover ficheiro" (click)="removeAudio()" class="grid size-8 place-items-center rounded-[8px] border border-[#eadfe3] bg-white text-[#d03a48]">
                    <span class="material-icon" aria-hidden="true">close</span>
                  </button>
                </div>
              </app-admin-editorial-section>
            </form>
          </section>

          <section class="mt-6 rounded-[8px] border border-[#eadfe3] bg-white p-6 shadow-[0_18px_45px_rgba(27,22,30,0.05)]">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 class="font-display text-[24px] font-extrabold text-[#5c1e2f]">Pre-visualizacao do episodio</h2>
                <p class="mt-2 text-[13px] leading-6 text-[#6f686b]">Como o podcast aparecera na area publica apos a revisao editorial.</p>
              </div>
              <span class="rounded-[999px] bg-[#fff7df] px-3 py-1 text-[11px] font-extrabold uppercase text-[#735c00]">{{ status() }}</span>
            </div>

            <article class="mt-5 grid gap-5 rounded-[8px] border border-[#eadfe3] bg-[#fbfaf7] p-5 md:grid-cols-[180px_minmax(0,1fr)]">
              <img
                src="https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=520&q=80"
                alt="Microfone antigo iluminado"
                class="aspect-square w-full rounded-[8px] object-cover"
              />
              <div class="min-w-0">
                <div class="flex flex-wrap gap-2">
                  <span class="rounded-[999px] bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#5c1e2f]">{{ category() }}</span>
                  <span class="rounded-[999px] bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#735c00]">Podcast</span>
                  <span class="rounded-[999px] bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#6f686b]">{{ durationLabel() }}</span>
                </div>
                <h3 class="mt-4 font-display text-[22px] font-extrabold leading-tight text-[#2c2729]">{{ previewTitle() }}</h3>
                <p class="mt-3 text-[13px] leading-6 text-[#6f686b]">
                  {{ previewDescription() }}
                </p>
                <div class="mt-5 flex items-center gap-3 rounded-[8px] bg-white px-4 py-3">
                  <button type="button" class="grid size-10 place-items-center rounded-full bg-[#5c1e2f] text-white" aria-label="Reproduzir pre-visualizacao">
                    <span class="material-icon" aria-hidden="true">play_arrow</span>
                  </button>
                  <div class="h-2 flex-1 overflow-hidden rounded-full bg-[#eee6e9]">
                    <span class="block h-full w-[42%] rounded-full bg-[#d4af37]"></span>
                  </div>
                  <span class="text-[12px] font-bold text-[#6f686b]">{{ durationLabel() }}</span>
                </div>
              </div>
            </article>
          </section>
        </section>

        <aside class="grid content-start gap-5">
          <section class="rounded-[8px] border border-[#eadfe3] bg-white p-5 shadow-[0_18px_45px_rgba(27,22,30,0.05)]">
            <h2 class="font-display text-[18px] font-extrabold text-[#5c1e2f]">Capa do Epis&oacute;dio</h2>
            <div class="mt-4 overflow-hidden rounded-[8px] bg-[#211a17]">
              <img
                src="https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=520&q=80"
                alt="Microfone antigo iluminado"
                class="aspect-square w-full object-cover"
              />
            </div>
            <button type="button" (click)="coverChanged.update(toggle)" class="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-[#5c1e2f] bg-white px-4 text-[13px] font-extrabold text-[#5c1e2f]">
              <span class="material-icon" aria-hidden="true">image</span>
              {{ coverChanged() ? 'Capa alterada' : 'Alterar capa' }}
            </button>
            <p class="mt-3 text-center text-[11px] text-[#8a8587]">Recomendado: formato quadrado, JPG ou PNG</p>
          </section>

          <section class="rounded-[8px] border border-[#eadfe3] bg-white p-5 shadow-[0_18px_45px_rgba(27,22,30,0.05)]">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8a8587]">Estado</p>
                <strong class="mt-1 block font-display text-[25px] font-extrabold text-[#5c1e2f]">{{ status() }}</strong>
              </div>
              <span class="grid size-11 place-items-center rounded-[8px] bg-[#fff7df] text-[#735c00]">
                <span class="material-icon" aria-hidden="true">pending_actions</span>
              </span>
            </div>
            <div class="mt-5">
              <div class="flex items-center justify-between text-[12px] font-bold text-[#534345]">
                <span>Progresso editorial</span>
                <span>{{ progress() }}%</span>
              </div>
              <div class="mt-2 h-2 overflow-hidden rounded-full bg-[#eee6e9]">
                <span class="block h-full rounded-full bg-[#5c1e2f]" [style.width.%]="progress()"></span>
              </div>
            </div>
          </section>

          <section class="rounded-[8px] border border-[#eadfe3] bg-white p-5 shadow-[0_18px_45px_rgba(27,22,30,0.05)]">
            <h2 class="font-display text-[18px] font-extrabold text-[#5c1e2f]">Centro de controlo</h2>
            <div class="mt-4 grid gap-3">
              @for (item of validationChecklist; track item.label) {
                <p class="flex items-center gap-3 text-[13px] font-semibold text-[#534345]">
                  <span class="grid size-7 place-items-center rounded-full" [class.bg-[#f7edef]]="item.done" [class.text-[#5c1e2f]]="item.done" [class.bg-[#f0eef0]]="!item.done" [class.text-[#8a8587]]="!item.done">
                    <span class="material-icon text-[18px]" aria-hidden="true">{{ item.done ? 'check' : 'radio_button_unchecked' }}</span>
                  </span>
                  {{ item.label }}
                </p>
              }
            </div>
          </section>

          <section class="rounded-[8px] border border-[#eadfe3] bg-white p-5 shadow-[0_18px_45px_rgba(27,22,30,0.05)]">
            <h2 class="font-display text-[18px] font-extrabold text-[#5c1e2f]">Visibilidade</h2>
            <div class="mt-4 grid gap-3">
              @for (option of visibilityOptions; track option.labelHtml) {
                <label class="flex min-h-[58px] items-start gap-3 rounded-[8px] border border-[#eadfe3] px-3 py-3" [class.border-[#f1c8d2]]="visibility() === option.value" [class.bg-[#fff8fa]]="visibility() === option.value" [class.bg-white]="visibility() !== option.value">
                  <input type="radio" name="visibility" [checked]="visibility() === option.value" (change)="visibility.set(option.value)" class="mt-0.5 accent-bordeaux" />
                  <span>
                    <strong class="block text-[13px] text-[#2c2729]" [innerHTML]="option.labelHtml"></strong>
                    <small class="mt-1 block text-[11px] leading-4 text-[#8a8587]" [innerHTML]="option.descriptionHtml"></small>
                  </span>
                </label>
              }
            </div>
          </section>

          <section class="rounded-[8px] border border-[#eadfe3] bg-white p-5 shadow-[0_18px_45px_rgba(27,22,30,0.05)]">
            <h2 class="font-display text-[18px] font-extrabold text-[#5c1e2f]">Agendamento</h2>
            <label class="mt-4 flex items-center gap-2 text-[13px] font-semibold text-[#2c2729]">
              <input type="checkbox" [checked]="scheduled()" (change)="scheduled.update(toggle)" class="accent-bordeaux" />
              Publicar mais tarde
            </label>
            <label class="mt-4 grid gap-2">
              <span class="text-[12px] font-bold text-[#534345]">Data de Lan&ccedil;amento</span>
              <input type="text" placeholder="mm/dd/yyyy" [value]="scheduleDate()" (input)="setScheduleDate($event)" [disabled]="!scheduled()" class="h-11 rounded-[8px] border border-[#ded8dd] bg-white px-3 text-[13px] outline-none placeholder:text-[#b0aaad] focus:border-[#5c1e2f] disabled:bg-[#f3f0f2]" />
            </label>
            <label class="mt-3 grid gap-2">
              <span class="text-[12px] font-bold text-[#534345]">Hora Luanda (GMT+1)</span>
              <input type="text" placeholder="--:--" [value]="scheduleTime()" (input)="setScheduleTime($event)" [disabled]="!scheduled()" class="h-11 rounded-[8px] border border-[#ded8dd] bg-white px-3 text-[13px] outline-none placeholder:text-[#b0aaad] focus:border-[#5c1e2f] disabled:bg-[#f3f0f2]" />
            </label>
          </section>

          <section class="grid gap-3">
            <button type="button" (click)="publish()" class="inline-flex h-12 items-center justify-center gap-3 rounded-[8px] bg-[#5c1e2f] px-4 text-[14px] font-extrabold text-white shadow-[0_12px_24px_rgba(92,30,47,0.2)]">
              <span class="material-icon" aria-hidden="true">publish</span>
              Publicar podcast
            </button>
            <button type="button" (click)="saveDraft()" class="inline-flex h-12 items-center justify-center gap-3 rounded-[8px] border border-[#5c1e2f] bg-white px-4 text-[14px] font-extrabold text-[#5c1e2f]">
              <span class="material-icon" aria-hidden="true">save</span>
              Guardar rascunho
            </button>
          </section>
        </aside>
      </main>
    </app-admin-console-shell>
  `,
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
  readonly previewDescription = computed(() => this.description().trim() || 'Episodio sobre redes comerciais, circulacao monetaria e memoria social, preparado para publicacao com contexto historico e leitura economica.');
  readonly durationLabel = computed(() => this.duration().trim() || '28 min');
  readonly visibilityLabel = computed(() => this.visibilityOptions.find((option) => option.value === this.visibility())?.plainLabel ?? 'Publico');

  readonly metrics = [
    { icon: 'graphic_eq', value: '68%', label: 'Audio processado', badge: 'Upload', description: 'Ficheiro carregado e em validacao tecnica.' },
    { icon: 'schedule', value: '28 min', label: 'Duracao prevista', badge: 'Aluno', description: 'Tempo estimado para escuta completa.' },
    { icon: 'library_music', value: 'Serie 1', label: 'Playlist', badge: 'Acervo', description: 'Episodio ligado a uma colecao editorial.' },
    { icon: 'verified_user', value: '72%', label: 'Pronto para revisao', badge: 'Editor', description: 'Checklist editorial parcialmente concluida.' },
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
