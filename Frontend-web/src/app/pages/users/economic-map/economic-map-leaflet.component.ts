import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild, inject } from '@angular/core';
import * as L from 'leaflet';
import { EconomicMapDataService } from './economic-map-data.service';
import { EconomicMapGeojsonService } from './economic-map-geojson.service';
import { MapLayerKey, MapLevel } from './economic-map.models';

@Component({
  selector: 'app-economic-map-leaflet',
  standalone: true,
  template: `
    <div class="relative h-full min-h-0 overflow-hidden bg-white">
      <div #mapRoot class="h-full min-h-0 w-full"></div>

      <div class="pointer-events-none absolute left-8 top-0 z-[410] flex flex-wrap items-center gap-3">
        <div class="pointer-events-auto inline-flex rounded-[8px] border border-[#E0E0E0] bg-white p-1 shadow-sm">
          <button type="button" class="rounded-[7px] bg-[#5C1E2F] px-5 py-2.5 text-[12px] font-extrabold text-white shadow-[0_6px_14px_rgba(92,30,47,0.20)]">Mapa de Províncias</button>
          <button type="button" class="rounded-[7px] px-5 py-2.5 text-[12px] font-extrabold text-[#616161]" (click)="reset.emit()">Mapa Completo</button>
        </div>
      </div>

      <div class="absolute bottom-[142px] left-8 z-[410] grid gap-3">
        <button type="button" class="grid size-11 place-items-center rounded-[8px] border border-[#E0E0E0] bg-white text-[#5C1E2F] shadow-md transition hover:-translate-y-0.5" aria-label="Ver Angola completa" (click)="reset.emit()">
          <span class="material-symbols-outlined" aria-hidden="true">home</span>
        </button>
        <div class="grid overflow-hidden rounded-[8px] border border-[#E0E0E0] bg-white shadow-md">
          <button type="button" class="grid size-11 place-items-center text-[#212121] transition hover:bg-[#F5F5F5]" aria-label="Aumentar zoom" (click)="zoomIn()">
            <span class="material-symbols-outlined" aria-hidden="true">add</span>
          </button>
          <button type="button" class="grid size-11 place-items-center border-t border-[#E0E0E0] text-[#212121] transition hover:bg-[#F5F5F5]" aria-label="Reduzir zoom" (click)="zoomOut()">
            <span class="material-symbols-outlined" aria-hidden="true">remove</span>
          </button>
          <button type="button" class="grid size-11 place-items-center border-t border-[#E0E0E0] text-[#212121] transition hover:bg-[#F5F5F5]" aria-label="Centrar mapa" (click)="showAngolaOverview()">
            <span class="material-symbols-outlined" aria-hidden="true">my_location</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }

      :host ::ng-deep .leaflet-container {
        background: #ffffff;
        font-family: inherit;
      }

      :host ::ng-deep .leaflet-control-attribution {
        display: none;
      }

      :host ::ng-deep .map-region-label {
        color: #212121;
        font-size: 12px;
        font-weight: 650;
        line-height: 1.2;
        text-align: center;
        text-shadow: 0 1px 0 #fff, 0 -1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff;
      }
    `,
  ],
})
export class EconomicMapLeafletComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) selectedRegionId = 'angola';
  @Input({ required: true }) activeLayer: MapLayerKey = 'economy';
  @Output() regionSelected = new EventEmitter<string>();
  @Output() reset = new EventEmitter<void>();

  @ViewChild('mapRoot', { static: true }) private readonly mapRoot?: ElementRef<HTMLDivElement>;

  private readonly geojsonService = inject(EconomicMapGeojsonService);
  private readonly dataService = inject(EconomicMapDataService);
  private readonly featureLayers = new Map<string, L.Layer>();
  private readonly loadedParents = new Set<string>();
  private map?: L.Map;
  private geojsonGroup = L.featureGroup();
  private initialViewApplied = false;

  async ngAfterViewInit(): Promise<void> {
    this.map = L.map(this.mapRoot?.nativeElement as HTMLDivElement, {
      center: [-12.35, 17.55],
      zoom: 5,
      minZoom: 5,
      maxZoom: 10,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
    });

    this.geojsonGroup.addTo(this.map);
    await this.loadLayer('province', 'angola');
    this.showAngolaOverview();
    this.refreshStyles();
    this.initialViewApplied = true;
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (!this.map) {
      return;
    }

    if (changes['selectedRegionId']) {
      await this.loadLayerForRegion(this.selectedRegionId);
      await this.loadChildrenFor(this.selectedRegionId);

      if (this.initialViewApplied) {
        this.focusRegion(this.selectedRegionId);
      }
    }

    if (changes['activeLayer']) {
      this.refreshStyles();
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  zoomIn(): void {
    this.map?.zoomIn();
  }

  zoomOut(): void {
    this.map?.zoomOut();
  }

  showAngolaOverview(): void {
    if (!this.map) {
      return;
    }

    const bounds = this.geojsonGroup.getBounds();

    if (bounds.isValid()) {
      this.map.flyToBounds(bounds.pad(0.08), { duration: 0.45, maxZoom: 5.65 });
      return;
    }

    this.map.flyTo([-12.35, 17.55], 5, { duration: 0.45 });
  }

  private async loadChildrenFor(regionId: string): Promise<void> {
    const region = this.dataService.getRegion(regionId);

    if (!region.nextLevel) {
      return;
    }

    await this.loadLayer(region.nextLevel, region.id);
  }

  private async loadLayerForRegion(regionId: string): Promise<void> {
    const region = this.dataService.getRegion(regionId);

    if (!region.parentId || region.level === 'country') {
      return;
    }

    await this.loadLayer(region.level, region.parentId);
  }

  private async loadLayer(level: MapLevel, parentId: string): Promise<void> {
    const key = `${level}:${parentId}`;

    if (this.loadedParents.has(key)) {
      return;
    }

    try {
      const layer = await this.geojsonService.loadLayer(level, parentId);

      L.geoJSON(layer.data, {
        style: (feature) => this.regionStyle(String(feature?.properties?.['id'] ?? '')),
        onEachFeature: (feature, leafletLayer) => {
          const id = String(feature.properties?.['id'] ?? '');
          const name = String(feature.properties?.['name'] ?? '');

          this.featureLayers.set(id, leafletLayer);
          leafletLayer.on('click', () => this.regionSelected.emit(id));

          const center = this.getLayerCenter(leafletLayer);
          if (center) {
            L.marker(center, {
              interactive: false,
              icon: L.divIcon({
                className: 'map-region-label',
                html: name,
                iconSize: [90, 30],
                iconAnchor: [45, 15],
              }),
            }).addTo(this.geojsonGroup);
          }
        },
      }).addTo(this.geojsonGroup);

      this.loadedParents.add(key);
      this.refreshStyles();
    } catch {
      this.loadedParents.add(key);
    }
  }

  private focusRegion(regionId: string): void {
    if (!this.map) {
      return;
    }

    if (regionId === 'angola') {
      this.showAngolaOverview();
      this.refreshStyles();
      return;
    }

    const layer = this.featureLayers.get(regionId);

    if (layer && 'getBounds' in layer) {
      const bounds = (layer as L.Polygon).getBounds();
      this.map.flyToBounds(bounds.pad(0.42), { duration: 0.55, maxZoom: this.zoomFor(regionId) });
    }

    this.refreshStyles();
  }

  private refreshStyles(): void {
    this.featureLayers.forEach((layer, id) => {
      if ('setStyle' in layer) {
        (layer as L.Path).setStyle(this.regionStyle(id));
      }
    });
  }

  private regionStyle(regionId: string): L.PathOptions {
    const isSelected = regionId === this.selectedRegionId;
    const isAncestor = this.dataService.breadcrumbFor(this.selectedRegionId).some((item) => item.id === regionId);

    return {
      color: isSelected ? '#5C1E2F' : isAncestor ? '#8A3F50' : '#CFCFCF',
      weight: isSelected ? 1.8 : 1,
      fillColor: isSelected ? '#B76678' : this.fillColor(),
      fillOpacity: isSelected ? 0.9 : 0.16,
      opacity: 1,
    };
  }

  private fillColor(): string {
    const colors: Record<MapLayerKey, string> = {
      history: '#D4AF37',
      economy: '#8A3F50',
      infrastructure: '#7A7F87',
      resources: '#2A9D8F',
      tourism: '#C48A96',
    };

    return colors[this.activeLayer];
  }

  private zoomFor(regionId: string): number {
    const level = this.dataService.getRegion(regionId).level;

    if (level === 'province') {
      return 7;
    }

    if (level === 'municipality') {
      return 8;
    }

    return 9;
  }

  private getLayerCenter(layer: L.Layer): L.LatLng | null {
    if ('getBounds' in layer) {
      return (layer as L.Polygon).getBounds().getCenter();
    }

    return null;
  }
}

