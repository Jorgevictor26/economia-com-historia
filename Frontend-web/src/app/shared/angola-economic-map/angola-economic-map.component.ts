import { Component, computed, signal } from '@angular/core';

interface EconomicPlace {
  id: string;
  name: string;
  level: 'Provincia' | 'Municipio' | 'Distrito urbano' | 'Bairro' | 'Patrimonio';
  layer: 'Nacional' | 'Comercio' | 'Mineracao' | 'Agricultura' | 'Memoria';
  economy: string;
  history: string;
  localInfo: string;
  x: number;
  y: number;
  zoomHint: number;
}

@Component({
  selector: 'app-angola-economic-map',
  template: `
    <section class="maps-experience" aria-label="Mapa economico-historico de Angola">
      <aside class="place-panel">
        <div class="search-box">
          <span>Angola</span>
          <button type="button" aria-label="Pesquisar">
            <span class="material-symbols-outlined" aria-hidden="true">search</span>
          </button>
          <button type="button" aria-label="Fechar pesquisa">
            <span class="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>

        <div class="panel-cover" aria-hidden="true"></div>

        <div class="panel-body">
          <p class="eyebrow">{{ selectedPlace().level }} / {{ selectedPlace().layer }}</p>
          <h2>{{ selectedPlace().name }}</h2>

          <div class="quick-actions" aria-label="Acoes do mapa">
            <button type="button">
              <span class="material-symbols-outlined" aria-hidden="true">near_me</span>
              Direcoes
            </button>
            <button type="button">
              <span class="material-symbols-outlined" aria-hidden="true">bookmark</span>
              Guardar
            </button>
            <button type="button">
              <span class="material-symbols-outlined" aria-hidden="true">explore</span>
              Imediacoes
            </button>
            <button type="button">
              <span class="material-symbols-outlined" aria-hidden="true">ios_share</span>
              Partilhar
            </button>
          </div>

          <section class="info-block">
            <h3>Interesse economico</h3>
            <p>{{ selectedPlace().economy }}</p>
          </section>

          <section class="info-block">
            <h3>Interesse historico</h3>
            <p>{{ selectedPlace().history }}</p>
          </section>

          <section class="info-block">
            <h3>Informacoes sobre o local</h3>
            <p>{{ selectedPlace().localInfo }}</p>
          </section>

          <section class="info-block">
            <h3>Locais no mapa</h3>
            <div class="place-list">
              @for (place of visiblePlaces(); track place.id) {
                <button type="button" [class.active]="selectedPlace().id === place.id" (click)="selectPlace(place.id)">
                  <strong>{{ place.name }}</strong>
                  <span>{{ place.level }}</span>
                </button>
              }
            </div>
          </section>
        </div>
      </aside>

      <div class="map-canvas">
        <div class="layer-picker" aria-label="Camadas">
          <span class="material-symbols-outlined" aria-hidden="true">layers</span>
          <select [value]="selectedLayer()" (change)="changeLayer($event)" aria-label="Selecionar camada">
            @for (layer of layers; track layer) {
              <option [value]="layer">{{ layer }}</option>
            }
          </select>
        </div>

        <svg viewBox="0 0 1040 640" role="img" aria-label="Mapa de Angola no estilo Google Maps">
          <defs>
            <pattern id="terrainPattern" width="90" height="90" patternUnits="userSpaceOnUse">
              <path d="M-15 62 C20 18 52 104 98 31" fill="none" stroke="#94d7b8" stroke-width="18" opacity="0.24" />
              <path d="M-10 28 C28 6 57 66 105 15" fill="none" stroke="#73cda3" stroke-width="9" opacity="0.18" />
            </pattern>
            <filter id="softLabel" x="-12%" y="-12%" width="124%" height="124%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#ffffff" flood-opacity="0.95" />
            </filter>
          </defs>

          <rect width="1040" height="640" fill="#79c8d7" />
          <path d="M0 0H1000V640H0z" fill="#bfe8d5" />
          <path d="M0 0H328C265 62 232 125 226 194C218 285 292 326 261 404C232 478 154 516 122 640H0z" fill="#79c8d7" />
          <path d="M243 0C232 57 224 118 230 181C238 258 292 319 260 405C230 484 154 536 131 640" fill="none" stroke="#f5f1e8" stroke-width="28" opacity="0.82" />
          <path d="M0 0H1040V640H0z" fill="url(#terrainPattern)" opacity="0.95" />

          <g [attr.transform]="mapTransform()" class="zoom-layer">
            <path
              class="angola-shape"
              d="M311 46 L460 57 L544 100 L582 166 L579 241 L622 303 L596 382 L552 445 L493 505 L398 563 L300 531 L262 459 L206 414 L172 334 L195 255 L180 181 L229 116 Z"
            />
            <path
              class="border-line"
              d="M311 46 L460 57 L544 100 L582 166 L579 241 L622 303 L596 382 L552 445 L493 505 L398 563 L300 531 L262 459 L206 414 L172 334 L195 255 L180 181 L229 116 Z"
            />

            <path d="M193 344 C279 329 364 338 438 304 C510 272 558 274 608 313" class="main-road" />
            <path d="M260 414 C329 376 397 367 493 505" class="main-road secondary" />
            <path d="M258 140 C324 162 363 214 381 275" class="river" />
            <path d="M450 160 C485 237 462 300 512 379" class="river" />
            <path d="M319 486 C380 458 418 471 475 520" class="river" />

            <text x="410" y="390" class="country-label">Angola</text>
            <text x="765" y="330" class="park-label">Parque Nacional<tspan x="765" dy="20">da Cameia</tspan></text>
            <text x="624" y="584" class="park-label">Coutada Publica</text>
            @for (label of cityLabels; track label.name) {
              <g class="city-label">
                <circle [attr.cx]="label.x" [attr.cy]="label.y" r="2.3" />
                <text [attr.x]="label.x + 5" [attr.y]="label.y + 4">{{ label.name }}</text>
              </g>
            }

            @for (place of visiblePlaces(); track place.id) {
              <g
                class="place-marker"
                [class.selected]="selectedPlace().id === place.id"
                role="button"
                tabindex="0"
                (click)="selectPlace(place.id)"
                (keyup.enter)="selectPlace(place.id)"
              >
                <circle [attr.cx]="place.x" [attr.cy]="place.y" r="11" />
                <circle [attr.cx]="place.x" [attr.cy]="place.y" r="4" />
                <text [attr.x]="place.x + 15" [attr.y]="place.y - 10">{{ place.name }}</text>
              </g>
            }
          </g>
        </svg>

        <div class="map-controls" aria-label="Controlos do mapa">
          <button type="button" aria-label="Minha localizacao">
            <span class="material-symbols-outlined" aria-hidden="true">my_location</span>
          </button>
          <button type="button" (click)="zoomIn()" aria-label="Aumentar zoom">
            <span class="material-symbols-outlined" aria-hidden="true">add</span>
          </button>
          <button type="button" (click)="zoomOut()" aria-label="Reduzir zoom">
            <span class="material-symbols-outlined" aria-hidden="true">remove</span>
          </button>
          <button type="button" aria-label="Street view">
            <span class="material-symbols-outlined street" aria-hidden="true">accessibility_new</span>
          </button>
        </div>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .maps-experience {
      position: relative;
      min-height: 640px;
      overflow: hidden;
      border: 1px solid #c8d6d6;
      border-radius: 8px;
      background: #79c8d7;
      box-shadow: 0 18px 50px rgb(22 19 21 / 0.08);
    }

    .map-canvas,
    svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    .place-panel {
      position: relative;
      z-index: 3;
      width: min(406px, calc(100% - 2rem));
      min-height: 640px;
      background: #fff;
      box-shadow: 12px 0 28px rgb(34 45 48 / 0.18);
    }

    .search-box {
      position: absolute;
      left: 14px;
      right: 16px;
      top: 12px;
      z-index: 4;
      display: grid;
      grid-template-columns: 1fr auto auto;
      align-items: center;
      min-height: 48px;
      border-radius: 24px;
      background: #fff;
      padding-inline: 22px 10px;
      box-shadow: 0 2px 8px rgb(42 47 49 / 0.28);
    }

    .search-box span:first-child {
      color: #2f3437;
      font-size: 0.95rem;
    }

    .panel-cover {
      height: 240px;
      background:
        linear-gradient(180deg, rgb(19 42 55 / 0.08), rgb(19 42 55 / 0.1)),
        radial-gradient(circle at 55% 28%, #ffffff 0 2px, transparent 3px),
        radial-gradient(circle at 20% 72%, #f4e9d2 0 8px, transparent 9px),
        linear-gradient(168deg, #7bbbd0 0 36%, #e9dfce 37% 46%, #6cae99 47% 100%);
      background-size: auto, 78px 54px, auto, auto;
    }

    .panel-body {
      color: #202124;
    }

    .eyebrow {
      margin: 18px 22px 4px;
      color: #00899a;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    h2 {
      margin: 0 22px 16px;
      color: #202124;
      font-size: 1.45rem;
      line-height: 1.2;
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      border-block: 1px solid #e0e0e0;
      padding: 14px 16px 16px;
    }

    .quick-actions button {
      display: grid;
      justify-items: center;
      gap: 7px;
      min-width: 0;
      color: #006f7e;
      font-size: 0.72rem;
      font-weight: 700;
      line-height: 1.15;
      text-align: center;
    }

    .quick-actions .material-symbols-outlined {
      display: grid;
      width: 40px;
      aspect-ratio: 1;
      place-items: center;
      border-radius: 999px;
      background: #d6f3fa;
      color: #00899a;
      font-size: 21px;
    }

    .info-block {
      border-bottom: 1px solid #e0e0e0;
      padding: 16px 22px 18px;
    }

    .info-block h3 {
      color: #202124;
      font-size: 1rem;
      font-weight: 600;
    }

    .info-block p {
      margin-top: 12px;
      color: #1f1f1f;
      font-size: 0.88rem;
      line-height: 1.55;
    }

    .place-list {
      display: grid;
      gap: 8px;
      margin-top: 12px;
    }

    .place-list button {
      display: flex;
      min-height: 42px;
      align-items: center;
      justify-content: space-between;
      border: 1px solid #dde3e4;
      border-radius: 6px;
      padding-inline: 12px;
      color: #3c4043;
      text-align: left;
    }

    .layer-picker {
      position: absolute;
      left: 420px;
      top: 8px;
      z-index: 2;
      display: flex;
      height: 48px;
      align-items: center;
      border: 1px solid #dadce0;
      background: #fff;
      padding-inline: 12px 6px;
      box-shadow: 0 1px 4px rgb(60 64 67 / 0.28);
    }

    .layer-picker select {
      width: 122px;
      border: 0;
      color: #3c4043;
      font: 700 0.8rem inherit;
      outline: 0;
    }

    .zoom-layer {
      transition: transform 180ms ease;
      transform-origin: center;
    }

    .angola-shape {
      fill: rgb(184 234 205 / 0.34);
      stroke: rgb(77 155 115 / 0.32);
      stroke-width: 20;
    }

    .border-line {
      fill: none;
      stroke: #e33c2f;
      stroke-dasharray: 4 5;
      stroke-linecap: round;
      stroke-width: 2;
    }

    .main-road {
      fill: none;
      stroke: #c7dcc8;
      stroke-width: 7;
    }

    .river {
      fill: none;
      stroke: #74b7d7;
      stroke-width: 2;
    }

    .country-label {
      fill: #283238;
      filter: url(#softLabel);
      font-size: 24px;
      font-weight: 800;
    }

    .park-label {
      fill: #1b7f65;
      filter: url(#softLabel);
      font-size: 16px;
      font-weight: 500;
      text-anchor: middle;
    }

    .city-label circle {
      fill: #fff;
      stroke: #777;
      stroke-width: 1;
    }

    .city-label text {
      fill: #3c4043;
      filter: url(#softLabel);
      font-size: 12px;
    }

    .place-marker {
      cursor: pointer;
      outline: none;
    }

    .place-marker circle:first-child {
      fill: #00899a;
      stroke: #fff;
      stroke-width: 3;
    }

    .place-marker circle:nth-child(2) {
      fill: #fff;
    }

    .place-marker text {
      fill: #202124;
      filter: url(#softLabel);
      font-size: 14px;
      font-weight: 700;
    }

    .place-marker.selected circle:first-child,
    .place-marker:hover circle:first-child,
    .place-marker:focus-visible circle:first-child {
      fill: #b3261e;
    }

    .place-marker.selected text {
      font-size: 17px;
    }

    .map-controls {
      position: absolute;
      right: 20px;
      bottom: 34px;
      z-index: 2;
      display: grid;
      overflow: hidden;
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 1px 4px rgb(60 64 67 / 0.3);
    }

    .map-controls button {
      display: grid;
      width: 40px;
      aspect-ratio: 1;
      border-bottom: 1px solid #e0e0e0;
      place-items: center;
      color: #5f6368;
    }

    @media (max-width: 900px) {
      .maps-experience,
      .place-panel {
        min-height: 760px;
      }

      .place-panel {
        width: 100%;
        min-height: 390px;
        box-shadow: 0 12px 22px rgb(34 45 48 / 0.18);
      }

      .panel-cover {
        height: 170px;
      }

      .map-canvas {
        top: 390px;
        height: 370px;
      }

      .layer-picker {
        left: 12px;
        top: 10px;
      }
    }

  `,
})
export class AngolaEconomicMapComponent {
  readonly layers: EconomicPlace['layer'][] = ['Nacional', 'Comercio', 'Mineracao', 'Agricultura', 'Memoria'];
  readonly selectedLayer = signal<EconomicPlace['layer']>('Nacional');
  readonly selectedPlaceId = signal('luanda');
  readonly zoomLevel = signal(1);

  readonly cityLabels = [
    { name: 'Mbanza-Kongo', x: 274, y: 92 },
    { name: 'Luanda', x: 247, y: 288 },
    { name: 'Belas', x: 208, y: 304 },
    { name: 'Caboledo', x: 221, y: 340 },
    { name: 'Porto Amboim', x: 232, y: 392 },
    { name: 'Sumbe', x: 248, y: 418 },
    { name: 'Benguela', x: 260, y: 482 },
    { name: 'Lobito', x: 272, y: 505 },
    { name: 'Lubango', x: 300, y: 574 },
    { name: 'Huambo', x: 346, y: 502 },
    { name: 'Malanje', x: 365, y: 326 },
    { name: 'Calandula', x: 338, y: 300 },
    { name: 'Saurimo', x: 600, y: 338 },
    { name: 'Luena', x: 636, y: 438 },
    { name: 'Menongue', x: 470, y: 560 },
    { name: 'Cuito Cuanavale', x: 540, y: 586 },
    { name: 'Dundo', x: 655, y: 136 },
    { name: 'Andrada', x: 688, y: 154 },
  ];

  readonly places: EconomicPlace[] = [
    {
      id: 'luanda',
      name: 'Luanda',
      level: 'Provincia',
      layer: 'Nacional',
      economy: 'Centro financeiro, logistico e administrativo do pais, com porto, servicos, sedes empresariais e mercado urbano de grande escala.',
      history: 'Fundada em 1576, tornou-se ponto central das rotas atlanticas e capital politica e economica de Angola independente.',
      localInfo: 'Na costa noroeste, a capital concentra instituicoes publicas, universidades, mercados, bancos e fluxos diarios de transporte.',
      x: 247,
      y: 288,
      zoomHint: 1,
    },
    {
      id: 'lobito',
      name: 'Lobito',
      level: 'Municipio',
      layer: 'Comercio',
      economy: 'O porto e o Corredor do Lobito ligam o litoral ao interior mineiro e agricola, com peso estrategico nas exportacoes.',
      history: 'Cresceu com o caminho-de-ferro de Benguela, reorganizando a circulacao de mercadorias e pessoas no centro de Angola.',
      localInfo: 'A zona costeira de Benguela e Lobito funciona como saida logistica para produtos do planalto e do leste.',
      x: 272,
      y: 505,
      zoomHint: 1,
    },
    {
      id: 'malanje',
      name: 'Malanje',
      level: 'Provincia',
      layer: 'Agricultura',
      economy: 'Area associada a agricultura, energia e corredores internos, com potencial de abastecimento alimentar e ligacao ao mercado nacional.',
      history: 'Ponto relevante nas rotas do interior norte, articulando sociedades locais, comercio e administracao territorial.',
      localInfo: 'A proximidade de Calandula e de rios interiores reforca a leitura do territorio como zona agricola e de circulacao.',
      x: 365,
      y: 326,
      zoomHint: 1,
    },
    {
      id: 'huila',
      name: 'Huila',
      level: 'Provincia',
      layer: 'Agricultura',
      economy: 'Destaca-se pela agropecuaria, comercio regional, turismo de altitude e articulacao com o sul do pais.',
      history: 'O planalto da Huila marcou encontros entre sociedades locais, missoes, comercio e ocupacao colonial no interior sul.',
      localInfo: 'Lubango e as areas envolventes ajudam a explicar o peso regional da agropecuaria, servicos e turismo de altitude.',
      x: 300,
      y: 574,
      zoomHint: 1,
    },
    {
      id: 'lunda-sul',
      name: 'Lunda Sul',
      level: 'Provincia',
      layer: 'Mineracao',
      economy: 'Economia fortemente marcada pelos diamantes, com impacto em receita, emprego especializado e cadeias de servicos.',
      history: 'Ligada aos reinos e redes politicas Lunda-Chokwe, com historia profunda de autoridade, comercio e cultura material.',
      localInfo: 'O leste do pais mostra como recursos minerais, fronteiras e rotas internas influenciam a economia regional.',
      x: 600,
      y: 338,
      zoomHint: 1,
    },
    {
      id: 'mbanza-kongo',
      name: 'Mbanza Kongo',
      level: 'Patrimonio',
      layer: 'Memoria',
      economy: 'A economia local combina patrimonio, circulacao regional, turismo cultural e comercio transfronteirico.',
      history: 'Antiga capital do Reino do Kongo, e referencia fundamental para compreender poder, comercio e cultura antes e durante a presenca europeia.',
      localInfo: 'No norte, a cidade liga memoria historica, turismo cultural e contacto com redes regionais da bacia do Congo.',
      x: 274,
      y: 92,
      zoomHint: 2,
    },
    {
      id: 'maianga',
      name: 'Maianga',
      level: 'Distrito urbano',
      layer: 'Memoria',
      economy: 'Area urbana de servicos, educacao, comercio e circulacao diaria, marcada por instituicoes e atividades de pequena escala.',
      history: 'Integra a expansao urbana de Luanda, refletindo transformacoes de moradia, mobilidade e administracao na capital.',
      localInfo: 'Aparece em zoom aproximado para mostrar que a leitura economica tambem existe em escala de distrito.',
      x: 253,
      y: 296,
      zoomHint: 2,
    },
    {
      id: 'mutamba',
      name: 'Mutamba',
      level: 'Bairro',
      layer: 'Memoria',
      economy: 'Zona de comercio, servicos, transportes e memoria institucional, com forte fluxo de trabalhadores, estudantes e vendedores.',
      history: 'Espaco historico do centro de Luanda, associado a edificios publicos, memoria colonial e movimentos urbanos da capital.',
      localInfo: 'No zoom maximo, pontos de bairro mostram informacoes locais parecidas com marcadores de interesse do Google Maps.',
      x: 250,
      y: 284,
      zoomHint: 3,
    },
  ];

  readonly selectedPlace = computed(() => this.places.find((place) => place.id === this.selectedPlaceId()) ?? this.places[0]);

  readonly visiblePlaces = computed(() =>
    this.places.filter((place) => {
      const layerMatches = this.selectedLayer() === 'Nacional' || place.layer === this.selectedLayer() || place.layer === 'Nacional';
      return layerMatches && place.zoomHint <= this.zoomLevel();
    }),
  );

  readonly mapTransform = computed(() => {
    const zoom = this.zoomLevel();
    const selected = this.selectedPlace();
    const dx = zoom > 1 ? (520 - selected.x) * (zoom - 1) * 0.32 : 0;
    const dy = zoom > 1 ? (320 - selected.y) * (zoom - 1) * 0.32 : 0;
    return `translate(${dx} ${dy}) scale(${zoom})`;
  });

  changeLayer(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedLayer.set(target.value as EconomicPlace['layer']);
    this.ensureVisibleSelection();
  }

  zoomIn(): void {
    this.zoomLevel.update((value) => Math.min(3, value + 1));
  }

  zoomOut(): void {
    this.zoomLevel.update((value) => Math.max(1, value - 1));
    this.ensureVisibleSelection();
  }

  selectPlace(placeId: string): void {
    const place = this.places.find((item) => item.id === placeId);

    if (!place) {
      return;
    }

    this.selectedPlaceId.set(place.id);
    this.selectedLayer.set(place.layer === 'Nacional' ? 'Nacional' : place.layer);
    this.zoomLevel.update((value) => Math.max(value, place.zoomHint));
  }

  private ensureVisibleSelection(): void {
    if (this.visiblePlaces().some((place) => place.id === this.selectedPlaceId())) {
      return;
    }

    this.selectedPlaceId.set(this.visiblePlaces()[0]?.id ?? 'luanda');
  }
}
