import { Injectable, inject } from '@angular/core';
import { EconomicMapDataService } from './economic-map-data.service';
import { MapSearchResult } from './economic-map.models';

@Injectable({ providedIn: 'root' })
export class EconomicMapSearchService {
  private readonly dataService = inject(EconomicMapDataService);

  search(term: string): MapSearchResult[] {
    return this.dataService.search(term).map((region) => ({
      id: region.id,
      name: region.name,
      level: region.level,
      parentName: region.parentId ? this.dataService.getRegion(region.parentId).name : undefined,
    }));
  }
}
