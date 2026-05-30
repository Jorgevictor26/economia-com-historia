import { Component, signal } from '@angular/core';
import { RouterLink, Routes } from '@angular/router';
import { BackToTopComponent } from '../../../shared/back-to-top/back-to-top.component';
import { PublicFooterComponent } from '../../../shared/public-footer/public-footer.component';
import { PublicNavbarComponent } from '../../../shared/public-navbar/public-navbar.component';

interface MapPoint {
  id: string;
  icon: string;
  label: string;
  eyebrow: string;
  title: string;
  imageUrl: string;
  history: string;
  stats: Array<{ label: string; value: string }>;
  x: number;
  y: number;
  tone: 'primary' | 'gold' | 'teal';
}

@Component({
  selector: 'app-map-page',
  imports: [RouterLink, PublicNavbarComponent, PublicFooterComponent, BackToTopComponent],
  styles: [
    `
      .map-glass {
        background: rgba(25, 28, 29, 0.72);
        border: 1px solid rgba(216, 193, 196, 0.18);
        backdrop-filter: blur(14px);
      }

      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }

      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #857275;
        border-radius: 999px;
      }

      .sona-pattern {
        background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30-30-30z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E");
        opacity: 0.045;
      }
    `,
  ],
  template: `
    <section class="-m-3 min-h-dvh bg-[#191c1d] text-white sm:-m-6">
      <app-public-navbar />

      <main class="relative overflow-hidden bg-[radial-gradient(circle_at_50%_50%,#2e3132_0%,#191c1d_68%)]">
        <div class="sona-pattern pointer-events-none absolute inset-0"></div>

        <section class="relative z-10 grid min-h-[calc(100dvh-58px)] gap-5 px-4 py-5 lg:grid-cols-[320px_minmax(0,1fr)_384px] lg:px-6">
          <aside class="map-glass order-2 flex flex-col rounded-[8px] p-5 lg:order-1 lg:max-h-[calc(100dvh-150px)]">
            <div class="relative">
              <input
                class="w-full border-0 border-b border-[#d8c1c4]/35 bg-white/8 py-3 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#ffb1c0]"
                placeholder="Pesquisar local..."
                type="text"
              />
              <span class="material-symbols-outlined absolute left-2 top-2.5 text-[#d8c1c4]" aria-hidden="true">search</span>
            </div>

            <div class="custom-scrollbar mt-6 grid flex-1 gap-6 overflow-y-auto pr-1">
              <section>
                <h2 class="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#ffb1c0]">Filtros geográficos</h2>
                <div class="mt-3 grid gap-3">
                  <select class="w-full border-0 border-b border-white/20 bg-[#191c1d] py-2 text-sm text-white outline-none">
                    <option>Província (Todas)</option>
                    <option>Luanda</option>
                    <option>Benguela</option>
                    <option>Huambo</option>
                  </select>
                  <select class="w-full border-0 border-b border-white/20 bg-[#191c1d] py-2 text-sm text-white outline-none">
                    <option>Município (Todos)</option>
                  </select>
                </div>
              </section>

              <section>
                <h2 class="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#ffb1c0]">Categorias</h2>
                <div class="mt-3 grid gap-2">
                  @for (category of categories; track category.label) {
                    <button type="button" class="flex items-center gap-3 rounded-[8px] p-2 text-left text-sm text-white/80 transition hover:bg-white/10 hover:text-white">
                      <span
                        class="material-symbols-outlined"
                        [class.text-[#ffb1c0]]="category.tone === 'primary'"
                        [class.text-[#ffe088]]="category.tone === 'gold'"
                        [class.text-[#8be0d4]]="category.tone === 'teal'"
                        aria-hidden="true"
                      >
                        {{ category.icon }}
                      </span>
                      {{ category.label }}
                    </button>
                  }
                </div>
              </section>
            </div>

            <div class="mt-6 border-t border-white/15 pt-4">
              <div class="flex items-center justify-between rounded-[8px] border border-[#904859]/40 bg-[#5c1e2f] p-3">
                <span class="text-xs font-bold">Camada ativa</span>
                <span class="inline-flex items-center gap-2 text-xs text-white/80">
                  <i class="h-2 w-2 rounded-full bg-[#ffb1c0]"></i>
                  Económica
                </span>
              </div>
            </div>
          </aside>

          <section class="order-1 min-h-[560px] lg:order-2">
            <div class="map-glass mx-auto mb-5 flex w-fit items-center gap-1 rounded-full p-1">
              <button type="button" class="rounded-full bg-[#40081a] px-5 py-2 text-xs font-bold text-white">Visão económica</button>
              <button type="button" class="rounded-full px-5 py-2 text-xs font-bold text-white/55 transition hover:text-white">Visão histórica</button>
            </div>

            <div class="relative flex min-h-[480px] items-center justify-center">
              <svg class="h-[min(68vh,680px)] w-full max-w-[760px] drop-shadow-[0_0_26px_rgba(144,72,89,0.42)]" viewBox="0 0 520 640" role="img" aria-label="Mapa interativo de Angola">
                <defs>
                  <linearGradient id="mapFill" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stop-color="#2e3132" />
                    <stop offset="55%" stop-color="#332129" />
                    <stop offset="100%" stop-color="#1b2729" />
                  </linearGradient>
                </defs>
                <path d="M204 28 318 52 351 105 427 119 401 178 447 237 418 315 452 386 409 481 349 519 323 603 234 580 193 532 118 516 94 446 126 392 84 330 112 252 95 182 147 128Z" fill="url(#mapFill)" stroke="#ffb1c0" stroke-width="4" />
                <path d="M147 128 228 178 318 52M112 252l116-74 173 0M84 330l156-18 207-75M126 392l143-81 149 4M118 516l151-205 80 208M193 532l76-221 140 170" fill="none" stroke="#8be0d4" stroke-opacity=".34" stroke-width="2" />
              </svg>

              @for (point of points; track point.id) {
                <button
                  type="button"
                  class="group absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center"
                  [style.left.%]="point.x"
                  [style.top.%]="point.y"
                  (click)="selectPoint(point)"
                >
                  <span
                    class="material-symbols-outlined text-[32px] transition group-hover:scale-125"
                    [class.text-[#ffb1c0]]="point.tone === 'primary'"
                    [class.text-[#ffe088]]="point.tone === 'gold'"
                    [class.text-[#8be0d4]]="point.tone === 'teal'"
                    aria-hidden="true"
                  >
                    {{ point.icon }}
                  </span>
                  <span class="pointer-events-none absolute top-9 whitespace-nowrap rounded-[6px] border border-white/15 bg-[#5c1e2f] px-3 py-1 text-[11px] font-bold opacity-0 shadow-xl transition group-hover:opacity-100">
                    {{ point.label }}
                  </span>
                </button>
              }
            </div>

            <div class="map-glass mx-auto mt-2 flex max-w-4xl items-center gap-5 rounded-full p-4">
              <span class="w-12 text-xs font-extrabold text-[#ffb1c0]">1500</span>
              <div class="relative h-1.5 flex-1 rounded-full bg-white/20">
                <div class="absolute inset-y-0 left-0 w-[70%] rounded-full bg-[#ffb1c0]"></div>
                <div class="absolute left-[70%] top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#40081a] bg-white shadow-lg"></div>
                <span class="absolute left-1/4 top-4 text-[10px] text-white/45">Colonial</span>
                <span class="absolute left-1/2 top-4 text-[10px] text-white/45">Independência</span>
                <span class="absolute left-[84%] top-4 text-[10px] text-[#ffb1c0]">Actualidade</span>
              </div>
              <span class="w-12 text-xs font-extrabold">2024</span>
            </div>
          </section>

          <aside
            class="map-glass custom-scrollbar order-3 max-h-[760px] overflow-y-auto rounded-[8px] p-6 transition lg:max-h-[calc(100dvh-150px)]"
            [class.hidden]="!infoPanelOpen()"
            [class.lg:block]="true"
          >
            @if (selectedPoint(); as point) {
              <button type="button" class="float-right grid size-9 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-[#ffb1c0]" aria-label="Fechar painel" (click)="closePanel()">
                <span class="material-symbols-outlined" aria-hidden="true">close</span>
              </button>

              <div class="border-t-4 border-[#ffe088] pt-4">
                <h2 class="font-display text-[25px] font-extrabold text-white">{{ point.title }}</h2>
                <p class="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#ffb1c0]">{{ point.eyebrow }}</p>
              </div>

              <div class="mt-5 h-40 overflow-hidden rounded-[8px]">
                <img [src]="point.imageUrl" [alt]="point.title" class="h-full w-full object-cover" />
              </div>

              <section class="mt-5">
                <h3 class="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#ffb1c0]">Contexto histórico</h3>
                <p class="mt-2 text-sm leading-7 text-white/68">{{ point.history }}</p>
              </section>

              <section class="mt-5">
                <h3 class="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#ffb1c0]">Indicadores económicos</h3>
                <div class="mt-3 grid grid-cols-2 gap-3">
                  @for (stat of point.stats; track stat.label) {
                    <div class="rounded-[8px] border border-white/10 bg-white/8 p-3">
                      <p class="text-[11px] text-white/45">{{ stat.label }}</p>
                      <p class="mt-1 text-sm font-extrabold">{{ stat.value }}</p>
                    </div>
                  }
                </div>
                <div class="mt-4 flex h-24 items-end gap-2 px-2">
                  <i class="h-1/2 flex-1 rounded-t-sm bg-[#5c1e2f]"></i>
                  <i class="h-2/3 flex-1 rounded-t-sm bg-[#5c1e2f]"></i>
                  <i class="h-5/6 flex-1 rounded-t-sm border border-[#ffb1c0] bg-[#904859]"></i>
                  <i class="h-full flex-1 rounded-t-sm bg-[#5c1e2f]"></i>
                </div>
              </section>

              <a routerLink="/app/contents" class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#40081a] px-5 py-4 text-sm font-extrabold text-white transition hover:bg-[#5c1e2f]">
                <span class="material-symbols-outlined" aria-hidden="true">auto_stories</span>
                Ver relatório completo
              </a>
            }
          </aside>
        </section>

        <div class="fixed bottom-6 right-6 z-30 hidden flex-col gap-3 lg:flex">
          <button type="button" class="inline-flex items-center gap-3 rounded-full bg-[#735c00] px-6 py-3 text-sm font-extrabold text-white shadow-2xl transition hover:scale-105" (click)="selectPoint(points[1])">
            <span class="material-symbols-outlined" aria-hidden="true">explore</span>
            Explorar História
          </button>
          <button type="button" class="inline-flex items-center gap-3 rounded-full bg-[#40081a] px-6 py-3 text-sm font-extrabold text-white shadow-2xl transition hover:scale-105" (click)="selectPoint(points[0])">
            <span class="material-symbols-outlined" aria-hidden="true">analytics</span>
            Explorar Economia
          </button>
        </div>
      </main>

      <app-public-footer />
      <app-back-to-top />
    </section>
  `,
})
export class MapPage {
  readonly infoPanelOpen = signal(true);

  readonly points: MapPoint[] = [
    {
      id: 'luanda',
      icon: 'location_on',
      label: 'Luanda: Hub económico',
      eyebrow: 'Capital da República',
      title: 'Província de Luanda',
      imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=900&q=80',
      history:
        'Fundada em 1576 por Paulo Dias de Novais, Luanda serviu como centro administrativo, portuário e financeiro. O crescimento económico foi impulsionado pelo porto natural, pelos serviços e pela indústria petrolífera.',
      stats: [
        { label: 'PIB regional', value: '35.4%' },
        { label: 'População', value: '8.2M' },
      ],
      x: 46,
      y: 38,
      tone: 'primary',
    },
    {
      id: 'huambo',
      icon: 'history_edu',
      label: 'Huambo: Marco histórico',
      eyebrow: 'Planalto central',
      title: 'Província do Huambo',
      imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
      history:
        'O Huambo articulou agricultura, caminhos-de-ferro e circulação de pessoas no planalto central. A região ajuda a compreender a ligação entre infraestrutura, produção e memória social.',
      stats: [
        { label: 'Agricultura', value: 'Alta' },
        { label: 'Altitude média', value: '1.7km' },
      ],
      x: 56,
      y: 55,
      tone: 'gold',
    },
    {
      id: 'lobito',
      icon: 'hub',
      label: 'Lobito: Corredor logístico',
      eyebrow: 'Porto e ferrovia',
      title: 'Corredor do Lobito',
      imageUrl: 'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&w=900&q=80',
      history:
        'O corredor liga zonas mineiras e agrícolas ao Atlântico, tornando-se uma peça central na discussão sobre exportações, integração regional e novas geografias económicas.',
      stats: [
        { label: 'Setor', value: 'Logística' },
        { label: 'Impacto', value: 'Regional' },
      ],
      x: 43,
      y: 58,
      tone: 'teal',
    },
  ];

  readonly categories = [
    { label: 'Economia', icon: 'trending_up', tone: 'primary' },
    { label: 'História', icon: 'museum', tone: 'gold' },
    { label: 'Cultura', icon: 'theater_comedy', tone: 'teal' },
    { label: 'Infraestrutura', icon: 'foundation', tone: 'primary' },
  ];

  readonly selectedPoint = signal<MapPoint>(this.points[0]);

  selectPoint(point: MapPoint): void {
    this.selectedPoint.set(point);
    this.infoPanelOpen.set(true);
  }

  closePanel(): void {
    this.infoPanelOpen.set(false);
  }
}

export const MAP_ROUTES: Routes = [{ path: '', component: MapPage }];
