import { Component, computed, signal } from '@angular/core';
import { RouterLink, Routes } from '@angular/router';

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
              <a routerLink="/admin" class="flex h-11 items-center gap-3 px-5 text-[12px] font-medium text-[#534c50] hover:bg-white hover:text-[#9b4056]">
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
              <a routerLink="/admin/contents/create" class="flex h-10 items-center gap-3 border-r-2 border-[#9b4056] bg-[#f7edef] px-5 text-[12px] font-bold text-[#9b4056]">
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
          <label class="flex h-10 w-[340px] items-center gap-3 rounded-lg bg-white px-4 text-[#8a8587]">
            <span class="text-[16px]">⌕</span>
            <input type="search" placeholder="Pesquisar..." class="w-full bg-transparent text-[12px] text-[#2c2729] outline-none placeholder:text-[#9a9497]" />
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

        <main class="grid max-w-[960px] gap-8 px-9 py-6 lg:grid-cols-[minmax(0,620px)_260px]">
          <section>
            <h1 class="font-display text-[25px] font-extrabold leading-none text-[#9b4056]">Artigo</h1>

            <form class="mt-9 grid gap-4">
              <label class="grid gap-2">
                <span class="text-[9px] font-semibold text-[#6f686b]">Título do Artigo</span>
                <input
                  type="text"
                  placeholder="Ex: A Evolução do Comércio no Reino do Congo"
                  class="h-[58px] border border-[#d9c5cb] bg-white px-3 font-display text-[22px] font-extrabold text-[#5c1e2f] outline-none placeholder:text-[#e7cfd5]"
                />
              </label>

              <label class="grid gap-2">
                <span class="text-[9px] font-semibold text-[#6f686b]">Subtítulo ou Resumo Acadêmico</span>
                <input
                  type="text"
                  placeholder="Uma análise rigorosa sobre as rotas comerciais pré-coloniais..."
                  class="h-[56px] border border-[#d9c5cb] bg-white px-3 text-[12px] text-[#2c2729] outline-none placeholder:text-[#e1cbd1]"
                />
              </label>

              <div class="mt-5 overflow-hidden border border-[#e4dde0] bg-white">
                <div class="flex h-12 items-center gap-5 bg-[#f0f1f2] px-5 text-[14px] font-bold text-[#1f1a1c]">
                  <button type="button">B</button>
                  <button type="button" class="italic">I</button>
                  <button type="button">≡</button>
                  <button type="button">99</button>
                  <button type="button">↔</button>
                  <button type="button">▣</button>
                  <button type="button">Σ</button>
                  <button type="button">▥</button>
                  <span class="ml-auto rounded bg-[#e6d5da] px-3 py-1 text-[11px] font-bold text-[#7d3449]">Reversões</span>
                </div>
                <textarea
                  placeholder="Comece a escrever o seu tratado académico aqui..."
                  class="min-h-[410px] w-full resize-none px-7 py-8 text-[13px] leading-7 text-[#2c2729] outline-none placeholder:text-[#e5e0e2]"
                ></textarea>
              </div>
            </form>
          </section>

          <aside class="grid content-start gap-5 pt-12">
            <section class="rounded-md border border-[#e1dddf] bg-[#f0f1f2] p-5">
              <h2 class="font-display text-[18px] font-extrabold text-bordeaux">Configurações</h2>
              <label class="mt-5 grid gap-2">
                <span class="text-[10px] font-semibold text-[#6f686b]">Categoria Principal</span>
                <select class="h-10 border border-[#d6cfd2] bg-white px-3 text-[12px] text-[#2c2729] outline-none">
                  <option>História Económica</option>
                </select>
              </label>

              <label class="mt-4 grid gap-2">
                <span class="text-[10px] font-semibold text-[#6f686b]">Etiquetas (Tags)</span>
                <div class="flex gap-2">
                  <span class="rounded bg-white px-2 py-1 text-[9px] text-[#6f686b]">Angola X</span>
                  <span class="rounded bg-white px-2 py-1 text-[9px] text-[#6f686b]">Moeda X</span>
                </div>
                <input type="text" placeholder="Adicionar tag..." class="h-10 border border-[#d6cfd2] bg-white px-3 text-[12px] outline-none placeholder:text-[#aaa4a7]" />
              </label>

              <div class="mt-6 grid gap-4 text-[12px] font-semibold text-[#2c2729]">
                <label class="flex items-center justify-between">
                  Conteúdo Premium
                  <input type="checkbox" checked class="accent-bordeaux" />
                </label>
                <label class="flex items-center justify-between">
                  Permitir Comentários
                  <input type="checkbox" checked class="accent-bordeaux" />
                </label>
              </div>
            </section>

            <section class="rounded-md border border-[#e1dddf] bg-[#f0f1f2] p-5">
              <div class="flex items-center justify-between">
                <h2 class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a8587]">Pré-visualização SEO</h2>
                <span class="text-[#6f686b]">⊙</span>
              </div>
              <article class="mt-5 rounded-sm bg-white p-4 shadow-sm">
                <h3 class="text-[13px] font-bold leading-5 text-[#1a4caa]">Título do Artigo | Economia com História: Angola</h3>
                <p class="mt-2 text-[10px] leading-4 text-[#1b8f43]">economiahistoria.ao/artigos/evolucao-comercio-congo</p>
                <p class="mt-2 text-[10px] leading-4 text-[#4f474a]">
                  Descubra como as redes comerciais do antigo Reino do Congo moldaram a economia da região...
                </p>
              </article>
              <p class="mt-4 text-[9px] leading-4 text-[#8a8587]">A meta-descrição é gerada automaticamente a partir do subtítulo, a menos que seja editada manualmente.</p>
            </section>

            <button type="button" class="grid h-[140px] place-items-center rounded-md border border-dashed border-[#c9c2c5] bg-[#eceeef] text-center">
              <span>
                <span class="mx-auto mb-2 grid size-8 place-items-center text-[22px] text-[#5f575b]">⇪</span>
                <strong class="block text-[11px] text-[#6f686b]">Carregar Imagem de Capa</strong>
                <small class="mt-1 block text-[9px] text-[#c9a9b2]">PNG, JPG até 5MB</small>
              </span>
            </button>
          </aside>
        </main>
      </div>
    </section>
  `,
})
export class AdminArticleCreatePage {}

export const ADMIN_ROUTES: Routes = [
  { path: 'contents/create', component: AdminArticleCreatePage },
  { path: '', component: AdminPage },
  { path: ':section', component: AdminPage },
];
