import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MapInfoTab, MapRegionInfo } from './economic-map.models';

@Component({
  selector: 'app-economic-map-info-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (region) {
      <aside class="h-full rounded-[8px] border border-[#D9DDE1] bg-white p-4 shadow-sm">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#7A7F87]">{{ region.typeLabel }}</p>
            <h2 class="mt-1 font-display text-[25px] font-extrabold leading-tight text-[#212121]">{{ region.name }}</h2>
          </div>
          <button type="button" class="grid size-9 place-items-center rounded-full text-[#9E9E9E] transition hover:bg-[#F5F5F5] hover:text-[#5C1E2F]" aria-label="Fechar painel" (click)="closed.emit()">
            <span class="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>

        <section class="mt-4 overflow-hidden rounded-[8px] border border-[#E0E0E0] bg-white shadow-sm">
          <div class="grid min-h-[132px] grid-cols-[minmax(0,1fr)_210px]">
            <img [src]="region.imageUrl" [alt]="region.name" class="h-full min-h-[132px] w-full object-cover" />
            <div class="relative grid content-center gap-2 overflow-hidden bg-white p-4">
              <span class="pointer-events-none absolute right-4 top-1/2 size-24 -translate-y-1/2 rounded-[8px] bg-[#F1F1F1] opacity-80"></span>
              <span class="pointer-events-none absolute right-10 top-1/2 size-3 -translate-y-1/2 rounded-full bg-[#8A3F50]"></span>
              @if (region.capital) {
                <p class="relative text-[12px] text-[#616161]"><span class="block text-[11px] text-[#7A7F87]">Capital</span><strong class="text-[#212121]">{{ region.capital }}</strong></p>
              }
              @if (region.area) {
                <p class="relative text-[12px] text-[#616161]"><span class="block text-[11px] text-[#7A7F87]">Área</span><strong class="text-[#212121]">{{ region.area }}</strong></p>
              }
              @if (region.population) {
                <p class="relative text-[12px] text-[#616161]"><span class="block text-[11px] text-[#7A7F87]">População</span><strong class="text-[#212121]">{{ region.population }}</strong></p>
              }
            </div>
          </div>
        </section>

        <nav class="mt-5 grid grid-cols-4 border-b border-[#E0E0E0]" aria-label="Informação da região">
          @for (tab of tabs; track tab.key) {
            <button
              type="button"
              class="border-b-2 px-2 pb-2.5 text-[12px] font-bold transition"
              [class.border-[#5C1E2F]]="activeTab === tab.key"
              [class.text-[#5C1E2F]]="activeTab === tab.key"
              [class.border-transparent]="activeTab !== tab.key"
              [class.text-[#212121]]="activeTab !== tab.key"
              (click)="tabSelected.emit(tab.key)"
            >
              {{ tab.label }}
            </button>
          }
        </nav>

        <div class="mt-4 animate-[eh-map-panel_220ms_ease_both]">
          @switch (activeTab) {
            @case ('overview') {
              <p class="text-[12px] leading-6 text-[#616161]">{{ region.summary }}</p>
              <div class="mt-4 grid grid-cols-3 gap-3">
                @for (stat of region.stats; track stat.label) {
                  <article class="rounded-[8px] border border-[#E0E0E0] bg-white p-3">
                    <span class="material-symbols-outlined text-[20px] text-[#8A3F50]" aria-hidden="true">{{ stat.icon }}</span>
                    <p class="mt-2 text-[11px] leading-4 text-[#616161]">{{ stat.label }}</p>
                    <strong class="mt-1 block text-[16px] text-[#212121]">{{ stat.value }}</strong>
                  </article>
                }
              </div>
              <ng-container *ngTemplateOutlet="highlightsTemplate" />
            }
            @case ('economy') {
              <p class="text-[13px] leading-7 text-[#616161]">{{ region.economy }}</p>
              <ng-container *ngTemplateOutlet="highlightsTemplate" />
            }
            @case ('history') {
              <p class="text-[13px] leading-7 text-[#616161]">{{ region.history }}</p>
            }
            @case ('gallery') {
              <div class="grid gap-3">
                @for (item of region.gallery; track item.title) {
                  <figure class="overflow-hidden rounded-[8px] border border-[#E0E0E0] bg-[#FAFAFA]">
                    <img [src]="item.imageUrl" [alt]="item.title" class="h-32 w-full object-cover" />
                    <figcaption class="px-3 py-2 text-[12px] font-bold text-[#5C1E2F]">{{ item.title }}</figcaption>
                  </figure>
                }
              </div>
            }
          }
        </div>

        @if (region.childrenLabel && childCount > 0) {
          <button type="button" class="mt-4 inline-flex h-11 w-full items-center justify-center gap-3 rounded-[8px] border border-[#C48A96] bg-white text-[13px] font-extrabold text-[#5C1E2F] transition hover:bg-[#F2E6E9]" (click)="exploreChildren.emit()">
            {{ region.childrenLabel }}
            <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
          </button>
        }
      </aside>

      <ng-template #highlightsTemplate>
        <article class="mt-4 rounded-[8px] border border-[#E0E0E0] bg-white p-4">
          <h3 class="text-[12px] font-extrabold uppercase tracking-[0.12em] text-[#212121]">Destaques económicos</h3>
          <ul class="mt-3 grid gap-1.5 text-[12px] leading-5 text-[#616161]">
            @for (highlight of region.highlights; track highlight) {
              <li class="flex gap-2"><span class="mt-2 size-1.5 rounded-full bg-[#8A3F50]"></span><span>{{ highlight }}</span></li>
            }
          </ul>
        </article>
      </ng-template>
    }
  `,
  styles: [
    `
      @keyframes eh-map-panel {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class EconomicMapInfoPanelComponent {
  @Input({ required: true }) region!: MapRegionInfo;
  @Input() activeTab: MapInfoTab = 'overview';
  @Input() childCount = 0;

  @Output() tabSelected = new EventEmitter<MapInfoTab>();
  @Output() closed = new EventEmitter<void>();
  @Output() exploreChildren = new EventEmitter<void>();

  readonly tabs: Array<{ key: MapInfoTab; label: string }> = [
    { key: 'overview', label: 'Visão Geral' },
    { key: 'economy', label: 'Economia' },
    { key: 'history', label: 'História' },
    { key: 'gallery', label: 'Galeria' },
  ];
}

