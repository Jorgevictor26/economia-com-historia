import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MapLayerKey, MapLayerOption, MapSearchResult } from './economic-map.models';

@Component({
  selector: 'app-economic-map-sidebar',
  standalone: true,
  template: `
    <aside class="grid h-full content-start gap-4 overflow-hidden border-r border-[#E0E0E0] bg-[#FAFAFA] p-5">
      <label class="flex h-[52px] items-center gap-3 rounded-[8px] border border-[#D9DDE1] bg-white px-4 text-[#616161] shadow-sm">
        <span class="material-symbols-outlined text-[24px] text-[#212121]" aria-hidden="true">search</span>
        <input
          class="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#7A7F87]"
          type="search"
          placeholder="Pesquisar local..."
          [value]="searchTerm"
          (input)="searchTermChange.emit($any($event.target).value)"
        />
      </label>

      @if (searchResults.length) {
        <section class="rounded-[8px] border border-[#E0E0E0] bg-white p-3 shadow-sm">
          <div class="grid gap-2">
            @for (result of searchResults; track result.id) {
              <button type="button" class="rounded-[8px] border border-[#E0E0E0] px-3 py-2 text-left transition hover:border-[#8A3F50] hover:bg-[#F2E6E9]" (click)="regionSelected.emit(result.id)">
                <span class="block text-[12px] font-extrabold text-[#5C1E2F]">{{ result.name }}</span>
                <span class="text-[11px] text-[#616161]">{{ result.parentName || result.level }}</span>
              </button>
            }
          </div>
        </section>
      }

      <section class="rounded-[8px] border border-[#E0E0E0] bg-white p-4 shadow-sm">
        <h2 class="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#212121]">Nível de detalhe</h2>
        <div class="mt-4 rounded-[8px] border border-[#E0E0E0] bg-white p-3 shadow-sm">
          <div class="flex items-center justify-between text-[13px] text-[#616161]">
            <span>{{ detailLabel }}</span>
            <span>{{ detailZoom }}</span>
          </div>
          <div class="mt-4 h-1 rounded-full bg-[#D7D7D7]">
            <span class="block h-full rounded-full bg-[#8A3F50] transition-all duration-300" [style.width.%]="detailProgress"></span>
          </div>
        <div class="mt-4 grid grid-cols-3 gap-2">
            <button type="button" class="rounded-[8px] border border-[#E0E0E0] bg-white px-2 py-2.5 text-[12px] font-bold text-[#212121] transition hover:border-[#8A3F50]" (click)="zoomOut.emit()">Reduzir</button>
            <button type="button" class="rounded-[8px] border border-[#E0E0E0] bg-white px-2 py-2.5 text-[12px] font-bold text-[#212121] transition hover:border-[#8A3F50]" (click)="reset.emit()">Angola</button>
            <button type="button" class="rounded-[8px] border border-[#E0E0E0] bg-white px-2 py-2.5 text-[12px] font-bold text-[#212121] transition hover:border-[#8A3F50]" (click)="zoomIn.emit()">Ampliar</button>
          </div>
        </div>
      </section>

      <section class="rounded-[8px] border border-[#E0E0E0] bg-white p-4 shadow-sm">
        <h2 class="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#212121]">Camadas do mapa</h2>
        <div class="mt-4 grid gap-2">
          @for (layer of layers; track layer.key) {
            <button
              type="button"
              class="relative flex min-h-11 items-center gap-3 overflow-hidden rounded-[8px] px-3 text-left text-[13px] font-semibold text-[#616161] transition hover:bg-[#F5F5F5]"
              [class.bg-[#F2E6E9]]="activeLayer === layer.key"
              [class.text-[#5C1E2F]]="activeLayer === layer.key"
              (click)="layerSelected.emit(layer.key)"
            >
              @if (activeLayer === layer.key) {
                <span class="absolute inset-y-0 right-0 w-1 bg-[#8A3F50]"></span>
              }
              <span class="material-symbols-outlined text-[20px]" aria-hidden="true">{{ layer.icon }}</span>
              {{ layer.label }}
            </button>
          }
        </div>
      </section>

      <section class="rounded-[8px] border border-[#E0E0E0] bg-white p-4 shadow-sm">
        <h2 class="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#212121]">Filtros rápidos</h2>
        <div class="mt-4 flex flex-wrap gap-2">
          @for (filter of quickFilters; track filter) {
            <button type="button" class="rounded-full border border-[#E0E0E0] bg-white px-3 py-2 text-[12px] font-semibold text-[#616161] transition hover:border-[#8A3F50] hover:text-[#5C1E2F]" (click)="searchTermChange.emit(filter)">
              {{ filter }}
            </button>
          }
        </div>
      </section>
    </aside>
  `,
})
export class EconomicMapSidebarComponent {
  @Input() searchTerm = '';
  @Input() searchResults: MapSearchResult[] = [];
  @Input() layers: MapLayerOption[] = [];
  @Input() activeLayer: MapLayerKey = 'economy';
  @Input() quickFilters: string[] = [];
  @Input() detailLabel = 'Angola';
  @Input() detailZoom = '0.0x';
  @Input() detailProgress = 0;

  @Output() searchTermChange = new EventEmitter<string>();
  @Output() layerSelected = new EventEmitter<MapLayerKey>();
  @Output() regionSelected = new EventEmitter<string>();
  @Output() reset = new EventEmitter<void>();
  @Output() zoomIn = new EventEmitter<void>();
  @Output() zoomOut = new EventEmitter<void>();
}
