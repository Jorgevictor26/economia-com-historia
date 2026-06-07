import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminConsoleShellComponent } from '../components/admin-console-shell.component';

@Component({
  selector: 'app-admin-forum-create-page',
  imports: [RouterLink, AdminConsoleShellComponent],
  template: `
    <app-admin-console-shell activeItem="contents">
      <main class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <section class="min-w-0">
          <header class="overflow-hidden rounded-[8px] border border-[#eadfe3] bg-white shadow-[0_18px_45px_rgba(27,22,30,0.05)]">
            <div class="grid gap-6 p-7 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div>
                <a routerLink="/admin" class="inline-flex items-center gap-2 text-[13px] font-semibold text-[#5f5861]">
                  <span aria-hidden="true" class="text-[18px] leading-none">&larr;</span>
                  Voltar a conte&uacute;dos
                </a>
                <p class="mt-6 inline-flex items-center gap-2 rounded-[999px] bg-[#f7edef] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8a1238]">
                  <span class="material-icon" aria-hidden="true">forum</span>
                  Debate orientado
                </p>
                <h1 class="mt-4 font-display text-[32px] font-extrabold leading-tight text-[#5c1e2f]">Criar novo f&oacute;rum</h1>
                <p class="mt-3 max-w-[680px] text-[14px] leading-6 text-[#534345]">
                  Estruture um espa&ccedil;o de debate com regras claras, conte&uacute;dos associados, controlo de acesso e modera&ccedil;&atilde;o editorial.
                </p>
              </div>

              <section class="rounded-[8px] border border-[#e6dde1] bg-[#fbfaf7] p-4">
                <p class="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8a8587]">Resumo do debate</p>
                <h2 class="mt-2 font-display text-[20px] font-extrabold leading-tight text-[#3a232b]">{{ previewTitle() }}</h2>
                <div class="mt-4 grid grid-cols-2 gap-3 text-[12px]">
                  <span class="rounded-[8px] bg-white px-3 py-2 text-[#534345]"><b class="block text-[#5c1e2f]">Categoria</b>{{ category() }}</span>
                  <span class="rounded-[8px] bg-white px-3 py-2 text-[#534345]"><b class="block text-[#5c1e2f]">Acesso</b>{{ publicVisible() ? 'Publico' : 'Restrito' }}</span>
                  <span class="rounded-[8px] bg-white px-3 py-2 text-[#534345]"><b class="block text-[#5c1e2f]">Anexos</b>{{ allowAttachments() ? 'PDFs' : 'Desligado' }}</span>
                  <span class="rounded-[8px] bg-white px-3 py-2 text-[#534345]"><b class="block text-[#5c1e2f]">Estado</b>{{ status() }}</span>
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

          <form class="mt-6 grid gap-5" (submit)="$event.preventDefault()">
            <section class="rounded-[8px] border border-[#eadfe3] bg-white p-6 shadow-[0_18px_45px_rgba(27,22,30,0.05)]">
              <h2 class="flex items-center gap-3 font-display text-[24px] font-extrabold text-[#5c1e2f]">
                <span class="material-icon" aria-hidden="true">format_list_bulleted</span>
                Informa&ccedil;&atilde;o estrutural
              </h2>
              <p class="mt-2 text-[13px] leading-6 text-[#6f686b]">Defina o t&iacute;tulo, o enquadramento e as regras que guiam a participa&ccedil;&atilde;o.</p>

              <label class="mt-5 grid gap-2">
                <span class="text-[13px] font-extrabold text-[#534345]">T&iacute;tulo do f&oacute;rum <b class="text-[#c43f58]">*</b></span>
                <input
                  type="text"
                  placeholder="Ex: O Impacto da Moeda Colonial no Com&eacute;rcio Transatl&acirc;ntico"
                  maxlength="120"
                  [value]="title()"
                  (input)="setTitle($event)"
                  class="h-12 rounded-[8px] border border-[#ded8dd] bg-white px-4 text-[14px] text-[#2c2729] outline-none placeholder:text-[#9a949d] focus:border-[#5c1e2f] focus:shadow-[0_0_0_3px_rgba(227,212,216,0.65)]"
                />
                <span class="-mt-1 text-right text-[12px] text-[#89828b]">{{ title().length }}/120</span>
              </label>

              <label class="mt-4 grid gap-2">
                <span class="text-[13px] font-extrabold text-[#534345]">Regras e directrizes do f&oacute;rum</span>
                <textarea
                  placeholder="Defina as normas de conduta, refer&ecirc;ncias bibliogr&aacute;ficas obrigat&oacute;rias e tom do debate..."
                  maxlength="700"
                  [value]="rules()"
                  (input)="setRules($event)"
                  class="min-h-[150px] resize-y rounded-[8px] border border-[#ded8dd] bg-[#fbfaf7] px-4 py-3 text-[14px] leading-6 text-[#2c2729] outline-none placeholder:text-[#9a949d] focus:border-[#5c1e2f] focus:shadow-[0_0_0_3px_rgba(227,212,216,0.65)]"
                ></textarea>
                <span class="-mt-1 text-right text-[12px] text-[#89828b]">{{ rules().length }}/700</span>
              </label>
            </section>

            <section class="rounded-[8px] border border-[#eadfe3] bg-white p-6 shadow-[0_18px_45px_rgba(27,22,30,0.05)]">
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 class="flex items-center gap-3 font-display text-[24px] font-extrabold text-[#5c1e2f]">
                    <span class="material-icon" aria-hidden="true">hub</span>
                    Vincula&ccedil;&atilde;o de conte&uacute;do
                  </h2>
                  <p class="mt-2 text-[13px] leading-6 text-[#6f686b]">Selecione o conte&uacute;do acad&eacute;mico que servir&aacute; de complemento ao debate.</p>
                </div>
                <button type="button" class="inline-flex h-10 items-center gap-2 rounded-[8px] border border-[#5c1e2f] bg-white px-4 text-[12px] font-extrabold text-[#5c1e2f]">
                  <span class="material-icon" aria-hidden="true">search</span>
                  Procurar conte&uacute;dos
                </button>
              </div>

              <div class="mt-5 grid gap-4 md:grid-cols-2">
                @for (content of linkedContents; track content.title) {
                  <label
                    class="flex min-h-[96px] cursor-pointer items-start gap-4 rounded-[8px] border p-4 transition hover:bg-[#fff8fa]"
                    [class.border-[#5c1e2f]]="selectedContent() === content.title"
                    [class.bg-[#fff8fa]]="selectedContent() === content.title"
                    [class.border-[#eadfe3]]="selectedContent() !== content.title"
                    [class.bg-white]="selectedContent() !== content.title"
                    (click)="selectedContent.set(content.title)"
                  >
                    <span class="grid size-10 shrink-0 place-items-center rounded-[8px] bg-[#f7edef] text-[#8a1238]">
                      <span class="material-icon" aria-hidden="true">{{ content.icon }}</span>
                    </span>
                    <span class="min-w-0 flex-1">
                      <strong class="block text-[14px] font-extrabold leading-5 text-[#5c1e2f]">{{ content.title }}</strong>
                      <small class="mt-1 block text-[11px] font-bold uppercase text-[#8a8587]">{{ content.meta }}</small>
                    </span>
                    <input type="radio" name="linkedContent" [checked]="selectedContent() === content.title" class="mt-1 accent-bordeaux" />
                  </label>
                }
              </div>
            </section>

            <section class="rounded-[8px] border border-[#eadfe3] bg-white p-6 shadow-[0_18px_45px_rgba(27,22,30,0.05)]">
              <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 class="font-display text-[24px] font-extrabold text-[#5c1e2f]">Pre-visualiza&ccedil;&atilde;o do debate</h2>
                  <p class="mt-2 text-[13px] leading-6 text-[#6f686b]">Amostra de como o f&oacute;rum aparece para estudantes e moderadores.</p>
                </div>
                <span class="rounded-[999px] bg-[#fff7df] px-3 py-1 text-[11px] font-extrabold uppercase text-[#735c00]">Configura&ccedil;&atilde;o {{ progress() }}%</span>
              </div>

              <article class="mt-5 rounded-[8px] border border-[#eadfe3] bg-[#fbfaf7] p-5">
                <div class="grid gap-5 md:grid-cols-[180px_minmax(0,1fr)]">
                  <div class="overflow-hidden rounded-[8px] bg-[#221816]">
                    <img
                      src="https://images.unsplash.com/photo-1515169067865-5387ec356754?auto=format&fit=crop&w=520&q=80"
                      alt="Sala de debate com publico"
                      class="aspect-[4/3] w-full object-cover"
                    />
                  </div>
                  <div class="min-w-0">
                    <div class="flex flex-wrap gap-2">
                      <span class="rounded-[999px] bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#5c1e2f]">{{ category() }}</span>
                      <span class="rounded-[999px] bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#735c00]">Debate moderado</span>
                      <span class="rounded-[999px] bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#6f686b]">{{ publicVisible() ? 'Publico' : 'Restrito' }}</span>
                    </div>
                    <h3 class="mt-4 font-display text-[22px] font-extrabold leading-tight text-[#2c2729]">{{ previewTitle() }}</h3>
                    <p class="mt-3 text-[13px] leading-6 text-[#6f686b]">
                      {{ previewRules() }}
                    </p>
                    <div class="mt-5 grid gap-2">
                      <span class="h-2 w-[78%] rounded-full bg-[#ddd8da]"></span>
                      <span class="h-2 w-[54%] rounded-full bg-[#e9e4e6]"></span>
                    </div>
                  </div>
                </div>
              </article>
            </section>
          </form>
        </section>

        <aside class="grid content-start gap-5">
          <section class="grid gap-3">
            <button type="button" (click)="publish()" class="inline-flex h-12 items-center justify-center gap-3 rounded-[8px] bg-[#5c1e2f] px-4 text-[14px] font-extrabold text-white shadow-[0_12px_24px_rgba(92,30,47,0.2)]">
              <span class="material-icon" aria-hidden="true">publish</span>
              Publicar f&oacute;rum
            </button>
            <button type="button" (click)="saveDraft()" class="inline-flex h-12 items-center justify-center gap-3 rounded-[8px] border border-[#5c1e2f] bg-white px-4 text-[14px] font-extrabold text-[#5c1e2f]">
              <span class="material-icon" aria-hidden="true">save</span>
              Guardar rascunho
            </button>
          </section>

          <section class="rounded-[8px] border border-[#eadfe3] bg-white p-5 shadow-[0_18px_45px_rgba(27,22,30,0.05)]">
            <h2 class="font-display text-[18px] font-extrabold text-[#5c1e2f]">Configura&ccedil;&otilde;es de acesso</h2>
            <label class="mt-4 grid gap-2">
              <span class="text-[12px] font-extrabold text-[#534345]">Categoria</span>
              <select [value]="category()" (change)="setCategory($event)" class="h-11 rounded-[8px] border border-[#ded8dd] bg-white px-3 text-[13px] text-[#534345] outline-none focus:border-[#5c1e2f]">
                <option>Economia Pol&iacute;tica</option>
                <option>Hist&oacute;ria Econ&oacute;mica</option>
                <option>Finan&ccedil;as P&uacute;blicas</option>
              </select>
            </label>

            <div class="mt-5 grid gap-4">
              @for (setting of accessSettings; track setting.label) {
                <label class="flex items-center justify-between gap-4 rounded-[8px] border border-[#eadfe3] bg-white px-3 py-3">
                  <span>
                    <strong class="block text-[13px] text-[#2c2729]">{{ setting.label }}</strong>
                    <small class="mt-1 block text-[11px] leading-4 text-[#8a8587]">{{ setting.description }}</small>
                  </span>
                  <input type="checkbox" [checked]="setting.checked()" (change)="setting.toggle()" class="size-4 accent-bordeaux" />
                </label>
              }
            </div>
          </section>

          <section class="rounded-[8px] border border-[#eadfe3] bg-white p-5 shadow-[0_18px_45px_rgba(27,22,30,0.05)]">
            <h2 class="font-display text-[18px] font-extrabold text-[#5c1e2f]">Guia para o sistema</h2>
            <div class="mt-4 overflow-hidden rounded-[8px] bg-[#221816]">
              <img
                src="https://images.unsplash.com/photo-1515169067865-5387ec356754?auto=format&fit=crop&w=520&q=80"
                alt="Discussao academica em auditorio"
                class="aspect-[4/3] w-full object-cover"
              />
            </div>
            <p class="mt-4 rounded-[8px] bg-[#fbfaf7] px-4 py-3 text-[13px] leading-5 text-[#6f686b]">
              {{ previewRules() }}
            </p>
            <div class="mt-4">
              <div class="flex items-center justify-between text-[12px] font-bold text-[#534345]">
                <span>Progresso da configura&ccedil;&atilde;o</span>
                <span>{{ progress() }}%</span>
              </div>
              <div class="mt-2 h-2 overflow-hidden rounded-full bg-[#eee6e9]">
                <span class="block h-full rounded-full bg-[#d4af37]" [style.width.%]="progress()"></span>
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
