import { Component, computed, signal } from '@angular/core';
import { RouterLink, Routes } from '@angular/router';
import { BackToTopComponent } from '../../../shared/back-to-top/back-to-top.component';
import { PublicFooterComponent } from '../../../shared/public-footer/public-footer.component';
import { PublicNavbarComponent } from '../../../shared/public-navbar/public-navbar.component';

type MapLevel = 'pais' | 'provincia' | 'municipio' | 'distrito' | 'bairro' | 'avenida';
type LayerKey = 'historia' | 'economia' | 'infraestrutura' | 'turismo' | 'educacao' | 'comercio';

interface MapRegion {
  id: string;
  parentId?: string;
  name: string;
  level: MapLevel;
  x: number;
  y: number;
  minZoom: number;
  shape?: string;
  line?: string;
  imageUrl: string;
  historia: string;
  economia: string;
  curiosidades: string[];
  socialIndicators: Array<{ label: string; value: string }>;
  economicIndicators: Array<{ label: string; value: string }>;
  chart: number[];
  layers: Record<LayerKey, string>;
}

interface MapLayer {
  key: LayerKey;
  label: string;
  icon: string;
  color: string;
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

      .region-shape {
        cursor: pointer;
        fill: rgba(255, 177, 192, 0.16);
        stroke: rgba(255, 177, 192, 0.68);
        stroke-width: 4;
        transition: fill 160ms ease, stroke 160ms ease, filter 160ms ease;
        vector-effect: non-scaling-stroke;
      }

      .region-shape:hover,
      .region-shape.is-active {
        fill: rgba(255, 224, 136, 0.28);
        stroke: #ffe088;
        filter: drop-shadow(0 0 10px rgba(255, 224, 136, 0.55));
      }

      .sub-region {
        cursor: pointer;
      }

      .sub-region circle {
        fill: #191c1d;
        stroke: currentColor;
        stroke-width: 4;
        transition: transform 160ms ease, fill 160ms ease;
        vector-effect: non-scaling-stroke;
      }

      .sub-region:hover circle,
      .sub-region.is-active circle {
        fill: currentColor;
        transform: scale(1.22);
        transform-box: fill-box;
        transform-origin: center;
      }

      .road-line {
        fill: none;
        stroke: #ffe088;
        stroke-width: 7;
        stroke-linecap: round;
        stroke-linejoin: round;
        vector-effect: non-scaling-stroke;
      }
    `,
  ],
  template: `
    <section class="-m-3 min-h-dvh bg-[#191c1d] text-white sm:-m-6">
      <app-public-navbar />

      <main class="relative overflow-hidden bg-[radial-gradient(circle_at_50%_50%,#2e3132_0%,#191c1d_68%)]">
        <div class="sona-pattern pointer-events-none absolute inset-0"></div>

        <section class="relative z-10 grid min-h-[calc(100dvh-58px)] gap-5 px-4 py-5 lg:grid-cols-[320px_minmax(0,1fr)_392px] lg:px-6">
          <aside class="map-glass order-2 flex flex-col rounded-[8px] p-5 lg:order-1 lg:max-h-[calc(100dvh-150px)]">
            <div class="relative">
              <input
                class="w-full border-0 border-b border-[#d8c1c4]/35 bg-white/8 py-3 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#ffb1c0]"
                placeholder="Pesquisar local..."
                type="search"
                [value]="searchTerm()"
                (input)="searchTerm.set($any($event.target).value)"
              />
              <span class="material-symbols-outlined absolute left-2 top-2.5 text-[#d8c1c4]" aria-hidden="true">search</span>
            </div>

            <div class="custom-scrollbar mt-6 grid flex-1 gap-6 overflow-y-auto pr-1">
              <section>
                <h2 class="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#ffb1c0]">Nível de detalhe</h2>
                <div class="mt-3 rounded-[8px] border border-white/10 bg-white/8 p-3">
                  <div class="flex items-center justify-between text-xs text-white/70">
                    <span>{{ zoomLabel() }}</span>
                    <span>{{ zoom().toFixed(1) }}x</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    class="mt-3 w-full accent-[#ffb1c0]"
                    [value]="zoom()"
                    (input)="setZoom($any($event.target).value)"
                  />
                  <div class="mt-3 grid grid-cols-3 gap-2">
                    <button type="button" class="rounded-[6px] border border-white/15 px-3 py-2 text-xs font-bold text-white/75 hover:bg-white/10" (click)="zoomOut()">Reduzir</button>
                    <button type="button" class="rounded-[6px] border border-white/15 px-3 py-2 text-xs font-bold text-white/75 hover:bg-white/10" (click)="resetMap()">Angola</button>
                    <button type="button" class="rounded-[6px] border border-white/15 px-3 py-2 text-xs font-bold text-white/75 hover:bg-white/10" (click)="zoomIn()">Ampliar</button>
                  </div>
                </div>
              </section>

              <section>
                <h2 class="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#ffb1c0]">Camadas do mapa</h2>
                <div class="mt-3 grid gap-2">
                  @for (layer of layers; track layer.key) {
                    <button
                      type="button"
                      class="flex items-center gap-3 rounded-[8px] border border-transparent p-2 text-left text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                      [class.border-[#ffb1c0]/50]="activeLayer() === layer.key"
                      [class.bg-white/10]="activeLayer() === layer.key"
                      (click)="activeLayer.set(layer.key)"
                    >
                      <span class="material-symbols-outlined" [style.color]="layer.color" aria-hidden="true">{{ layer.icon }}</span>
                      {{ layer.label }}
                    </button>
                  }
                </div>
              </section>

              <section>
                <h2 class="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#ffb1c0]">Regiões carregadas</h2>
                <div class="mt-3 grid gap-2">
                  @for (region of filteredVisibleRegions(); track region.id) {
                    <button
                      type="button"
                      class="flex min-h-10 items-center justify-between rounded-[8px] border border-white/10 px-3 py-2 text-left text-xs text-white/78 transition hover:bg-white/10"
                      (click)="selectRegion(region)"
                    >
                      <span class="font-bold">{{ region.name }}</span>
                      <span class="capitalize text-white/45">{{ region.level }}</span>
                    </button>
                  }
                </div>
              </section>
            </div>
          </aside>

          <section class="order-1 min-h-[620px] lg:order-2">
            <div class="map-glass mx-auto mb-5 flex w-fit items-center gap-2 rounded-full p-1">
              <button type="button" class="rounded-full bg-[#40081a] px-5 py-2 text-xs font-bold text-white">{{ activeLayerLabel() }}</button>
              <button type="button" class="rounded-full px-5 py-2 text-xs font-bold text-white/55 transition hover:text-white" (click)="resetMap()">Mapa completo</button>
            </div>

            <div class="relative flex min-h-[520px] items-center justify-center overflow-hidden rounded-[8px]" (wheel)="onMapWheel($event)">
              <div class="absolute inset-x-10 inset-y-8 rounded-full bg-[#904859]/20 blur-3xl"></div>
              <div class="relative h-[min(72vh,760px)] w-full max-w-[840px] origin-center transition-transform duration-300" [style.transform]="mapCssTransform()">
                <img
                  class="h-full w-full object-contain drop-shadow-[0_0_26px_rgba(144,72,89,0.42)]"
                  src="https://upload.wikimedia.org/wikipedia/commons/a/aa/Angola%2C_administrative_divisions_-_en_-_colored.svg"
                  alt="Mapa real das divisões administrativas de Angola"
                />

                @for (region of visibleRegions(); track region.id) {
                  <button
                    type="button"
                    class="group absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center"
                    [class.z-20]="selectedRegion().id === region.id"
                    [style.left.%]="regionPositionX(region)"
                    [style.top.%]="regionPositionY(region)"
                    (click)="selectRegion(region)"
                  >
                    <span class="grid size-5 place-items-center rounded-full border-2 border-white shadow-lg shadow-black/40" [style.background]="activeLayerColor()"></span>
                    <span class="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-[6px] border border-white/15 bg-black/70 px-2 py-1 text-[10px] font-extrabold text-white opacity-0 shadow-xl transition group-hover:opacity-100">
                      {{ region.name }}
                    </span>
                  </button>
                }
              </div>

              <div class="absolute bottom-4 left-4 rounded-[8px] border border-white/10 bg-black/45 px-3 py-2 text-xs font-bold text-white/75">
                {{ zoomLabel() }} carregados
              </div>

              <div class="absolute bottom-4 right-4 grid overflow-hidden rounded-[8px] border border-white/10 bg-black/45">
                <button type="button" class="grid size-10 place-items-center text-white hover:bg-white/10" aria-label="Aumentar zoom" (click)="zoomIn()">
                  <span class="material-symbols-outlined" aria-hidden="true">add</span>
                </button>
                <button type="button" class="grid size-10 place-items-center border-t border-white/10 text-white hover:bg-white/10" aria-label="Reduzir zoom" (click)="zoomOut()">
                  <span class="material-symbols-outlined" aria-hidden="true">remove</span>
                </button>
                <button type="button" class="grid size-10 place-items-center border-t border-white/10 text-white hover:bg-white/10" aria-label="Ver Angola completa" (click)="resetMap()">
                  <span class="material-symbols-outlined" aria-hidden="true">public</span>
                </button>
              </div>
            </div>
          </section>

          <aside
            class="map-glass custom-scrollbar order-3 max-h-[780px] overflow-y-auto rounded-[8px] p-6 transition lg:max-h-[calc(100dvh-150px)]"
            [class.hidden]="!infoPanelOpen()"
            [class.lg:block]="true"
          >
            @if (selectedRegion(); as region) {
              <button type="button" class="float-right grid size-9 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-[#ffb1c0]" aria-label="Fechar painel" (click)="closePanel()">
                <span class="material-symbols-outlined" aria-hidden="true">close</span>
              </button>

              <div class="border-t-4 border-[#ffe088] pt-4">
                <p class="text-[11px] font-bold uppercase tracking-[0.16em] text-[#ffb1c0]">{{ region.level }}</p>
                <h2 class="mt-1 font-display text-[25px] font-extrabold text-white">{{ region.name }}</h2>
              </div>

              <div class="mt-5 h-40 overflow-hidden rounded-[8px]">
                <img [src]="region.imageUrl" [alt]="region.name" class="h-full w-full object-cover" />
              </div>

              <section class="mt-5">
                <h3 class="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#ffb1c0]">Camada {{ activeLayerLabel() }}</h3>
                <p class="mt-2 text-sm leading-7 text-white/68">{{ region.layers[activeLayer()] }}</p>
              </section>

              <section class="mt-5">
                <h3 class="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#ffb1c0]">Informações históricas</h3>
                <p class="mt-2 text-sm leading-7 text-white/68">{{ region.historia }}</p>
              </section>

              <section class="mt-5">
                <h3 class="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#ffb1c0]">Dados económicos</h3>
                <p class="mt-2 text-sm leading-7 text-white/68">{{ region.economia }}</p>
                <div class="mt-3 grid grid-cols-2 gap-3">
                  @for (indicator of region.economicIndicators; track indicator.label) {
                    <div class="rounded-[8px] border border-white/10 bg-white/8 p-3">
                      <p class="text-[11px] text-white/45">{{ indicator.label }}</p>
                      <p class="mt-1 text-sm font-extrabold">{{ indicator.value }}</p>
                    </div>
                  }
                </div>
                <div class="mt-4 flex h-24 items-end gap-2 px-2">
                  @for (value of region.chart; track $index) {
                    <i class="flex-1 rounded-t-sm border border-[#ffb1c0]/20 bg-[#904859]" [style.height.%]="value"></i>
                  }
                </div>
              </section>

              <section class="mt-5">
                <h3 class="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#ffb1c0]">Indicadores sociais</h3>
                <div class="mt-3 grid grid-cols-2 gap-3">
                  @for (indicator of region.socialIndicators; track indicator.label) {
                    <div class="rounded-[8px] border border-white/10 bg-white/8 p-3">
                      <p class="text-[11px] text-white/45">{{ indicator.label }}</p>
                      <p class="mt-1 text-sm font-extrabold">{{ indicator.value }}</p>
                    </div>
                  }
                </div>
              </section>

              <section class="mt-5">
                <h3 class="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#ffb1c0]">Curiosidades</h3>
                <div class="mt-3 grid gap-2">
                  @for (curiosity of region.curiosidades; track curiosity) {
                    <p class="rounded-[8px] border border-white/10 bg-white/8 p-3 text-sm leading-6 text-white/70">{{ curiosity }}</p>
                  }
                </div>
              </section>

              @if (childRegions().length) {
                <section class="mt-5">
                  <h3 class="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#ffb1c0]">Próximo nível</h3>
                  <div class="mt-3 grid gap-2">
                    @for (child of childRegions(); track child.id) {
                      <button type="button" class="flex items-center justify-between rounded-[8px] border border-white/10 px-3 py-2 text-left text-xs text-white/80 hover:bg-white/10" (click)="selectRegion(child)">
                        <span class="font-bold">{{ child.name }}</span>
                        <span class="capitalize text-white/45">{{ child.level }}</span>
                      </button>
                    }
                  </div>
                </section>
              }

              <a routerLink="/app/contents" class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#40081a] px-5 py-4 text-sm font-extrabold text-white transition hover:bg-[#5c1e2f]">
                <span class="material-symbols-outlined" aria-hidden="true">auto_stories</span>
                Ver relatório completo
              </a>
            }
          </aside>
        </section>
      </main>

      <app-public-footer />
      <app-back-to-top />
    </section>
  `,
})
export class MapPage {
  readonly zoom = signal(0);
  readonly infoPanelOpen = signal(false);
  readonly activeLayer = signal<LayerKey>('economia');
  readonly searchTerm = signal('');
  readonly selectedRegionId = signal('angola');

  readonly layers: MapLayer[] = [
    { key: 'historia', label: 'História', icon: 'history_edu', color: '#ffe088' },
    { key: 'economia', label: 'Economia', icon: 'trending_up', color: '#ffb1c0' },
    { key: 'infraestrutura', label: 'Infraestrutura', icon: 'foundation', color: '#8be0d4' },
    { key: 'turismo', label: 'Turismo', icon: 'travel_explore', color: '#f7c873' },
    { key: 'educacao', label: 'Educação', icon: 'school', color: '#a9c7ff' },
    { key: 'comercio', label: 'Comércio', icon: 'storefront', color: '#c4f0a4' },
  ];

  readonly regions: MapRegion[] = [
    this.region({
      id: 'angola',
      name: 'Angola',
      level: 'pais',
      x: 500,
      y: 570,
      minZoom: 0,
      imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Angola%2C%20administrative%20divisions%20-%20en%20-%20colored.svg?width=900',
      historia: 'Angola reúne memórias de reinos africanos, rotas atlânticas, período colonial, luta de libertação, independência em 1975 e reconstrução nacional.',
      economia: 'A economia nacional é marcada por petróleo, diamantes, agricultura, portos, comércio e uma agenda de diversificação produtiva.',
      curiosidades: ['O mapa revela progressivamente regiões administrativas conforme o zoom.', 'As camadas permitem ler o território por temas independentes.'],
      socialIndicators: [
        { label: 'População', value: '36M+' },
        { label: 'Províncias', value: '18' },
      ],
      economicIndicators: [
        { label: 'Setores-chave', value: '6' },
        { label: 'Costa atlântica', value: '1.6k km' },
      ],
      chart: [44, 58, 66, 73, 81],
      layers: {
        historia: 'Leitura nacional desde os reinos do Kongo, Ndongo e Matamba até à Angola contemporânea.',
        economia: 'Camada de produção, circulação, exportação e centros de serviços.',
        infraestrutura: 'Portos, ferrovias, estradas, energia e ligações regionais.',
        turismo: 'Paisagens, património cultural e rotas históricas.',
        educacao: 'Centros urbanos, universidades, investigação e formação técnica.',
        comercio: 'Mercados internos, corredores logísticos e comércio transfronteiriço.',
      },
    }),
    this.region({ id: 'cabinda', parentId: 'angola', name: 'Cabinda', level: 'provincia', x: 72, y: 66, minZoom: 1, shape: '35,20 80,8 104,46 92,110 45,118 20,74', historia: 'Território com trajetória administrativa singular e forte ligação ao Atlântico e ao Congo.', economia: 'Enclave petrolífero com relevância energética, portuária e florestal.', curiosidades: ['Cabinda aparece separada do corpo principal do território angolano.'], socialIndicators: [{ label: 'Perfil', value: 'Urbano' }, { label: 'Ligação', value: 'Atlântico' }], economicIndicators: [{ label: 'Setor', value: 'Petróleo' }, { label: 'Recurso', value: 'Floresta' }] }),
    this.region({ id: 'zaire', parentId: 'angola', name: 'Zaire', level: 'provincia', x: 135, y: 170, minZoom: 1, shape: '30,150 95,122 248,120 270,150 238,205 158,235 82,232', historia: 'Região associada ao antigo Reino do Kongo e a redes políticas e comerciais pré-coloniais.', economia: 'Circulação transfronteiriça, agricultura, comércio e ligação ao corredor norte.', curiosidades: ['Mbanza Kongo é uma referência patrimonial e histórica.'], socialIndicators: [{ label: 'Património', value: 'Alto' }, { label: 'Fronteira', value: 'Norte' }], economicIndicators: [{ label: 'Comércio', value: 'Fronteira' }, { label: 'Agricultura', value: 'Café' }] }),
    this.region({ id: 'uige', parentId: 'angola', name: 'Uíge', level: 'provincia', x: 330, y: 218, minZoom: 1, shape: '248,120 435,118 462,205 438,292 345,285 302,240 238,205 270,150', historia: 'Área importante nas memórias do café, da ocupação colonial e das redes do interior norte.', economia: 'Agricultura, café, comércio regional e ligações ao norte do país.', curiosidades: ['O café estruturou parte da memória económica local.'], socialIndicators: [{ label: 'Perfil', value: 'Agrário' }, { label: 'Rede', value: 'Norte' }], economicIndicators: [{ label: 'Café', value: 'Histórico' }, { label: 'Comércio', value: 'Regional' }] }),
    this.region({ id: 'bengo', parentId: 'angola', name: 'Bengo', level: 'provincia', x: 168, y: 318, minZoom: 1, shape: '82,232 158,235 238,205 302,240 270,315 210,325 158,365 96,330', historia: 'Território de transição entre Luanda, o litoral e o interior norte.', economia: 'Agricultura periurbana, pesca, materiais de construção e abastecimento da capital.', curiosidades: ['A proximidade de Luanda cria uma economia periurbana dinâmica.'], socialIndicators: [{ label: 'Ligação', value: 'Luanda' }, { label: 'Perfil', value: 'Misto' }], economicIndicators: [{ label: 'Abastecimento', value: 'Alto' }, { label: 'Pesca', value: 'Litoral' }] }),
    this.region({ id: 'luanda', parentId: 'angola', name: 'Luanda', level: 'provincia', x: 75, y: 382, minZoom: 1, shape: '50,340 96,330 122,374 96,438 55,420', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Luanda%20Skyline%20-%20Angola%202015.jpg?width=900', historia: 'Fundada em 1576 por Paulo Dias de Novais, tornou-se capital política e económica de Angola independente.', economia: 'Maior centro financeiro, logístico, administrativo e de serviços do país.', curiosidades: ['A baía e o porto natural foram decisivos para a centralidade da cidade.'], socialIndicators: [{ label: 'População', value: '8.2M' }, { label: 'Urbanização', value: 'Alta' }], economicIndicators: [{ label: 'PIB regional', value: '35.4%' }, { label: 'Serviços', value: 'Muito alto' }] }),
    this.region({ id: 'kwanza-norte', parentId: 'angola', name: 'Kwanza Norte', level: 'provincia', x: 265, y: 370, minZoom: 1, shape: '210,325 270,315 350,318 342,445 260,462 205,410', historia: 'Região ligada a rotas interiores, produção agrícola e administração colonial.', economia: 'Agricultura, energia, comércio interno e articulação com o vale do Kwanza.', curiosidades: ['Conecta o eixo Luanda-Malanje ao centro do país.'], socialIndicators: [{ label: 'Vale', value: 'Kwanza' }, { label: 'Perfil', value: 'Interior' }], economicIndicators: [{ label: 'Energia', value: 'Relevante' }, { label: 'Agricultura', value: 'Média' }] }),
    this.region({ id: 'malanje', parentId: 'angola', name: 'Malanje', level: 'provincia', x: 430, y: 378, minZoom: 1, shape: '350,318 438,292 520,355 520,505 405,500 342,445', historia: 'Associada a rotas interiores, quedas de Calandula e transformações agrárias.', economia: 'Agricultura, energia, comércio regional e potencial logístico do interior norte.', curiosidades: ['As Quedas de Calandula são um importante símbolo turístico.'], socialIndicators: [{ label: 'Turismo', value: 'Natural' }, { label: 'Perfil', value: 'Interior' }], economicIndicators: [{ label: 'Agricultura', value: 'Alta' }, { label: 'Energia', value: 'Potencial' }] }),
    this.region({ id: 'lunda-norte', parentId: 'angola', name: 'Lunda Norte', level: 'provincia', x: 655, y: 388, minZoom: 1, shape: '520,300 815,212 812,360 702,495 555,480 520,400', historia: 'Região marcada por sociedades Lunda-Chokwe e redes políticas do leste.', economia: 'Diamantes, comércio fronteiriço e serviços associados à cadeia mineira.', curiosidades: ['O Dundo é um centro urbano ligado à história diamantífera.'], socialIndicators: [{ label: 'Fronteira', value: 'Leste' }, { label: 'Cultura', value: 'Chokwe' }], economicIndicators: [{ label: 'Diamantes', value: 'Alto' }, { label: 'Serviços', value: 'Mineiros' }] }),
    this.region({ id: 'lunda-sul', parentId: 'angola', name: 'Lunda Sul', level: 'provincia', x: 810, y: 530, minZoom: 1, shape: '702,495 812,360 930,392 940,565 855,610 742,585', historia: 'História ligada a redes Lunda-Chokwe, cultura material e autoridade política.', economia: 'Diamantes, serviços mineiros e circulação regional no leste.', curiosidades: ['Saurimo funciona como centro urbano regional.'], socialIndicators: [{ label: 'Capital', value: 'Saurimo' }, { label: 'Perfil', value: 'Mineiro' }], economicIndicators: [{ label: 'Diamantes', value: 'Alto' }, { label: 'Comércio', value: 'Regional' }] }),
    this.region({ id: 'moxico', parentId: 'angola', name: 'Moxico', level: 'provincia', x: 760, y: 720, minZoom: 1, shape: '555,480 702,495 742,585 940,565 940,760 850,760 850,980 690,940 560,820', historia: 'Território associado a longas rotas interiores e a memórias da guerra e reconstrução.', economia: 'Agricultura, madeira, comércio fronteiriço e potencial logístico oriental.', curiosidades: ['Luena estrutura uma extensa área de circulação leste.'], socialIndicators: [{ label: 'Extensão', value: 'Muito alta' }, { label: 'Fronteira', value: 'Leste' }], economicIndicators: [{ label: 'Madeira', value: 'Relevante' }, { label: 'Logística', value: 'Potencial' }] }),
    this.region({ id: 'kwanza-sul', parentId: 'angola', name: 'Kwanza Sul', level: 'provincia', x: 235, y: 540, minZoom: 1, shape: '96,438 205,410 260,462 405,500 332,612 205,615 132,555', historia: 'Região relevante nas economias de plantação e na ligação litoral-planalto.', economia: 'Café, agricultura, pesca, indústria ligeira e comércio costeiro.', curiosidades: ['Sumbe e Porto Amboim articulam litoral, agricultura e serviços.'], socialIndicators: [{ label: 'Costa', value: 'Centro' }, { label: 'Perfil', value: 'Misto' }], economicIndicators: [{ label: 'Café', value: 'Histórico' }, { label: 'Pesca', value: 'Litoral' }] }),
    this.region({ id: 'benguela', parentId: 'angola', name: 'Benguela', level: 'provincia', x: 170, y: 720, minZoom: 1, shape: '132,555 205,615 302,620 320,762 230,820 100,790 82,690', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Porto%20do%20Lobito%20-%20Angola%202015.jpg?width=900', historia: 'O caminho-de-ferro de Benguela reorganizou mercadorias e pessoas no centro de Angola.', economia: 'Portos, Corredor do Lobito, comércio, pesca e indústria.', curiosidades: ['O Lobito é uma porta atlântica para cadeias logísticas regionais.'], socialIndicators: [{ label: 'Portos', value: '2' }, { label: 'Corredor', value: 'Lobito' }], economicIndicators: [{ label: 'Logística', value: 'Alta' }, { label: 'Pesca', value: 'Alta' }] }),
    this.region({ id: 'huambo', parentId: 'angola', name: 'Huambo', level: 'provincia', x: 320, y: 705, minZoom: 1, shape: '302,620 420,610 420,760 320,762', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Huambo%20Central%20rotunda.jpg?width=900', historia: 'Centro histórico do planalto central e de redes ferroviárias e agrícolas.', economia: 'Agricultura de planalto, comércio, educação e serviços regionais.', curiosidades: ['A altitude influencia o perfil agrícola e urbano da região.'], socialIndicators: [{ label: 'Altitude', value: '1.7km' }, { label: 'Ensino', value: 'Regional' }], economicIndicators: [{ label: 'Agricultura', value: 'Alta' }, { label: 'Serviços', value: 'Regional' }] }),
    this.region({ id: 'bie', parentId: 'angola', name: 'Bié', level: 'provincia', x: 455, y: 660, minZoom: 1, shape: '420,610 555,480 560,820 420,760', historia: 'Território do planalto central com importância nas rotas interiores.', economia: 'Agricultura, comércio interno e articulação entre litoral, centro e leste.', curiosidades: ['Kuito é uma referência urbana no planalto.'], socialIndicators: [{ label: 'Centro', value: 'Geográfico' }, { label: 'Perfil', value: 'Agrário' }], economicIndicators: [{ label: 'Agricultura', value: 'Alta' }, { label: 'Comércio', value: 'Interno' }] }),
    this.region({ id: 'huila', parentId: 'angola', name: 'Huíla', level: 'provincia', x: 260, y: 875, minZoom: 1, shape: '100,790 230,820 320,762 420,760 420,940 320,995 180,980 95,910', historia: 'O planalto da Huíla marcou encontros entre sociedades locais, missões e ocupação colonial.', economia: 'Agropecuária, comércio regional, turismo de altitude e serviços.', curiosidades: ['Lubango é um importante polo turístico e urbano do sul.'], socialIndicators: [{ label: 'Turismo', value: 'Alto' }, { label: 'Perfil', value: 'Planalto' }], economicIndicators: [{ label: 'Agropecuária', value: 'Alta' }, { label: 'Serviços', value: 'Regional' }] }),
    this.region({ id: 'namibe', parentId: 'angola', name: 'Namibe', level: 'provincia', x: 90, y: 970, minZoom: 1, shape: '40,900 95,910 180,980 145,1110 35,1108', historia: 'Litoral sul marcado por circulação marítima, desertos e povoamentos costeiros.', economia: 'Pesca, porto, minerais, turismo costeiro e economia do deserto.', curiosidades: ['O deserto e o litoral criam uma paisagem económica singular.'], socialIndicators: [{ label: 'Costa', value: 'Sul' }, { label: 'Clima', value: 'Árido' }], economicIndicators: [{ label: 'Pesca', value: 'Alta' }, { label: 'Porto', value: 'Relevante' }] }),
    this.region({ id: 'cunene', parentId: 'angola', name: 'Cunene', level: 'provincia', x: 330, y: 1030, minZoom: 1, shape: '180,980 320,995 420,940 485,1080 420,1145 185,1140 145,1110', historia: 'Região associada a sociedades pastoris, fronteira sul e memória de resistência.', economia: 'Pecuária, comércio fronteiriço, agricultura e gestão de água.', curiosidades: ['A gestão da água é central para a vida económica local.'], socialIndicators: [{ label: 'Fronteira', value: 'Sul' }, { label: 'Perfil', value: 'Pastoril' }], economicIndicators: [{ label: 'Pecuária', value: 'Alta' }, { label: 'Água', value: 'Crítica' }] }),
    this.region({ id: 'cuando-cubango', parentId: 'angola', name: 'Kwando-Kubango', level: 'provincia', x: 610, y: 990, minZoom: 1, shape: '420,760 560,820 690,940 850,980 940,1140 485,1080 420,940', historia: 'Território de grandes rios, fronteiras e memórias militares do sudeste.', economia: 'Agropecuária, turismo natural, comércio fronteiriço e conservação.', curiosidades: ['Cuito Cuanavale tem forte significado histórico.'], socialIndicators: [{ label: 'Natureza', value: 'Alta' }, { label: 'Fronteira', value: 'Sudeste' }], economicIndicators: [{ label: 'Turismo', value: 'Natural' }, { label: 'Agropecuária', value: 'Média' }] }),
    this.region({ id: 'luanda-municipio', parentId: 'luanda', name: 'Luanda', level: 'municipio', x: 68, y: 362, minZoom: 2, historia: 'Núcleo histórico da capital desde o período colonial.', economia: 'Centro administrativo, financeiro, comercial e portuário.', curiosidades: ['Ao ampliar surgem Ingombota, Maianga e Mutamba.'], socialIndicators: [{ label: 'Centralidade', value: 'Máxima' }, { label: 'Densidade', value: 'Alta' }], economicIndicators: [{ label: 'Serviços', value: 'Alto' }, { label: 'Porto', value: 'Ativo' }] }),
    this.region({ id: 'viana', parentId: 'luanda', name: 'Viana', level: 'municipio', x: 120, y: 382, minZoom: 2, historia: 'Cresceu com a expansão urbana e industrial de Luanda.', economia: 'Zona industrial, armazéns, habitação e eixos de transporte metropolitano.', curiosidades: ['É estratégico para logística e periferia produtiva.'], socialIndicators: [{ label: 'Crescimento', value: 'Alto' }, { label: 'Habitação', value: 'Expansão' }], economicIndicators: [{ label: 'Indústria', value: 'Alta' }, { label: 'Logística', value: 'Alta' }] }),
    this.region({ id: 'belas', parentId: 'luanda', name: 'Belas', level: 'municipio', x: 88, y: 414, minZoom: 2, historia: 'A expansão de Talatona e Mussulo marcou novas centralidades urbanas.', economia: 'Imobiliário, turismo costeiro, comércio e serviços.', curiosidades: ['Combina áreas costeiras e urbanizações recentes.'], socialIndicators: [{ label: 'Urbanização', value: 'Alta' }, { label: 'Litoral', value: 'Sim' }], economicIndicators: [{ label: 'Imobiliário', value: 'Alto' }, { label: 'Turismo', value: 'Costeiro' }] }),
    this.region({ id: 'lobito', parentId: 'benguela', name: 'Lobito', level: 'municipio', x: 152, y: 700, minZoom: 2, imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Porto%20do%20Lobito%20-%20Angola%202015.jpg?width=900', historia: 'Cidade marcada pelo caminho-de-ferro de Benguela.', economia: 'Porto, caminho-de-ferro e Corredor do Lobito.', curiosidades: ['Eixo logístico entre litoral, planalto e leste.'], socialIndicators: [{ label: 'Mobilidade', value: 'Porto' }, { label: 'Corredor', value: 'Regional' }], economicIndicators: [{ label: 'Logística', value: 'Muito alta' }, { label: 'Porto', value: 'Estratégico' }] }),
    this.region({ id: 'ingombota', parentId: 'luanda-municipio', name: 'Ingombota', level: 'distrito', x: 62, y: 352, minZoom: 3, historia: 'Centro histórico urbano de Luanda.', economia: 'Serviços públicos, bancos, comércio e sedes empresariais.', curiosidades: ['Concentra edifícios institucionais e memória urbana.'], socialIndicators: [{ label: 'Serviços', value: 'Central' }, { label: 'Fluxo', value: 'Alto' }], economicIndicators: [{ label: 'Bancos', value: 'Alto' }, { label: 'Administração', value: 'Central' }] }),
    this.region({ id: 'maianga', parentId: 'luanda-municipio', name: 'Maianga', level: 'distrito', x: 78, y: 372, minZoom: 3, historia: 'Área ligada à expansão urbana e administrativa da capital.', economia: 'Educação, serviços, comércio e circulação diária.', curiosidades: ['É uma ponte entre zonas residenciais e serviços centrais.'], socialIndicators: [{ label: 'Educação', value: 'Alta' }, { label: 'Fluxo', value: 'Diário' }], economicIndicators: [{ label: 'Comércio', value: 'Local' }, { label: 'Serviços', value: 'Alto' }] }),
    this.region({ id: 'mutamba', parentId: 'ingombota', name: 'Mutamba', level: 'bairro', x: 65, y: 345, minZoom: 4, historia: 'Bairro associado a edifícios públicos e memória urbana de Luanda.', economia: 'Comércio, transportes, serviços e memória institucional.', curiosidades: ['É um ponto central de mobilidade e vida administrativa.'], socialIndicators: [{ label: 'Transporte', value: 'Central' }, { label: 'Uso', value: 'Misto' }], economicIndicators: [{ label: 'Comércio', value: 'Alto' }, { label: 'Serviços', value: 'Institucional' }] }),
    this.region({ id: 'avenida-4-fevereiro', parentId: 'mutamba', name: 'Av. 4 de Fevereiro', level: 'avenida', x: 54, y: 338, minZoom: 5, line: '48,336 54,338 62,342 72,348 86,354', historia: 'A marginal de Luanda concentra memória urbana, representação política e comércio.', economia: 'Eixo nobre de serviços, hotéis, bancos e frente marítima.', curiosidades: ['A avenida acompanha a baía de Luanda.'], socialIndicators: [{ label: 'Frente mar', value: 'Sim' }, { label: 'Fluxo', value: 'Alto' }], economicIndicators: [{ label: 'Hotéis', value: 'Alto' }, { label: 'Bancos', value: 'Alto' }] }),
  ];

  readonly selectedRegion = computed(() => this.regions.find((region) => region.id === this.selectedRegionId()) ?? this.regions[0]);
  readonly childRegions = computed(() => this.regions.filter((region) => region.parentId === this.selectedRegion().id));
  readonly visibleRegions = computed(() => this.regions.filter((region) => region.id !== 'angola' && region.minZoom <= this.zoom() && this.isInVisibleBranch(region)));
  readonly visibleShapeRegions = computed(() => this.visibleRegions().filter((region) => region.shape));
  readonly visibleLineRegions = computed(() => this.visibleRegions().filter((region) => region.line));
  readonly visiblePointRegions = computed(() => this.visibleRegions().filter((region) => !region.shape && !region.line));
  readonly filteredVisibleRegions = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const regions = this.visibleRegions();
    return term ? regions.filter((region) => region.name.toLowerCase().includes(term)) : regions;
  });
  readonly zoomLabel = computed(() => {
    if (this.zoom() < 1) return 'Angola completa';
    if (this.zoom() < 2) return 'Províncias';
    if (this.zoom() < 3) return 'Municípios';
    if (this.zoom() < 4) return 'Distritos urbanos';
    if (this.zoom() < 5) return 'Bairros';
    return 'Avenidas e ruas';
  });
  readonly mapTransform = computed(() => {
    const selected = this.selectedRegion();
    const scale = this.zoom() < 1 ? 0.96 : 1 + this.zoom() * 0.72;
    const target = this.zoom() < 1 ? this.regions[0] : selected;
    const dx = 500 - target.x * scale;
    const dy = 580 - target.y * scale;
    return `translate(${dx} ${dy}) scale(${scale})`;
  });
  readonly mapCssTransform = computed(() => {
    const scale = this.zoom() < 1 ? 1 : 1 + this.zoom() * 0.12;
    return `scale(${scale})`;
  });

  selectRegion(region: MapRegion): void {
    this.selectedRegionId.set(region.id);
    this.infoPanelOpen.set(true);
    this.zoom.update((value) => Math.max(value, region.minZoom));
  }

  setZoom(value: string): void {
    this.zoom.set(this.clampZoom(Number(value)));
  }

  zoomIn(): void {
    this.zoom.update((value) => this.clampZoom(value + 0.5));
  }

  zoomOut(): void {
    this.zoom.update((value) => this.clampZoom(value - 0.5));
  }

  resetMap(): void {
    this.selectedRegionId.set('angola');
    this.zoom.set(0);
    this.infoPanelOpen.set(false);
  }

  closePanel(): void {
    this.infoPanelOpen.set(false);
  }

  onMapWheel(event: WheelEvent): void {
    event.preventDefault();
    this.zoom.update((value) => this.clampZoom(value + (event.deltaY > 0 ? -0.18 : 0.18)));
  }

  activeLayerLabel(): string {
    return this.layers.find((layer) => layer.key === this.activeLayer())?.label ?? 'Economia';
  }

  activeLayerColor(): string {
    return this.layers.find((layer) => layer.key === this.activeLayer())?.color ?? '#ffb1c0';
  }

  regionPositionX(region: MapRegion): number {
    return Math.min(92, Math.max(8, region.x / 10));
  }

  regionPositionY(region: MapRegion): number {
    return Math.min(94, Math.max(6, region.y / 11.6));
  }

  private isInVisibleBranch(region: MapRegion): boolean {
    if (region.level === 'provincia') {
      return true;
    }

    if (this.selectedRegion().id === 'angola') {
      return false;
    }

    let current: MapRegion | undefined = region;

    while (current) {
      if (current.id === this.selectedRegion().id) {
        return true;
      }

      current = current.parentId ? this.regions.find((item) => item.id === current?.parentId) : undefined;
    }

    return false;
  }

  private clampZoom(value: number): number {
    return Math.min(5, Math.max(0, Number.isFinite(value) ? value : 0));
  }

  private region(region: Omit<MapRegion, 'imageUrl' | 'chart' | 'layers'> & Partial<Pick<MapRegion, 'imageUrl' | 'chart' | 'layers'>>): MapRegion {
    return {
      imageUrl: region.imageUrl ?? 'https://commons.wikimedia.org/wiki/Special:FilePath/Angola%2C%20administrative%20divisions%20-%20en%20-%20colored.svg?width=900',
      chart: region.chart ?? [42, 55, 64, 72, 86],
      layers: {
        historia: region.layers?.historia ?? region.historia,
        economia: region.layers?.economia ?? region.economia,
        infraestrutura: region.layers?.infraestrutura ?? 'Infraestruturas de circulação, energia, serviços públicos e conexão territorial.',
        turismo: region.layers?.turismo ?? 'Pontos de memória, paisagem, património local e rotas de visita.',
        educacao: region.layers?.educacao ?? 'Escolas, centros de formação, universidades e circulação de conhecimento.',
        comercio: region.layers?.comercio ?? 'Mercados, serviços, logística, comércio formal e redes locais de troca.',
      },
      ...region,
    };
  }
}

export const MAP_ROUTES: Routes = [{ path: '', component: MapPage }];
