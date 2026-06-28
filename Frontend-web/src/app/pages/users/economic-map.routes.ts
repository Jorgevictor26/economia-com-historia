import { Component, computed, inject, signal } from '@angular/core';
import { Routes } from '@angular/router';
import { BackToTopComponent } from '../shared/back-to-top/back-to-top.component';
import { PublicNavbarComponent } from '../shared/public-navbar/public-navbar.component';
import { EconomicMapDataService } from './economic-map/economic-map-data.service';
import { EconomicMapInfoPanelComponent } from './economic-map/economic-map-info-panel.component';
import { EconomicMapLeafletComponent } from './economic-map/economic-map-leaflet.component';
import { EconomicMapSearchService } from './economic-map/economic-map-search.service';
import { MapInfoTab, MapLayerKey } from './economic-map/economic-map.models';
import { EconomicMapSidebarComponent } from './economic-map/economic-map-sidebar.component';

@Component({
  selector: 'app-economic-map-page',
  standalone: true,
  imports: [
    PublicNavbarComponent,
    BackToTopComponent,
    EconomicMapSidebarComponent,
    EconomicMapLeafletComponent,
    EconomicMapInfoPanelComponent,
  ],
  templateUrl: './economic-map.page.html',
})
export class EconomicMapPage {
  private readonly dataService = inject(EconomicMapDataService);
  private readonly searchService = inject(EconomicMapSearchService);

  readonly selectedRegionId = signal('huambo');
  readonly activeLayer = signal<MapLayerKey>('economy');
  readonly activeTab = signal<MapInfoTab>('overview');
  readonly searchTerm = signal('');
  readonly panelOpen = signal(true);
  readonly detailStep = signal(0);

  readonly layers = this.dataService.layers;
  readonly quickFilters = this.dataService.quickFilters;
  readonly selectedRegion = computed(() => this.dataService.getRegion(this.selectedRegionId()));
  readonly breadcrumb = computed(() => this.dataService.breadcrumbFor(this.selectedRegionId()));
  readonly children = computed(() => this.dataService.getChildren(this.selectedRegionId()));
  readonly searchResults = computed(() => this.searchService.search(this.searchTerm()));
  readonly detailLabel = computed(() => {
    const labels = ['Angola', 'Províncias', 'Municípios', 'Distritos'];
    return labels[this.detailStep()] ?? 'Distritos';
  });
  readonly detailProgress = computed(() => Math.max(12, (this.detailStep() + 1) * 25));

  selectRegion(regionId: string): void {
    const region = this.dataService.getRegion(regionId);

    this.selectedRegionId.set(region.id);
    this.panelOpen.set(region.id !== 'angola');
    this.activeTab.set('overview');
    this.detailStep.set(this.levelStep(region.level));
  }

  resetMap(): void {
    this.selectedRegionId.set('angola');
    this.panelOpen.set(false);
    this.activeTab.set('overview');
    this.detailStep.set(0);
  }

  closePanel(): void {
    this.panelOpen.set(false);
  }

  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  selectLayer(layer: MapLayerKey): void {
    this.activeLayer.set(layer);
  }

  setActiveTab(tab: MapInfoTab): void {
    this.activeTab.set(tab);
  }

  exploreChildren(): void {
    const child = this.children()[0];

    if (child) {
      this.selectRegion(child.id);
    }
  }

  zoomIn(): void {
    const child = this.children()[0];

    if (child) {
      this.selectRegion(child.id);
      return;
    }

    this.detailStep.update((step) => Math.min(3, step + 1));
  }

  zoomOut(): void {
    const breadcrumb = this.breadcrumb();
    const parent = breadcrumb[breadcrumb.length - 2];

    if (parent) {
      this.selectRegion(parent.id);
      return;
    }

    this.resetMap();
  }

  private levelStep(level: string): number {
    const steps: Record<string, number> = {
      country: 0,
      province: 1,
      municipality: 2,
      district: 3,
    };

    return steps[level] ?? 0;
  }
}

export const ECONOMIC_MAP_ROUTES: Routes = [{ path: '', component: EconomicMapPage }];
