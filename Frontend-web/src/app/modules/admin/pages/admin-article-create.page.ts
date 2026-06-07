import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminConsoleShellComponent } from '../components/admin-console-shell.component';

@Component({
  selector: 'app-admin-article-create-page',
  imports: [RouterLink, AdminConsoleShellComponent],
  template: `
    <app-admin-console-shell activeItem="contents">
      <main class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
        <section class="min-w-0 rounded-[8px] border border-[#ece7ea] bg-white px-8 py-6 shadow-[0_18px_45px_rgba(27,22,30,0.05)] max-md:px-5">
          <header class="flex items-start justify-between gap-6">
            <div>
              <a routerLink="/admin" class="inline-flex items-center gap-2 text-[13px] font-semibold text-[#5f5861]">
                <span aria-hidden="true" class="text-[18px] leading-none">&larr;</span>
                Voltar a conte&uacute;dos
              </a>
              <h1 class="mt-7 font-display text-[28px] font-extrabold leading-none text-[#4a1425]">Novo artigo acad&eacute;mico</h1>
              <p class="mt-3 max-w-[690px] text-[14px] leading-6 text-[#69616a]">
                Publique conte&uacute;dos hist&oacute;ricos e econ&oacute;micos com rigor acad&eacute;mico. Pol&iacute;ticas com conte&uacute;do de qualidade t&ecirc;m maior impacto na nossa comunidade.
              </p>
            </div>

            <ol class="flex shrink-0 items-center gap-3 text-[11px] font-semibold text-[#aaa3aa] max-md:hidden">
              <li class="flex items-center gap-1.5 text-[#7d193b]"><span class="grid size-5 place-items-center rounded-full border border-[#7d193b] text-[11px]">1</span> Dados</li>
              <li class="flex items-center gap-1.5"><span class="grid size-5 place-items-center rounded-full border border-[#d9d3d7]">2</span> Estrutura</li>
              <li class="flex items-center gap-1.5"><span class="grid size-5 place-items-center rounded-full border border-[#d9d3d7]">3</span> Revis&atilde;o</li>
            </ol>
          </header>

          <form class="mt-7 grid gap-5" (submit)="$event.preventDefault()">
            <section class="rounded-[8px] border border-[#e5dde2] bg-white p-5">
              <h2 class="flex items-center gap-3 text-[18px] font-extrabold text-[#8a1238]">
                <span class="grid size-5 place-items-center text-[20px] leading-none" style="font-family: 'Material Symbols Outlined'; font-feature-settings: 'liga'; -webkit-font-feature-settings: 'liga'; font-variation-settings: 'FILL' 0, 'wght' 430, 'GRAD' 0, 'opsz' 24;" aria-hidden="true">article</span>
                Dados principais
              </h2>

              <label class="mt-6 grid gap-2">
                <span class="text-[13px] font-bold text-[#554d57]">T&iacute;tulo do artigo <b class="text-[#c43f58]">*</b></span>
                <input type="text" placeholder="Ex: A Evolu&ccedil;&atilde;o do Com&eacute;rcio no Reino do Kongo" maxlength="100" [value]="title()" (input)="setTitle($event)" class="h-12 rounded-[8px] border border-[#ded8dd] bg-white px-4 text-[14px] text-[#2c2729] outline-none placeholder:text-[#9a949d] focus:border-[#9b1640]" />
                <span class="-mt-1 text-right text-[12px] text-[#89828b]">{{ title().length }}/100</span>
              </label>

              <label class="mt-4 grid gap-2">
                <span class="text-[13px] font-bold text-[#554d57]">Resumo acad&eacute;mico <b class="text-[#c43f58]">*</b></span>
                <textarea placeholder="S&iacute;ntese do objetivo, contexto hist&oacute;rico e conceitos econ&oacute;micos abordados..." maxlength="500" [value]="summary()" (input)="setSummary($event)" class="min-h-[104px] resize-y rounded-[8px] border border-[#ded8dd] bg-white px-4 py-3 text-[14px] leading-6 text-[#2c2729] outline-none placeholder:text-[#9a949d] focus:border-[#9b1640]"></textarea>
                <span class="-mt-1 text-right text-[12px] text-[#89828b]">{{ summary().length }}/500</span>
              </label>

              <div class="mt-4 grid gap-4 md:grid-cols-3">
                <label class="grid gap-2">
                  <span class="text-[13px] font-bold text-[#554d57]">Categoria <b class="text-[#c43f58]">*</b></span>
                  <select [value]="category()" (change)="setCategory($event)" class="h-11 rounded-[8px] border border-[#ded8dd] bg-white px-3 text-[13px] text-[#8a828b] outline-none focus:border-[#9b1640]">
                    <option>Selecione uma categoria</option>
                    <option>Economia</option>
                    <option>Hist&oacute;ria</option>
                    <option>Textos com Jindungo</option>
                  </select>
                </label>
                <label class="grid gap-2">
                  <span class="text-[13px] font-bold text-[#554d57]">Tipo <b class="text-[#c43f58]">*</b></span>
                  <select [value]="type()" (change)="setType($event)" class="h-11 rounded-[8px] border border-[#ded8dd] bg-white px-3 text-[13px] text-[#8a828b] outline-none focus:border-[#9b1640]">
                    <option>Selecione o tipo</option>
                    <option>Artigo</option>
                    <option>Ensaio</option>
                    <option>Estudo de caso</option>
                  </select>
                </label>
                <label class="grid gap-2">
                  <span class="text-[13px] font-bold text-[#554d57]">Tempo de leitura <b class="text-[#c43f58]">*</b></span>
                  <select [value]="readTime()" (change)="setReadTime($event)" class="h-11 rounded-[8px] border border-[#ded8dd] bg-white px-3 text-[13px] text-[#8a828b] outline-none focus:border-[#9b1640]">
                    <option>Selecione</option>
                    <option>5 min</option>
                    <option>10 min</option>
                    <option>15 min</option>
                  </select>
                </label>
              </div>
            </section>

            <section class="rounded-[8px] border border-[#e5dde2] bg-white p-5">
              <h2 class="flex items-center gap-3 text-[18px] font-extrabold text-[#8a1238]">
                <span class="grid size-5 place-items-center text-[20px] leading-none" style="font-family: 'Material Symbols Outlined'; font-feature-settings: 'liga'; -webkit-font-feature-settings: 'liga'; font-variation-settings: 'FILL' 0, 'wght' 430, 'GRAD' 0, 'opsz' 24;" aria-hidden="true">edit_square</span>
                Conte&uacute;do do artigo
              </h2>

              <div class="mt-5 overflow-hidden rounded-[8px] border border-[#ded8dd] bg-white">
                <div class="flex min-h-11 flex-wrap items-center gap-4 border-b border-[#ebe5e8] px-4 text-[14px] text-[#4f4852]">
                  <select aria-label="Estilo de texto" class="h-8 bg-transparent text-[13px] outline-none">
                    <option>Normal</option>
                    <option>T&iacute;tulo</option>
                    <option>Cita&ccedil;&atilde;o</option>
                  </select>
                  <button type="button" class="grid size-7 place-items-center font-extrabold" aria-label="Negrito">B</button>
                  <button type="button" class="grid size-7 place-items-center italic" aria-label="It&aacute;lico">I</button>
                  <button type="button" class="grid size-7 place-items-center underline" aria-label="Sublinhado">U</button>
                  <button type="button" class="grid size-7 place-items-center" aria-label="Lista"><span style="font-family: 'Material Symbols Outlined'; font-feature-settings: 'liga'; -webkit-font-feature-settings: 'liga';">format_list_bulleted</span></button>
                  <button type="button" class="grid size-7 place-items-center" aria-label="Alinhar"><span style="font-family: 'Material Symbols Outlined'; font-feature-settings: 'liga'; -webkit-font-feature-settings: 'liga';">format_align_left</span></button>
                  <button type="button" class="grid size-7 place-items-center" aria-label="Link"><span style="font-family: 'Material Symbols Outlined'; font-feature-settings: 'liga'; -webkit-font-feature-settings: 'liga';">link</span></button>
                  <button type="button" class="grid size-7 place-items-center" aria-label="Imagem"><span style="font-family: 'Material Symbols Outlined'; font-feature-settings: 'liga'; -webkit-font-feature-settings: 'liga';">image</span></button>
                  <button type="button" class="grid size-7 place-items-center" aria-label="Citacao">&rdquo;</button>
                  <button type="button" class="grid size-7 place-items-center" aria-label="Tabela">&#9638;</button>
                  <button type="button" class="grid size-7 place-items-center" aria-label="Formula">T<sub>x</sub></button>
                  <button type="button" class="grid size-7 place-items-center" aria-label="Ajuda">?</button>
                </div>
                <textarea [value]="body()" (input)="setBody($event)" class="min-h-[210px] w-full resize-y border-0 px-4 py-4 text-[15px] leading-7 text-[#2c2729] outline-none" placeholder="Escreva o conte&uacute;do aqui..."></textarea>
              </div>
            </section>
          </form>

          @if (showPreview()) {
            <section class="mt-5 rounded-[8px] border border-[#e5dde2] bg-[#fbfaf7] p-5">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <h2 class="font-display text-[22px] font-extrabold text-[#4a1425]">{{ previewTitle() }}</h2>
                <span class="rounded-[999px] bg-white px-3 py-1 text-[11px] font-extrabold uppercase text-[#735c00]">{{ status() }}</span>
              </div>
              <p class="mt-3 text-[13px] leading-6 text-[#69616a]">{{ previewSummary() }}</p>
              <div class="mt-4 flex flex-wrap gap-2">
                <span class="rounded-[999px] bg-white px-3 py-1 text-[11px] font-bold text-[#8a1238]">{{ categoryLabel() }}</span>
                <span class="rounded-[999px] bg-white px-3 py-1 text-[11px] font-bold text-[#8a1238]">{{ typeLabel() }}</span>
                <span class="rounded-[999px] bg-white px-3 py-1 text-[11px] font-bold text-[#8a1238]">{{ readTimeLabel() }}</span>
              </div>
            </section>
          }
        </section>

        <aside class="grid content-start gap-5">
          <section class="rounded-[8px] border border-[#ece7ea] bg-white p-5 shadow-[0_18px_45px_rgba(27,22,30,0.05)]">
            <h2 class="text-[16px] font-extrabold text-[#39333c]">Imagem de capa</h2>
            <button type="button" (click)="coverUploaded.set(!coverUploaded())" class="mt-5 grid min-h-[156px] w-full place-items-center rounded-[8px] border border-dashed border-[#cfc7ce] bg-white text-center">
              <span>
                <span class="mx-auto grid size-10 place-items-center text-[30px] text-[#85808a]" style="font-family: 'Material Symbols Outlined'; font-feature-settings: 'liga'; -webkit-font-feature-settings: 'liga'; font-variation-settings: 'FILL' 0, 'wght' 430, 'GRAD' 0, 'opsz' 24;" aria-hidden="true">{{ coverUploaded() ? 'image' : 'cloud_upload' }}</span>
                <small class="mt-3 block text-[12px] font-semibold text-[#817982]">{{ coverUploaded() ? 'Capa selecionada' : 'Arraste ou clique para carregar' }}</small>
                <small class="mt-1 block text-[11px] text-[#958e97]">{{ coverUploaded() ? 'Clique para remover/trocar' : 'PNG, JPG at&eacute; 5MB' }}</small>
                <small class="mt-1 block text-[11px] text-[#958e97]">Recomendado: 16:9</small>
              </span>
            </button>
          </section>

          <section class="rounded-[8px] border border-[#ece7ea] bg-white p-5 shadow-[0_18px_45px_rgba(27,22,30,0.05)]">
            <h2 class="text-[16px] font-extrabold text-[#39333c]">Publica&ccedil;&atilde;o</h2>
            <div class="mt-5 grid gap-4 text-[14px] font-medium text-[#625b65]">
              <label class="flex items-center justify-between gap-4"><span class="flex items-center gap-3"><span style="font-family: 'Material Symbols Outlined'; font-feature-settings: 'liga'; -webkit-font-feature-settings: 'liga';" aria-hidden="true">public</span> P&uacute;blico</span><input type="radio" name="visibility" [checked]="visibility() === 'publico'" (change)="visibility.set('publico')" class="size-4 accent-bordeaux" /></label>
              <label class="flex items-center justify-between gap-4"><span class="flex items-center gap-3"><span style="font-family: 'Material Symbols Outlined'; font-feature-settings: 'liga'; -webkit-font-feature-settings: 'liga';" aria-hidden="true">monitoring</span> An&aacute;lise geral</span><input type="radio" name="visibility" [checked]="visibility() === 'analise'" (change)="visibility.set('analise')" class="size-4 accent-bordeaux" /></label>
              <label class="flex items-center justify-between gap-4"><span class="flex items-center gap-3"><span style="font-family: 'Material Symbols Outlined'; font-feature-settings: 'liga'; -webkit-font-feature-settings: 'liga';" aria-hidden="true">lock</span> Privado</span><input type="radio" name="visibility" [checked]="visibility() === 'privado'" (change)="visibility.set('privado')" class="size-4 accent-bordeaux" /></label>
            </div>
          </section>

          <section class="rounded-[8px] border border-[#ece7ea] bg-white p-5 shadow-[0_18px_45px_rgba(27,22,30,0.05)]">
            <h2 class="text-[16px] font-extrabold text-[#39333c]">Estado</h2>
            <strong class="mt-2 block font-display text-[24px] font-extrabold text-[#8a1238]">{{ status() }}</strong>
            <p class="mt-2 text-[12px] leading-5 text-[#69616a]">{{ progress() }}% preenchido</p>
            <div class="mt-2 h-2 overflow-hidden rounded-full bg-[#eee6e9]">
              <span class="block h-full rounded-full bg-[#8a1238]" [style.width.%]="progress()"></span>
            </div>
          </section>

          <section class="rounded-[8px] border border-[#f3ddbf] bg-[#fff5e8] p-5 text-[#6f3d12]">
            <h2 class="flex items-center gap-2 text-[14px] font-extrabold"><span aria-hidden="true">&#128161;</span> Dica</h2>
            <p class="mt-3 text-[13px] leading-5 text-[#68451e]">Revise o seu conte&uacute;do antes de publicar para garantir a melhor qualidade.</p>
          </section>

          <section class="grid gap-3">
            <button type="button" (click)="saveDraft()" class="inline-flex h-12 items-center justify-center gap-3 rounded-[8px] bg-[#8a1238] px-4 text-[14px] font-extrabold text-white shadow-[0_10px_24px_rgba(138,18,56,0.22)]">
              <span style="font-family: 'Material Symbols Outlined'; font-feature-settings: 'liga'; -webkit-font-feature-settings: 'liga';" aria-hidden="true">save</span>
              Guardar rascunho
            </button>
            <button type="button" (click)="togglePreview()" class="inline-flex h-12 items-center justify-center gap-3 rounded-[8px] border border-[#9b1640] bg-white px-4 text-[14px] font-extrabold text-[#9b1640]">
              <span style="font-family: 'Material Symbols Outlined'; font-feature-settings: 'liga'; -webkit-font-feature-settings: 'liga';" aria-hidden="true">visibility</span>
              {{ showPreview() ? 'Ocultar preview' : 'Pr&eacute;-visualizar' }}
            </button>
          </section>
        </aside>
      </main>
    </app-admin-console-shell>
  `,
})
export class AdminArticleCreatePage {
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

  togglePreview(): void {
    this.showPreview.update((value) => !value);
    this.status.set('Em revisao');
  }

  private eventValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
  }
}
