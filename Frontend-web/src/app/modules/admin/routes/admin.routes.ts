import { Component, computed, signal } from '@angular/core';
import { RouterLink, Routes } from '@angular/router';
import { AdminConsoleShellComponent } from '../components/admin-console-shell.component';
import { AdminEditorialSectionComponent } from '../components/admin-editorial-section.component';
import { AdminArticleCreatePage as AdminArticleCreateStandalonePage } from '../pages/admin-article-create.page';
import { AdminForumCreatePage } from '../pages/admin-forum-create.page';
import { AdminJindungoCreatePage } from '../pages/admin-jindungo-create.page';
import { AdminPodcastCreatePage } from '../pages/admin-podcast-create.page';
import { AdminQuizCreatePage as AdminQuizCreateStandalonePage } from '../pages/admin-quiz-create.page';
import { AdminVideoCreatePage } from '../pages/admin-video-create.page';

interface AdminMetric {
  label: string;
  value: string;
  delta: string;
}

interface StudentRank {
  position: number;
  name: string;
  course: string;
  score: number;
  avatar: string;
}

@Component({
  selector: 'app-admin-page',
  imports: [RouterLink],
  template: `
    <section class="-m-6 grid min-h-dvh grid-cols-[220px_minmax(0,1fr)] bg-white text-[#2c2729]">
      <aside class="flex min-h-dvh flex-col border-r border-[#e7e2e4] bg-[#f3f4f5]">
        <a routerLink="/admin" class="flex h-[70px] items-center gap-2 px-5 text-[#8a4055]">
          <img src="/auth-logo.png" alt="Economia com História" class="h-[25px] w-auto" />
          <span class="font-display text-[13px] font-extrabold">Economia com História</span>
        </a>

        <nav class="mt-4 grid gap-7 px-0">
          <div>
            <p class="px-5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#8a8587]">Plataforma</p>
            <div class="mt-3 grid">
              <a routerLink="/admin" class="flex h-11 items-center gap-3 border-r-2 border-[#9b4056] bg-[#f7edef] px-5 text-[12px] font-bold text-[#9b4056]">
                <span class="grid size-5 place-items-center text-[14px]">▦</span>
                Painel Global
              </a>
            </div>
          </div>

          <div>
            <p class="px-5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#8a8587]">Administração</p>
            <div class="mt-3 grid gap-1">
              <a routerLink="/admin/quiz" class="flex h-10 items-center gap-3 px-5 text-[12px] font-medium text-[#534c50] hover:bg-white hover:text-[#9b4056]">
                <span class="grid size-5 place-items-center text-[14px]">◷</span>
                Gestão de Quiz
              </a>
              <a routerLink="/admin/contents" class="flex h-10 items-center gap-3 px-5 text-[12px] font-medium text-[#534c50] hover:bg-white hover:text-[#9b4056]">
                <span class="grid size-5 place-items-center text-[14px]">◉</span>
                Conteúdos
              </a>
            </div>
          </div>

          <div>
            <p class="px-5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#8a8587]">Infraestrutura</p>
            <div class="mt-3 grid gap-1">
              <a routerLink="/admin/settings" class="flex h-10 items-center gap-3 px-5 text-[12px] font-medium text-[#534c50] hover:bg-white hover:text-[#9b4056]">
                <span class="grid size-5 place-items-center text-[14px]">⚙</span>
                Configurações
              </a>
            </div>
          </div>
        </nav>

        <div class="mt-auto flex items-center gap-3 border-t border-[#e7e2e4] px-5 py-5">
          <span class="grid size-10 shrink-0 place-items-center rounded-md bg-[#9b4056] text-[13px] font-extrabold text-white">CT</span>
          <div>
            <p class="text-[12px] font-extrabold text-[#2c2729]">Carlos Tchipia</p>
            <p class="text-[10px] text-[#8a8587]">Administrador</p>
          </div>
        </div>
      </aside>

      <div class="min-w-0">
        <header class="flex h-[70px] items-center gap-5 border-b border-[#e7e2e4] bg-[#f3f4f5] px-12">
          <button type="button" aria-label="Abrir navegação" class="grid size-8 place-items-center text-[28px] text-[#9b4056]">≡</button>
          <label class="relative flex h-10 w-[340px] items-center gap-3 rounded-lg bg-white px-4 text-[#8a8587]">
            <span class="text-[16px]">⌕</span>
            <input type="search" placeholder="Pesquisar..." class="w-full bg-transparent text-[12px] text-[#2c2729] outline-none placeholder:text-[#9a9497]" [value]="searchTerm()" (input)="updateSearch($event)" />
            @if (searchTerm()) {
              <section class="absolute left-0 top-12 z-50 grid w-full overflow-hidden rounded-[8px] border border-[#e3d4d8] bg-white text-left shadow-xl">
                @if (searchResults().length) {
                  @for (result of searchResults(); track result.label) {
                    <a [routerLink]="result.route" class="grid gap-1 px-4 py-3 text-[#534345] hover:bg-[#f7edef] hover:text-[#5c1e2f]" (click)="searchTerm.set('')">
                      <strong class="text-[12px] text-[#5c1e2f]">{{ result.label }}</strong>
                      <span class="text-[11px] text-[#7a7276]">{{ result.detail }}</span>
                    </a>
                  }
                } @else {
                  <p class="px-4 py-3 text-[12px] text-[#7a7276]">Nenhum resultado encontrado.</p>
                }
              </section>
            }
          </label>

          <div class="ml-auto flex items-center gap-8">
            <button type="button" aria-label="Notificações" class="text-[20px] text-[#4e474a]">♧</button>
            <img
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
              alt="Carlos Tchipia"
              class="size-9 rounded-full object-cover"
            />
          </div>
        </header>

        <main class="max-w-[1040px] px-8 py-10">
          <h1 class="font-display text-[31px] font-extrabold leading-none text-[#9b4056]">Painel Global</h1>

          <section class="mt-6 grid gap-4 lg:grid-cols-4">
            @for (metric of filteredMetrics(); track metric.label) {
              <article class="min-h-[92px] border border-[#e6e0e3] bg-white px-5 py-4">
                <p class="text-[9px] font-bold uppercase tracking-[0.12em] text-[#8a8587]">{{ metric.label }}</p>
                <strong class="mt-2 block font-display text-[21px] font-extrabold leading-none text-[#9b4056]">{{ metric.value }}</strong>
                <p class="mt-3 text-[9px] font-semibold text-[#8c6f36]">{{ metric.delta }}</p>
              </article>
            }
          </section>

          <section class="mt-9 grid gap-12 lg:grid-cols-[420px_1fr]">
            <div>
              <h2 class="font-display text-[24px] font-extrabold leading-none text-bordeaux">Top Estudantes</h2>
              <p class="mt-2 text-[12px] text-[#8a8587]">Estudantes com pontuações mais altas nos quizzes</p>

              <div class="mt-4 grid gap-3">
                @for (student of filteredStudents(); track student.name) {
                  <article class="grid grid-cols-[28px_44px_minmax(0,1fr)_78px] items-center gap-3">
                    <span class="grid size-7 place-items-center rounded-full bg-[#767676] text-[11px] font-bold text-white">{{ student.position }}</span>
                    <img [src]="student.avatar" [alt]="student.name" class="size-10 rounded-full object-cover" />
                    <div class="min-w-0">
                      <h3 class="truncate text-[13px] font-extrabold text-[#2c2729]">{{ student.name }}</h3>
                      <p class="mt-0.5 text-[11px] text-[#8a8587]">{{ student.course }}</p>
                    </div>
                    <div class="flex items-center justify-end gap-3 text-[#6b1d31]">
                      <span class="text-[16px]">♚</span>
                      <strong class="text-[15px]">{{ student.score }}</strong>
                    </div>
                  </article>
                }
              </div>
            </div>

            <div>
              <h2 class="text-[13px] font-extrabold text-[#2c2729]">Gráfico</h2>
              <div class="mt-7 grid grid-cols-[32px_1fr] gap-3">
                <div class="grid h-[210px] grid-rows-4 text-[10px] text-[#b0aaad]">
                  <span>30K</span>
                  <span>20K</span>
                  <span>10K</span>
                  <span>0</span>
                </div>
                <div class="flex h-[210px] items-end justify-between gap-6">
                  @for (bar of filteredContentBars(); track bar.label) {
                    <div class="grid h-full flex-1 grid-rows-[1fr_auto] justify-items-center gap-3">
                      <span class="mt-auto w-8 rounded-t-lg bg-[#6b1d31]" [style.height.%]="bar.value"></span>
                      <span class="text-[10px] text-[#9a9497]">{{ bar.label }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          </section>

          <section class="mt-8 max-w-[820px] bg-white">
            <div class="flex items-center gap-8">
              <button type="button" class="text-[17px] font-extrabold text-[#2c2729]">Total Utilizadores</button>
              <button type="button" class="text-[17px] text-[#a7a1a4]">Total Conteúdo</button>
              <button type="button" class="text-[17px] text-[#a7a1a4]">Quizzes<span class="text-[#ec4b9a]">*</span></button>
              <span class="ml-auto flex items-center gap-2 text-[12px] font-medium text-[#2c2729]"><i class="size-1.5 rounded-full bg-[#2c2729]"></i>Esse ano</span>
              <span class="flex items-center gap-2 text-[12px] font-medium text-[#2c2729]"><i class="size-1.5 rounded-full bg-[#2c2729]"></i>Ano Passado</span>
            </div>

            <div class="mt-5 h-[260px]">
              <svg viewBox="0 0 820 260" class="h-full w-full overflow-visible">
                <g fill="#b7b1b4" font-size="15">
                  <text x="0" y="20">30K</text>
                  <text x="0" y="98">20K</text>
                  <text x="0" y="176">10K</text>
                  <text x="0" y="246">0</text>
                </g>
                <path
                  d="M54 150 C88 134 101 118 124 132 C150 148 128 196 176 190 C228 184 236 172 272 152 C314 128 353 141 382 142 C420 143 410 66 464 55 C506 48 529 70 566 36 C594 8 618 45 628 87 C638 126 672 112 700 99 C734 84 756 122 784 126 C812 130 824 95 862 84"
                  fill="none"
                  stroke="#2c2729"
                  stroke-width="1.2"
                />
                <path
                  d="M54 204 C86 151 108 136 142 138 C180 140 214 150 246 132 C282 112 300 88 324 70 C352 48 370 112 386 162 C404 220 438 210 474 210 C516 210 516 141 552 132 C590 122 618 164 642 150 C676 132 664 75 710 67 C746 61 785 66 816 58 C848 50 866 26 884 18"
                  fill="none"
                  stroke="#b9d5fb"
                  stroke-dasharray="4 5"
                  stroke-width="1.2"
                />
                <g fill="#aaa4a7" font-size="16">
                  <text x="92" y="258">Jan</text>
                  <text x="196" y="258">Fev</text>
                  <text x="300" y="258">Mar</text>
                  <text x="410" y="258">Abril</text>
                  <text x="526" y="258">Maio</text>
                  <text x="650" y="258">Jun</text>
                  <text x="764" y="258">Jul</text>
                </g>
              </svg>
            </div>
          </section>
        </main>
      </div>
    </section>
  `,
})
export class AdminPage {
  readonly searchTerm = signal('');
  readonly metrics: AdminMetric[] = [
    { label: 'Engajamento Médio', value: '8.4 / 10', delta: 'Crescimento e interações' },
    { label: 'Membros Ativos', value: '1,842', delta: '+4.5% novos hoje' },
    { label: 'Taxa de Retenção', value: '97.6%', delta: 'Alta fidelidade' },
    { label: 'Total de Subscritores', value: '12.450', delta: '+8.2% novos seguidores' },
  ];

  readonly students: StudentRank[] = [
    {
      position: 1,
      name: 'Carlos Tchipia',
      course: 'Gestão',
      score: 950,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    },
    {
      position: 2,
      name: 'Jussana Paim',
      course: 'Contabilidade',
      score: 920,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    },
    {
      position: 3,
      name: 'David Jaspe',
      course: 'Gestão',
      score: 980,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    },
    {
      position: 4,
      name: 'Isabel Marques',
      course: 'Contabilidade',
      score: 890,
      avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&q=80',
    },
    {
      position: 5,
      name: 'Líria Bá',
      course: 'Contabilidade',
      score: 870,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    },
  ];

  readonly contentBars = [
    { label: 'Podcast', value: 45 },
    { label: 'Artigo', value: 80 },
    { label: 'Quiz', value: 56 },
    { label: 'Conteúdo', value: 82 },
    { label: 'Fórum', value: 33 },
    { label: 'Diverso', value: 69 },
  ];

  readonly filteredMetrics = computed(() => {
    const query = this.normalizeText(this.searchTerm());
    if (!query) {
      return this.metrics;
    }

    return this.metrics.filter((metric) => this.normalizeText(`${metric.label} ${metric.value} ${metric.delta}`).includes(query));
  });

  readonly filteredStudents = computed(() => {
    const query = this.normalizeText(this.searchTerm());
    if (!query) {
      return this.students;
    }

    return this.students.filter((student) => this.normalizeText(`${student.name} ${student.course} ${student.score}`).includes(query));
  });

  readonly filteredContentBars = computed(() => {
    const query = this.normalizeText(this.searchTerm());
    if (!query) {
      return this.contentBars;
    }

    return this.contentBars.filter((bar) => this.normalizeText(`${bar.label} ${bar.value}`).includes(query));
  });

  readonly searchResults = computed(() => [
    ...this.filteredMetrics().map((metric) => ({ label: metric.label, detail: `${metric.value} - ${metric.delta}`, route: '/admin' })),
    ...this.filteredStudents().map((student) => ({ label: student.name, detail: `${student.course} - ${student.score} pontos`, route: '/admin' })),
    ...this.filteredContentBars().map((bar) => ({ label: bar.label, detail: `${bar.value}% no gráfico`, route: '/admin' })),
  ].slice(0, 6));

  updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}

@Component({
  selector: 'app-admin-article-create-page',
  imports: [RouterLink, AdminConsoleShellComponent, AdminEditorialSectionComponent],
  template: `
    <app-admin-console-shell activeItem="contents">
      <main class="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section class="min-w-0">
          <header class="border-b border-[#e3d4d8] px-8 py-7 text-center">
            <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#735c00]">Criação de conteúdo</p>
            <h1 class="mt-2 font-display text-[30px] font-extrabold text-[#5c1e2f]">Novo artigo académico</h1>
            <p class="mx-auto mt-2 max-w-[620px] text-[14px] leading-6 text-[#534345]">
              Publique conteúdos históricos e económicos com metadados editoriais, imagem de capa e controlo de visibilidade.
            </p>
          </header>

          <form class="grid gap-0" (submit)="$event.preventDefault()">
            <app-admin-editorial-section title="Dados principais" icon="&#9635;" [bordered]="true">
              <label class="grid gap-2">
                <span class="text-[12px] font-semibold text-[#6f686b]">Título do artigo</span>
                <input type="text" placeholder="Ex: A Evolução do Comércio no Reino do Kongo" class="h-12 border border-[#b8aeb2] px-4 text-[15px] text-[#2c2729] outline-none" />
              </label>

              <label class="grid gap-2">
                <span class="text-[12px] font-semibold text-[#6f686b]">Resumo académico</span>
                <textarea placeholder="Sintetize o objetivo, o contexto histórico e os conceitos económicos abordados..." class="min-h-[130px] resize-y border border-[#b8aeb2] px-4 py-3 text-[14px] leading-6 text-[#2c2729] outline-none"></textarea>
              </label>

              <div class="grid gap-4 md:grid-cols-3">
                <label class="grid gap-2">
                  <span class="text-[12px] font-semibold text-[#6f686b]">Categoria</span>
                  <select class="h-11 border border-[#b8aeb2] bg-white px-3 text-[14px] outline-none">
                    <option>Economia</option>
                    <option>História</option>
                    <option>Textos com Jindungo</option>
                  </select>
                </label>
                <label class="grid gap-2">
                  <span class="text-[12px] font-semibold text-[#6f686b]">Tipo</span>
                  <select class="h-11 border border-[#b8aeb2] bg-white px-3 text-[14px] outline-none">
                    <option>Artigo</option>
                    <option>Ensaio</option>
                    <option>Estudo de caso</option>
                  </select>
                </label>
                <label class="grid gap-2">
                  <span class="text-[12px] font-semibold text-[#6f686b]">Tempo de leitura</span>
                  <input type="text" value="12 min" class="h-11 border border-[#b8aeb2] px-3 text-[14px] outline-none" />
                </label>
              </div>
            </app-admin-editorial-section>

            <app-admin-editorial-section title="Corpo editorial" icon="&#9998;">
              <div class="border border-[#b8aeb2] bg-white">
                <div class="flex min-h-11 items-center gap-4 border-b border-[#d8cfd3] px-4 text-[13px] text-[#5c1e2f]">
                  <strong>B</strong><i>I</i><span>Lista</span><span>Citação</span>
                </div>
                <textarea placeholder="Escreva o conteúdo aqui..." class="min-h-[280px] w-full resize-y border-0 px-4 py-4 text-[15px] leading-7 text-[#2c2729] outline-none"></textarea>
              </div>
            </app-admin-editorial-section>
          </form>
        </section>

        <aside class="grid content-start border-l border-[#e3d4d8] bg-[#fbfaf7] max-lg:border-l-0 max-lg:border-t">
          <section class="border-b border-[#e3d4d8] px-6 py-6">
            <h2 class="text-[12px] font-bold uppercase tracking-[0.16em] text-[#5c1e2f]">Imagem de capa</h2>
            <button type="button" class="mt-4 grid min-h-[170px] w-full place-items-center border border-dashed border-[#b8aeb2] bg-white text-center">
              <span>
                <span class="mx-auto grid size-12 place-items-center text-[28px] text-[#8a4055]">⇪</span>
                <strong class="mt-2 block text-[13px] text-[#5c1e2f]">Carregar imagem</strong>
                <small class="mt-1 block text-[11px] text-[#8a8587]">PNG ou JPG até 5MB</small>
              </span>
            </button>
          </section>

          <section class="border-b border-[#e3d4d8] px-6 py-6">
            <h2 class="text-[12px] font-bold uppercase tracking-[0.16em] text-[#5c1e2f]">Publicação</h2>
            <div class="mt-4 grid gap-3 text-[13px] text-[#2c2729]">
              <label class="flex items-center justify-between gap-4">Público <input type="radio" name="visibility" checked class="accent-bordeaux" /></label>
              <label class="flex items-center justify-between gap-4">Jindungo <input type="radio" name="visibility" class="accent-bordeaux" /></label>
              <label class="flex items-center justify-between gap-4">Privado <input type="radio" name="visibility" class="accent-bordeaux" /></label>
            </div>
          </section>

          <section class="grid gap-3 px-6 py-6">
            <button type="button" class="h-11 bg-[#5c1e2f] px-4 text-[13px] font-extrabold text-white">Publicar conteúdo</button>
            <button type="button" class="h-11 border border-[#5c1e2f] bg-white px-4 text-[13px] font-extrabold text-[#5c1e2f]">Guardar rascunho</button>
            <a routerLink="/admin" class="inline-flex h-10 items-center justify-center text-[13px] font-bold text-[#6f686b]">Cancelar</a>
          </section>
        </aside>
      </main>
    </app-admin-console-shell>
  `,
})
export class AdminArticleCreatePage {}
@Component({
  selector: 'app-admin-quiz-create-page',
  imports: [AdminConsoleShellComponent, AdminEditorialSectionComponent],
  template: `
    <app-admin-console-shell activeItem="quiz">
      <main class="grid gap-0 xl:grid-cols-[minmax(0,1fr)_330px]">
        <section class="min-w-0">
          <header class="border-b border-[#e3d4d8] px-8 py-7 text-center">
            <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#735c00]">Avaliações da plataforma</p>
            <h1 class="mt-2 font-display text-[30px] font-extrabold text-[#5c1e2f]">Geração de quiz</h1>
            <p class="mx-auto mt-2 max-w-[680px] text-[14px] leading-6 text-[#534345]">
              Crie avaliações ligadas aos conteúdos publicados, com revisão editorial antes da publicação.
            </p>
          </header>

          <section class="grid gap-0 lg:grid-cols-[minmax(0,1fr)_290px]">
            <div class="min-w-0">
              <app-admin-editorial-section title="Conteúdo relacionado" icon="&#9635;" [bordered]="true">
                <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                  <label class="grid gap-2">
                    <span class="text-[12px] font-semibold text-[#6f686b]">Selecionar conteúdo</span>
                    <select class="h-11 border border-[#b8aeb2] bg-white px-3 text-[14px] outline-none">
                      <option>A política monetária de Angola</option>
                      <option>Rotas comerciais do Reino do Kongo</option>
                      <option>O Caminho de Ferro de Benguela</option>
                    </select>
                  </label>
                  <label class="grid gap-2">
                    <span class="text-[12px] font-semibold text-[#6f686b]">Categoria</span>
                    <select class="h-11 border border-[#b8aeb2] bg-white px-3 text-[14px] outline-none">
                      <option>Economia</option>
                      <option>História</option>
                      <option>Jindungo</option>
                    </select>
                  </label>
                </div>

                <article class="border border-[#eadfe2] bg-[#fbf7f8] p-4">
                  <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8c6f36]">Resumo extraído</p>
                  <h3 class="mt-1 font-display text-[18px] font-extrabold leading-tight text-[#40081a]">Moeda, inflação e memória social</h3>
                  <p class="mt-2 text-[13px] leading-6 text-[#5f575b]">
                    Base sugerida para perguntas sobre instrumentos monetários, ciclos de preço e impacto social no quotidiano angolano.
                  </p>
                </article>
              </app-admin-editorial-section>

              <app-admin-editorial-section title="Modo de criação" icon="&#9881;" [bordered]="true">
                <div class="flex w-fit items-center gap-2 border border-[#e3d4d8] bg-[#f7edef] p-1">
                  <button type="button" class="h-10 px-5 text-[13px] font-extrabold" [class.bg-[#5c1e2f]]="mode() === 'ia'" [class.text-white]="mode() === 'ia'" [class.text-[#8a4055]]="mode() !== 'ia'" (click)="mode.set('ia')">Gerar com IA</button>
                  <button type="button" class="h-10 px-5 text-[13px] font-extrabold" [class.bg-[#5c1e2f]]="mode() === 'manual'" [class.text-white]="mode() === 'manual'" [class.text-[#8a4055]]="mode() !== 'manual'" (click)="mode.set('manual')">Criar manualmente</button>
                </div>

                @if (mode() === 'ia') {
                  <textarea class="min-h-[180px] resize-y border border-[#b8aeb2] px-4 py-3 text-[14px] leading-6 text-[#2c2729] outline-none" placeholder="Ex: Gerar perguntas sobre causas da inflação, papel do banco central e efeitos no consumo familiar."></textarea>
                  <button type="button" class="h-11 w-fit bg-[#d4af37] px-5 text-[13px] font-extrabold text-[#5c1e2f]">Gerar rascunho</button>
                } @else {
                  <div class="grid gap-4">
                    <input type="text" placeholder="Escreva a pergunta..." class="h-12 border border-[#b8aeb2] px-4 text-[14px] outline-none" />
                    <div class="grid gap-3 md:grid-cols-2">
                      @for (option of ['A', 'B', 'C', 'D']; track option) {
                        <label class="flex min-h-12 items-center gap-3 border border-[#e3d4d8] px-4 text-[13px] text-[#5f575b]">
                          <input type="radio" name="correctOption" class="accent-bordeaux" />
                          Opção {{ option }}
                        </label>
                      }
                    </div>
                    <button type="button" class="h-11 w-fit bg-[#d4af37] px-5 text-[13px] font-extrabold text-[#5c1e2f]">Adicionar pergunta</button>
                  </div>
                }
              </app-admin-editorial-section>

              <app-admin-editorial-section title="Pré-visualização das perguntas" icon="&#9636;">
                @for (question of previewQuestions; track question.title) {
                  <article class="border border-[#eadfe2] bg-[#fbf7f8] p-4">
                    <div class="flex items-start justify-between gap-4">
                      <div>
                        <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8c6f36]">{{ question.kind }}</p>
                        <h3 class="mt-1 text-[14px] font-extrabold leading-5 text-[#2c2729]">{{ question.title }}</h3>
                      </div>
                      <span class="bg-white px-2 py-1 text-[10px] font-bold text-[#8a4055]">{{ question.status }}</span>
                    </div>
                  </article>
                }
              </app-admin-editorial-section>
            </div>

            <aside class="border-l border-[#e3d4d8] bg-[#fbfaf7] p-6 max-lg:border-l-0 max-lg:border-t">
              <h2 class="font-display text-[18px] font-extrabold text-[#5c1e2f]">Parâmetros</h2>
              <div class="mt-5 grid gap-4">
                <label class="grid gap-2"><span class="text-[12px] font-semibold text-[#6f686b]">Perguntas</span><input type="number" value="8" min="3" max="20" class="h-11 border border-[#b8aeb2] px-3 text-[14px] outline-none" /></label>
                <label class="grid gap-2"><span class="text-[12px] font-semibold text-[#6f686b]">Dificuldade</span><select class="h-11 border border-[#b8aeb2] bg-white px-3 text-[14px] outline-none"><option>Médio</option><option>Básico</option><option>Avançado</option></select></label>
                <label class="grid gap-2"><span class="text-[12px] font-semibold text-[#6f686b]">XP total</span><input type="number" value="120" class="h-11 border border-[#b8aeb2] px-3 text-[14px] outline-none" /></label>
                <label class="grid gap-2"><span class="text-[12px] font-semibold text-[#6f686b]">Tempo estimado</span><input type="text" value="10 minutos" class="h-11 border border-[#b8aeb2] px-3 text-[14px] outline-none" /></label>
              </div>
            </aside>
          </section>
        </section>

        <aside class="grid content-start border-l border-[#e3d4d8] bg-[#fbfaf7] max-xl:border-l-0 max-xl:border-t">
          <section class="border-b border-[#e3d4d8] px-6 py-6">
            <h2 class="font-display text-[18px] font-extrabold text-[#5c1e2f]">Publicação</h2>
            <div class="mt-5 grid gap-4 text-[13px] font-semibold text-[#2c2729]">
              <label class="flex items-center justify-between gap-4">Visível para estudantes <input type="checkbox" class="accent-bordeaux" /></label>
              <label class="flex items-center justify-between gap-4">Exigir login <input type="checkbox" checked class="accent-bordeaux" /></label>
              <label class="flex items-center justify-between gap-4">Entrar no ranking <input type="checkbox" checked class="accent-bordeaux" /></label>
            </div>
            <div class="mt-6 grid gap-3">
              <button type="button" class="h-11 bg-[#5c1e2f] px-4 text-[13px] font-extrabold text-white">Publicar quiz</button>
              <button type="button" class="h-11 border border-[#5c1e2f] bg-white px-4 text-[13px] font-extrabold text-[#5c1e2f]">Guardar rascunho</button>
            </div>
          </section>

          <section class="border-b border-[#e3d4d8] px-6 py-6">
            <h2 class="text-[12px] font-bold uppercase tracking-[0.16em] text-[#5c1e2f]">Estado</h2>
            <strong class="mt-3 block font-display text-[25px] font-extrabold text-[#9b4056]">Rascunho</strong>
            <div class="mt-4 grid gap-3 text-[12px] text-[#5f575b]">
              @for (rule of qualityRules; track rule) {
                <p class="flex items-center gap-2"><span class="grid size-5 place-items-center rounded-full bg-white text-[10px] font-bold text-[#8c6f36]">✓</span>{{ rule }}</p>
              }
            </div>
          </section>

          <section class="px-6 py-6">
            <h2 class="font-display text-[17px] font-extrabold text-[#5c1e2f]">Fila editorial</h2>
            <div class="mt-4 grid gap-3">
              @for (item of editorialQueue; track item.title) {
                <article class="border-b border-[#eee6e8] pb-3 last:border-b-0 last:pb-0">
                  <h3 class="text-[13px] font-extrabold text-[#2c2729]">{{ item.title }}</h3>
                  <p class="mt-1 text-[11px] text-[#8a8587]">{{ item.meta }} · {{ item.count }}</p>
                </article>
              }
            </div>
          </section>
        </aside>
      </main>
    </app-admin-console-shell>
  `,
})
export class AdminQuizCreatePage{
  readonly mode = signal<'ia' | 'manual'>('ia');
  readonly qualityRules = ['Ligado a um conteudo', 'Sem perguntas opinativas', 'Revisao obrigatoria'];
  readonly previewQuestions = [
    { kind: 'Multipla escolha', title: 'Qual instrumento ajuda a controlar a liquidez na economia?', status: 'IA' },
    { kind: 'Aplicacao', title: 'Como a inflacao altera o poder de compra das familias?', status: 'Revisar' },
  ];
  readonly editorialQueue = [
    { title: 'Kongo e comercio', meta: 'Historia - 6 perguntas', count: '82%' },
    { title: 'Reservas cambiais', meta: 'Economia - 10 perguntas', count: '64%' },
    { title: 'Petroleo e soberania', meta: 'Jindungo - 8 perguntas', count: '41%' },
  ];
}

export const ADMIN_ROUTES: Routes = [
  { path: 'quiz', component: AdminQuizCreateStandalonePage },
  { path: 'quizzes', component: AdminQuizCreateStandalonePage },
  { path: 'podcast/create', component: AdminPodcastCreatePage },
  { path: 'podcasts/create', component: AdminPodcastCreatePage },
  { path: 'jindungo/create', component: AdminJindungoCreatePage },
  { path: 'jindungos/create', component: AdminJindungoCreatePage },
  { path: 'contents/jindungo/create', component: AdminJindungoCreatePage },
  { path: 'video/create', component: AdminVideoCreatePage },
  { path: 'videos/create', component: AdminVideoCreatePage },
  { path: 'contents/video/create', component: AdminVideoCreatePage },
  { path: 'forum/create', component: AdminForumCreatePage },
  { path: 'forums/create', component: AdminForumCreatePage },
  { path: 'contents/forum/create', component: AdminForumCreatePage },
  { path: 'contents/create', component: AdminArticleCreateStandalonePage },
  { path: '', component: AdminPage },
  { path: ':section', component: AdminPage },
];
