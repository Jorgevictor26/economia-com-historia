import { Component, computed, signal } from '@angular/core';

interface Place {
  id: string;
  name: string;
  level: 'Provincia' | 'Municipio' | 'Distrito urbano' | 'Bairro' | 'Patrimonio';
  layer: 'Nacional' | 'Comercio' | 'Mineracao' | 'Agricultura' | 'Memoria';
  lat: number;
  lng: number;
  zoomHint: number;
  economy: string;
  history: string;
  localInfo: string;
}

interface Tile {
  key: string;
  url: string;
  x: number;
  y: number;
}

@Component({
  selector: 'app-angola-economic-map',
  template: `
    <section class="maps" aria-label="Mapa economico-historico de Angola">
      <aside class="panel">
        <div class="search">
          <span>Angola</span>
          <span class="material-symbols-outlined" aria-hidden="true">search</span>
          <span class="material-symbols-outlined" aria-hidden="true">close</span>
        </div>

        <div class="cover"></div>

        <div class="content">
          <p>{{ selectedPlace().level }} / {{ selectedPlace().layer }}</p>
          <h2>{{ selectedPlace().name }}</h2>

          <div class="actions" aria-label="Acoes do mapa">
            @for (action of actions; track action.label) {
              <button type="button">
                <span class="material-symbols-outlined" aria-hidden="true">{{ action.icon }}</span>
                {{ action.label }}
              </button>
            }
          </div>

          <section>
            <h3>Interesse economico</h3>
            <p>{{ selectedPlace().economy }}</p>
          </section>

          <section>
            <h3>Interesse historico</h3>
            <p>{{ selectedPlace().history }}</p>
          </section>

          <section>
            <h3>Informacoes sobre o local</h3>
            <p>{{ selectedPlace().localInfo }}</p>
          </section>

          <section>
            <h3>Locais no mapa</h3>
            <div class="places">
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

      <div class="map" (click)="selectNearest($event)">
        @for (tile of tiles(); track tile.key) {
          <img [src]="tile.url" alt="" [style.left.px]="tile.x" [style.top.px]="tile.y" width="256" height="256" draggable="false" />
        }

        @for (place of visiblePlaces(); track place.id) {
          <button
            type="button"
            class="marker"
            [class.active]="selectedPlace().id === place.id"
            [style.left.px]="point(place).x"
            [style.top.px]="point(place).y"
            (click)="selectPlace(place.id); $event.stopPropagation()"
          >
            <span></span>
            <strong>{{ place.name }}</strong>
          </button>
        }

        <div class="layers">
          <span class="material-symbols-outlined" aria-hidden="true">layers</span>
          <select [value]="selectedLayer()" (change)="changeLayer($event)" aria-label="Selecionar camada">
            @for (layer of layers; track layer) {
              <option [value]="layer">{{ layer }}</option>
            }
          </select>
        </div>

        <div class="controls" aria-label="Controlos do mapa">
          <button type="button" (click)="centerOnAngola(); $event.stopPropagation()" aria-label="Centrar em Angola">
            <span class="material-symbols-outlined" aria-hidden="true">my_location</span>
          </button>
          <button type="button" (click)="zoomIn(); $event.stopPropagation()" aria-label="Aumentar zoom">
            <span class="material-symbols-outlined" aria-hidden="true">add</span>
          </button>
          <button type="button" (click)="zoomOut(); $event.stopPropagation()" aria-label="Reduzir zoom">
            <span class="material-symbols-outlined" aria-hidden="true">remove</span>
          </button>
          <button type="button" aria-label="Street view">
            <span class="material-symbols-outlined" aria-hidden="true">accessibility_new</span>
          </button>
        </div>

        <small class="attrib">© OpenStreetMap contributors</small>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }
    .maps { position: relative; min-height: 640px; overflow: hidden; border: 1px solid #c8d6d6; border-radius: 8px; background: #9ccfc4; }
    .map { position: absolute; inset: 0; overflow: hidden; background: #9ccfc4; }
    .map img { position: absolute; width: 256px; height: 256px; user-select: none; }
    .panel { position: relative; z-index: 3; width: min(406px, calc(100% - 2rem)); min-height: 640px; background: #fff; box-shadow: 10px 0 24px rgb(35 45 48 / 0.18); }
    .search { position: absolute; left: 14px; right: 16px; top: 12px; z-index: 4; display: grid; grid-template-columns: 1fr auto auto; align-items: center; min-height: 48px; border-radius: 24px; background: #fff; padding-inline: 22px 12px; box-shadow: 0 2px 8px rgb(42 47 49 / 0.28); color: #3c4043; }
    .cover { height: 240px; background: linear-gradient(168deg, #79bfd0 0 34%, #efe7d8 35% 45%, #68aa8f 46% 100%); }
    .content > p { margin: 18px 22px 4px; color: #00778a; font-size: .72rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
    h2 { margin: 0 22px 16px; color: #202124; font-size: 1.45rem; line-height: 1.2; }
    .actions { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; border-block: 1px solid #e0e0e0; padding: 14px 16px 16px; }
    .actions button { display: grid; justify-items: center; gap: 7px; color: #006f7e; font-size: .72rem; font-weight: 700; text-align: center; }
    .actions .material-symbols-outlined { display: grid; width: 40px; aspect-ratio: 1; place-items: center; border-radius: 999px; background: #d6f3fa; font-size: 21px; }
    section { border-bottom: 1px solid #e0e0e0; padding: 16px 22px 18px; }
    h3 { color: #202124; font-size: 1rem; font-weight: 700; }
    section p { margin-top: 12px; color: #1f1f1f; font-size: .88rem; line-height: 1.55; }
    .places { display: grid; gap: 8px; margin-top: 12px; }
    .places button { display: flex; min-height: 42px; align-items: center; justify-content: space-between; border: 1px solid #dde3e4; border-radius: 6px; padding-inline: 12px; color: #3c4043; text-align: left; }
    .places button.active { border-color: #00899a; background: #e5f7fa; color: #00707f; }
    .marker { position: absolute; z-index: 2; display: flex; align-items: center; gap: 6px; transform: translate(-12px, -12px); color: #202124; font-size: 13px; font-weight: 800; text-shadow: 0 1px 2px #fff; }
    .marker span { width: 24px; aspect-ratio: 1; border: 4px solid #fff; border-radius: 999px; background: #00899a; box-shadow: 0 1px 3px rgb(0 0 0 / .3); }
    .marker.active span { background: #b3261e; }
    .layers { position: absolute; left: 420px; top: 8px; z-index: 2; display: flex; height: 48px; align-items: center; border: 1px solid #dadce0; background: #fff; padding-inline: 12px 6px; box-shadow: 0 1px 4px rgb(60 64 67 / .28); }
    .layers select { width: 122px; border: 0; color: #3c4043; font: 700 .8rem inherit; outline: 0; }
    .controls { position: absolute; right: 20px; bottom: 34px; z-index: 2; display: grid; overflow: hidden; border-radius: 8px; background: #fff; box-shadow: 0 1px 4px rgb(60 64 67 / .3); }
    .controls button { display: grid; width: 40px; aspect-ratio: 1; place-items: center; border-bottom: 1px solid #e0e0e0; color: #5f6368; }
    .attrib { position: absolute; right: 12px; bottom: 6px; z-index: 2; background: rgb(255 255 255 / .82); color: #3c4043; font-size: .68rem; }
    @media (max-width: 900px) {
      .maps, .panel { min-height: 760px; }
      .panel { width: 100%; min-height: 390px; box-shadow: 0 12px 22px rgb(34 45 48 / .18); }
      .cover { height: 170px; }
      .map { top: 390px; height: 370px; }
      .layers { left: 12px; top: 10px; }
    }
  `,
})
export class AngolaEconomicMapComponent {
  readonly width = 1040;
  readonly height = 640;
  readonly tileSize = 256;
  readonly visualCenterX = 720;
  readonly visualCenterY = 320;
  readonly layers: Place['layer'][] = ['Nacional', 'Comercio', 'Mineracao', 'Agricultura', 'Memoria'];
  readonly selectedLayer = signal<Place['layer']>('Nacional');
  readonly selectedPlaceId = signal('luanda');
  readonly zoom = signal(6);
  readonly center = signal({ lat: -12.3, lng: 17.7 });
  readonly actions = [
    { label: 'Direcoes', icon: 'near_me' },
    { label: 'Guardar', icon: 'bookmark' },
    { label: 'Imediacoes', icon: 'explore' },
    { label: 'Partilhar', icon: 'ios_share' },
  ];

  readonly places: Place[] = [
    { id: 'luanda', name: 'Luanda', level: 'Provincia', layer: 'Nacional', lat: -8.839, lng: 13.289, zoomHint: 6, economy: 'Centro financeiro, logistico e administrativo do pais, com porto, servicos, sedes empresariais e mercado urbano de grande escala.', history: 'Fundada em 1576, tornou-se ponto central das rotas atlanticas e capital politica e economica de Angola independente.', localInfo: 'Na costa noroeste, a capital concentra instituicoes publicas, universidades, mercados, bancos e fluxos diarios de transporte.' },
    { id: 'lobito', name: 'Lobito', level: 'Municipio', layer: 'Comercio', lat: -12.36, lng: 13.55, zoomHint: 6, economy: 'O porto e o Corredor do Lobito ligam o litoral ao interior mineiro e agricola, com peso estrategico nas exportacoes.', history: 'Cresceu com o caminho-de-ferro de Benguela, reorganizando a circulacao de mercadorias e pessoas no centro de Angola.', localInfo: 'A zona costeira de Benguela e Lobito funciona como saida logistica para produtos do planalto e do leste.' },
    { id: 'malanje', name: 'Malanje', level: 'Provincia', layer: 'Agricultura', lat: -9.54, lng: 16.34, zoomHint: 6, economy: 'Area associada a agricultura, energia e corredores internos, com potencial de abastecimento alimentar e ligacao ao mercado nacional.', history: 'Ponto relevante nas rotas do interior norte, articulando sociedades locais, comercio e administracao territorial.', localInfo: 'A proximidade de Calandula e de rios interiores reforca a leitura do territorio como zona agricola e de circulacao.' },
    { id: 'huila', name: 'Lubango', level: 'Provincia', layer: 'Agricultura', lat: -14.92, lng: 13.49, zoomHint: 6, economy: 'Destaca-se pela agropecuaria, comercio regional, turismo de altitude e articulacao com o sul do pais.', history: 'O planalto da Huila marcou encontros entre sociedades locais, missoes, comercio e ocupacao colonial no interior sul.', localInfo: 'Lubango e as areas envolventes explicam o peso regional da agropecuaria, servicos e turismo de altitude.' },
    { id: 'lunda-sul', name: 'Lunda Sul', level: 'Provincia', layer: 'Mineracao', lat: -9.66, lng: 20.39, zoomHint: 6, economy: 'Economia fortemente marcada pelos diamantes, com impacto em receita, emprego especializado e cadeias de servicos.', history: 'Ligada aos reinos e redes politicas Lunda-Chokwe, com historia profunda de autoridade, comercio e cultura material.', localInfo: 'O leste do pais mostra como recursos minerais, fronteiras e rotas internas influenciam a economia regional.' },
    { id: 'mbanza-kongo', name: 'Mbanza Kongo', level: 'Patrimonio', layer: 'Memoria', lat: -6.27, lng: 14.24, zoomHint: 7, economy: 'A economia local combina patrimonio, circulacao regional, turismo cultural e comercio transfronteirico.', history: 'Antiga capital do Reino do Kongo, e referencia fundamental para compreender poder, comercio e cultura antes e durante a presenca europeia.', localInfo: 'No norte, a cidade liga memoria historica, turismo cultural e contacto com redes regionais da bacia do Congo.' },
    { id: 'maianga', name: 'Maianga', level: 'Distrito urbano', layer: 'Memoria', lat: -8.84, lng: 13.23, zoomHint: 8, economy: 'Area urbana de servicos, educacao, comercio e circulacao diaria, marcada por instituicoes e atividades de pequena escala.', history: 'Integra a expansao urbana de Luanda, refletindo transformacoes de moradia, mobilidade e administracao na capital.', localInfo: 'Aparece em zoom aproximado para mostrar que a leitura economica tambem existe em escala de distrito.' },
    { id: 'mutamba', name: 'Mutamba', level: 'Bairro', layer: 'Memoria', lat: -8.815, lng: 13.235, zoomHint: 9, economy: 'Zona de comercio, servicos, transportes e memoria institucional, com forte fluxo de trabalhadores, estudantes e vendedores.', history: 'Espaco historico do centro de Luanda, associado a edificios publicos, memoria colonial e movimentos urbanos da capital.', localInfo: 'No zoom maximo, pontos de bairro mostram informacoes locais parecidas com marcadores de interesse do Google Maps.' },
  ];

  readonly selectedPlace = computed(() => this.places.find((place) => place.id === this.selectedPlaceId()) ?? this.places[0]);
  readonly visiblePlaces = computed(() => this.places.filter((place) => (this.selectedLayer() === 'Nacional' || place.layer === this.selectedLayer() || place.layer === 'Nacional') && place.zoomHint <= this.zoom()));

  readonly tiles = computed<Tile[]>(() => {
    const center = this.project(this.center().lat, this.center().lng, this.zoom());
    const minX = Math.floor((center.x - this.visualCenterX) / this.tileSize) - 1;
    const maxX = Math.floor((center.x + this.width - this.visualCenterX) / this.tileSize) + 1;
    const minY = Math.floor((center.y - this.visualCenterY) / this.tileSize) - 1;
    const maxY = Math.floor((center.y + this.height - this.visualCenterY) / this.tileSize) + 1;
    const count = 2 ** this.zoom();
    const tiles: Tile[] = [];

    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        if (y < 0 || y >= count) {
          continue;
        }

        const wrappedX = ((x % count) + count) % count;
        tiles.push({
          key: `${this.zoom()}-${wrappedX}-${y}`,
          url: `https://tile.openstreetmap.org/${this.zoom()}/${wrappedX}/${y}.png`,
          x: x * this.tileSize - center.x + this.visualCenterX,
          y: y * this.tileSize - center.y + this.visualCenterY,
        });
      }
    }

    return tiles;
  });

  point(place: Place): { x: number; y: number } {
    const center = this.project(this.center().lat, this.center().lng, this.zoom());
    const projected = this.project(place.lat, place.lng, this.zoom());
    return { x: projected.x - center.x + this.visualCenterX, y: projected.y - center.y + this.visualCenterY };
  }

  selectPlace(placeId: string): void {
    const place = this.places.find((item) => item.id === placeId);

    if (!place) {
      return;
    }

    this.selectedPlaceId.set(place.id);
    this.selectedLayer.set(place.layer === 'Nacional' ? 'Nacional' : place.layer);
    this.zoom.update((value) => Math.max(value, place.zoomHint));
    this.center.set({ lat: place.lat, lng: place.lng });
  }

  selectNearest(event: MouseEvent): void {
    const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * this.width;
    const y = ((event.clientY - bounds.top) / bounds.height) * this.height;
    const nearest = this.visiblePlaces().reduce((best, place) => {
      const point = this.point(place);
      const distance = Math.hypot(point.x - x, point.y - y);
      return distance < best.distance ? { place, distance } : best;
    }, { place: this.selectedPlace(), distance: Number.POSITIVE_INFINITY });

    if (nearest.distance < 90) {
      this.selectPlace(nearest.place.id);
    }
  }

  changeLayer(event: Event): void {
    this.selectedLayer.set((event.target as HTMLSelectElement).value as Place['layer']);
    this.ensureVisibleSelection();
  }

  zoomIn(): void {
    this.zoom.update((value) => Math.min(9, value + 1));
  }

  zoomOut(): void {
    this.zoom.update((value) => Math.max(5, value - 1));
    this.ensureVisibleSelection();
  }

  centerOnAngola(): void {
    this.center.set({ lat: -12.3, lng: 17.7 });
    this.zoom.set(6);
    this.selectedPlaceId.set('luanda');
    this.selectedLayer.set('Nacional');
  }

  private ensureVisibleSelection(): void {
    if (this.visiblePlaces().some((place) => place.id === this.selectedPlaceId())) {
      return;
    }

    this.selectedPlaceId.set(this.visiblePlaces()[0]?.id ?? 'luanda');
  }

  private project(lat: number, lng: number, zoom: number): { x: number; y: number } {
    const sin = Math.sin((lat * Math.PI) / 180);
    const scale = this.tileSize * 2 ** zoom;
    return {
      x: ((lng + 180) / 360) * scale,
      y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
    };
  }
}
